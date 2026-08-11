'use client';

import React, { useState, useEffect } from 'react';
import { Banner } from '@/components/ui/banner';
import { SearchBar } from '@/components/ui/search-bar';
import { LowQuantityTable } from './low-quantity-table';
import { dashboardApi } from '@/lib/api/dashboard';
import { LowStockItem } from '@/lib/types';
import { exportToCSV } from '@/lib/utils/csv-export';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export function LowQuantityPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadLowStock = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardApi.getLowStock({
          threshold: threshold,
        });

        if (response.success && response.data) {
          const itemsData = Array.isArray(response.data) ? response.data : [];
          setItems(itemsData);
        }
      } catch (err) {
        console.error('Error loading low stock products:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load low stock products';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadLowStock();
  }, [threshold, refreshKey]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Client-side pagination and filtering for low stock (API returns all items)
  const itemsPerPage = 10;
  const filteredItems = searchQuery
    ? items.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handleExportCSV = () => {
    const columns = [
      { key: 'name' as keyof LowStockItem, label: 'Product Name' },
      { key: 'currentStock' as keyof LowStockItem, label: 'Current Stock' },
      { key: 'type' as keyof LowStockItem, label: 'Type' },
      { key: 'status' as keyof LowStockItem, label: 'Status' }
    ];
    exportToCSV(filteredItems, 'low-quantity-items', columns);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Low Quantity Alerts</h1>
      </div>

      <Banner 
        variant="danger"
        message="These products are running low. Restock now to prevent disruption in sales."
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <SearchBar
            placeholder="Search by: Product Name, SKU"
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
                <p className="text-gray-500">Loading low stock products...</p>
              </div>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No low stock products found</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : `All products are above threshold (${threshold})`}
                </p>
              </div>
            </div>
          ) : (
            <LowQuantityTable
              items={currentItems}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              threshold={threshold}
              onRefresh={() => setRefreshKey((prev) => prev + 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
