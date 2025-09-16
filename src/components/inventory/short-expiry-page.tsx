'use client';

import React, { useState } from 'react';
import { Banner } from '@/components/ui/banner';
import { SearchBar } from '@/components/ui/search-bar';
import { ShortExpiryTable } from './short-expiry-table';
import { shortExpiryItems } from '@/lib/data/mockData';
import { exportToCSV } from '@/lib/utils/csv-export';
import { Download } from 'lucide-react';
import { ShortExpiryItem } from '@/lib/types';

export function ShortExpiryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  
  const filteredItems = shortExpiryItems.filter(item => 
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
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
    const columns = [
      { key: 'productName' as keyof ShortExpiryItem, label: 'Product Name' },
      { key: 'expiryDate' as keyof ShortExpiryItem, label: 'Expiry Date' },
      { key: 'remainingDays' as keyof ShortExpiryItem, label: 'Remaining Days' },
      { key: 'quantity' as keyof ShortExpiryItem, label: 'Quantity' },
      { key: 'unit' as keyof ShortExpiryItem, label: 'Unit' }
    ];
    
    exportToCSV(filteredItems, 'short-expiry-items', columns);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Short Expiry Stock</h1>
      </div>

      <Banner 
        variant="danger"
        message="These items are nearing expiry. Consider marking them down or moving to clearance sale to avoid losses."
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
                icon: <Download className="w-4 h-4" />,
                onClick: handleExportCSV,
                variant: 'danger'
              }
            ]}
          />
        </div>
        
        <div className="flex-1 min-h-0">
          <ShortExpiryTable
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
