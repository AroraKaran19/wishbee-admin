'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { Loader2, Trash2, X } from 'lucide-react';
import { heavyLiftApi, type HeavyLiftGroup, type HeavyLiftGroupProduct } from '@/lib/api/heavy-lift';
import { ProductSearch } from './product-search';
import { GroupProducts } from './group-products';

interface GroupModalProps {
  group: HeavyLiftGroup | null;
  groupNames: Map<string, string>;
  onClose: () => void;
  onSaved: (message: string) => void;
  onDeleted: (message: string) => void;
}

type Confirm = 'discard' | 'delete' | null;

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

const buttonBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

export function GroupModal({ group, groupNames, onClose, onSaved, onDeleted }: GroupModalProps) {
  const titleId = useId();
  const nameId = useId();
  const feeId = useId();
  const isNew = group === null;

  const [name, setName] = useState(group?.name ?? '');
  const [fee, setFee] = useState(group ? String(group.fee) : '');
  const [added, setAdded] = useState<HeavyLiftGroupProduct[]>([]);
  const [removed, setRemoved] = useState<Map<string, HeavyLiftGroupProduct>>(new Map());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const feeNumber = parseFloat(fee);
  const nameChanged = !isNew && name.trim() !== group.name;
  const feeChanged = !isNew && feeNumber !== group.fee;
  const changeCount = (nameChanged ? 1 : 0) + (feeChanged ? 1 : 0) + added.length + removed.size;
  const dirty = isNew ? name.trim() !== '' || fee !== '' || added.length > 0 : changeCount > 0;

  const requestClose = useCallback(() => {
    if (busy) return;
    if (dirty) setConfirm('discard');
    else onClose();
  }, [busy, dirty, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestClose]);

  const pickProduct = (product: HeavyLiftGroupProduct) => {
    setError(null);
    if (removed.has(product._id)) {
      keepProduct(product._id);
      return;
    }
    setAdded((prev) => [product, ...prev.filter((p) => p._id !== product._id)]);
  };

  const removeProduct = (product: HeavyLiftGroupProduct) =>
    setRemoved((prev) => new Map(prev).set(product._id, product));

  const keepProduct = (productId: string) =>
    setRemoved((prev) => {
      const next = new Map(prev);
      next.delete(productId);
      return next;
    });

  const save = async () => {
    if (!name.trim()) {
      setError('Give the group a name, for example 10 to 15 kg.');
      return;
    }
    if (!Number.isFinite(feeNumber) || feeNumber < 0) {
      setError('Enter a charge per unit of ₹0 or more.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const add = added.map((p) => p._id);
      const remove = [...removed.keys()];
      if (isNew) {
        const created = await heavyLiftApi.create({ name: name.trim(), fee: feeNumber });
        if (add.length > 0) await heavyLiftApi.updateProducts(created._id, { add, remove: [] });
        onSaved(`Created ${created.name}`);
      } else {
        if (nameChanged || feeChanged) {
          await heavyLiftApi.update(group._id, { name: name.trim(), fee: feeNumber });
        }
        if (add.length > 0 || remove.length > 0) {
          await heavyLiftApi.updateProducts(group._id, { add, remove });
        }
        onSaved(`Saved ${name.trim()}`);
      }
    } catch (err) {
      setError(errorMessage(err, 'Could not save changes.'));
      setBusy(false);
    }
  };

  const deleteGroup = async () => {
    if (!group) return;
    setBusy(true);
    try {
      await heavyLiftApi.remove(group._id);
      onDeleted(`Deleted ${group.name}`);
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the group.'));
      setConfirm(null);
      setBusy(false);
    }
  };

  const statusText = error
    ? error
    : isNew
      ? added.length > 0
        ? `${added.length} product${added.length === 1 ? '' : 's'} to add`
        : 'Not created yet'
      : changeCount === 0
        ? 'No unsaved changes'
        : `${changeCount} unsaved change${changeCount === 1 ? '' : 's'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
          <h2 id={titleId} className="truncate text-lg font-semibold text-gray-900">
            {isNew ? 'New Heavy Lift group' : `Manage ${group.name}`}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            className="rounded-md p-1 text-gray-400 hover:bg-muted hover:text-gray-600 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-3">
            <div>
              <label htmlFor={nameId} className="mb-1 block text-xs font-medium text-gray-600">
                Name
              </label>
              <input
                id={nameId}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
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
                  value={fee}
                  onChange={(e) => {
                    setFee(e.target.value);
                    setError(null);
                  }}
                  placeholder="0"
                  className="w-full min-w-0 px-3 py-2 text-sm tabular-nums focus:outline-none"
                />
              </div>
            </div>
          </div>

          <ProductSearch
            groupId={group?._id ?? null}
            addedIds={new Set(added.map((p) => p._id))}
            removedIds={new Set(removed.keys())}
            groupNames={groupNames}
            onPick={pickProduct}
          />

          <GroupProducts
            groupId={group?._id ?? null}
            added={added}
            removed={removed}
            groupNames={groupNames}
            onUndoAdd={(id) => setAdded((prev) => prev.filter((p) => p._id !== id))}
            onRemove={removeProduct}
            onKeep={keepProduct}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-b-xl border-t border-gray-200 bg-gray-50 px-6 py-4">
          {confirm === 'discard' ? (
            <>
              <span className="mr-auto text-sm font-medium text-gray-900">Discard your unsaved changes?</span>
              <button type="button" onClick={() => setConfirm(null)} className={`${buttonBase} bg-muted text-gray-800 hover:bg-muted-hover`}>
                Keep editing
              </button>
              <button type="button" onClick={onClose} className={`${buttonBase} bg-danger text-white hover:bg-danger-hover`}>
                Discard changes
              </button>
            </>
          ) : confirm === 'delete' && group ? (
            <>
              <span className="mr-auto text-sm text-gray-900">
                <span className="font-medium">Delete {group.name}?</span>{' '}
                <span className="text-gray-600">
                  Its {group.productCount} product{group.productCount === 1 ? '' : 's'} will stop carrying a Heavy
                  Lift Charge.
                </span>
              </span>
              <button type="button" onClick={() => setConfirm(null)} disabled={busy} className={`${buttonBase} bg-muted text-gray-800 hover:bg-muted-hover`}>
                Cancel
              </button>
              <button type="button" onClick={deleteGroup} disabled={busy} className={`${buttonBase} bg-danger text-white hover:bg-danger-hover`}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete group
              </button>
            </>
          ) : (
            <>
              <span
                role={error ? 'alert' : undefined}
                className={`w-full text-sm sm:order-2 sm:w-auto ${error ? 'text-danger' : 'text-gray-600'}`}
              >
                {statusText}
              </span>
              <span className="mr-auto sm:order-1">
                {!isNew && (
                  <button
                    type="button"
                    onClick={() => setConfirm('delete')}
                    disabled={busy}
                    className={`${buttonBase} gap-1.5 border border-danger/40 text-danger hover:bg-danger-light`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete group
                  </button>
                )}
              </span>
              <button
                type="button"
                onClick={requestClose}
                disabled={busy}
                className={`${buttonBase} bg-muted text-gray-800 hover:bg-muted-hover sm:order-3`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={busy || (!isNew && changeCount === 0)}
                className={`${buttonBase} bg-primary text-white hover:bg-primary-hover sm:order-4`}
              >
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isNew ? 'Create group' : 'Save changes'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
