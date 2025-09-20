'use client';

import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Customer, TableConfig } from '@/lib/types';
import { Edit, Trash2 } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CustomerTable({ 
  customers, 
  currentPage, 
  totalPages, 
  onPageChange 
}: CustomerTableProps) {

  const handleEdit = (customer: Customer) => {
    console.log('Edit customer:', customer);
  };

  const handleDelete = (customer: Customer) => {
    console.log('Delete customer:', customer);
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const tableConfig: TableConfig<Customer> = {
    columns: [
      {
        key: 'name',
        title: 'Name',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value}
          </div>
        )
      },
      {
        key: 'contact',
        title: 'Contact',
        align: 'center',
        render: (_, record) => (
          <div className="text-sm text-gray-900">
            {record.phone}
          </div>
        )
      },
      {
        key: 'totalSpend',
        title: 'Total Spend',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {formatCurrency(value)}
          </div>
        )
      },
      {
        key: 'loyaltyTier',
        title: 'Loyalty Tier',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value}
          </div>
        )
      },
      {
        key: 'lastOrder',
        title: 'Last Order',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value}
          </div>
        )
      },
      {
        key: 'status',
        title: 'Status',
        align: 'center',
        render: (value) => (
          <div className={`text-sm ${value === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
            {value}
          </div>
        )
      }
    ],
    actions: [
      {
        key: 'edit',
        label: '',
        icon: <Edit className="h-4 w-4" />,
        onClick: (record) => handleEdit(record),
        variant: 'secondary',
        size: 'sm',
        className: 'text-green-600 hover:text-green-700 bg-transparent hover:bg-green-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center'
      },
      {
        key: 'delete',
        label: '',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (record) => handleDelete(record),
        variant: 'secondary',
        size: 'sm',
        className: 'text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center'
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
      <DataTable data={customers} config={tableConfig} />
      <div className="h-4"></div>
    </div>
  );
}
