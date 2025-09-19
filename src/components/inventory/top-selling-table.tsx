'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { TopSellingItem, TableConfig } from '@/lib/types';
import { Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface TopSellingTableProps {
  items: TopSellingItem[];
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

  const handleBoostPromo = (item: TopSellingItem) => {
    console.log('Boost promo for:', item);
  };

  const handleViewTrends = (item: TopSellingItem) => {
    console.log('View trends for:', item);
  };

  const tableConfig: TableConfig<TopSellingItem> = {
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
        key: 'soldQuantity',
        title: 'Sold Quantity (Last 30 Days)',
        align: 'center',
        render: (value, record) => (
          <div className="text-sm text-gray-900">
            {value.toLocaleString()} {record.unit}
          </div>
        )
      },
      {
        key: 'revenue',
        title: 'Revenue (₹)',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900 font-medium">
            ₹{value.toLocaleString()}
          </div>
        )
      },
      {
        key: 'remainingQuantity',
        title: 'Remaining Quantity',
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
        key: 'boost-promo',
        label: 'Boost Promo',
        icon: <Sparkles className="h-4 w-4" />,
        onClick: (record) => handleBoostPromo(record),
        variant: 'primary',
        size: 'sm',
        className: 'text-white',
        disabled: (record) => record.suggestedAction !== 'boost'
      },
      {
        key: 'view-trends',
        label: 'View Trends',
        icon: <TrendingUp className="h-4 w-4" />,
        onClick: (record) => handleViewTrends(record),
        variant: 'danger',
        size: 'sm',
        className: 'text-white',
        disabled: (record) => record.suggestedAction !== 'trends'
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
