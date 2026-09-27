'use client';

import { useEffect, useId, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { productApi } from '@/lib/api/products';
import type { HeavyLiftGroup, HeavyLiftGroupProduct } from '@/lib/api/heavy-lift';
import { ProductThumb } from './product-thumb';

interface ProductSearchProps {
  groupId: string;
  draftIds: Set<string>;
  savedGroupOf: Map<string, HeavyLiftGroup>;
  onPick: (product: HeavyLiftGroupProduct) => void;
}

type Status = { label: string; hint: string; tone: 'add' | 'move' | 'restore' | 'none' };

export function ProductSearch({ groupId, draftIds, savedGroupOf, onPick }: ProductSearchProps) {
  const listId = useId();
  const inputId = useId();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<HeavyLiftGroupProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    productApi
      .getAll({ page: 1, limit: 20, search: debounced })
      .then((response: any) => {
        const products = response.data?.products || response.data || response;
        if (!cancelled) {
          setResults(Array.isArray(products) ? products : []);
          setActive(0);
        }
      })
      .catch(() => !cancelled && setResults([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const statusOf = (product: HeavyLiftGroupProduct): Status => {
    const sku = product.sku ? `SKU ${product.sku}` : '';
    if (draftIds.has(product._id)) return { label: '', hint: 'Already in this group', tone: 'none' };
    const saved = savedGroupOf.get(product._id);
    if (saved?._id === groupId) return { label: 'Keep', hint: 'Marked for removal', tone: 'restore' };
    if (saved) return { label: 'Move here', hint: `In ${saved.name}`, tone: 'move' };
    return { label: 'Add', hint: sku, tone: 'add' };
  };

  const pick = (product: HeavyLiftGroupProduct) => {
    if (draftIds.has(product._id)) return;
    onPick({ _id: product._id, name: product.name, sku: product.sku, images: product.images });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) pick(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && query.trim().length > 0;
  const optionId = (i: number) => `${listId}-${i}`;
  const toneClass = { add: 'text-primary', move: 'text-amber-700', restore: 'text-gray-700', none: '' };

  return (
    <div className="relative">
      <label htmlFor={inputId} className="block text-xs font-medium text-gray-600 mb-1">
        Add products
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          id={inputId}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search by product name or SKU"
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && results[active] ? optionId(active) : undefined}
          aria-autocomplete="list"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-9 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching products"
          className="absolute z-30 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {results.length === 0 && (
            <li className="px-3 py-3 text-sm text-gray-500">
              {loading || query.trim() !== debounced ? 'Searching...' : `No products match "${debounced}".`}
            </li>
          )}
          {results.map((product, i) => {
            const status = statusOf(product);
            const disabled = status.tone === 'none';
            return (
              <li
                key={product._id}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                aria-disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(product)}
                className={`flex items-center gap-3 px-3 py-2 ${
                  disabled ? 'cursor-default text-gray-400' : 'cursor-pointer text-gray-900'
                } ${i === active && !disabled ? 'bg-primary-light/60' : ''}`}
              >
                <ProductThumb
                  src={product.images?.[0]}
                  alt=""
                  size={32}
                  className={`rounded-md ${disabled ? 'opacity-60' : ''}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{product.name}</span>
                  {status.hint && <span className="block truncate text-xs text-gray-500">{status.hint}</span>}
                </span>
                {status.label && (
                  <span className={`shrink-0 text-xs font-medium ${toneClass[status.tone]}`}>{status.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
