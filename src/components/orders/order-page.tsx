'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { OrderTable } from './order-table';
import { OrderSummaryCards } from './order-summary-cards';
import { orderApi, convertApiOrderToUIOrder, convertStatsToOrderSummary, OrderPeriod } from '@/lib/api/orders';
import { Order, OrderSummary } from '@/lib/types';
import { Upload, Calendar, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { BulkInvoiceModal } from './bulk-invoice-modal';

// Map UI period labels to API period values
const periodMap: Record<string, OrderPeriod> = {
  "today": "today",
  "7days": "7days",
  "30days": "30days",
  "6months": "6months",
  "12months": "12months",
  "all-time": "all-time",
};

// Map API period to UI display label
const getPeriodLabel = (period: string): string => {
  const labels: Record<string, string> = {
    "today": "Today",
    "currentDate": "Today",
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
    "lastMonth": "Last 30 Days",
    "6months": "Last 6 Months",
    "12months": "Last 12 Months",
    "all-time": "All Time",
  };
  return labels[period] || period;
};

export function OrderPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [period, setPeriod] = useState<OrderPeriod | "custom">("30days");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  // Applied dates - only updated when submit button is clicked
  const [appliedStartDate, setAppliedStartDate] = useState<string>("");
  const [appliedEndDate, setAppliedEndDate] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isBulkInvoiceModalOpen, setIsBulkInvoiceModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Set default date range (last 30 days) when custom is first selected
  useEffect(() => {
    if (period === "custom" && !startDate && !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setEndDate(today.toISOString().split("T")[0]);
      setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    }
  }, [period, startDate, endDate]);

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

  // Fetch order stats (summary cards) - update when period changes
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const filters: { period?: OrderPeriod; startDate?: string; endDate?: string } = {};
        
        if (period === "custom" && appliedStartDate && appliedEndDate) {
          filters.startDate = appliedStartDate;
          filters.endDate = appliedEndDate;
        } else if (period !== "custom") {
          filters.period = period;
        } else {
          // Default to 7days if custom but no dates applied yet
          filters.period = "7days";
        }
        
        const stats = await orderApi.getStats(filters);
        const summary = convertStatsToOrderSummary(stats);
        setOrderSummary(summary);
      } catch (err) {
        console.error('Error fetching order stats:', err);
        // Don't show error for stats, just log it
      }
    };

    fetchStats();
  }, [period, appliedStartDate, appliedEndDate]);

  // Validate date range
  const isDateRangeValid = (): boolean => {
    if (!startDate || !endDate) return false;
    
    // Create date objects at midnight UTC to avoid timezone issues
    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T00:00:00.000Z");
    
    // Start date must be before end date (not equal, not after)
    return start < end;
  };

  // Handle custom date range submit
  const handleCustomRangeSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    // Validate date range
    if (!isDateRangeValid()) {
      toast.error("Start date must be before end date");
      return;
    }

    // Apply the dates - this will trigger the useEffects to fetch data
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1); // Reset to first page
  };

  // Fetch orders with pagination, search, and period/date filters
  useEffect(() => {
    const fetchOrders = async () => {
      // Don't fetch for custom period until dates are applied
      if (period === "custom" && (!appliedStartDate || !appliedEndDate)) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const filters: any = {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchQuery || undefined,
        };

        // Add period or date range filters
        if (period === "custom" && appliedStartDate && appliedEndDate) {
          filters.startDate = appliedStartDate;
          filters.endDate = appliedEndDate;
        } else if (period !== "custom") {
          filters.period = period;
        }
        
        // Fetch orders with pagination, search, and period/date filters
        const orderResponse = await orderApi.getAll(filters);
        
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
  }, [currentPage, debouncedSearchQuery, period, appliedStartDate, appliedEndDate]);

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
      
      const filters: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery || undefined,
      };

      // Add period or date range filters
      if (period === "custom" && appliedStartDate && appliedEndDate) {
        filters.startDate = appliedStartDate;
        filters.endDate = appliedEndDate;
      } else if (period !== "custom") {
        filters.period = period;
      }
      
      // Fetch updated orders
      const orderResponse = await orderApi.getAll(filters);
      
      // Convert API orders to UI format
      const uiOrders = orderResponse.orders.map(convertApiOrderToUIOrder);
      setOrders(uiOrders);
      setTotalPages(orderResponse.pagination.pages);
      
      // Fetch updated stats
      const statsFilters: { period?: OrderPeriod; startDate?: string; endDate?: string } = {};
      if (period === "custom" && appliedStartDate && appliedEndDate) {
        statsFilters.startDate = appliedStartDate;
        statsFilters.endDate = appliedEndDate;
      } else if (period !== "custom") {
        statsFilters.period = period;
      }
      const stats = await orderApi.getStats(statsFilters);
      const summary = convertStatsToOrderSummary(stats);
      setOrderSummary(summary);
      
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
      
      const filters: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery || undefined,
      };

      // Add period or date range filters
      if (period === "custom" && appliedStartDate && appliedEndDate) {
        filters.startDate = appliedStartDate;
        filters.endDate = appliedEndDate;
      } else if (period !== "custom") {
        filters.period = period;
      }
      
      // Refetch orders and stats after deletion
      const orderResponse = await orderApi.getAll(filters);
      
      // Convert API orders to UI format
      const uiOrders = orderResponse.orders.map(convertApiOrderToUIOrder);
      setOrders(uiOrders);
      setTotalPages(orderResponse.pagination.pages);
      
      // Fetch updated stats
      const statsFilters: { period?: OrderPeriod; startDate?: string; endDate?: string } = {};
      if (period === "custom" && appliedStartDate && appliedEndDate) {
        statsFilters.startDate = appliedStartDate;
        statsFilters.endDate = appliedEndDate;
      } else if (period !== "custom") {
        statsFilters.period = period;
      }
      const stats = await orderApi.getStats(statsFilters);
      const summary = convertStatsToOrderSummary(stats);
      setOrderSummary(summary);
      
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

      <div className="flex-shrink-0">
        {orderSummary && <OrderSummaryCards summary={orderSummary} />}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {/* Period Selector */}
        <div className="flex-shrink-0 mb-4">
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {Object.keys(periodMap).map((periodKey) => (
                <button
                  key={periodKey}
                  onClick={() => {
                    setPeriod(periodMap[periodKey]);
                    setCurrentPage(1); // Reset to first page when period changes
                    // Clear applied dates when switching away from custom
                    setAppliedStartDate("");
                    setAppliedEndDate("");
                  }}
                  className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors ${
                    period === periodMap[periodKey]
                      ? "bg-[#13aaff] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {getPeriodLabel(periodKey)}
                </button>
              ))}
              <button
                onClick={() => {
                  setPeriod("custom");
                  setCurrentPage(1); // Reset to first page when switching to custom
                  // Clear applied dates when switching to custom
                  setAppliedStartDate("");
                  setAppliedEndDate("");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  period === "custom"
                    ? "bg-[#13aaff] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Custom Range
              </button>
            </div>

            {/* Custom Date Range Picker */}
            {period === "custom" && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Selected Range:{" "}
                    {appliedStartDate && appliedEndDate ? (
                      <span className="text-[#13aaff]">
                        {new Date(appliedStartDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        to{" "}
                        {new Date(appliedEndDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    ) : startDate && endDate ? (
                      <span className={isDateRangeValid() ? "text-gray-600" : "text-red-600"}>
                        {new Date(startDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        to{" "}
                        {new Date(endDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {" "}(Not applied)
                      </span>
                    ) : (
                      <span className="text-gray-400">No dates selected</span>
                    )}
                  </p>
                  {startDate && endDate && !isDateRangeValid() && (
                    <p className="text-sm text-red-600 mt-1">
                      Start date must be before end date
                    </p>
                  )}
                </div>
                <div className="flex gap-4 items-end">
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                  />
                  <button
                    onClick={handleCustomRangeSubmit}
                    disabled={!startDate || !endDate || !isDateRangeValid()}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !startDate || !endDate || !isDateRangeValid()
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#13aaff] text-white hover:bg-[#0d8fd9]"
                    }`}
                  >
                    Apply Date Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 mb-4">
          <SearchBar
            placeholder="Search by: Order ID, Customer Name, Product"
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
    </div>
  );
}
