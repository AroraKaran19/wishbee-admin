'use client';

import { useEffect, useId, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { productApi } from '@/lib/api/products';
import type { HeavyLiftGroup, HeavyLiftGroupProduct } from '@/lib/api/heavy-lift';

interface ProductSearchProps {
  group: HeavyLiftGroup;
  groupOfProduct: Map<string, HeavyLiftGroup>;
  onAdd: (product: HeavyLiftGroupProduct) => void;
}

export function ProductSearch({ group, groupOfProduct, onAdd }: ProductSearchProps) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<HeavyLiftGroupProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setQuery('');
    setResults([]);
  }, [group._id]);

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

  const choose = (product: HeavyLiftGroupProduct) => {
    if (groupOfProduct.get(product._id)?._id === group._id) return;
    onAdd({ _id: product._id, name: product.name, sku: product.sku });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && query.trim().length > 0;
  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    <div className="relative">
      <Input
        icon={<Search className="h-4 w-4" />}
        rightIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        placeholder="Add a product by name or SKU..."
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && results[active] ? optionId(active) : undefined}
        aria-autocomplete="list"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {results.length === 0 && !loading && (
            <li className="px-3 py-3 text-sm text-gray-500">
              {debounced ? 'No products found' : 'Searching...'}
            </li>
          )}
          {results.map((product, i) => {
            const current = groupOfProduct.get(product._id);
            const inThisGroup = current?._id === group._id;
            return (
              <li
                key={product._id}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                aria-disabled={inThisGroup}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(product)}
                className={`flex items-center justify-between gap-3 px-3 py-2 text-sm ${
                  inThisGroup ? 'cursor-default text-gray-400' : 'cursor-pointer text-gray-900'
                } ${i === active && !inThisGroup ? 'bg-primary-light' : ''}`}
              >
                <span className="min-w-0 truncate">
                  {product.name}
                  {product.sku && <span className="ml-2 text-xs text-gray-400">{product.sku}</span>}
                </span>
                <span className="shrink-0 text-xs">
                  {inThisGroup ? (
                    'In this group'
                  ) : current ? (
                    <span className="text-amber-700">Move from {current.name}</span>
                  ) : (
                    <span className="font-medium text-primary">Add</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
