'use client';

import React, { useState } from 'react';
import { Banner } from '@/components/ui/banner';
import { SearchBar } from '@/components/ui/search-bar';
import { ExpiredTable } from './expired-table';
import { expiredItems } from '@/lib/data/mockData_new';
import { exportToCSV } from '@/lib/utils/csv-export';
import { Upload } from 'lucide-react';
import { ExpiredItem } from '@/lib/types';

export function ExpiredPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  
  const filteredItems = expiredItems.filter(item => 
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
      { key: 'productName' as keyof ExpiredItem, label: 'Product Name' },
      { key: 'expiryDate' as keyof ExpiredItem, label: 'Expiry Date' },
      { key: 'quantity' as keyof ExpiredItem, label: 'Quantity' },
      { key: 'unit' as keyof ExpiredItem, label: 'Unit' },
      { key: 'status' as keyof ExpiredItem, label: 'Status' }
    ];
    
    exportToCSV(filteredItems, 'expired-items', columns);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Expired Inventory</h1>
      </div>

      <Banner 
        variant="danger"
        message="These products have passed their expiry date and must be removed from active inventory."
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
          <ExpiredTable
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
