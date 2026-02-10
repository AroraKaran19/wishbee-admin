'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { CustomerTable } from './customer-table';
import { CustomerExportModal, CustomerExportRange } from './customer-export-modal';
import { customerApi, convertApiCustomerToUICustomer } from '@/lib/api/customers';
import { Customer } from '@/lib/types';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export function CustomerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 10;

  // Debounce search query - update debouncedSearchQuery after 500ms of no typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  // Fetch customers with pagination, search, and sorting
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch customers with pagination, search, and sorting
        const customerResponse = await customerApi.getAll({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchQuery || undefined,
          sortBy: sortBy,
          sortOrder: sortOrder,
        });
        
        // Convert API users to UI format
        const uiCustomers = customerResponse.users.map(convertApiCustomerToUICustomer);
        setCustomers(uiCustomers);
        setTotalPages(customerResponse.pagination.pages);
        
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [currentPage, debouncedSearchQuery, sortBy, sortOrder]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Don't reset currentPage here - let the debounced effect handle it
  };

  const handleCustomerUpdate = async () => {
    // Refetch customers after update
    try {
      setLoading(true);
      setError(null);
      
      const customerResponse = await customerApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });
      
      const uiCustomers = customerResponse.users.map(convertApiCustomerToUICustomer);
      setCustomers(uiCustomers);
      setTotalPages(customerResponse.pagination.pages);
    } catch (err) {
      console.error('Error refetching customers after update:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh customers');
    } finally {
      setLoading(false);
    }
  };

  const buildCSVFromCustomers = (list: Customer[]) => {
    const headers = ['Name', 'Store Name', 'Phone', 'Email', 'Customer ID', 'Total Spend', 'Loyalty Tier', 'Last Order', 'Status'];
    const escape = (v: string | number | undefined) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = list.map((customer) =>
      [
        escape(customer.name),
        escape(customer.storeName),
        escape(customer.phone),
        escape(customer.email),
        escape(customer.customerId),
        escape(customer.totalSpend),
        escape(customer.loyaltyTier),
        escape(customer.lastOrder),
        escape(customer.status),
      ].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (content: string, filename = 'customers.csv') => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportWithRange = async (range: CustomerExportRange) => {
    setExporting(true);
    try {
      let list: Customer[];
      if (range.rangeType === 'current') {
        list = customers;
      } else if (range.rangeType === 'all') {
        const all: Customer[] = [];
        let page = 1;
        let hasMore = true;
        while (hasMore) {
          const res = await customerApi.getAll({
            page,
            limit: itemsPerPage,
            search: debouncedSearchQuery || undefined,
            sortBy,
            sortOrder,
          });
          const ui = res.users.map(convertApiCustomerToUICustomer);
          all.push(...ui);
          hasMore = page < (res.pagination?.pages ?? 1);
          page += 1;
        }
        list = all;
      } else {
        const from = range.fromPage ?? 1;
        const to = range.toPage ?? from;
        const all: Customer[] = [];
        for (let p = from; p <= to; p++) {
          const res = await customerApi.getAll({
            page: p,
            limit: itemsPerPage,
            search: debouncedSearchQuery || undefined,
            sortBy,
            sortOrder,
          });
          all.push(...res.users.map(convertApiCustomerToUICustomer));
        }
        list = all;
      }
      if (list.length === 0) {
        toast.error('No customers to export');
        return;
      }
      const csv = buildCSVFromCustomers(list);
      const name = range.rangeType === 'all' ? 'customers-all.csv' : 'customers.csv';
      downloadCSV(csv, name);
      toast.success(`Exported ${list.length} customer${list.length === 1 ? '' : 's'}`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
      setExportModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    setExportModalOpen(true);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-500 mt-1 text-sm">
          View and manage customer details, loyalty, and order history to improve engagement and retention.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-shrink-0 mb-4 space-y-4">
          <SearchBar
            placeholder="Search by: Name, Phone, Email, Customer ID"
            onSearch={handleSearch}
            onSearchChange={setSearchQuery}
            searchValue={searchQuery}
            actions={[
              {
                key: 'export',
                label: 'Export CSV',
                icon: <Upload className="w-4 h-4" />,
                onClick: handleExportCSV,
                variant: 'danger',
                disabled: exporting,
              }
            ]}
          />
          
          {/* Sorting Controls */}
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-600 font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1); // Reset to first page when sorting changes
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="createdAt">Registration Date</option>
              <option value="updatedAt">Last Updated</option>
              <option value="totalSpend">Total Spend</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as 'asc' | 'desc');
                setCurrentPage(1); // Reset to first page when sort order changes
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading customers...</p>
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No customers found</p>
                <p className="text-gray-400 text-sm">
                  {debouncedSearchQuery
                    ? 'Try adjusting your search terms'
                    : 'No customers available'}
                </p>
              </div>
            </div>
          ) : (
            <CustomerTable
              customers={customers}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onCustomerUpdate={handleCustomerUpdate}
            />
          )}
        </div>
      </div>

      <CustomerExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportWithRange}
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={exporting}
      />
    </div>
  );
}
