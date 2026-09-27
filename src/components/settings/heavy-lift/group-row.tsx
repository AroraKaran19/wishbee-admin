'use client';

import { useState } from 'react';
import { Check, ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import type { HeavyLiftGroup, HeavyLiftGroupProduct } from '@/lib/api/heavy-lift';
import { ProductSearch } from './product-search';

interface GroupRowProps {
  group: HeavyLiftGroup;
  expanded: boolean;
  groupOfProduct: Map<string, HeavyLiftGroup>;
  onToggle: () => void;
  onRename: (name: string, fee: number) => Promise<boolean>;
  onDelete: () => void;
  onAddProduct: (product: HeavyLiftGroupProduct) => void;
  onRemoveProduct: (productId: string) => void;
}

const iconButton =
  'rounded-md p-1.5 text-gray-400 hover:bg-muted hover:text-gray-700 cursor-pointer disabled:opacity-50';

export function GroupRow({
  group,
  expanded,
  groupOfProduct,
  onToggle,
  onRename,
  onDelete,
  onAddProduct,
  onRemoveProduct,
}: GroupRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [fee, setFee] = useState(String(group.fee));
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setName(group.name);
    setFee(String(group.fee));
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    const ok = await onRename(name, parseFloat(fee));
    setSaving(false);
    if (ok) setEditing(false);
  };

  const handleEditKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  const count = group.products.length;

  return (
    <li className="border-b border-gray-200 last:border-b-0">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${group.name}`}
          className={iconButton}
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {editing ? (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleEditKey}
              aria-label="Group name"
              className="h-8 w-48 py-1 text-sm"
              autoFocus
            />
            <span className="text-sm text-gray-500">₹</span>
            <Input
              type="number"
              min={0}
              step={1}
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              onKeyDown={handleEditKey}
              aria-label="Charge per unit"
              className="h-8 w-20 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">per unit</span>
            <button type="button" onClick={save} disabled={saving} className={iconButton} aria-label="Save">
              <Check className="h-4 w-4 text-green-600" />
            </button>
            <button type="button" onClick={() => setEditing(false)} className={iconButton} aria-label="Cancel">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="flex flex-1 min-w-0 items-center gap-3 text-left cursor-pointer"
          >
            <span className="truncate font-medium text-gray-900">{group.name}</span>
            <span className="shrink-0 text-sm text-gray-500">{formatCurrency(group.fee)} / unit</span>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-gray-600">
              {count} product{count === 1 ? '' : 's'}
            </span>
          </button>
        )}

        {!editing && (
          <div className="flex shrink-0 items-center">
            <button type="button" onClick={startEdit} className={iconButton} aria-label={`Edit ${group.name}`}>
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" onClick={onDelete} className={`${iconButton} hover:text-red-600`} aria-label={`Delete ${group.name}`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="space-y-2 pb-3 pl-12 pr-3">
          <ProductSearch group={group} groupOfProduct={groupOfProduct} onAdd={onAddProduct} />
          {count === 0 ? (
            <p className="px-1 py-2 text-sm text-gray-500">
              No products yet. Search above to add some.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 rounded-lg border border-gray-200">
              {group.products.map((p) => (
                <li key={p._id} className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm">
                  <span className="min-w-0 truncate text-gray-800">
                    {p.name}
                    {p.sku && <span className="ml-2 text-xs text-gray-400">{p.sku}</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveProduct(p._id)}
                    className={`${iconButton} hover:text-red-600`}
                    aria-label={`Remove ${p.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
