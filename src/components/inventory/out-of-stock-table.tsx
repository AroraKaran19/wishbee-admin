'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { OutOfStockItem, TableConfig } from '@/lib/types';
import { RotateCcw } from 'lucide-react';

interface OutOfStockTableProps {
  items: OutOfStockItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OutOfStockTable({ 
  items, 
  currentPage, 
  totalPages, 
  onPageChange 
}: OutOfStockTableProps) {

  const handleView = (item: OutOfStockItem) => {
    console.log('View item:', item);
  };

  const tableConfig: TableConfig<OutOfStockItem> = {
    columns: [
      {
        key: 'productName',
        title: 'Product Name',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value}
          </div>
        )
      },
      {
        key: 'category',
        title: 'Category',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value}
          </div>
        )
      },
      {
        key: 'lastStockDate',
        title: 'Last Stock Date',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value}
          </div>
        )
      },
      {
        key: 'supplierName',
        title: 'Supplier Name',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value}
          </div>
        )
      }
    ],
    actions: [
      {
        key: 'restock',
        label: 'Restock',
        icon: <RotateCcw className="h-4 w-4" />,
        onClick: (record) => handleView(record),
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
  )
}
