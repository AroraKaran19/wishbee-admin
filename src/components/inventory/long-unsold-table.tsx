'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { LongUnsoldItem, TableConfig } from '@/lib/types';
import { Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';

interface LongUnsoldTableProps {
  items: LongUnsoldItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function LongUnsoldTable({ 
  items, 
  currentPage, 
  totalPages, 
  onPageChange 
}: LongUnsoldTableProps) {

  const handleApplyDiscount = (item: LongUnsoldItem) => {
    console.log('Apply discount to:', item);
  };

  const handleAddToCombo = (item: LongUnsoldItem) => {
    console.log('Add to combo offer:', item);
  };

  const tableConfig: TableConfig<LongUnsoldItem> = {
    columns: [
      {
        key: 'productName',
        title: 'Product Name',
        align: 'center',
        render: (value, record) => (
          <Link 
            href={`/inventory/product/${record.id}`}
            className="text-sm text-gray-900 hover:text-gray-700 font-medium transition-colors"
          >
            {value}
          </Link>
        )
      },
      {
        key: 'daysSinceLastSale',
        title: 'Days Since Last Sale',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {typeof value === 'number' ? `${value} Days` : value}
          </div>
        )
      },
      {
        key: 'stockQty',
        title: 'Stock Qty',
        align: 'center',
        render: (value, record) => (
          <div className="text-sm text-gray-900">
            {value} {record.unit}
          </div>
        )
      },
      {
        key: 'price',
        title: 'Price (₹)',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900 font-medium">
            ₹{value}
          </div>
        )
      }
    ],
    actions: [
      {
        key: 'apply-discount',
        label: 'Apply Discount',
        icon: <Sparkles className="h-4 w-4" />,
        onClick: (record) => handleApplyDiscount(record),
        variant: 'primary',
        size: 'sm',
        className: 'text-white',
        disabled: (record) => record.suggestedAction !== 'discount'
      },
      {
        key: 'add-combo',
        label: 'Add to Combo Offer',
        icon: <Plus className="h-4 w-4" />,
        onClick: (record) => handleAddToCombo(record),
        variant: 'danger',
        size: 'sm',
        className: 'text-white',
        disabled: (record) => record.suggestedAction !== 'combo'
      }
    ],
    pagination: {
      currentPage,
      totalPages,
      onPageChange,
      showPageInfo: true
    },
    rowKey: 'id',
    className: 'rounded-xl shadow-sm',
    rowClassName: () => 'hover:bg-gray-50'
  };

  return (
    <div>
      <DataTable data={items} config={tableConfig} />
      <div className="h-4"></div>
    </div>
  )
}
