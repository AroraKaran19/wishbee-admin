'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Order, TableConfig } from '@/lib/types';
import { Edit, Trash2, Download } from 'lucide-react';
import { OrderStatusModal } from './order-status-modal';
import { OrderDetailsModal } from './order-details-modal';
import { downloadOrderInvoice } from '@/lib/utils/invoice';
import toast from 'react-hot-toast';

interface OrderTableProps {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOrderUpdate?: (orderId: string, newStatus: string) => Promise<void>;
  onOrderDelete?: (orderId: string) => Promise<void>;
}

export function OrderTable({ 
  orders, 
  currentPage, 
  totalPages, 
  onPageChange,
  onOrderUpdate,
  onOrderDelete
}: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // Update the order in the local state
    if (onOrderUpdate) {
      await onOrderUpdate(orderId, newStatus);
    }
    setIsStatusModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCloseModal = () => {
    setIsStatusModalOpen(false);
    setSelectedOrder(null);
  };

  const handleDelete = async (order: Order) => {
    if (
      !confirm(
        `Are you sure you want to delete order "${order.orderId}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    if (onOrderDelete) {
      await onOrderDelete(order.id);
    }
  };

  const handleDownloadInvoice = async (order: Order) => {
    // Check if order is cancelled - prevent invoice generation
    if (order.status === 'Cancelled') {
      toast.error('Cannot generate invoice for cancelled orders', { id: 'invoice-download' });
      return;
    }

    // Check if order is delivered and payment is completed
    if (order.status !== 'Delivered') {
      toast.error('Invoice can only be generated for delivered orders', { id: 'invoice-download' });
      return;
    }

    const paymentStatus = order.paymentDetails?.status?.toUpperCase();
    if (paymentStatus !== 'COMPLETED') {
      toast.error('Invoice can only be generated for orders with completed payment', { id: 'invoice-download' });
      return;
    }

    try {
      toast.loading('Generating invoice...', { id: 'invoice-download' });
      await downloadOrderInvoice(order.id);
      toast.success('Invoice downloaded successfully', { id: 'invoice-download' });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to download invoice',
        { id: 'invoice-download' }
      );
    }
  };

  const handleOrderIdClick = (order: Order) => {
    setSelectedOrderId(order.id);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrderId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  const tableConfig: TableConfig<Order> = {
    columns: [
      {
        key: 'orderId',
        title: 'Order ID',
        align: 'center',
        render: (value, record) => (
          <button
            onClick={() => handleOrderIdClick(record)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
          >
            {value}
          </button>
        )
      },
      {
        key: 'amount',
        title: 'Amount',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {formatCurrency(value)}
          </div>
        )
      },
      {
        key: 'customer',
        title: 'Customer',
        align: 'center',
        render: (value, record) => {
          const customerName = [record.customerFirstName, record.customerLastName].filter(Boolean).join(" ");
          return (
            <div className="text-sm text-gray-900">
              {customerName ? (
                <div className="font-medium">
                  {customerName}
                </div>
              ) : null}
              <div className={`text-xs ${customerName ? 'text-gray-600' : 'text-gray-900'}`}>
                {value || "N/A"}
              </div>
            </div>
          );
        }
      },
      {
        key: 'status',
        title: 'Status',
        align: 'center',
        render: (value) => (
          <div className={`text-sm ${
            value === 'Delivered' ? 'text-green-600' : 
            value === 'Pending' ? 'text-blue-600' : 
            value === 'Processing' ? 'text-yellow-600' :
            value === 'Shipped' ? 'text-purple-600' :
            value === 'Cancelled' ? 'text-red-600' :
            value === 'Refunded' ? 'text-red-600' :
            value === 'Returned' ? 'text-orange-600' :
            'text-gray-600'
          }`}>
            {value}
          </div>
        )
      },
      {
        key: 'payment',
        title: 'Payment',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value}
          </div>
        )
      },
      {
        key: 'orderDate',
        title: 'Receiving Date',
        align: 'center',
        render: (value) => (
          <div className="text-sm text-gray-900">
            {formatDate(value)}
          </div>
        )
      }
    ],
    actions: [
      {
        key: 'download',
        label: '',
        icon: <Download className="h-4 w-4" />,
        onClick: (record) => handleDownloadInvoice(record),
        variant: 'secondary',
        size: 'sm',
        disabled: (record: Order) => {
          // Disable if cancelled
          if (record.status === 'Cancelled') {
            return true;
          }
          // Disable if not delivered
          if (record.status !== 'Delivered') {
            return true;
          }
          // Disable if payment is not completed
          const paymentStatus = record.paymentDetails?.status?.toUpperCase();
          if (paymentStatus !== 'COMPLETED') {
            return true;
          }
          return false;
        },
        className: 'text-blue-600 hover:text-blue-700 bg-transparent hover:bg-blue-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
      },
      {
        key: 'edit',
        label: '',
        icon: <Edit className="h-4 w-4" />,
        onClick: (record) => handleEdit(record),
        variant: 'secondary',
        size: 'sm',
        className: 'text-green-600 hover:text-green-700 bg-transparent hover:bg-green-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center'
      },
      {
        key: 'delete',
        label: '',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (record) => handleDelete(record),
        variant: 'secondary',
        size: 'sm',
        className: 'text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center'
      }
    ],
    pagination: {
      currentPage,
      totalPages,
      onPageChange,
      showPageInfo: true
    },
    rowKey: 'id',
    className: 'rounded-xl shadow-sm',
    rowClassName: () => 'hover:bg-gray-50'
  };

  return (
    <div>
      <DataTable data={orders} config={tableConfig} />
      <div className="h-4"></div>
      
      {/* Status Edit Modal */}
      <OrderStatusModal
        order={selectedOrder}
        isOpen={isStatusModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        orderId={selectedOrderId}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
}
