'use client';

import React, { useState, useEffect } from 'react';
import { Banner } from '@/components/ui/banner';
import { SearchBar } from '@/components/ui/search-bar';
import { ShortExpiryTable } from './short-expiry-table';
import { productApi } from '@/lib/api/products';
import { Product } from '@/lib/types';
import { exportProductsToCSV } from '@/lib/utils/csv-export';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export function ShortExpiryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const itemsPerPage = 10;

  useEffect(() => {
    const loadCloseToExpiry = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productApi.getCloseToExpiry({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
        });

        if (response.success && response.data) {
          const productsData = response.data.products || [];
          setProducts(Array.isArray(productsData) ? productsData : []);

          if (response.data.pagination) {
            setPagination({
              currentPage: response.data.pagination.currentPage || currentPage,
              totalPages: response.data.pagination.totalPages || 1,
              totalItems: response.data.pagination.totalItems || 0,
            });
          }
        }
      } catch (err) {
        console.error('Error loading close to expiry products:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load close to expiry products';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadCloseToExpiry();
  }, [currentPage, searchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    exportProductsToCSV(products, 'short-expiry-items');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Short Expiry Stock</h1>
      </div>

      <Banner 
        variant="danger"
        message="These items are nearing expiry. Consider marking them down or moving to clearance sale to avoid losses."
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
                <p className="text-gray-500">Loading close to expiry products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No products close to expiry found</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'No products are close to expiry'}
                </p>
              </div>
            </div>
          ) : (
            <ShortExpiryTable
              items={products}
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
