'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Customer, TableConfig } from '@/lib/types';
import { Edit, Trash2 } from 'lucide-react';
import { CustomerEditModal } from './customer-edit-modal';
import { customerApi } from '@/lib/api/customers';
import toast from 'react-hot-toast';

interface CustomerTableProps {
  customers: Customer[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCustomerUpdate?: () => Promise<void>;
}

export function CustomerTable({ 
  customers, 
  currentPage, 
  totalPages, 
  onPageChange,
  onCustomerUpdate
}: CustomerTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDelete = async (customer: Customer) => {
    if (
      !confirm(
        `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(customer.id);
      await customerApi.delete(customer.id);
      toast.success('Customer deleted successfully');
      // Refresh the customer list
      if (onCustomerUpdate) {
        await onCustomerUpdate();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete customer'
      );
    } finally {
      setDeletingId(null);
    }
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
        className: 'text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center',
        disabled: (record) => deletingId === record.id
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
      
      {/* Customer Edit Modal */}
      <CustomerEditModal
        customer={selectedCustomer}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onCustomerUpdate={onCustomerUpdate}
      />
    </div>
  );
}
