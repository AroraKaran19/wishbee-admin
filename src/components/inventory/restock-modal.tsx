"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productApi } from "@/lib/api/products";
import toast from "react-hot-toast";

export interface RestockTarget {
  id: string;
  name: string;
  sku?: string;
  currentStock: number;
}

interface RestockModalProps {
  target: RestockTarget | null;
  onClose: () => void;
  onSuccess: () => void;
}

/** Positive whole numbers only; rejects decimals, signs, and blank input. */
const parseQuantity = (raw: string): number | null => {
  if (!/^\d+$/.test(raw.trim())) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
};

export function RestockModal({ target, onClose, onSuccess }: RestockModalProps) {
  const [quantity, setQuantity] = useState("");
  const [liveStock, setLiveStock] = useState<number | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const targetId = target?.id ?? null;

  // Read stock at open time: the row value can be stale if an order landed
  // since the page rendered, and adding to it would undo that order.
  useEffect(() => {
    if (!targetId) return;

    let cancelled = false;
    setQuantity("");
    setLiveStock(null);
    setLoadingStock(true);

    productApi
      .getById(targetId)
      .then((response) => {
        if (cancelled) return;
        const product = response?.data || response;
        setLiveStock(typeof product?.stock === "number" ? product.stock : null);
      })
      .catch((error) => {
        console.error("Error loading current stock:", error);
        if (!cancelled) setLiveStock(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingStock(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetId]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    onClose();
  }, [submitting, onClose]);

  if (!target) return null;

  const baseStock = liveStock ?? target.currentStock;
  const addedQuantity = parseQuantity(quantity);
  const newStock = addedQuantity === null ? null : baseStock + addedQuantity;
  const canSubmit = addedQuantity !== null && !loadingStock && !submitting;

  const handleSubmit = async () => {
    if (addedQuantity === null || newStock === null) return;

    try {
      setSubmitting(true);
      await productApi.update(target.id, { stock: newStock });
      toast.success(`${target.name} restocked to ${newStock} units`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error restocking product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to restock product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900">Restock Product</h2>

        <div className="bg-gray-50 p-3 rounded-lg mt-4">
          <p className="text-sm font-medium text-gray-900">{target.name}</p>
          {target.sku && (
            <p className="text-sm text-gray-600 mt-1">SKU: {target.sku}</p>
          )}
        </div>

        <div className="mt-4">
          <span className="block text-sm text-gray-500">Current stock</span>
          <span className="text-xl font-semibold text-gray-900">
            {loadingStock ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400 mt-1" />
            ) : (
              `${baseStock} units`
            )}
          </span>
        </div>

        <div className="mt-4">
          <label
            htmlFor="restock-quantity"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Add quantity
          </label>
          <input
            id="restock-quantity"
            type="number"
            min={1}
            step={1}
            autoFocus
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canSubmit) handleSubmit();
            }}
            disabled={loadingStock || submitting}
            placeholder="e.g. 50"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {quantity.trim() !== "" && addedQuantity === null && (
            <p className="text-red-500 text-xs mt-1">
              Enter a whole number greater than 0
            </p>
          )}
        </div>

        {newStock !== null && !loadingStock && (
          <p className="text-sm text-gray-700 mt-4">
            New stock:{" "}
            <span className="font-semibold">
              {baseStock} &rarr; {newStock}
            </span>
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? "Updating..." : "Update Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
