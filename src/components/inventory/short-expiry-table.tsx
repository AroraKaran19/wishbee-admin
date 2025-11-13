'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Product, TableConfig } from '@/lib/types';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface ShortExpiryTableProps {
  items: Product[];
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

  const handleAddToFlashSale = (item: Product) => {
    // Navigate to product edit page
    window.location.href = `/inventory/product/${item._id}/edit`;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  };

  const calculateRemainingDays = (expiryDate: Date | string | undefined) => {
    if (!expiryDate) return 'N/A';
    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
        key: 'expiry',
        title: 'Expiry Date',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {formatDate(value)}
          </div>
        )
      },
      {
        key: 'expiry',
        title: 'Remaining Days',
        align: 'center',
        render: (value) => {
          const days = calculateRemainingDays(value);
          const isUrgent = typeof days === 'number' && days <= 7;
          return (
            <div className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
              {typeof days === 'number' ? `${days} Days` : days}
            </div>
          );
        }
      },
      {
        key: 'stock',
        title: 'Quantity',
        align: 'center',
        render: (value, record) => (
          <div className="text-sm text-gray-900">
            {value} {record.weight?.unit || 'units'}
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
    rowKey: '_id',
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
