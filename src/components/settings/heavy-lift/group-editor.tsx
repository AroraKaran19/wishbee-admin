'use client';

import { useId, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { HeavyLiftGroup, HeavyLiftGroupProduct } from '@/lib/api/heavy-lift';
import { ProductSearch } from './product-search';
import { ProductThumb } from './product-thumb';
import { diffDraft, validateDraft, type GroupDraft } from './draft';

interface GroupEditorProps {
  saved: HeavyLiftGroup;
  draft: GroupDraft;
  isNew: boolean;
  saving: boolean;
  savedGroupOf: Map<string, HeavyLiftGroup>;
  onChange: (draft: GroupDraft) => void;
  onSave: () => void;
  onDiscard: () => void;
  onDelete?: () => void;
}

type RowState = 'kept' | 'adding' | 'moving' | 'removing';

const badge: Record<Exclude<RowState, 'kept'>, string> = {
  adding: 'bg-success-light text-success',
  moving: 'bg-amber-100 text-amber-800',
  removing: 'bg-danger-light text-danger',
};

const rowTint: Record<RowState, string> = {
  kept: '',
  adding: 'bg-success-light/40',
  moving: 'bg-amber-50/70',
  removing: 'bg-danger-light/70',
};

export function GroupEditor({
  saved,
  draft,
  isNew,
  saving,
  savedGroupOf,
  onChange,
  onSave,
  onDiscard,
  onDelete,
}: GroupEditorProps) {
  const nameId = useId();
  const feeId = useId();
  const [error, setError] = useState<string | null>(null);
  const diff = diffDraft(saved, draft);
  const draftIds = new Set(draft.products.map((p) => p._id));

  const update = (patch: Partial<GroupDraft>) => {
    setError(null);
    onChange({ ...draft, ...patch });
  };

  const addProduct = (product: HeavyLiftGroupProduct) =>
    update({ products: [product, ...draft.products.filter((p) => p._id !== product._id)] });

  const dropProduct = (productId: string) =>
    update({ products: draft.products.filter((p) => p._id !== productId) });

  const handleSave = () => {
    const problem = validateDraft(draft);
    if (problem) {
      setError(problem);
      return;
    }
    onSave();
  };

  const rows: { product: HeavyLiftGroupProduct; state: RowState; from?: string }[] = [
    ...diff.added.map((product) => {
      const from = savedGroupOf.get(product._id);
      return from && from._id !== saved._id
        ? { product, state: 'moving' as const, from: from.name }
        : { product, state: 'adding' as const };
    }),
    ...saved.products.map((product) => ({
      product,
      state: draftIds.has(product._id) ? ('kept' as const) : ('removing' as const),
    })),
  ];

  const changeText = isNew
    ? 'New group, not saved yet'
    : diff.count === 0
      ? 'No unsaved changes'
      : `${diff.count} unsaved change${diff.count === 1 ? '' : 's'}`;

  return (
    <div className="px-4 pb-4 md:pl-11">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3 border-b border-gray-100 p-4 lg:grid-cols-[220px_140px_minmax(0,1fr)]">
          <div>
            <label htmlFor={nameId} className="mb-1 block text-xs font-medium text-gray-600">
              Name
            </label>
            <input
              id={nameId}
              value={draft.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="e.g. 10 to 15 kg"
              autoFocus={isNew}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor={feeId} className="mb-1 block text-xs font-medium text-gray-600">
              Charge per unit
            </label>
            <div className="flex overflow-hidden rounded-lg border border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <span className="border-r border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">₹</span>
              <input
                id={feeId}
                type="number"
                min={0}
                step={1}
                inputMode="decimal"
                value={draft.fee}
                onChange={(e) => update({ fee: e.target.value })}
                placeholder="0"
                className="w-full min-w-0 px-3 py-2 text-sm tabular-nums focus:outline-none"
              />
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <ProductSearch
              groupId={saved._id}
              draftIds={draftIds}
              savedGroupOf={savedGroupOf}
              onPick={(product) =>
                savedGroupOf.get(product._id)?._id === saved._id
                  ? update({ products: [...draft.products, product] })
                  : addProduct(product)
              }
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">
            No products yet. Search above to add the heavy items this charge applies to.
          </p>
        ) : (
          <ul className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto">
            {rows.map(({ product, state, from }) => (
              <li key={product._id} className={`flex items-center gap-3 px-4 py-2.5 ${rowTint[state]}`}>
                <ProductThumb
                  src={product.images?.[0]}
                  alt=""
                  size={40}
                  className={state === 'removing' ? 'opacity-50' : ''}
                />
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
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge[state]}`}>
                        {state === 'adding' ? 'Adding' : state === 'moving' ? `Moving from ${from}` : 'Removing'}
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
                    onClick={() => dropProduct(product._id)}
                    className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-danger-light hover:text-danger cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      state === 'removing'
                        ? update({ products: [...draft.products, product] })
                        : dropProduct(product._id)
                    }
                    className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-white cursor-pointer"
                  >
                    Undo
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-lg border-t border-gray-200 bg-gray-50 px-4 py-3">
          {error ? (
            <span role="alert" className="text-sm text-danger">
              {error}
            </span>
          ) : (
            <span className="text-sm text-gray-600">{changeText}</span>
          )}
          <span className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                onDiscard();
              }}
              disabled={saving || (!isNew && diff.count === 0)}
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-gray-800 hover:bg-muted-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isNew ? 'Cancel' : 'Discard'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (!isNew && diff.count === 0)}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isNew ? 'Create group' : 'Save changes'}
            </button>
          </span>
        </div>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={saving}
          className="mt-3 text-sm text-gray-500 hover:text-danger disabled:opacity-50 cursor-pointer"
        >
          Delete this group
        </button>
      )}
    </div>
  );
}
