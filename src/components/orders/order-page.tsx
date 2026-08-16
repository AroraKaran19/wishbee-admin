'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { OrderTable } from './order-table';
import { PeriodFilter, usePeriodFilter } from './period-filter';
import { StaffActivityCard } from './staff-activity-card';
import { OrderStatusFilter, getOrderStatusLabel } from './order-status-filter';
import { orderApi, convertApiOrderToUIOrder } from '@/lib/api/orders';
import { Order } from '@/lib/types';
import { Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { BulkInvoiceModal } from './bulk-invoice-modal';
import { PosBulkInvoiceModal } from './pos-bulk-invoice-modal';
import { buildPeriodFilters } from '@/lib/utils/order-period';

export function OrderPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isBulkInvoiceModalOpen, setIsBulkInvoiceModalOpen] = useState(false);
  const [isPosBulkInvoiceModalOpen, setIsPosBulkInvoiceModalOpen] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const itemsPerPage = 10;

  const resetToFirstPage = useCallback(() => setCurrentPage(1), []);
  const filter = usePeriodFilter(resetToFirstPage);
  const { period, appliedStartDate, appliedEndDate, ready } = filter;

  // Debounce search query - update debouncedSearchQuery after 500ms of no typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const buildOrderFilters = useCallback(() => {
    return {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchQuery || undefined,
      status: statusFilter || undefined,
      ...buildPeriodFilters(period, appliedStartDate, appliedEndDate),
    };
  }, [currentPage, debouncedSearchQuery, statusFilter, period, appliedStartDate, appliedEndDate]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const loadOrders = useCallback(async () => {
    const orderResponse = await orderApi.getAll(buildOrderFilters());
    setOrders(orderResponse.orders.map(convertApiOrderToUIOrder));
    setTotalPages(orderResponse.pagination.pages);
  }, [buildOrderFilters]);

  // Fetch orders with pagination, search, and period/date filters
  useEffect(() => {
    // Wait until the stored/URL period has been resolved
    if (!ready) return;

    // Don't fetch for custom period until dates are applied
    if (period === 'custom' && (!appliedStartDate || !appliedEndDate)) {
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        await loadOrders();
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [ready, period, appliedStartDate, appliedEndDate, loadOrders]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Don't reset currentPage here - let the debounced effect handle it
  };

  const handleOrderUpdate = async () => {
    // Refetch orders after status update
    try {
      setLoading(true);
      setError(null);
      await loadOrders();
      setActivityRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error refetching orders after update:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);

      await orderApi.delete(orderId);
      toast.success('Order deleted successfully');

      await loadOrders();
      setActivityRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error deleting order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete order';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // Create CSV content (for now, as PDF export would require additional libraries)
    const headers = ['Order ID', 'Amount', 'Customer', 'Status', 'Payment', 'Delivery Date'];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.orderId,
        order.amount,
        order.customer,
        order.status,
        order.payment,
        order.deliveryDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Overall Orders</h1>
        <p className="text-gray-500 mt-1 text-sm">
          View, filter, and manage all customer orders from one place.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {/* Period Selector */}
        <div className="flex-shrink-0 mb-4">
          <PeriodFilter filter={filter} />
        </div>

        <div className="flex-shrink-0 mb-4">
          <StaffActivityCard
            filters={buildPeriodFilters(period, appliedStartDate, appliedEndDate)}
            ready={ready}
            refreshKey={activityRefreshKey}
          />
        </div>

        <div className="flex-shrink-0 mb-4">
          <OrderStatusFilter value={statusFilter} onChange={handleStatusChange} />
        </div>

        <div className="flex-shrink-0 mb-4">
          <SearchBar
            placeholder="Search by: Order ID, Customer, Store, Mobile, Amount, Product"
            onSearch={handleSearch}
            onSearchChange={setSearchQuery}
            searchValue={searchQuery}
            actions={[
              {
                key: 'bulk-invoice',
                label: 'Bulk Download Invoices',
                icon: <Download className="w-4 h-4" />,
                onClick: () => setIsBulkInvoiceModalOpen(true),
                variant: 'primary'
              },
              {
                key: 'pos-bulk-invoice',
                label: 'POS Orders Invoices',
                icon: <Download className="w-4 h-4" />,
                onClick: () => setIsPosBulkInvoiceModalOpen(true),
                variant: 'primary'
              },
              {
                key: 'export',
                label: 'Export Page',
                icon: <Upload className="w-4 h-4" />,
                onClick: handleExportPDF,
                variant: 'danger'
              }
            ]}
          />
        </div>

        <div className="flex-1 min-h-0">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No orders found</p>
                <p className="text-gray-400 text-sm">
                  {debouncedSearchQuery
                    ? 'Try adjusting your search terms'
                    : statusFilter
                    ? `No ${getOrderStatusLabel(statusFilter).toLowerCase()} orders in this period`
                    : 'No orders available'}
                </p>
              </div>
            </div>
          ) : (
            <OrderTable
              orders={orders}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onOrderUpdate={handleOrderUpdate}
              onOrderDelete={handleOrderDelete}
            />
          )}
        </div>
      </div>

      {/* Bulk Invoice Modal */}
      <BulkInvoiceModal
        isOpen={isBulkInvoiceModalOpen}
        onClose={() => setIsBulkInvoiceModalOpen(false)}
      />

      {/* POS Bulk Invoice Modal */}
      <PosBulkInvoiceModal
        isOpen={isPosBulkInvoiceModalOpen}
        onClose={() => setIsPosBulkInvoiceModalOpen(false)}
      />
    </div>
  );
}
