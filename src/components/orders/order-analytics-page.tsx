"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Package, Wallet, Receipt, XCircle } from "lucide-react";
import { KpiCard } from "./kpi-card";
import { SummaryCard, SummaryMetric } from "./summary-card";
import { MixBar, MixSlice } from "./mix-bar";
import { PeriodFilter, usePeriodFilter } from "./period-filter";
import { orderApi, convertStatsToOrderSummary } from "@/lib/api/orders";
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
        name: "On the way",
        value: orderSummary.onTheWay,
        color: STATUS_COLORS.onTheWay,
      },
      {
        name: "Cancelled",
        value: orderSummary.totalCancelled ?? 0,
        color: STATUS_COLORS.cancelled,
      },
      {
        name: "Refunded",
        value: orderSummary.totalReturned,
        color: STATUS_COLORS.refunded,
      },
    ];
  }, [orderSummary]);

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
      </div>

      {/* Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
        <MixBar
          title="Order status"
          slices={statusSlices}
          footer={[
            {
              label: "Pending",
              value: String(orderSummary?.totalPending ?? 0),
              secondary: "to process",
            },
            {
              label: "On the way",
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
