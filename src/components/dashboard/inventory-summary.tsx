"use client";

import React, { useState, useEffect } from "react";
import { MetricCard } from "./metric-card";
import { SearchBar } from "@/components/ui/search-bar";
import { InventoryTable } from "./inventory-table";
import { formatCurrency } from "@/lib/utils";
import { exportProductsToCSV } from "@/lib/utils/csv-export";
import { productApi } from "@/lib/api/products";
import { Plus, Upload, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export function InventorySummary() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productApi.getAll({
          page: 1,
          limit: 20,
          search: searchQuery || undefined,
        });
        setProducts(response.data || response);
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
  }, [searchQuery]);

  // Filter products locally for additional filtering
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.subCategory.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    exportProductsToCSV(filteredProducts, "inventory-products");
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Calculate dynamic metrics from products
  const totalCategories = new Set(products.map((p) => p.category._id)).size;
  const inventoryValue = products.reduce(
    (sum, product) => sum + product.price.single * product.stock,
    0
  );
  const revenueGenerated = 0; // Assuming 30% margin

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
          title="Total Categories"
          value={totalCategories}
          trend="Live data from products"
          variant="blue"
        />
        <MetricCard
          title="Inventory Value"
          value={formatCurrency(inventoryValue)}
          trend="Based on current stock"
          variant="green"
        />
        <MetricCard
          title="Estimated Revenue"
          value={formatCurrency(revenueGenerated)}
          trend="30% margin estimate"
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
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
        <div className="h-4"></div>
      </div>
    </div>
  );
}
