'use client';

import React, { useState } from 'react';
import { Banner } from '@/components/ui/banner';
import { SearchBar } from '@/components/ui/search-bar';
import { LowQuantityTable } from './low-quantity-table';
import { lowQuantityItems } from '@/lib/data/mockData';
import { exportToCSV } from '@/lib/utils/csv-export';
import { Download } from 'lucide-react';
import { LowQuantityItem } from '@/lib/types';

export function LowQuantityPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  
  const filteredItems = lowQuantityItems.filter(item => 
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    const columns = [
      { key: 'productName', label: 'Product Name' },
      { key: 'availableQuantity', label: 'Available Quantity' },
      { key: 'thresholdLevel', label: 'Threshold Level' },
      { key: 'supplierName', label: 'Supplier Name' }
    ];
    
    exportToCSV(filteredItems, 'low-quantity-items', columns as { key: keyof LowQuantityItem; label: string }[]);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Low Quantity Alerts</h1>
      </div>

      <Banner 
        variant="danger"
        message="These products are running low. Restock now to prevent disruption in sales."
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
          <LowQuantityTable
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
