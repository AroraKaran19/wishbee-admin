"use client";

import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GrowthBadge } from "./growth-badge";
import { OrderTrend, TrendGranularity } from "@/lib/api/orders";

interface KpiCardProps {
  label: string;
  value: string;
  caption: string;
  trend?: OrderTrend;
  dataKey: "orders" | "revenue";
  color: string;
  /** Percent change vs the previous window; null hides the badge. */
  growth?: number | null;
  formatValue?: (value: number) => string;
}

/** Axis label for a bucket key, matched to the series granularity. */
export const formatBucket = (
  key: string,
  granularity: TrendGranularity
): string => {
  if (granularity === "month") {
    const [year, month] = key.split("-");
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
      "en-IN",
      { month: "short" }
    );
  }

  if (granularity === "hour") {
    const [datePart, hourPart] = key.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day, Number(hourPart)).toLocaleTimeString(
      "en-IN",
      { hour: "numeric", hour12: true }
    );
  }

  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

/** Longer label for tooltips, where there is room for the full date. */
const formatBucketLong = (
  key: string,
  granularity: TrendGranularity
): string => {
  if (granularity === "month") {
    const [year, month] = key.split("-");
    return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
      "en-IN",
      { month: "long", year: "numeric" }
    );
  }
  if (granularity === "hour") return formatBucket(key, granularity);
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Headline metric over its distribution. Bars suit the discrete buckets the API
 * returns better than a continuous area, and the busiest bucket is picked out in
 * full colour so the peak is readable without hunting through a tooltip.
 */
export function KpiCard({
  label,
  value,
  caption,
  trend,
  dataKey,
  color,
  growth,
  formatValue = (v) => String(v),
}: KpiCardProps) {
  const data = useMemo(() => {
    if (!trend?.points?.length) return [];
    return trend.points.map((point) => ({
      ...point,
      label: formatBucket(point.date, trend.granularity),
      fullLabel: formatBucketLong(point.date, trend.granularity),
    }));
  }, [trend]);

  const peakIndex = useMemo(() => {
    if (!data.length) return -1;
    let index = 0;
    for (let i = 1; i < data.length; i += 1) {
      if ((data[i][dataKey] as number) > (data[index][dataKey] as number)) {
        index = i;
      }
    }
    return (data[index][dataKey] as number) > 0 ? index : -1;
  }, [data, dataKey]);

  const hasShape = data.length > 1 && peakIndex >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </div>
          <div className="flex items-baseline gap-2 mt-2 flex-wrap">
            <span className="text-3xl font-semibold text-gray-900 tabular-nums leading-none">
              {value}
            </span>
            {growth !== null && growth !== undefined && (
              <GrowthBadge growth={growth} />
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1.5">{caption}</div>
        </div>
      </div>

      <div className="mt-4 h-[150px] overflow-hidden">
        {hasShape ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: -14 }}
              barCategoryGap="18%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={14}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={52}
                tickCount={4}
                tickFormatter={formatValue}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullLabel ?? ""
                }
                formatter={(v: number) => [formatValue(v), label]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  padding: "6px 10px",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} maxBarSize={34}>
                {data.map((point, index) => (
                  <Cell
                    key={point.date}
                    // Peak in full colour, the rest tinted back so it reads as context.
                    fill={index === peakIndex ? color : `${color}33`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-gray-400">
              Not enough data to plot a trend
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
