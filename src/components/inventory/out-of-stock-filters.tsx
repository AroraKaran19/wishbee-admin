'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic, Filter, Download } from 'lucide-react';

export function OutOfStockFilters() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportCSV = () => {
    console.log('Export CSV clicked');
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search by: Product Name, Category, Last Stocked Date"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <Button
              variant="primary"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <Mic className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <Filter className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleExportCSV}
        variant="danger"
        className="flex items-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span>Export CSV</span>
      </Button>
    </div>
  );
}
