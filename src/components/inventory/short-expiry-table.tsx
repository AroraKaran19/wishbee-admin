'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ShortExpiryItem, TableConfig } from '@/lib/types';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface ShortExpiryTableProps {
  items: ShortExpiryItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ShortExpiryTable({ 
  items, 
  currentPage, 
  totalPages, 
  onPageChange 
}: ShortExpiryTableProps) {

  const handleAddToFlashSale = (item: ShortExpiryItem) => {
    console.log('Add to flash sale:', item);
  };

  const tableConfig: TableConfig<ShortExpiryItem> = {
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
        key: 'expiryDate',
        title: 'Expiry Date',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value}
          </div>
        )
      },
      {
        key: 'remainingDays',
        title: 'Remaining Days',
        align: 'center',
        render: (value) => (
          <div className={`text-sm text-gray-900`}>
            {value} Days
          </div>
        )
      },
      {
        key: 'quantity',
        title: 'Quantity',
        align: 'center',
        render: (value, record) => (
          <div className="text-sm text-gray-900">
            {value} {record.unit}
          </div>
        )
      }
    ],
    actions: [
      {
        key: 'flash-sale',
        label: 'Add to Flash Sale',
        icon: <Plus className="h-4 w-4" />,
        onClick: (record) => handleAddToFlashSale(record),
        variant: 'danger',
        size: 'sm',
        className: 'text-white'
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
  );
}
