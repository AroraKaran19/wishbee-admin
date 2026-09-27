'use client';

import { ChevronRight } from 'lucide-react';
import type { HeavyLiftGroup } from '@/lib/api/heavy-lift';
import { ProductThumb } from './product-thumb';
import { GroupEditor } from './group-editor';
import { diffDraft, draftFromGroup, type GroupDraft } from './draft';

export const ROW_GRID =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:grid-cols-[minmax(0,1fr)_160px_minmax(0,1fr)_170px]';

interface GroupRowProps {
  group: HeavyLiftGroup;
  draft?: GroupDraft;
  isNew?: boolean;
  expanded: boolean;
  saving: boolean;
  savedGroupOf: Map<string, HeavyLiftGroup>;
  onToggle: () => void;
  onDraftChange: (draft: GroupDraft) => void;
  onSave: () => void;
  onDiscard: () => void;
  onDelete?: () => void;
}

const formatFee = (fee: number) =>
  `₹${Number.isInteger(fee) ? fee : fee.toFixed(2)}`;

export function GroupRow({
  group,
  draft,
  isNew = false,
  expanded,
  saving,
  savedGroupOf,
  onToggle,
  onDraftChange,
  onSave,
  onDiscard,
  onDelete,
}: GroupRowProps) {
  const unsaved = isNew || (draft ? diffDraft(group, draft).count > 0 : false);
  const count = group.products.length;
  const preview = group.products.slice(0, 4);

  return (
    <li className={`border-b border-gray-200 last:border-b-0 ${expanded ? 'bg-primary-light/30' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`${ROW_GRID} w-full px-4 py-3 text-left cursor-pointer ${expanded ? '' : 'hover:bg-gray-50'}`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <ChevronRight
            className={`h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none ${
              expanded ? 'rotate-90 text-gray-600' : 'text-gray-400'
            }`}
            aria-hidden
          />
          <span className="truncate font-medium text-gray-900">{isNew ? draft?.name.trim() || 'New group' : group.name}</span>
        </span>

        <span className="text-right text-sm tabular-nums md:text-left">
          {isNew ? (
            <span className="text-gray-400">Not saved</span>
          ) : (
            <>
              <span className="font-semibold text-gray-900">{formatFee(group.fee)}</span>
              <span className="text-gray-500 md:hidden"> / unit</span>
            </>
          )}
        </span>

        <span className="hidden items-center gap-2 md:flex">
          {count === 0 ? (
            <span className="text-sm text-gray-400">{isNew ? '' : 'No products yet'}</span>
          ) : (
            <>
              <span className="flex -space-x-2">
                {preview.map((p) => (
                  <ProductThumb key={p._id} src={p.images?.[0]} alt="" size={32} className="ring-2 ring-white" />
                ))}
              </span>
              <span className="text-sm text-gray-500">
                {count} product{count === 1 ? '' : 's'}
              </span>
            </>
          )}
        </span>

        <span className="hidden justify-end md:flex">
          {unsaved && !isNew && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              Unsaved changes
            </span>
          )}
        </span>
      </button>

      {expanded && (
        <GroupEditor
          saved={group}
          draft={draft ?? draftFromGroup(group)}
          isNew={isNew}
          saving={saving}
          savedGroupOf={savedGroupOf}
          onChange={onDraftChange}
          onSave={onSave}
          onDiscard={onDiscard}
          onDelete={onDelete}
        />
      )}
    </li>
  );
}
