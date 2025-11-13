'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Product, TableConfig } from '@/lib/types';
import { Sparkles, TrendingUp } from 'lucide-react';
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

  const handleBoostPromo = (item: Product) => {
    // Navigate to product edit page
    window.location.href = `/inventory/product/${item._id}/edit`;
  };

  const handleViewTrends = (item: Product) => {
    // Navigate to product detail page
    window.location.href = `/inventory/product/${item._id}`;
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
        key: 'soldQuantity',
        title: 'Sold Quantity (Last 30 Days)',
        align: 'center',
        render: (value, record) => (
          <div className="text-sm text-gray-900">
            {value ? value.toLocaleString() : 0} {record.weight?.unit || 'units'}
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
        render: (value, record) => (
          <div className="text-sm text-gray-900">
            {value ?? 0} {record.weight?.unit || 'units'}
          </div>
        )
      }
    ],
    actions: [
      {
        key: 'boost-promo',
        label: 'Boost Promo',
        icon: <Sparkles className="h-4 w-4" />,
        onClick: (record) => handleBoostPromo(record),
        variant: 'primary',
        size: 'sm',
        className: 'text-white'
      },
      {
        key: 'view-trends',
        label: 'View Trends',
        icon: <TrendingUp className="h-4 w-4" />,
        onClick: (record) => handleViewTrends(record),
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
