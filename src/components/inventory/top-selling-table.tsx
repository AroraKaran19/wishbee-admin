'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Product, TableConfig } from '@/lib/types';
import Link from 'next/link';

interface TopSellingTableProps {
  items: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TopSellingTable({ 
  items, 
  currentPage, 
  totalPages, 
  onPageChange 
}: TopSellingTableProps) {

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
        key: 'soldQuantity',
        title: 'Sold Quantity (Last 30 Days)',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value ? value.toLocaleString() : 0} units
          </div>
        )
      },
      {
        key: 'revenue',
        title: 'Revenue (₹)',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900 font-medium">
            ₹{value ? value.toLocaleString() : '0'}
          </div>
        )
      },
      {
        key: 'stock',
        title: 'Remaining Stock',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value ?? 0} units
          </div>
        )
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
