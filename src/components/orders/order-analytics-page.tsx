"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Package, Wallet, Receipt, XCircle } from "lucide-react";
import { KpiCard } from "./kpi-card";
import { SummaryCard, SummaryMetric } from "./summary-card";
import { MixBar, MixSlice } from "./mix-bar";
import { PeriodFilter, usePeriodFilter } from "./period-filter";
import {
  orderApi,
  convertStatsToOrderSummary,
  OrderStatus,
} from "@/lib/api/orders";
import { OrderSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  buildPeriodFilters,
  getComparisonLabel,
} from "@/lib/utils/order-period";

/** Semantic colours: green delivered, red cancelled, and so on across the page. */
const STATUS_COLORS = {
  delivered: "#0b8f00",
  pending: "#2196f3",
  onTheWay: "#ff9800",
  cancelled: "#dc2626",
  refunded: "#7c3aed",
};

/**
 * Every order status, in lifecycle order, with the label and colour used
 * wherever statuses are listed. Kept in step with `staff-activity-card`.
 */
const STATUS_SLICE_META: Array<{
  status: OrderStatus;
  label: string;
  color: string;
}> = [
  { status: "PENDING", label: "Pending", color: "#2196f3" },
  { status: "PROCESSING", label: "Processing", color: "#00bcd4" },
  { status: "SHIPPED", label: "Shipped", color: "#ff9800" },
  { status: "DELIVERED", label: "Delivered", color: "#0b8f00" },
  { status: "CANCELLED", label: "Cancelled", color: "#dc2626" },
  { status: "REFUNDED", label: "Refunded", color: "#7c3aed" },
  { status: "RETURNED", label: "Returned", color: "#db2777" },
];

const PAYMENT_COLORS = {
  upi: "#4caf50",
  cod: "#ff9800",
  card: "#2196f3",
};

