'use client';

import React, { useState } from 'react';
import { WarningBanner } from '@/components/ui/banner';
import { SearchBar } from '@/components/ui/search-bar';
import { OutOfStockTable } from './out-of-stock-table';
import { outOfStockItems } from '@/lib/data/mockData';
import { exportOutOfStockToCSV } from '@/lib/utils/csv-export';
import { Upload } from 'lucide-react';

export function OutOfStockPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  
  const filteredItems = outOfStockItems.filter(item => 
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    exportOutOfStockToCSV(filteredItems, 'out-of-stock-items');
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Out of Stock Items</h1>
      </div>

        <WarningBanner 
          message="These items are out of stock and need immediate restocking to avoid customer dissatisfaction."
        />

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <SearchBar
            placeholder="Search by: Product Name, Category, Supplier"
            onSearch={handleSearch}
            onSearchChange={setSearchQuery}
            actions={[
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
          <OutOfStockTable
            items={currentItems}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
