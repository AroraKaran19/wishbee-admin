"use client";

import React, { useState, useEffect } from "react";
import { MetricCard } from "./metric-card";
import { SearchBar } from "@/components/ui/search-bar";
import { InventoryTable } from "./inventory-table";
import { formatCurrency } from "@/lib/utils";
import { exportProductsToCSV } from "@/lib/utils/csv-export";
import { productApi } from "@/lib/api/products";
import { Product } from "@/lib/types";
import { Plus, Upload, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export function InventorySummary() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const itemsPerPage = 10;

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productApi.getAll({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
        });

        // Handle different response structures
        const productsData =
          response.data?.products || response.data || response;

        setProducts(Array.isArray(productsData) ? productsData : []);

        // Set pagination data - API returns pagination at root level of data
        if (response.data) {
          setPagination({
            currentPage: response.data.page || currentPage,
            totalPages: response.data.totalPages || 1,
            totalItems: response.data.total || 0,
            hasNext:
              (response.data.page || 1) < (response.data.totalPages || 1),
            hasPrev: (response.data.page || 1) > 1,
          });
        }
      } catch (err) {
        console.error("Error loading products:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load products";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, searchQuery, itemsPerPage]);

  // No local filtering needed - server handles search and pagination
  const filteredProducts = products || [];

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleExportCSV = () => {
    exportProductsToCSV(filteredProducts, "inventory-products");
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  // No need for local slicing - server handles pagination
  const currentProducts = filteredProducts;

  // Calculate dynamic metrics from current page products
  // Note: These are estimates based on current page data
  const totalCategories = new Set(
    (products || [])
      .map((p) => p.category)
      .filter((cat) => cat && typeof cat === "object" && "_id" in cat)
      .map((cat) => (cat as any)._id)
  ).size;

  const inventoryValue = (products || []).reduce(
    (sum, product) => sum + (product.mrp || 0) * (product.stock || 0),
    0
  );

  const revenueGenerated = inventoryValue * 0.3; // Assuming 30% margin

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">
          Overall Inventory Summary
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Quick snapshot of inventory status to assist order handling decisions.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex-shrink-0 flex flex-wrap gap-6 justify-start">
        <MetricCard
          title="Total Products"
          value={pagination.totalItems}
          trend="Server-side count"
          variant="blue"
        />
        <MetricCard
          title="Current Page"
          value={`${pagination.currentPage} of ${pagination.totalPages}`}
          trend="Pagination info"
          variant="green"
        />
        <MetricCard
          title="Page Inventory Value"
          value={formatCurrency(inventoryValue)}
          trend="Current page only"
          variant="light-blue"
        />
      </div>

      <div className="flex-shrink-0 mb-4">
        <SearchBar
          placeholder="Search by: Product Name, Category, Brand"
          onSearch={handleSearch}
          onSearchChange={setSearchQuery}
          actions={[
            {
              key: "add",
              label: "Add Products",
              icon: <Plus className="w-4 h-4" />,
              href: "/inventory/add",
              variant: "primary",
              onClick: () => {},
            },
            {
              key: "refresh",
              label: "Refresh",
              icon: <RefreshCw className="w-4 h-4" />,
              onClick: handleRefresh,
              variant: "secondary",
            },
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
              <p className="text-gray-500">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">No products found</p>
              <p className="text-gray-400 text-sm">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Add some products to get started"}
              </p>
            </div>
          </div>
        ) : (
          <InventoryTable
            products={currentProducts}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
        <div className="h-4"></div>
      </div>
    </div>
  );
}