/** Compact rupee label for chart axes, where full currency strings overflow. */
const formatCompactCurrency = (value: number): string => {
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

export function OrderAnalyticsPage() {
  const filter = usePeriodFilter();
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { period, appliedStartDate, appliedEndDate, ready } = filter;

  useEffect(() => {
    if (!ready) return;

    const fetchStats = async () => {
      try {
        setError(null);
        const filters = buildPeriodFilters(
          period,
          appliedStartDate,
          appliedEndDate,
          "7days"
        );
        const stats = await orderApi.getStats(filters);
        setOrderSummary(convertStatsToOrderSummary(stats));
      } catch (err) {
        console.error("Error fetching order stats:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch order stats"
        );
      }
    };

    fetchStats();
  }, [ready, period, appliedStartDate, appliedEndDate]);

  const statusSlices = useMemo<MixSlice[]>(() => {
    if (!orderSummary) return [];
    const breakdown = orderSummary.statusBreakdown;

    // Older API responses have no per-status breakdown; fall back to the merged
    // buckets so the card still renders rather than showing an empty bar.
    if (!breakdown) {
      return [
        {
          name: "Delivered",
          value: orderSummary.totalDelivered ?? 0,
          color: STATUS_COLORS.delivered,
        },
        {
          name: "Pending",
          value: orderSummary.totalPending ?? 0,
          color: STATUS_COLORS.pending,
        },
        {
          name: "Processing / Shipped",
          value: orderSummary.onTheWay,
          color: STATUS_COLORS.onTheWay,
        },
        {
          name: "Cancelled",
          value: orderSummary.totalCancelled ?? 0,
          color: STATUS_COLORS.cancelled,
        },
        {
          name: "Refunded / Returned",
          value: orderSummary.totalReturned,
          color: STATUS_COLORS.refunded,
        },
      ];
    }

    return STATUS_SLICE_META.map(({ status, label, color }) => ({
      name: label,
      value: breakdown[status]?.count ?? 0,
      color,
    }));
  }, [orderSummary]);

  const pendingValue =
    orderSummary?.statusBreakdown?.PENDING?.amount ?? 0;

  // Deliveries made in the window. Not the same as `totalDelivered`, which
  // counts orders *placed* in the window that have since been delivered.
  const deliveredInPeriod = useMemo(
    () =>
      (orderSummary?.deliveredTrend?.points ?? []).reduce(
        (sum, point) => sum + point.delivered,
        0
      ),
    [orderSummary]
  );

  const paymentSlices = useMemo<MixSlice[]>(() => {
    if (!orderSummary) return [];
    return [
      {
        name: "UPI",
        value: orderSummary.totalUPIOrders ?? 0,
        color: PAYMENT_COLORS.upi,
      },
      {
        name: "COD",
        value: orderSummary.totalCODOrders ?? 0,
        color: PAYMENT_COLORS.cod,
      },
      {
        name: "Card",
        value: orderSummary.totalCardOrders ?? 0,
        color: PAYMENT_COLORS.card,
      },
    ];
  }, [orderSummary]);

  const comparisonLabel = useMemo(
    () => getComparisonLabel(period, appliedStartDate, appliedEndDate),
    [period, appliedStartDate, appliedEndDate]
  );

  const summaryMetrics = useMemo<SummaryMetric[]>(() => {
    const delivered = orderSummary?.totalDelivered ?? 0;
    const revenue = orderSummary?.revenue ?? 0;
    const totalOrders = orderSummary?.totalOrders ?? 0;
    const cancelled = orderSummary?.totalCancelled ?? 0;
    const comparison = orderSummary?.comparison;

    // Average over delivered orders only - the ones that actually produced revenue.
    const avgOrderValue = delivered > 0 ? revenue / delivered : 0;
    const cancelRate = totalOrders > 0 ? (cancelled / totalOrders) * 100 : 0;

    return [
      {
        key: "orders",
        label: "Total Orders",
        icon: Package,
        value: String(totalOrders),
        growth: comparison?.ordersGrowth,
        caption: comparisonLabel ?? undefined,
      },
      {
        key: "revenue",
        label: "Revenue",
        icon: Wallet,
        value: formatCurrency(revenue),
        growth: comparison?.revenueGrowth,
        caption: comparisonLabel ?? undefined,
        emphasized: true,
      },
      {
        key: "aov",
        label: "Avg Order Value",
        icon: Receipt,
        value: delivered > 0 ? formatCurrency(avgOrderValue) : "—",
        caption: delivered > 0 ? `across ${delivered} delivered` : undefined,
      },
      {
        key: "cancel-rate",
        label: "Cancellation Rate",
        icon: XCircle,
        value: totalOrders > 0 ? `${cancelRate.toFixed(1)}%` : "—",
        caption:
          totalOrders > 0 ? `${cancelled} of ${totalOrders} orders` : undefined,
        invertGrowth: true,
      },
    ];
  }, [orderSummary, comparisonLabel]);

  const periodLabel = orderSummary?.period || "Selected period";

  return (
    // No overflow here - the dashboard layout's <main> owns page scrolling.
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Orders Analytics</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Order volume, revenue, and payment mix for the selected period.
        </p>
      </div>

      <PeriodFilter filter={filter} />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Headline figures */}
      <div>
        <SummaryCard
          title="Overall Summary"
          periodLabel={periodLabel}
          metrics={summaryMetrics}
          loading={!orderSummary}
        />
      </div>

      {/* Distribution over time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KpiCard
          label="Orders over time"
          value={String(orderSummary?.totalOrders ?? 0)}
          caption={periodLabel}
          trend={orderSummary?.trend}
          dataKey="orders"
          color="#00b7fb"
          growth={orderSummary?.comparison?.ordersGrowth}
        />
        <KpiCard
          label="Revenue over time"
          value={formatCurrency(orderSummary?.revenue ?? 0)}
          caption="from delivered orders"
          trend={orderSummary?.trend}
          dataKey="revenue"
          color="#0b8f00"
          growth={orderSummary?.comparison?.revenueGrowth}
          formatValue={formatCompactCurrency}
        />
        {/* Full width: the only series keyed on delivery date, so it reads as
            its own thing rather than a third of a row of placement-dated charts. */}
        <div className="lg:col-span-2">
          <KpiCard
            label="Delivered over time"
            value={String(deliveredInPeriod)}
            caption="by date marked delivered"
            trend={orderSummary?.deliveredTrend}
            dataKey="delivered"
            color="#0b8f00"
          />
        </div>
      </div>

      {/* Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
        <MixBar
          title="Order status"
          slices={statusSlices}
          footer={[
            {
              label: "Pending to process",
              value: String(orderSummary?.totalPending ?? 0),
              secondary: formatCurrency(pendingValue),
            },
            {
              label: "In transit",
              value: String(orderSummary?.onTheWay ?? 0),
              secondary: formatCurrency(orderSummary?.onTheWayCost ?? 0),
            },
          ]}
        />
        <MixBar title="Payment method" slices={paymentSlices} />
      </div>
    </div>
  );
}
