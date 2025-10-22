'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { OrderTable } from './order-table';
import { OrderSummaryCards } from './order-summary-cards';
import { orderApi, convertApiOrderToUIOrder, convertAnalyticsToOrderSummary } from '@/lib/api/orders';
import { Order, OrderSummary } from '@/lib/types';
import { Upload } from 'lucide-react';

export function OrderPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch orders and analytics on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch orders with pagination
        const orderResponse = await orderApi.getAll({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
        });
        
        // Convert API orders to UI format
        const uiOrders = orderResponse.orders.map(convertApiOrderToUIOrder);
        setOrders(uiOrders);
        setTotalPages(orderResponse.pagination.pages);
        
        // Fetch order analytics for summary cards
        const analytics = await orderApi.getAnalytics();
        const summary = convertAnalyticsToOrderSummary(analytics);
        setOrderSummary(summary);
        
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchQuery]);
  
  // Filter orders based on search query (client-side filtering for better UX)
  const filteredOrders = orders.filter(order => 
    order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => 
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleOrderUpdate = async (orderId: string, newStatus: string) => {
    // Refetch orders and analytics after status update
    try {
      setLoading(true);
      setError(null);
      
      // Fetch updated orders
      const orderResponse = await orderApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
      });
      
      // Convert API orders to UI format
      const uiOrders = orderResponse.orders.map(convertApiOrderToUIOrder);
      setOrders(uiOrders);
      setTotalPages(orderResponse.pagination.pages);
      
      // Fetch updated analytics
      const analytics = await orderApi.getAnalytics();
      const summary = convertAnalyticsToOrderSummary(analytics);
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
      ...filteredOrders.map(order => [
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

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Overall Orders</h1>
          <p className="text-gray-500 mt-1 text-sm">
            View, filter, and manage all customer orders from one place.
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Overall Orders</h1>
          <p className="text-gray-500 mt-1 text-sm">
            View, filter, and manage all customer orders from one place.
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <OrderTable
            orders={filteredOrders}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onOrderUpdate={handleOrderUpdate}
          />
        </div>
      </div>
    </div>
  );
}
