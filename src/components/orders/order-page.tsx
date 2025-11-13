'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { OrderTable } from './order-table';
import { OrderSummaryCards } from './order-summary-cards';
import { orderApi, convertApiOrderToUIOrder, convertStatsToOrderSummary } from '@/lib/api/orders';
import { Order, OrderSummary } from '@/lib/types';
import { Upload } from 'lucide-react';

export function OrderPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

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

  // Fetch order stats (summary cards) - only once on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await orderApi.getStats();
        const summary = convertStatsToOrderSummary(stats);
        setOrderSummary(summary);
      } catch (err) {
        console.error('Error fetching order stats:', err);
        // Don't show error for stats, just log it
      }
    };

    fetchStats();
  }, []);

  // Fetch orders with pagination and search
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch orders with pagination and debounced search
        const orderResponse = await orderApi.getAll({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchQuery || undefined,
        });
        
        // Convert API orders to UI format
        const uiOrders = orderResponse.orders.map(convertApiOrderToUIOrder);
        setOrders(uiOrders);
        setTotalPages(orderResponse.pagination.pages);
        
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, debouncedSearchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Don't reset currentPage here - let the debounced effect handle it
  };

  const handleOrderUpdate = async (orderId: string, newStatus: string) => {
    // Refetch orders and stats after status update
    try {
      setLoading(true);
      setError(null);
      
      // Fetch updated orders
      const orderResponse = await orderApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery || undefined,
      });
      
      // Convert API orders to UI format
      const uiOrders = orderResponse.orders.map(convertApiOrderToUIOrder);
      setOrders(uiOrders);
      setTotalPages(orderResponse.pagination.pages);
      
      // Fetch updated stats
      const stats = await orderApi.getStats();
      const summary = convertStatsToOrderSummary(stats);
      setOrderSummary(summary);
      
    } catch (err) {
      console.error('Error refetching orders after update:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh orders');
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

      <div className="flex-shrink-0">
        {orderSummary && <OrderSummaryCards summary={orderSummary} />}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <SearchBar
            placeholder="Search by: Order ID, Customer Name, Product"
            onSearch={handleSearch}
            onSearchChange={setSearchQuery}
            searchValue={searchQuery}
            actions={[
              {
                key: 'export',
                label: 'Export PDF',
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
            />
          )}
        </div>
      </div>
    </div>
  );
}
