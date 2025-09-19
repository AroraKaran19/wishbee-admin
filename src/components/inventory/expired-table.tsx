'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ExpiredItem, TableConfig } from '@/lib/types';
import { Trash2, Bookmark, CircleX } from 'lucide-react';
import Link from 'next/link';

interface ExpiredTableProps {
  items: ExpiredItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ExpiredTable({ 
  items, 
  currentPage, 
  totalPages, 
  onPageChange 
}: ExpiredTableProps) {

  const handleRemove = (item: ExpiredItem) => {
    console.log('Remove item:', item);
  };

  const handleMarkWaste = (item: ExpiredItem) => {
    console.log('Mark as waste:', item);
  };

  const tableConfig: TableConfig<ExpiredItem> = {
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
        key: 'quantity',
        title: 'Quantity',
        align: 'center',
        render: (value, record) => (
          <div className="text-sm text-gray-900">
            {value} {record.unit}
          </div>
        )
      },
      {
        key: 'status',
        title: 'Status',
        align: 'center',
        render: () => (
          <div className="flex items-center justify-center">
            <div className="flex items-center text-red-600">
            <CircleX className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Expired</span>
            </div>
          </div>
        )
      }
    ],
    actions: [
      {
        key: 'remove',
        label: 'Remove',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (record) => handleRemove(record),
        variant: 'danger',
        size: 'sm',
        className: 'text-white'
      },
      {
        key: 'mark-waste',
        label: 'Mark Waste',
        icon: <Bookmark className="h-4 w-4" />,
        onClick: (record) => handleMarkWaste(record),
        variant: 'primary',
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
