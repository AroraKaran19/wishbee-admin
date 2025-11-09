'use client';

import React, { useState } from 'react';
import { Download, Edit, Pause, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { TableConfig } from '@/lib/types/table';
import { Button } from '@/components/ui/button';

export interface Coupon {
  id: string;
  offerName: string;
  code: string;
  discount: string;
  minCart: string;
  status: 'Active' | 'Upcoming' | 'Expired';
  validity: string;
}

interface CouponsTableProps {
  coupons: Coupon[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onExportCSV?: () => void;
  onEdit?: (coupon: Coupon) => void;
  onToggle?: (coupon: Coupon) => void;
  onDelete?: (coupon: Coupon) => void;
}

export function CouponsTable({
  coupons,
  currentPage,
  totalPages,
  onPageChange,
  onExportCSV,
  onEdit,
  onToggle,
  onDelete,
}: CouponsTableProps) {
  const handleEdit = (coupon: Coupon) => {
    onEdit?.(coupon);
  };

  const handleAction = (coupon: Coupon) => {
    if (coupon.status === 'Active') {
      onToggle?.(coupon);
    } else {
      onDelete?.(coupon);
    }
  };

  const tableConfig: TableConfig<Coupon> = {
    columns: [
      {
        key: 'offerName',
        title: 'Offer Name',
        align: 'left',
      },
      {
        key: 'code',
        title: 'Code',
        align: 'left',
      },
      {
        key: 'discount',
        title: 'Discount',
        align: 'left',
      },
      {
        key: 'minCart',
        title: 'Min. Cart',
        align: 'left',
      },
      {
        key: 'status',
        title: 'Status',
        align: 'center',
        render: (value) => {
          const statusColors: Record<string, { bg: string; text: string }> = {
            Active: { bg: 'bg-green-100', text: 'text-green-700' },
            Upcoming: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
            Expired: { bg: 'bg-red-100', text: 'text-red-700' },
          };
          const colors = statusColors[value as string] || { bg: 'bg-gray-100', text: 'text-gray-700' };
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
              {value}
            </span>
          );
        },
      },
      {
        key: 'validity',
        title: 'Validity',
        align: 'left',
      },
    ],
    actions: [
      {
        key: 'edit',
        label: '',
        icon: <Edit className="h-4 w-4" />,
        onClick: (record: Coupon) => handleEdit(record),
        variant: 'secondary',
        size: 'sm',
        className:
          'text-green-600 hover:text-green-700 bg-transparent hover:bg-green-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center',
      },
      {
        key: 'action',
        label: '',
        icon: <Pause className="h-4 w-4" />,
        onClick: (record: Coupon) => handleAction(record),
        variant: 'secondary',
        size: 'sm',
        className:
          'text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center',
        renderIcon: (record: Coupon) =>
          record.status === 'Active' ? <Pause className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />,
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
    <div className="">
      <div className="px-6 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Coupons and Promo Codes</h2>
        <Button onClick={onExportCSV} variant="danger" size="sm" className="flex py-2 items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>
      <div>
        <DataTable data={coupons} config={tableConfig} />
      </div>
    </div>
  );
}
