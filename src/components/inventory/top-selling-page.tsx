'use client';

import React, { useState, useEffect } from 'react';
import { SuccessBanner } from '@/components/ui/banner';
import { SearchBar } from '@/components/ui/search-bar';
import { TopSellingTable } from './top-selling-table';
import { exportTopSellingToCSV } from '@/lib/utils/csv-export';
import { Upload } from 'lucide-react';
import { dashboardApi } from '@/lib/api/dashboard';
import { Product } from '@/lib/types';
import toast from 'react-hot-toast';

export function TopSellingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    const loadTopSelling = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardApi.getTopSelling({
          page: currentPage,
          limit: itemsPerPage,
        });

        if (response.success && response.data) {
          const productsData = response.data || [];
          setProducts(Array.isArray(productsData) ? productsData : []);
          
          // Check if response includes pagination info
          if (response.pagination) {
            setPagination({
              currentPage: response.pagination.currentPage || currentPage,
              totalPages: response.pagination.totalPages || 1,
              totalItems: response.pagination.totalItems || productsData.length,
            });
          } else {
            // If no pagination info, estimate based on data length
            // If we get exactly itemsPerPage, there might be more pages
            const hasMore = productsData.length === itemsPerPage;
            setPagination({
              currentPage: currentPage,
              totalPages: hasMore ? currentPage + 1 : currentPage,
              totalItems: productsData.length,
            });
          }
        }
      } catch (err) {
        console.error('Error loading top selling products:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load top selling products';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadTopSelling();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    // Note: API may not support search, so this is client-side filtering on current page
  };

  const handleExportCSV = () => {
    // Export all loaded products (limited to what API returns per page)
    exportTopSellingToCSV(products, 'top-selling-items');
  };

  // Client-side filtering for search (if API doesn't support search)
  const filteredItems = products.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Top Selling Stock</h1>
      </div>

      <SuccessBanner 
        message="These are your highest-performing products from the last 30 days. Keep them well-stocked and strategically promoted to maintain momentum."
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <SearchBar
            placeholder="Search by: Product Name, Category, SKU"
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
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading top selling products...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No top selling products found</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'No products have been sold in the last 30 days'}
                </p>
              </div>
            </div>
          ) : (
            <TopSellingTable
              items={filteredItems}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
