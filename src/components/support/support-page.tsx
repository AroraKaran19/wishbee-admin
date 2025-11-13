'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { SupportTable } from './support-table';
import { enquiryApi, Enquiry, EnquiryFilters } from '@/lib/api/enquiries';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export function SupportPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'RESOLVED' | 'CLOSED' | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const itemsPerPage = 10;

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  // Fetch enquiries
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters: EnquiryFilters = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (statusFilter !== 'ALL') {
          filters.status = statusFilter;
        }

        if (typeFilter !== 'ALL') {
          filters.type = typeFilter;
        }

        // Note: The API doesn't support search, but we can filter by userId if needed
        // For now, we'll do client-side filtering if search is provided

        const response = await enquiryApi.getAll(filters);
        setEnquiries(response.enquiries);
        setTotalPages(response.totalPages);
        setTotal(response.total);
      } catch (err) {
        console.error('Error fetching enquiries:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enquiries';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [currentPage, statusFilter, typeFilter]);

  // Client-side search filtering
  const filteredEnquiries = debouncedSearchQuery
    ? enquiries.filter((enquiry) => {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const userName = `${enquiry.user.firstName} ${enquiry.user.lastName}`.toLowerCase();
        const userEmail = enquiry.user.email?.toLowerCase() || '';
        const userPhone = enquiry.user.phoneNumber?.toLowerCase() || '';
        const message = enquiry.message?.toLowerCase() || '';
        const type = enquiry.type?.toLowerCase() || '';

        return (
          userName.includes(searchLower) ||
          userEmail.includes(searchLower) ||
          userPhone.includes(searchLower) ||
          message.includes(searchLower) ||
          type.includes(searchLower)
        );
      })
    : enquiries;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEnquiryUpdate = async () => {
    // Refetch enquiries after update
    try {
      setLoading(true);
      const filters: EnquiryFilters = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter !== 'ALL') {
        filters.status = statusFilter;
      }

      if (typeFilter !== 'ALL') {
        filters.type = typeFilter;
      }

      const response = await enquiryApi.getAll(filters);
      setEnquiries(response.enquiries);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      console.error('Error refreshing enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Support & Enquiries</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage customer support enquiries and requests.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search by customer name, email, phone, message, or type..."
            onSearch={handleSearch}
            searchValue={searchQuery}
            actions={[]}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="ALL">All Types</option>
            <option value="PAYMENT">Payment</option>
            <option value="DELIVERY">Delivery</option>
            <option value="PRODUCT">Product</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Table Area */}
      {loading && enquiries.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="text-gray-500">Loading enquiries...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {debouncedSearchQuery
              ? 'No enquiries found matching your search.'
              : 'No enquiries found.'}
          </p>
        </div>
      ) : (
        <SupportTable
          enquiries={filteredEnquiries}
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          onPageChange={handlePageChange}
          onEnquiryUpdate={handleEnquiryUpdate}
        />
      )}
    </div>
  );
}

