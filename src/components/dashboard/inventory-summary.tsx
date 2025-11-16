"use client";

import React, { useState, useEffect } from "react";
import { MetricCard } from "./metric-card";
import { SearchBar } from "@/components/ui/search-bar";
import { InventoryTable } from "./inventory-table";
import { formatCurrency } from "@/lib/utils";
import { exportProductsToCSV } from "@/lib/utils/csv-export";
import { dashboardApi } from "@/lib/api/dashboard";
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
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCombos, setTotalCombos] = useState(0);
  const itemsPerPage = 10;

  // Load inventory from API
  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardApi.getInventory({
          page: currentPage,
          limit: itemsPerPage,
        });

        // Handle API response structure
        if (response.success && response.data) {
          const inventoryData = response.data.data || {};
          const productsData = inventoryData.products || [];

          setProducts(Array.isArray(productsData) ? productsData : []);
          setTotalInventoryValue(response.data.totalInventoryValue || 0);
          setTotalProducts(response.data.totalProducts || 0);
          setTotalCombos(response.data.totalCombos || 0);

          // Set pagination data
          setPagination({
            currentPage: inventoryData.page || currentPage,
            totalPages: inventoryData.totalPages || 1,
            totalItems: response.data.totalProducts || 0,
            hasNext: (inventoryData.page || 1) < (inventoryData.totalPages || 1),
            hasPrev: (inventoryData.page || 1) > 1,
          });
        }
      } catch (err) {
        console.error("Error loading inventory:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load inventory";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [currentPage, itemsPerPage]);

  // Filter products locally if search query is provided
  // Note: The API doesn't support search for inventory endpoint
  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category &&
            typeof p.category === "object" &&
            "name" in p.category &&
            (p.category as any).name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()))
      )
    : products;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Note: Search is client-side since API doesn't support it
  };

  const handleExportCSV = () => {
    exportProductsToCSV(filteredProducts, "inventory-products");
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const currentProducts = filteredProducts;

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
          value={totalProducts}
          trend="All products"
          variant="blue"
        />
        <MetricCard
          title="Total Combos"
          value={totalCombos}
          trend="All combos"
          variant="green"
        />
        <MetricCard
          title="Total Inventory Value"
          value={formatCurrency(totalInventoryValue)}
          trend="Total value"
          variant="light-blue"
        />
      </div>

      <div className="flex-shrink-0 mb-4">
        <SearchBar
          placeholder="Search by: Product Name, Category, Brand"
          onSearch={handleSearch}
          onSearchChange={setSearchQuery}
          showFilter={true}
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
