'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Product, TableConfig } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
interface InventoryTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function InventoryTable({ products, currentPage, totalPages, onPageChange }: InventoryTableProps) {
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
            {value && typeof value === 'object' && 'name' in value ? value.name : 'N/A'}
          </div>
        )
      },
      {
        key: 'mrp',
        title: 'MRP',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {formatCurrency(value)}
          </div>
        )
      },
      {
        key: 'stock',
        title: 'Stock',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value} units
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

  return <DataTable data={products} config={tableConfig} />;
}
