'use client';

import { Trash2 } from 'lucide-react';
import type { HeavyLiftGroup } from '@/lib/api/heavy-lift';
import { ProductThumb } from './product-thumb';

const ROW_GRID =
  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)_210px]';

const formatFee = (fee: number) => `₹${Number.isInteger(fee) ? fee : fee.toFixed(2)}`;

const productCountText = (count: number) => `${count} product${count === 1 ? '' : 's'}`;

interface GroupTableProps {
  groups: HeavyLiftGroup[];
  onManage: (group: HeavyLiftGroup) => void;
  onDelete: (group: HeavyLiftGroup) => void;
  children?: React.ReactNode;
}

export function GroupTable({ groups, onManage, onDelete, children }: GroupTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        className={`${ROW_GRID} hidden border-b border-gray-200 bg-primary-light px-4 py-3 text-sm font-semibold text-gray-900 md:grid`}
      >
        <span>Group</span>
        <span>Charge per unit</span>
        <span>Products</span>
        <span className="text-right">Actions</span>
      </div>

      {children ?? (
        <ul className="divide-y divide-gray-200">
          {groups.map((group) => (
            <li
              key={group._id}
              onClick={() => onManage(group)}
              className={`${ROW_GRID} cursor-pointer px-4 py-3 hover:bg-gray-50`}
            >
              <span className="truncate font-medium text-gray-900">{group.name}</span>
              <span className="text-right text-sm tabular-nums md:text-left">
                <span className="font-semibold text-gray-900">{formatFee(group.fee)}</span>
                <span className="text-gray-500 md:hidden"> / unit</span>
              </span>
              <span className="hidden items-center gap-2 md:flex">
                {group.productCount === 0 ? (
                  <span className="text-sm text-gray-400">No products yet</span>
                ) : (
                  <>
                    <span className="flex -space-x-2">
                      {group.preview.map((p) => (
                        <ProductThumb key={p._id} src={p.images?.[0]} alt="" size={32} className="ring-2 ring-white" />
                      ))}
                    </span>
                    <span className="text-sm text-gray-500">{productCountText(group.productCount)}</span>
                  </>
                )}
              </span>
              <span className="col-span-2 flex items-center justify-between gap-2 md:col-span-1 md:justify-end">
                <span className="text-sm text-gray-500 md:hidden">{productCountText(group.productCount)}</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onManage(group);
                    }}
                    className="rounded-lg bg-primary-light px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-white cursor-pointer"
                  >
                    Manage
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(group);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger-light cursor-pointer"
                    aria-label={`Delete ${group.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </button>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
