'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  heavyLiftApi,
  type HeavyLiftGroupProduct,
  type HeavyLiftProductPage,
} from '@/lib/api/heavy-lift';
import { ProductThumb } from './product-thumb';

export const PAGE_SIZE = 10;

interface GroupProductsProps {
  groupId: string | null;
  added: HeavyLiftGroupProduct[];
  removed: Map<string, HeavyLiftGroupProduct>;
  groupNames: Map<string, string>;
  onUndoAdd: (productId: string) => void;
  onRemove: (product: HeavyLiftGroupProduct) => void;
  onKeep: (productId: string) => void;
}

type RowState = 'kept' | 'adding' | 'moving' | 'removing';

const rowTint: Record<RowState, string> = {
  kept: '',
  adding: 'bg-success-light/40',
  moving: 'bg-amber-50/70',
  removing: 'bg-danger-light/70',
};

const badgeClass: Record<Exclude<RowState, 'kept'>, string> = {
  adding: 'bg-success-light text-success',
  moving: 'bg-amber-100 text-amber-800',
  removing: 'bg-danger-light text-danger',
};

export function GroupProducts({
  groupId,
  added,
  removed,
  groupNames,
  onUndoAdd,
  onRemove,
  onKeep,
}: GroupProductsProps) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [data, setData] = useState<HeavyLiftProductPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilter(filter.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [filter]);

  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    setLoading(true);
    heavyLiftApi
      .products(groupId, { page, limit: PAGE_SIZE, search: debouncedFilter })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'Could not load products.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [groupId, page, debouncedFilter]);

  const total = data?.total ?? 0;
  const saved = data?.products ?? [];
  const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(page * PAGE_SIZE, total);
  const showFilter = Boolean(groupId) && (total > 0 || debouncedFilter !== '');

  const renderRow = (product: HeavyLiftGroupProduct, state: RowState) => {
    const from = product.heavyLiftGroup ? groupNames.get(String(product.heavyLiftGroup)) : undefined;
    return (
      <li key={`${state}-${product._id}`} className={`flex items-center gap-3 px-4 py-2 ${rowTint[state]}`}>
        <ProductThumb src={product.images?.[0]} alt="" size={36} className={state === 'removing' ? 'opacity-50' : ''} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span
              className={`truncate text-sm font-medium ${
                state === 'removing' ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}
            >
              {product.name}
            </span>
            {state !== 'kept' && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClass[state]}`}>
                {state === 'adding' ? 'Adding' : state === 'moving' ? `Moving from ${from ?? 'another group'}` : 'Removing'}
              </span>
            )}
          </span>
          {product.sku && (
            <span className={`block text-xs ${state === 'removing' ? 'text-gray-400' : 'text-gray-500'}`}>
              SKU {product.sku}
            </span>
          )}
        </span>
        {state === 'kept' ? (
          <button
            type="button"
            onClick={() => onRemove(product)}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-danger-light hover:text-danger cursor-pointer"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => (state === 'removing' ? onKeep(product._id) : onUndoAdd(product._id))}
            className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-white cursor-pointer"
          >
            Undo
          </button>
        )}
      </li>
    );
  };

  const emptyText = debouncedFilter
    ? `No products in this group match "${debouncedFilter}".`
    : 'No products yet. Search above to add the heavy items this charge applies to.';

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-lg border-b border-gray-200 bg-gray-50 px-4 py-2.5">
        <span className="text-sm font-medium text-gray-900">
          Products in this group
          {groupId && data && <span className="font-normal text-gray-500"> ({total})</span>}
        </span>
        {showFilter && (
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter this list"
            aria-label="Filter products in this group"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-48"
          />
        )}
      </div>

      <ul className="divide-y divide-gray-100">
        {added.map((product) =>
          renderRow(product, product.heavyLiftGroup && String(product.heavyLiftGroup) !== groupId ? 'moving' : 'adding')
        )}
        {error ? (
          <li className="px-4 py-6 text-center text-sm text-danger">{error}</li>
        ) : loading && !data ? (
          <li className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </li>
        ) : (
          saved.map((product) => renderRow(product, removed.has(product._id) ? 'removing' : 'kept'))
        )}
        {!loading && !error && saved.length === 0 && added.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-gray-500">{emptyText}</li>
        )}
      </ul>

      {groupId && total > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-2.5 text-sm text-gray-600">
          <span className="flex items-center gap-2 tabular-nums">
            {firstShown}–{lastShown} of {total}
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" aria-label="Loading" />}
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1 || loading}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (data?.totalPages ?? 1) || loading}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 cursor-pointer"
            >
              Next
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
