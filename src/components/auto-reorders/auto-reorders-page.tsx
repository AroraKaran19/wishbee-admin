'use client';

import React, { useMemo, useState } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { AutoReordersTable, AutoReorder } from './auto-reorders-table';

export function AutoReordersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const data: AutoReorder[] = useMemo(
    () => [
      {
        id: 'ar_1001',
        customer: 'Aniket',
        products: 'Milk, Bread',
        frequency: 'Everyday',
        nextOrder: '15 Jul 2025',
        payment: 'UPI',
        status: 'Active',
      },
      {
        id: 'ar_1002',
        customer: 'Tanya Singh',
        products: 'Rice (5kg)',
        frequency: 'Monthly',
        nextOrder: '15 Jul 2025',
        payment: 'COD',
        status: 'Paused',
      },
      {
        id: 'ar_1003',
        customer: 'Ramesh Verma',
        products: 'Oil, Sugar',
        frequency: 'Every Sunday',
        nextOrder: '15 Jul 2025',
        payment: 'UPI',
        status: 'Active',
      },
      {
        id: 'ar_1004',
        customer: 'Tanya Singh',
        products: 'Milk, Bread',
        frequency: 'Every Monday',
        nextOrder: '15 Jul 2025',
        payment: 'UPI',
        status: 'Active',
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return data;
    return data.filter((r) =>
      [r.customer, r.products, r.frequency, r.payment, r.status]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [data, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const current = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (query: string) => setSearchQuery(query);
  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Auto-Reorders</h1>
        <p className="text-gray-500 mt-1 text-sm">
          View and manage all active recurring orders set by your customers.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <SearchBar
            placeholder="Search by: Customer, Phone, Order ID, Product Name"
            onSearch={handleSearch}
            onSearchChange={setSearchQuery}
            showVoiceSearch={true}
            actions={[
              {
                key: 'export-pdf',
                label: 'Export PDF',
                onClick: () => console.log('Export PDF'),
                variant: 'danger',
              },
            ]}
          />
        </div>

        <div className="flex-1 min-h-0">
          <AutoReordersTable
            data={current}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}


