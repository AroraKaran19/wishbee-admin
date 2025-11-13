'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Product, TableConfig } from '@/lib/types';
import { Trash2, Edit, CircleX } from 'lucide-react';
import Link from 'next/link';
import { productApi } from '@/lib/api/products';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ExpiredTableProps {
  items: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ExpiredTable({ 
  items, 
  currentPage, 
  totalPages, 
  onPageChange 
}: ExpiredTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (item: Product) => {
    router.push(`/inventory/product/${item._id}/edit`);
  };

  const handleDelete = async (item: Product) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(item._id ?? null);
      await productApi.delete(item._id ?? '');
      toast.success('Product deleted successfully');
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete product'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
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
        key: 'stock',
        title: 'Quantity',
        align: 'center',
        render: (value, record) => (
          <div className="text-sm text-gray-900">
            {value} {record.weight?.unit || 'units'}
          </div>
        )
      },
      {
        key: 'status',
        title: 'Status',
        align: 'center',
        render: () => (
          <div className="flex items-center justify-center">
            <div className="flex items-center text-red-600">
            <CircleX className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Expired</span>
            </div>
          </div>
        )
      }
    ],
    actions: [
      {
        key: 'edit',
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        onClick: (record) => handleEdit(record),
        variant: 'primary',
        size: 'sm',
        className: 'text-white',
        disabled: (record) => deletingId === record._id
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (record) => handleDelete(record),
        variant: 'danger',
        size: 'sm',
        className: 'text-white',
        disabled: (record) => deletingId === record._id
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
