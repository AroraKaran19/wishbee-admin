'use client';

import React, { useEffect, useState } from 'react';
import { X, Calendar, Download } from 'lucide-react';
import { customerApi, CustomerDetailsFilters } from '@/lib/api/customers';
import { convertApiOrderToUIOrder, OrderPeriod } from '@/lib/api/orders';
import { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { OrderTable } from '@/components/orders/order-table';
import { exportCustomerDataToCSV } from '@/lib/utils/csv-export';
import toast from 'react-hot-toast';

interface CustomerDetailsModalProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

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

export function CustomerDetailsModal({ customerId, isOpen, onClose }: CustomerDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatistics, setOrderStatistics] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [period, setPeriod] = useState<OrderPeriod | "custom">("30days");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
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

  // Fetch customer details and initial orders when modal opens
  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetails();
    } else {
      // Reset state when modal closes
      setCustomer(null);
      setOrders([]);
      setOrderStatistics(null);
      setCurrentPage(1);
      setPeriod("30days");
      setStartDate("");
      setEndDate("");
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setError(null);
    }
  }, [isOpen, customerId]);

  // Fetch orders when filters change (but only after customer is loaded)
  // For custom period, don't auto-fetch - wait for submit button
  useEffect(() => {
    if (isOpen && customerId && customer) {
      // Don't auto-fetch for custom period - user must click submit
      if (period === "custom") {
        return;
      }
      fetchOrders();
    }
  }, [isOpen, customerId, customer, currentPage, period, debouncedSearchQuery]);

  const fetchCustomerDetails = async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch with default filters (30days period, first page)
      const filters: CustomerDetailsFilters = {
        page: 1,
        limit: itemsPerPage,
        period: "30days",
      };

      const data = await customerApi.getComprehensiveDetails(customerId, filters);
      
      setCustomer(data.customer);
      setOrderStatistics(data.orderStatistics);
      
      // Convert API orders to UI format
      // The user field is now populated in the API response, so convertApiOrderToUIOrder will handle it
      const uiOrders = data.orders.map((apiOrder: any) => {
        const uiOrder = convertApiOrderToUIOrder(apiOrder);
        // If user is not populated (string ID), fallback to customer info
        if (data.customer && typeof apiOrder.user === 'string') {
          uiOrder.customerFirstName = data.customer.firstName;
          uiOrder.customerLastName = data.customer.lastName;
          // Update customer phone if not already set
          if (!uiOrder.customer && data.customer.phoneNumber) {
            uiOrder.customer = data.customer.phoneNumber;
          }
        }
        return uiOrder;
      });
      setOrders(uiOrders);
      setTotalPages(data.pagination.pages);
      
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customer details');
      toast.error(err instanceof Error ? err.message : 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!customerId) return;

    // Don't fetch for custom period until dates are set and valid
    if (period === "custom" && (!startDate || !endDate || !isDateRangeValid())) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const filters: CustomerDetailsFilters = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery || undefined,
      };

      // Add period or date range filters
      if (period === "custom" && startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      } else if (period !== "custom") {
        filters.period = period;
      }

      const data = await customerApi.getComprehensiveDetails(customerId, filters);
      
      // Update order statistics (they are filtered by period/date range)
      setOrderStatistics(data.orderStatistics);
      
      // Convert API orders to UI format
      // The user field is now populated in the API response, so convertApiOrderToUIOrder will handle it
      const uiOrders = data.orders.map((apiOrder: any) => {
        const uiOrder = convertApiOrderToUIOrder(apiOrder);
        // If user is not populated (string ID), fallback to customer info
        if (customer && typeof apiOrder.user === 'string') {
          uiOrder.customerFirstName = customer.firstName;
          uiOrder.customerLastName = customer.lastName;
          // Update customer phone if not already set
          if (!uiOrder.customer && customer.phoneNumber) {
            uiOrder.customer = customer.phoneNumber;
          }
        }
        return uiOrder;
      });
      setOrders(uiOrders);
      setTotalPages(data.pagination.pages);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

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

    setCurrentPage(1); // Reset to first page
    // Manually fetch orders with the custom date range
    await fetchOrders();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOrderUpdate = async (orderId: string, newStatus: string) => {
    // Refetch orders after update to refresh the list
    // fetchOrders already updates order statistics, so we just need to call it
    await fetchOrders();
  };

  const handleOrderDelete = async (orderId: string) => {
    // Refetch orders after delete to refresh the list
    // fetchOrders already updates order statistics, so we just need to call it
    await fetchOrders();
  };

  const handleExportData = () => {
    if (!customer) {
      toast.error("Customer data not available");
      return;
    }

    try {
      // Generate filename with customer name or ID
      const customerName = [customer.firstName, customer.lastName]
        .filter(Boolean)
        .join("_")
        .replace(/\s+/g, "_") || customer._id || "customer";
      const filename = `customer_${customerName}_${new Date().toISOString().split("T")[0]}`;

      exportCustomerDataToCSV(customer, orderStatistics, filename);
      toast.success("Customer data exported successfully");
    } catch (error) {
      console.error("Error exporting customer data:", error);
      toast.error("Failed to export customer data");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
          <div className="flex items-center gap-3">
            {customer && (
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-[#13aaff] text-white rounded-lg hover:bg-[#0d8fd9] transition-colors text-sm font-medium"
                title="Export customer data to CSV"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && !customer ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error && !customer ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchCustomerDetails}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : customer ? (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium text-gray-900">{customer.phoneNumber || "N/A"}</span>
                  </div>
                  {customer.email && (
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 font-medium text-gray-900">{customer.email}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 font-medium ${customer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {customer.loyaltyTier && (
                    <div>
                      <span className="text-gray-500">Loyalty Tier:</span>
                      <span className="ml-2 font-medium text-gray-900">{customer.loyaltyTier}</span>
                    </div>
                  )}
                  {customer.loyaltyPoints !== undefined && (
                    <div>
                      <span className="text-gray-500">Loyalty Points:</span>
                      <span className="ml-2 font-medium text-gray-900">{customer.loyaltyPoints}</span>
                    </div>
                  )}
                  {/* Note: govtId is not in Customer interface, would need to fetch from API */}
                  {customer.storeName && (
                    <div>
                      <span className="text-gray-500">Store Name:</span>
                      <span className="ml-2 font-medium text-gray-900">{customer.storeName}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Registration Date:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatDate(customer.createdAt)}</span>
                  </div>
                </div>

                {/* Addresses - Only show default address */}
                {customer.addresses && customer.addresses.length > 0 && (() => {
                  const defaultAddress = customer.addresses.find((address: any) => address.isDefault === true);
                  if (!defaultAddress) return null;
                  
                  return (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Addresses</h4>
                      <div className="bg-white p-3 rounded border text-sm">
                        <div className="font-medium text-gray-900">{defaultAddress.type}</div>
                        <div className="text-gray-600">
                          {defaultAddress.addressLine}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postalCode}
                        </div>
                        {defaultAddress.storeName && (
                          <div className="text-gray-600">Store: {defaultAddress.storeName}</div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Order Statistics */}
              {orderStatistics && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Total Orders</div>
                      <div className="text-xl font-semibold text-gray-900">{orderStatistics.totalOrders || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Total Spend</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {/* NOTE: totalSpend from API currently includes PENDING and CANCELLED orders */}
                        {/* This should be fixed on the backend API to exclude these statuses */}
                        {formatCurrency(orderStatistics.totalSpend || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Delivered</div>
                      <div className="text-xl font-semibold text-green-600">{orderStatistics.totalDelivered || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Pending</div>
                      <div className="text-xl font-semibold text-yellow-600">{orderStatistics.totalPending || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Cancelled</div>
                      <div className="text-xl font-semibold text-red-600">{orderStatistics.totalCancelled || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Returned</div>
                      <div className="text-xl font-semibold text-orange-600">{orderStatistics.totalReturned || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">UPI Orders</div>
                      <div className="text-xl font-semibold text-gray-900">{orderStatistics.totalUPIOrders || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">COD Orders</div>
                      <div className="text-xl font-semibold text-gray-900">{orderStatistics.totalCODOrders || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Card Orders</div>
                      <div className="text-xl font-semibold text-gray-900">{orderStatistics.totalCardOrders || 0}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order History */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order History</h3>
                
                {/* Search Input */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search orders by Order ID, Product name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Period Selector */}
                <div className="mb-4 space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(periodMap).map((periodKey) => (
                      <button
                        key={periodKey}
                        onClick={() => {
                          setPeriod(periodMap[periodKey]);
                          setCurrentPage(1);
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
                        setCurrentPage(1);
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
                          {startDate && endDate ? (
                            <span className={isDateRangeValid() ? "text-[#13aaff]" : "text-red-600"}>
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

                {/* Orders Table */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No orders found for this period
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
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

