'use client';

import React, { useState } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { OrderTable } from './order-table';
import { OrderSummaryCards } from './order-summary-cards';
import { mockOrders, mockOrderSummary } from '@/lib/data/mockData';
import { Upload } from 'lucide-react';

export function OrderPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  
  const filteredOrders = mockOrders.filter(order => 
    order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => 
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Overall Orders</h1>
        <p className="text-gray-500 mt-1 text-sm">
          View, filter, and manage all customer orders from one place.
        </p>
      </div>

      <div className="flex-shrink-0">
        <OrderSummaryCards summary={mockOrderSummary} />
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
            orders={currentOrders}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
