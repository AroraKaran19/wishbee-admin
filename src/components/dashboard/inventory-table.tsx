"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Product, TableConfig } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { productApi } from "@/lib/api/products";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface InventoryTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function InventoryTable({
  products,
  currentPage,
  totalPages,
  onPageChange,
}: InventoryTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDeleteClick = (item: Product) => {
    setProductToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeletingId(productToDelete._id ?? null);
      await productApi.delete(productToDelete._id ?? "");
      toast.success("Product deleted successfully");
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product"
      );
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleEssential = async (product: Product) => {
    if (!product._id) return;

    try {
      setTogglingId(product._id);
      await productApi.update(product._id, {
        isEssential: !product.isEssential,
      });
      toast.success(
        `Product ${!product.isEssential ? "marked as" : "removed from"} essential`
      );
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error("Error toggling essential status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update essential status"
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleDiscountPage = async (product: Product) => {
    if (!product._id) return;

    try {
      setTogglingId(product._id);
      await productApi.update(product._id, {
        productDiscountPage: !(product.productDiscountPage ?? false),
      });
      toast.success(
        `Product ${!(product.productDiscountPage ?? false) ? "added to" : "removed from"} discounts page`
      );
      window.location.reload();
    } catch (error) {
      console.error("Error toggling discounts page:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update discounts page status"
      );
    } finally {
      setTogglingId(null);
    }
  };
  const tableConfig: TableConfig<Product> = {
    columns: [
      {
        key: "name",
        title: "Product Name",
        align: "center",
        render: (value, record) => (
          <Link
            href={`/inventory/product/${record._id}`}
            className="text-sm text-gray-900 hover:text-gray-700 font-medium transition-colors"
          >
            {value}
          </Link>
        ),
      },
      {
        key: "category",
        title: "Category",
        align: "center",
        render: (value) => (
          <div className="text-sm text-gray-900">
            {value && typeof value === "object" && "name" in value
              ? value.name
              : "N/A"}
          </div>
        ),
      },
      {
        key: "mrp",
        title: "MRP",
        align: "center",
        render: (value) => (
          <div className="text-sm text-gray-900">{formatCurrency(value)}</div>
        ),
      },
      {
        key: "stock",
        title: "Stock",
        align: "center",
        render: (value) => (
          <div className="text-sm text-gray-900">{value} units</div>
        ),
      },
      {
        key: "sku",
        title: "SKU",
        align: "center",
        render: (value) => (
          <div className="text-sm text-gray-500 font-mono">{value}</div>
        ),
      },
      {
        key: "status",
        title: "Status",
        align: "center",
        render: (value) => (
          <span
            className={`text-sm px-2 py-1 rounded-full ${
              value === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : value === "OUT_OF_STOCK"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {value === "ACTIVE"
              ? "Active"
              : value === "OUT_OF_STOCK"
              ? "Out of Stock"
              : "Discontinued"}
          </span>
        ),
      },
      {
        key: "isEssential",
        title: "Essential",
        align: "center",
        render: (value, record) => {
          const isEssential = record.isEssential ?? false;
          const isDisabled = togglingId === record._id;
          return (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEssential}
                onChange={() => handleToggleEssential(record)}
                disabled={isDisabled}
                className="sr-only"
              />
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isEssential ? "bg-blue-600" : "bg-gray-200"
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                    isEssential ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </label>
          );
        },
      },
      {
        key: "productDiscountPage",
        title: "Discount Page",
        align: "center",
        render: (value, record) => {
          const onDiscountPage = record.productDiscountPage ?? false;
          const isDisabled = togglingId === record._id;
          return (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={onDiscountPage}
                onChange={() => handleToggleDiscountPage(record)}
                disabled={isDisabled}
                className="sr-only"
              />
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  onDiscountPage ? "bg-amber-500" : "bg-gray-200"
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                    onDiscountPage ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </label>
          );
        },
      },
    ],
    actions: [
      {
        key: "delete",
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (record) => handleDeleteClick(record),
        variant: "danger",
        size: "sm",
        className: "text-white",
        disabled: (record) => deletingId === record._id,
      },
    ],
    pagination: {
      currentPage,
      totalPages,
      onPageChange,
      showPageInfo: true,
    },
    rowKey: "_id",
    className: "rounded-xl shadow-sm",
    rowClassName: () => "hover:bg-gray-50",
  };

  return (
    <>
      <DataTable data={products} config={tableConfig} />
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              Confirm Delete
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-6">
              <p className="text-sm font-medium text-gray-900">
                {productToDelete.name}
              </p>
              {productToDelete.sku && (
                <p className="text-sm text-gray-600 mt-1">
                  SKU: {productToDelete.sku}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleDeleteCancel}
                disabled={deletingId !== null}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={deletingId !== null}
              >
                {deletingId !== null ? "Deleting..." : "Delete Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
