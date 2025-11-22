'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Order } from '@/lib/types';
import { orderApi, convertApiOrderToUIOrder } from '@/lib/api/orders';
import { formatCurrency } from '@/lib/utils';

interface OrderDetailsModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ orderId, isOpen, onClose }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    } else {
      setOrder(null);
      setError(null);
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      const apiOrder = await orderApi.getById(orderId);
      const uiOrder = convertApiOrderToUIOrder(apiOrder);
      setOrder(uiOrder);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    // Handle both display format and API format
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'DELIVERED':
        return 'text-green-600 bg-green-50';
      case 'PENDING':
        return 'text-blue-600 bg-blue-50';
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-50';
      case 'SHIPPED':
        return 'text-purple-600 bg-purple-50';
      case 'CANCELLED':
      case 'CANCELED':
        return 'text-red-600 bg-red-50';
      case 'REFUNDED':
        return 'text-red-600 bg-red-50';
      case 'RETURNED':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatStatus = (status: string) => {
    // Convert API status to display format
    const statusMap: Record<string, string> = {
      'PENDING': 'Pending',
      'PROCESSING': 'Processing',
      'SHIPPED': 'Shipped',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled',
      'CANCELED': 'Cancelled',
      'REFUNDED': 'Refunded',
      'RETURNED': 'Returned',
    };
    return statusMap[status.toUpperCase()] || status;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchOrderDetails}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="text-lg font-semibold text-gray-900">{order.orderId}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.amount)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(order.orderDate)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2 text-gray-700">
                  {(order.customerFirstName || order.customerLastName) && (
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {[order.customerFirstName, order.customerLastName].filter(Boolean).join(" ") || "N/A"}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Phone:</span> {order.customer}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity} x {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.quantity * item.price - (item.discountApplied || 0))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
                <div className="text-gray-700">
                  <p>{order.address.street}</p>
                  {order.address.landmark && <p>{order.address.landmark}</p>}
                  <p>
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                  {order.address.country && <p>{order.address.country}</p>}
                  {order.address.type && (
                    <p className="text-sm text-gray-500 mt-1">Type: {order.address.type}</p>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              {order.billingAddress && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing Address</h3>
                  <div className="text-gray-700">
                    <p>{order.billingAddress.street}</p>
                    {order.billingAddress.landmark && <p>{order.billingAddress.landmark}</p>}
                    <p>
                      {order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.pincode}
                    </p>
                    {order.billingAddress.country && <p>{order.billingAddress.country}</p>}
                    {order.billingAddress.type && (
                      <p className="text-sm text-gray-500 mt-1">Type: {order.billingAddress.type}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Details */}
              {order.paymentDetails && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Details</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><span className="font-medium">Method:</span> {order.payment}</p>
                    {order.paymentDetails.transactionId && (
                      <p><span className="font-medium">Transaction ID:</span> {order.paymentDetails.transactionId}</p>
                    )}
                    {order.paymentDetails.status && (
                      <p><span className="font-medium">Payment Status:</span> {order.paymentDetails.status}</p>
                    )}
                    {order.paymentDetails.amount && (
                      <p><span className="font-medium">Amount:</span> {formatCurrency(order.paymentDetails.amount)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Slot */}
              {order.deliverySlot && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Slot</h3>
                  <div className="text-gray-700">
                    <p><span className="font-medium">Date:</span> {formatDate(order.deliverySlot.date)}</p>
                    {order.deliverySlot.timeWindow && (
                      <p><span className="font-medium">Time Window:</span> {order.deliverySlot.timeWindow}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Notes */}
              {order.orderNotes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Notes</h3>
                  <p className="text-gray-700">{order.orderNotes}</p>
                </div>
              )}

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tracking Information</h3>
                  <p className="text-gray-700">Tracking Number: {order.trackingNumber}</p>
                </div>
              )}

              {/* Update History */}
              {order.updateHistory && order.updateHistory.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Update History</h3>
                  <div className="space-y-3">
                    {order.updateHistory.map((history, index) => (
                      <div key={index} className="bg-white p-4 rounded border-l-4 border-blue-500">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(history.status)}`}>
                            {formatStatus(history.status)}
                          </span>
                          <p className="text-sm text-gray-500">{formatDate(history.updatedAt)}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Updated by:</span> {history.updatedBy}
                        </p>
                        {history.reason && (
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Reason:</span> {history.reason}
                          </p>
                        )}
                        {history.notes && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Notes:</span> {history.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.createdAt && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                )}
                {order.updatedAt && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(order.updatedAt)}</p>
                  </div>
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

