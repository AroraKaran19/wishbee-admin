"use client";

import React, { useState, useEffect } from "react";
import { WarningBanner } from "@/components/ui/banner";
import { SearchBar } from "@/components/ui/search-bar";
import { OutOfStockTable } from "./out-of-stock-table";
import { productApi } from "@/lib/api/products";
import { Product } from "@/lib/types";
import { exportProductsToCSV } from "@/lib/utils/csv-export";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

export function OutOfStockPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadOutOfStock = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productApi.getOutOfStock({
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
        console.error("Error loading out of stock products:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load out of stock products";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadOutOfStock();
  }, [currentPage, searchQuery, refreshKey]);

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
    exportProductsToCSV(products, "out-of-stock-items");
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Out of Stock Items</h1>
      </div>

      <WarningBanner message="These items are out of stock and need immediate restocking to avoid customer dissatisfaction." />

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
                key: "export",
                label: "Export CSV",
                icon: <Upload className="w-4 h-4" />,
                onClick: handleExportCSV,
                variant: "danger",
              },
            ]}
          />
        </div>

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading out of stock products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No out of stock products found</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "All products are in stock"}
                </p>
              </div>
            </div>
          ) : (
            <OutOfStockTable
              items={products}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              onRefresh={() => setRefreshKey((prev) => prev + 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
