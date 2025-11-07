'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { TableConfig } from '@/lib/types/table';
import { Edit, Pause, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface AutoReorder {
  id: string;
  customer: string;
  products: string; // simple comma list display
  frequency: string; // e.g., Weekly, Every Monday, Monthly
  nextOrder: string; // formatted date string
  payment: 'UPI' | 'COD' | 'CARD';
  status: 'Active' | 'Paused';
}

interface AutoReordersTableProps {
  data: AutoReorder[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AutoReordersTable({ data, currentPage, totalPages, onPageChange }: AutoReordersTableProps) {
  const router = useRouter();
  const [rows, setRows] = useState<AutoReorder[]>(data);

  useEffect(() => {
    setRows(data);
  }, [data]);

  const handleEdit = (record: AutoReorder) => {
    router.push(`/auto-reorders/${record.id}`);
  };

  const handleToggleStatus = (record: AutoReorder) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' }
          : r
      )
    );
  };

  const tableConfig: TableConfig<AutoReorder> = {
    columns: [
      {
        key: 'customer',
        title: 'Customer',
        align: 'center',
      },
      {
        key: 'products',
        title: 'Products',
        align: 'center',
      },
      {
        key: 'frequency',
        title: 'Frequency',
        align: 'center',
      },
      {
        key: 'nextOrder',
        title: 'Next Order',
        align: 'center',
      },
      {
        key: 'payment',
        title: 'Payment',
        align: 'center',
      },
      {
        key: 'status',
        title: 'Status',
        align: 'center',
        render: (value) => (
          <div className={`text-sm ${value === 'Active' ? 'text-green-600' : 'text-orange-600'}`}>{value}</div>
        ),
      },
    ],
    actions: [
      {
        key: 'edit',
        label: '',
        icon: <Edit className="h-4 w-4" />,
        onClick: (record: AutoReorder) => handleEdit(record),
        variant: 'secondary',
        size: 'sm',
        className:
          'text-green-600 hover:text-green-700 bg-transparent hover:bg-green-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center',
      },
      {
        key: 'toggle',
        label: '',
        icon: (
          <span className="inline-flex items-center">
            <Pause className="h-4 w-4" />
          </span>
        ),
        onClick: (record: AutoReorder) => handleToggleStatus(record),
        variant: 'secondary',
        size: 'sm',
        className:
          'text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center',
        renderIcon: (record: AutoReorder) => (record.status === 'Active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />),
      } as any,
    ],
    pagination: {
      currentPage,
      totalPages,
      onPageChange,
      showPageInfo: true,
    },
    rowKey: 'id',
    className: 'rounded-xl shadow-sm',
    rowClassName: () => 'hover:bg-gray-50',
  };

  return (
    <div>
      <DataTable data={rows} config={tableConfig} />
      <div className="h-4"></div>
    </div>
  );
}
