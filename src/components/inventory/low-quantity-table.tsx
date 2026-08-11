'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { LowStockItem, TableConfig } from '@/lib/types';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { RestockModal, RestockTarget } from '@/components/inventory/restock-modal';

interface LowQuantityTableProps {
  items: LowStockItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  threshold: number;
  onRefresh: () => void;
}

export function LowQuantityTable({
  items,
  currentPage,
  totalPages,
  onPageChange,
  threshold,
  onRefresh
}: LowQuantityTableProps) {
  const [restockTarget, setRestockTarget] = useState<RestockTarget | null>(null);

  const handleRestock = (item: LowStockItem) => {
    // Combos have no restock endpoint, so they keep the edit-page route.
    if (item.type !== 'product') {
      window.location.href = `/inventory/combo/${item.productId}/edit`;
      return;
    }

    setRestockTarget({
      id: item.productId,
      name: item.name,
      currentStock: item.currentStock,
    });
  };

  const getQuantityColor = (quantity: number, threshold: number) => {
    const percentage = (quantity / threshold) * 100;
    if (percentage <= 30) return 'bg-red-500';
    if (percentage <= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const tableConfig: TableConfig<LowStockItem> = {
    columns: [
      {
        key: 'name',
        title: 'Product Name',
        align: 'center',
        render: (value, record) => (
          <Link 
            href={record.type === 'product' 
              ? `/inventory/product/${record.productId}`
              : `/inventory/combo/${record.productId}`
            }
            className="text-sm text-gray-900 hover:text-gray-700 font-medium transition-colors"
          >
            {value}
          </Link>
        )
      },
      {
        key: 'currentStock',
        title: 'Available Quantity',
        align: 'center',
        render: (value) => {
          const stockValue = value ?? 0;
          const percentage = (stockValue / threshold) * 100;
          const width = Math.min(percentage, 100);
          
          return (
            <div className="space-y-2">
              <div className="text-sm text-gray-900 font-medium">
                {stockValue.toString().padStart(2, '0')} units
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getQuantityColor(stockValue, threshold)}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        }
      },
      {
        key: 'type',
        title: 'Type',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900 capitalize">
            {value}
          </div>
        )
      },
      {
        key: 'status',
        title: 'Status',
        align: 'center',
        render: (value) => (
          <span 
            className={`text-sm px-2 py-1 rounded-full ${
              value === 'ACTIVE' 
                ? 'bg-green-100 text-green-800' 
                : value === 'OUT_OF_STOCK'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {value === 'ACTIVE' ? 'Active' : value === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Discontinued'}
          </span>
        )
      }
    ],
    actions: [
      {
        key: 'restock',
        label: 'Restock',
        icon: <RotateCcw className="h-4 w-4" />,
        onClick: (record) => handleRestock(record),
        variant: 'primary',
        size: 'sm',
        className: 'text-white flex items-center gap-2'
      }
    ],
    pagination: {
      currentPage,
      totalPages,
      onPageChange,
      showPageInfo: true
    },
    rowKey: 'productId',
    className: 'rounded-xl shadow-sm',
    rowClassName: () => 'hover:bg-gray-50'
  };

  return (
    <div>
      <DataTable data={items} config={tableConfig} />
      <RestockModal
        target={restockTarget}
        onClose={() => setRestockTarget(null)}
        onSuccess={onRefresh}
      />
      <div className="h-4"></div>
    </div>
  );
}
