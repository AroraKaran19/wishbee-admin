'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Product, TableConfig } from '@/lib/types';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface LongUnsoldTableProps {
  items: Product[];
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

  const handleEditProduct = (item: Product) => {
    // Navigate to product edit page
    window.location.href = `/inventory/product/${item._id}/edit`;
  };

  const calculateDaysSinceLastSale = (lastSoldAt: Date | string | null | undefined): number | string => {
    if (!lastSoldAt) return 'Never sold';
    
    const lastSold = typeof lastSoldAt === 'string' ? new Date(lastSoldAt) : lastSoldAt;
    const today = new Date();
    const diffTime = today.getTime() - lastSold.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
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
        key: 'lastSoldAt',
        title: 'Days Since Last Sale',
        align: 'center',
        render: (value, record) => {
          const days = calculateDaysSinceLastSale(record.lastSoldAt);
          const isNeverSold = days === 'Never sold';
          return (
            <div className="text-sm">
              {isNeverSold ? (
                <span className="text-red-600 font-medium">{days}</span>
              ) : (
                <span className="text-gray-900 font-medium">{days} days</span>
              )}
            </div>
          );
        }
      },
      {
        key: 'stock',
        title: 'Stock Qty',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value ?? 0} units
          </div>
        )
      },
      {
        key: 'mrp',
        title: 'Price',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900 font-medium">
            {formatCurrency(value)}
          </div>
        )
      }
    ],
    actions: [
      {
        key: 'edit-product',
        label: 'Edit Product',
        icon: <Sparkles className="h-4 w-4" />,
        onClick: (record) => handleEditProduct(record),
        variant: 'primary',
        size: 'sm',
        className: 'text-white flex items-center gap-2'
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
