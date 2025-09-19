'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { LowQuantityItem, TableConfig } from '@/lib/types';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface LowQuantityTableProps {
  items: LowQuantityItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function LowQuantityTable({ 
  items, 
  currentPage, 
  totalPages, 
  onPageChange 
}: LowQuantityTableProps) {

  const handleRestock = (item: LowQuantityItem) => {
    console.log('Restock item:', item);
  };

  const getQuantityColor = (quantity: number, threshold: number) => {
    const percentage = (quantity / threshold) * 100;
    if (percentage <= 30) return 'bg-red-500';
    if (percentage <= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };


  const tableConfig: TableConfig<LowQuantityItem> = {
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
        key: 'availableQuantity',
        title: 'Available Quantity',
        align: 'center',
        render: (value, record) => {
          const percentage = (value / record.thresholdLevel) * 100;
          const width = Math.min(percentage, 100);
          
          return (
            <div className="space-y-2">
              <div className="text-sm text-gray-900 font-medium">
                {value.toString().padStart(2, '0')} {record.unit}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getQuantityColor(value, record.thresholdLevel)}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        }
      },
      {
        key: 'thresholdLevel',
        title: 'Threshold Level',
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
