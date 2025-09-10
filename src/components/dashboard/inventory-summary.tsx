'use client';

import React, { useState } from 'react';
import { MetricCard } from './metric-card';
import { SearchFilters } from './search-filters';
import { ActionButtons } from './action-buttons';
import { InventoryTable } from './inventory-table';
import { mockProducts, mockInventorySummary } from '@/lib/data/mockData';
import { formatCurrency, formatPercentage } from '@/lib/utils';

export function InventorySummary() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(mockProducts.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = mockProducts.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Overall Inventory Summary</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Quick snapshot of inventory status to assist order handling decisions.
        </p>
      </div>

      <div className="flex-shrink-0 flex flex-wrap gap-6 justify-start">
        <MetricCard
          title="Total Categories"
          value={mockInventorySummary.totalCategories}
          trend={`Last 30 Days ${formatPercentage(mockInventorySummary.trends.totalCategories.percentage)} ↑`}
          variant="blue"
        />
        <MetricCard
          title="Inventory value"
          value={formatCurrency(mockInventorySummary.inventoryValue)}
          trend={`Last 30 days ${formatPercentage(mockInventorySummary.trends.inventoryValue.percentage)} ↑`}
          variant="green"
        />
        <MetricCard
          title="Revenue Generated"
          value={formatCurrency(mockInventorySummary.revenueGenerated)}
          trend={`Last 30 Days ${formatPercentage(mockInventorySummary.trends.revenueGenerated.percentage)} ↑`}
          variant="light-blue"
        />
      </div>

      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <SearchFilters />
        <ActionButtons />
      </div>

      <div className="flex-1 min-h-0">
        <InventoryTable
          products={currentProducts}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <div className="h-4"></div>
      </div>
    </div>
  );
}
