'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';
import { couponApi, Coupon } from '@/lib/api/coupons';
import { DataTable } from '@/components/ui/data-table';
import { TableConfig } from '@/lib/types';
import { SearchBar } from '@/components/ui/search-bar';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 10;

function formatDate(s: string | undefined) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return s;
  }
}

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await couponApi.getAll({
        page: pagination.currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
      });
      setCoupons(data.coupons || []);
      setPagination((prev) => ({
        ...prev,
        currentPage: data.pagination?.currentPage ?? 1,
        totalPages: data.pagination?.totalPages ?? 1,
        totalItems: data.pagination?.totalItems ?? 0,
        hasNext: data.pagination?.hasNext ?? false,
        hasPrev: data.pagination?.hasPrev ?? false,
      }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, debouncedSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handlePageChange = (page: number) => {
    setPagination((p) => ({ ...p, currentPage: page }));
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    try {
      setDeletingId(coupon._id);
      await couponApi.delete(coupon._id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  };

  const tableConfig: TableConfig<Coupon> = {
    columns: [
      {
        key: 'code',
        title: 'Code',
        align: 'center',
        render: (v, r) => (
          <span className="font-mono font-medium text-gray-900">{r.code}</span>
        ),
      },
      {
        key: 'type',
        title: 'Type',
        align: 'center',
        render: (v, r) => (
          <span className="capitalize text-sm text-gray-700">{r.type}</span>
        ),
      },
      {
        key: 'value',
        title: 'Value',
        align: 'center',
        render: (v, r) =>
          r.type === 'percentage' ? (
            <span className="text-sm">{r.value}%</span>
          ) : (
            <span className="text-sm">{formatCurrency(r.value)}</span>
          ),
      },
      {
        key: 'description',
        title: 'Description',
        align: 'left',
        render: (v, r) => (
          <span className="text-sm text-gray-600 line-clamp-2 max-w-[200px]">
            {r.description || '—'}
          </span>
        ),
      },
      {
        key: 'validFrom',
        title: 'Valid from',
        align: 'center',
        render: (v, r) => (
          <span className="text-sm text-gray-600">{formatDate(r.validFrom)}</span>
        ),
      },
      {
        key: 'validUntil',
        title: 'Valid until',
        align: 'center',
        render: (v, r) => (
          <span className="text-sm text-gray-600">{formatDate(r.validUntil)}</span>
        ),
      },
      {
        key: 'currentUses',
        title: 'Uses',
        align: 'center',
        render: (v, r) => (
          <span className="text-sm">
            {r.currentUses ?? 0}
            {r.maxUses != null ? ` / ${r.maxUses}` : ''}
          </span>
        ),
      },
      {
        key: 'isActive',
        title: 'Status',
        align: 'center',
        render: (v, r) => (
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              r.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {r.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
    ],
    actions: [
      {
        key: 'edit',
        label: '',
        icon: <Edit className="h-4 w-4" />,
        onClick: (record) => router.push(`/coupons/${record._id}/edit`),
        variant: 'secondary',
        size: 'sm',
        className: 'text-blue-600 hover:bg-blue-50 border-0 cursor-pointer',
      },
      {
        key: 'delete',
        label: '',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (record) => handleDelete(record),
        variant: 'danger',
        size: 'sm',
        className: 'text-white bg-red-600 hover:bg-red-700 border-0 cursor-pointer',
        disabled: (record) => deletingId === record._id,
      },
    ],
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      onPageChange: handlePageChange,
      showPageInfo: true,
    },
    rowKey: '_id',
    loading,
    emptyState: {
      title: 'No coupons',
      description: searchQuery
        ? 'Try a different search.'
        : 'Create a coupon to get started.',
    },
    className: 'rounded-xl shadow-sm',
    rowClassName: () => 'hover:bg-gray-50',
  };

  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.OFFERS_BANNERS}>
        <div className="space-y-6 flex flex-col h-full">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Coupons</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Create and manage discount coupons. GENERAL coupons are available to everyone;
              LIMITED coupons are restricted to specific users.
            </p>
          </div>

          <div className="flex-shrink-0">
            <SearchBar
              placeholder="Search by code or description..."
              onSearch={setSearchQuery}
              onSearchChange={setSearchQuery}
              searchValue={searchQuery}
              showFilter={false}
              actions={[
                {
                  key: 'add',
                  label: 'Add Coupon',
                  icon: <Plus className="w-4 h-4" />,
                  variant: 'primary',
                  href: '/coupons/new',
                  onClick: () => {},
                },
              ]}
            />
          </div>

          <div className="flex-1 min-h-0">
            {loading && coupons.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <DataTable data={coupons} config={tableConfig} />
            )}
            <div className="h-4" />
          </div>
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}
