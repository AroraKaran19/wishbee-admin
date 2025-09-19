'use client';

import React, { useState } from 'react';
import { MetricCard } from './metric-card';
import { SearchBar } from '@/components/ui/search-bar';
import { InventoryTable } from './inventory-table';
import { mockProducts, mockInventorySummary } from '@/lib/data/mockData';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { exportProductsToCSV } from '@/lib/utils/csv-export';
import { Plus, Upload } from 'lucide-react';

export function InventorySummary() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    exportProductsToCSV(filteredProducts, 'inventory-products');
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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

      <div className="flex-shrink-0 mb-4">
        <SearchBar
          placeholder="Search by: Product Name, Category, Brand"
          onSearch={handleSearch}
          onSearchChange={setSearchQuery}
          actions={[
            {
              key: 'add',
              label: 'Add Products',
              icon: <Plus className="w-4 h-4" />,
              href: '/inventory/add',
              variant: 'primary',
              onClick: () => {}
            },
            {
              key: 'export',
              label: 'Export CSV',
              icon: <Upload className="w-4 h-4" />,
              onClick: handleExportCSV,
              variant: 'danger'
            }
          ]}
        />
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
