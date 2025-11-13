'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { CustomerTable } from './customer-table';
import { customerApi, convertApiCustomerToUICustomer } from '@/lib/api/customers';
import { Customer } from '@/lib/types';
import { Upload } from 'lucide-react';

export function CustomerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
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

  // Fetch customers with pagination and search
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch customers with pagination and debounced search
        const customerResponse = await customerApi.getAll({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchQuery || undefined,
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
  }, [currentPage, debouncedSearchQuery]);

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

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Name', 'Phone', 'Email', 'Customer ID', 'Total Spend', 'Loyalty Tier', 'Last Order', 'Status'];
    const csvContent = [
      headers.join(','),
      ...customers.map(customer => [
        customer.name,
        customer.phone,
        customer.email,
        customer.customerId,
        customer.totalSpend,
        customer.loyaltyTier,
        customer.lastOrder,
        customer.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div className="flex-shrink-0 mb-4">
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
                variant: 'danger'
              }
            ]}
          />
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
    </div>
  );
}
