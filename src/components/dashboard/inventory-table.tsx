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
            href={`/inventory/product/${record.id}`}
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
            {value}
          </div>
        )
      },
      {
        key: 'buyingPrice',
        title: 'Buying Price',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {formatCurrency(value)}
          </div>
        )
      },
      {
        key: 'stockQuantity',
        title: 'Stock Qty',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value} Pieces
          </div>
        )
      },
      {
        key: 'lastSoldDate',
        title: 'Last Sold Date',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value}
          </div>
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
        key: 'availabilityStatus',
        title: 'Availability',
        align: 'center',
        render: (value) => (
          <span 
            className={`text-sm ${
              value === 'in-stock' 
                ? 'text-success' 
                : 'text-danger'
            }`}
          >
            {value === 'in-stock' ? 'In Stock' : 'Out of stock'}
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
    rowKey: 'id',
    className: 'rounded-xl shadow-sm',
    rowClassName: () => 'hover:bg-gray-50'
  };

  return <DataTable data={products} config={tableConfig} />;
}
