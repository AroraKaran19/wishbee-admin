'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Product, TableConfig } from '@/lib/types';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface OutOfStockTableProps {
  items: Product[];
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

  const handleRestock = (item: Product) => {
    // Navigate to product edit page
    window.location.href = `/inventory/product/${item._id}/edit`;
  };

  const tableConfig: TableConfig<Product> = {
    columns: [
      {
        key: 'name',
        title: 'Product Name',
        align: 'center',
        render: (value, record) => (
          <Link 
            href={`/inventory/product/${record._id}`}
            className="text-sm text-gray-900 hover:text-gray-700 font-medium transition-colors"
          >
            {value}
          </Link>
        )
      },
      {
        key: 'category',
        title: 'Category',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value && typeof value === 'object' && 'name' in value ? (value as any).name : 'N/A'}
          </div>
        )
      },
      {
        key: 'sku',
        title: 'SKU',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-500 font-mono">
            {value}
          </div>
        )
      },
      {
        key: 'stock',
        title: 'Stock',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-red-600 font-medium">
            {value} units
          </div>
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
        className: 'text-white'
      }
    ],
    pagination: {
      currentPage,
      totalPages,
      onPageChange,
      showPageInfo: true
    },
    rowKey: '_id',
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
