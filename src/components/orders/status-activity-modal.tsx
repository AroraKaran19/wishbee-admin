"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { OrderDetailsModal } from "./order-details-modal";
import { orderApi, StatusActivityOrder } from "@/lib/api/orders";
import { PeriodFilters } from "@/lib/utils/order-period";
import { exportStatusActivityOrdersToCSV } from "@/lib/utils/csv-export";

const PAGE_SIZE = 50;

/** The endpoint's ceiling, so an export makes as few round trips as possible. */
const EXPORT_PAGE_SIZE = 200;

/** Backstop so a runaway total can't spin forever. 200k rows is far past use. */
const MAX_EXPORT_PAGES = 1000;

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** e.g. "delivered-orders-2026-08-14", or a "from_to" pair across a range. */
function buildExportFilename(
  statusLabel: string,
  filters: PeriodFilters
): string {
  const { startDate, endDate } = filters;
  const scope = !startDate || !endDate
    ? filters.period ?? "period"
    : startDate === endDate
    ? startDate
    : `${startDate}_${endDate}`;
  return `${statusLabel}-orders-${scope}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-");
}

function formatChangedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface StatusActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Uppercase status name, e.g. DELIVERED. Null while the modal is closed. */
  status: string | null;
  statusLabel: string;
  /** The tile's ₹ figure, shown in the header so both agree. */
  amount: number;
  filters: PeriodFilters;
}

export function StatusActivityModal({
  isOpen,
  onClose,
  status,
  statusLabel,
  amount,
  filters,
}: StatusActivityModalProps) {
  const [orders, setOrders] = useState<StatusActivityOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { period, startDate, endDate } = filters;

  useEffect(() => {
    if (!isOpen || !status) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await orderApi.getStatusActivityOrders({
          status,
          period,
          startDate,
          endDate,
          page,
          limit: PAGE_SIZE,
        });
        setOrders(result.orders);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.pages);
      } catch (err) {
        console.error("Error fetching status activity orders:", err);
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isOpen, status, page, period, startDate, endDate]);

  /**
   * Export every row for this status, not just the page on screen - so it walks
   * the endpoint to the end rather than reusing what the table already holds.
   */
  const handleExport = async () => {
    if (!status || exporting) return;

    try {
      setExporting(true);
      setError(null);

      const all: StatusActivityOrder[] = [];
      let current = 1;
      let pages = 1;

      do {
        const result = await orderApi.getStatusActivityOrders({
          status,
          period,
          startDate,
          endDate,
          page: current,
          limit: EXPORT_PAGE_SIZE,
        });
        all.push(...result.orders);
        pages = result.pagination.pages;
        current += 1;
      } while (current <= pages && current <= MAX_EXPORT_PAGES);

      if (!all.length) {
        setError("Nothing to export for this status");
        return;
      }

      // Orders reach PENDING by being placed, not by a staff action.
      const isPlacement = status === "PENDING";
      exportStatusActivityOrdersToCSV(
        all,
        buildExportFilename(statusLabel, filters),
        isPlacement ? "Placed At" : "Marked At",
        isPlacement ? "Placed By" : "Changed By"
      );
    } catch (err) {
      console.error("Error exporting status activity orders:", err);
      setError(err instanceof Error ? err.message : "Failed to export orders");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${statusLabel} orders`}
      size="2xl"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-sm text-gray-600">
          {total} {total === 1 ? "order" : "orders"}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900 tabular-nums">
            {rupees.format(amount)}
          </span>
          <button
            onClick={handleExport}
            disabled={exporting || loading || total === 0}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors hover:border-[#13aaff] hover:text-gray-900 disabled:text-gray-300 disabled:border-gray-100 disabled:cursor-not-allowed cursor-pointer"
            title="Download every order in this status as a spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Preparing..." : "Export"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Loading orders...
        </div>
      ) : error ? (
        <div className="py-4 text-sm text-red-600">{error}</div>
      ) : orders.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No orders to show
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {orders.map((order, index) => (
            <li
              key={`${order.orderId}-${order.changedAt}-${index}`}
              className="flex items-start justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {order.customerName}
                </div>
                {order.storeName ? (
                  <div className="text-xs text-gray-600 truncate">
                    {order.storeName}
                  </div>
                ) : null}
                <div className="text-xs text-gray-400 mt-0.5 truncate">
                  by {order.changedByName}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                {order.refId ? (
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(order.orderId)}
                    title="View order details"
                    className="text-xs font-medium text-blue-600 rounded cursor-pointer transition-colors hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13aaff]"
                  >
                    {order.refId}
                  </button>
                ) : (
                  <div className="text-xs font-medium text-gray-400">—</div>
                )}
                <div className="text-sm text-gray-900 tabular-nums">
                  {rupees.format(order.amount)}
                </div>
                <div className="text-xs text-gray-400 tabular-nums">
                  {formatChangedAt(order.changedAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 mt-2 border-t border-gray-100">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || loading}
            className="flex items-center gap-1 text-sm text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <span className="text-sm text-gray-500 tabular-nums">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page === totalPages || loading}
            className="flex items-center gap-1 text-sm text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed hover:text-gray-900 transition-colors cursor-pointer"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <OrderDetailsModal
        orderId={selectedOrderId}
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
      />
    </Modal>
  );
}
