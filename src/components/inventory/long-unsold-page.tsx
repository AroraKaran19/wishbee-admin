'use client';

import React, { useState, useEffect } from 'react';
import { WarningBanner } from '@/components/ui/banner';
import { SearchBar } from '@/components/ui/search-bar';
import { LongUnsoldTable } from './long-unsold-table';
import { productApi } from '@/lib/api/products';
import { Product } from '@/lib/types';
import { exportProductsToCSV } from '@/lib/utils/csv-export';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export function LongUnsoldPage() {
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
  const [daysThreshold, setDaysThreshold] = useState(90);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadLongUnsold = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productApi.getLongUnsold({
          page: currentPage,
          limit: itemsPerPage,
          daysThreshold: daysThreshold,
          search: searchQuery || undefined,
        });

        if (response.success && response.data) {
          const productsData = response.data.products || [];
          setProducts(Array.isArray(productsData) ? productsData : []);

          // Handle pagination structure: { total, totalPages, page }
          setPagination({
            currentPage: response.data.page || currentPage,
            totalPages: response.data.totalPages || 1,
            totalItems: response.data.total || 0,
          });
        }
      } catch (err) {
        console.error('Error loading long unsold products:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load long unsold products';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadLongUnsold();
  }, [currentPage, searchQuery, daysThreshold]);

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
    exportProductsToCSV(products, 'long-unsold-items');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Unsold Products (No Sales in 60+ Days)</h1>
      </div>

      <WarningBanner 
        message={`These items haven't been sold in over ${daysThreshold} days. Consider applying discounts or bundling them with offers to clear stock.`}
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
                <p className="text-gray-500">Loading long unsold products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No long unsold products found</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : `No products unsold for ${daysThreshold} days`}
                </p>
              </div>
            </div>
          ) : (
            <LongUnsoldTable
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
