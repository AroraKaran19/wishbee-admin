'use client';

import React, { useState } from 'react';
import { SuccessBanner } from '@/components/ui/banner';
import { SearchBar } from '@/components/ui/search-bar';
import { TopSellingTable } from './top-selling-table';
import { topSellingItems } from '@/lib/data/mockData';
import { exportTopSellingToCSV } from '@/lib/utils/csv-export';
import { Upload } from 'lucide-react';

export function TopSellingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  
  const filteredItems = topSellingItems.filter(item => 
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.unit.toLowerCase().includes(searchQuery.toLowerCase())
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
    exportTopSellingToCSV(filteredItems, 'top-selling-items');
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Top Selling Stock</h1>
      </div>

      <SuccessBanner 
        message="These are your highest-performing products. Keep them well-stocked and strategically promoted to maintain momentum."
      />

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <SearchBar
            placeholder="Search by: Product Name, Category, Last Stocked Date"
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
          <TopSellingTable
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
