"use client";

import React, { useState } from "react";
import { Order } from "@/lib/types";
import { orderApi } from "@/lib/api/orders";
import { X, Check } from "lucide-react";
import toast from "react-hot-toast";

interface OrderStatusModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string) => Promise<void>;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending", color: "text-blue-600" },
  { value: "PROCESSING", label: "Processing", color: "text-yellow-600" },
  { value: "SHIPPED", label: "Shipped", color: "text-purple-600" },
  { value: "DELIVERED", label: "Delivered", color: "text-green-600" },
  { value: "CANCELLED", label: "Cancelled", color: "text-red-600" },
  { value: "REFUNDED", label: "Refunded", color: "text-red-600" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "COD", label: "Cash on Delivery" },
  { value: "CARD", label: "Card" },
  { value: "UPI", label: "UPI" },
  { value: "NET_BANKING", label: "Net Banking" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

export function OrderStatusModal({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
}: OrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen && order) {
      // Convert display status to API format
      const statusStr = String(order.status);
      const statusApiFormat = 
        statusStr === "Delivered" ? "DELIVERED" :
        statusStr === "Cancelled" ? "CANCELLED" :
        statusStr === "Processing" ? "PROCESSING" :
        statusStr === "Shipped" ? "SHIPPED" :
        statusStr === "Refunded" ? "REFUNDED" :
        "PENDING";
      setSelectedStatus(statusApiFormat);
      setNotes("");
      setError(null);
      
      // Set payment fields from order
      const currentPaymentMethod = order.paymentDetails?.method || 
        (order.payment === "COD" ? "COD" : 
         order.payment === "Card" ? "CARD" :
         order.payment === "UPI" ? "UPI" : "NET_BANKING");
      setPaymentMethod(currentPaymentMethod);
      setPaymentStatus(order.paymentDetails?.status || "PENDING");
      setTransactionId(order.paymentDetails?.transactionId || "");
    }
  }, [isOpen, order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !selectedStatus) return;

    setIsUpdating(true);
    setError(null);

    try {
      // Convert current status to API format for comparison
      const currentStatusApi = 
        order.status === "Delivered" ? "DELIVERED" :
        order.status === "Cancelled" ? "CANCELLED" :
        order.status === "Processing" ? "PROCESSING" :
        order.status === "Shipped" ? "SHIPPED" :
        "PENDING";
      
      // Check if status changed
      const statusChanged = selectedStatus !== currentStatusApi;
      
      // Check if payment changed (excluding transactionId as it cannot be changed)
      const currentPaymentMethod = order.paymentDetails?.method || 
        (order.payment === "COD" ? "COD" : 
         order.payment === "Card" ? "CARD" :
         order.payment === "UPI" ? "UPI" : "NET_BANKING");
      const currentPaymentStatus = order.paymentDetails?.status || "PENDING";
      
      const paymentChanged = 
        paymentMethod !== currentPaymentMethod ||
        paymentStatus !== currentPaymentStatus;
      
      // Only make API call if something changed
      if (statusChanged || paymentChanged) {
        // Prepare payment object if payment changed
        // Note: transactionId is not included as it cannot be changed
        const paymentData = paymentChanged ? {
          method: paymentMethod,
          status: paymentStatus,
        } : undefined;
        
        try {
          await orderApi.updateStatus(
            order.id, 
            selectedStatus, 
            notes || undefined,
            paymentData
          );
          
          await onStatusUpdate(order.id, selectedStatus);
          toast.success("Order updated successfully");
        } catch (statusErr: any) {
          // Handle specific error for cancelled orders
          const errorMessage = statusErr?.message || statusErr?.error?.message || "Failed to update order";
          if (errorMessage.includes("cannot be changed once it has been cancelled") || 
              errorMessage.includes("cancelled") ||
              errorMessage.includes("REFUNDED")) {
            toast.error("Order cannot be changed once it has been cancelled or refunded");
            setIsUpdating(false);
            return;
          }
          throw statusErr;
        }
      } else {
        // If nothing changed, just close
        onClose();
        return;
      }
      
      onClose();
    } catch (err: any) {
      console.error("Error updating order:", err);
      const errorMessage = err?.message || err?.error?.message || "Failed to update order";
      
      // Show toast for errors
      if (errorMessage.includes("cannot be changed once it has been cancelled") || 
          errorMessage.includes("cancelled")) {
        toast.error("Order cannot be changed once it has been cancelled");
      } else {
        toast.error(errorMessage);
      }
      
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  if (!isOpen || !order) return null;

  // Check if order is cancelled or refunded
  const statusStr = String(order.status);
  const isCancelledOrRefunded = 
    statusStr === "Cancelled" || 
    statusStr === "CANCELLED" ||
    statusStr === "Refunded" ||
    statusStr === "REFUNDED" ||
    selectedStatus === "CANCELLED" ||
    selectedStatus === "REFUNDED";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Order
          </h3>
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Order Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Order ID</div>
            <div className="font-medium text-gray-900">{order.orderId}</div>
            <div className="text-sm text-gray-600 mt-1">
              Customer: {order.customer}
            </div>
            <div className="text-sm text-gray-600">Amount: ₹{order.amount}</div>
          </div>

          {/* Current Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <div
              className={`text-sm font-medium ${
                order.status === "Delivered"
                  ? "text-green-600"
                  : order.status === "Pending"
                  ? "text-blue-600"
                  : order.status === "Processing"
                  ? "text-yellow-600"
                  : order.status === "Shipped"
                  ? "text-purple-600"
                  : order.status === "Cancelled"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {order.status}
            </div>
          </div>

          {/* New Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status *
            </label>
            {isCancelledOrRefunded ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                {statusStr === "Cancelled" || statusStr === "CANCELLED" || selectedStatus === "CANCELLED"
                  ? "Cancelled" 
                  : "Refunded"}
              </div>
            ) : (
              <select
                value={selectedStatus}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  // Show warning for CANCELLED or REFUNDED
                  if (newStatus === "CANCELLED" || newStatus === "REFUNDED") {
                    setPendingStatus(newStatus);
                    setShowWarningModal(true);
                  } else {
                    setSelectedStatus(newStatus);
                  }
                }}
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                required
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {isCancelledOrRefunded && (
              <p className="mt-2 text-sm text-gray-500">
                This order cannot be changed once it has been cancelled or refunded.
              </p>
            )}
          </div>

          {/* Payment Section */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Payment Information</h4>
            
            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {PAYMENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction ID */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID
              </label>
              <input
                type="text"
                value={transactionId}
                readOnly
                disabled={true}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                placeholder="Transaction ID cannot be changed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Transaction ID cannot be modified
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isUpdating}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Add any notes about this status change..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUpdating}
              className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !selectedStatus}
              className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </button>
          </div>
        </form>

        {/* Warning Confirmation Modal */}
        {showWarningModal && pendingStatus && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-lg font-semibold mb-4 text-red-600">
                Warning: Irreversible Action
              </h2>
              <p className="text-gray-700 mb-4">
                You are about to mark this order as{" "}
                <span className="font-semibold text-red-600">
                  {pendingStatus === "CANCELLED" ? "Cancelled" : "Refunded"}
                </span>
                . This action cannot be undone.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Once an order is{" "}
                  {pendingStatus === "CANCELLED" ? "cancelled" : "refunded"}, it
                  cannot be changed back to any other status.
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg mb-6">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-medium text-gray-900">{order?.orderId}</p>
                <p className="text-sm text-gray-600 mt-1">Amount</p>
                <p className="font-medium text-gray-900">₹{order?.amount}</p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowWarningModal(false);
                    setPendingStatus(null);
                  }}
                  disabled={isUpdating}
                  className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus(pendingStatus);
                    setShowWarningModal(false);
                    setPendingStatus(null);
                  }}
                  disabled={isUpdating}
                  className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm {pendingStatus === "CANCELLED" ? "Cancellation" : "Refund"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
