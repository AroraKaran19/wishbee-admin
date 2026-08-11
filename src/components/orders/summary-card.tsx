"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { GrowthBadge } from "./growth-badge";

export interface SummaryMetric {
  key: string;
  label: string;
  value: string;
  icon: LucideIcon;
  caption?: string;
  growth?: number | null;
  /** Flips the delta colouring for metrics where a rise is bad. */
  invertGrowth?: boolean;
  /** Raises this cell above the others as the card's focal metric. */
  emphasized?: boolean;
}

interface SummaryCardProps {
  title: string;
  periodLabel?: string;
  metrics: SummaryMetric[];
  loading?: boolean;
}

/**
 * Segmented headline card: several metrics share one surface, with the focal one
 * raised on its own elevated tile so the eye lands there first.
 */
export function SummaryCard({
  title,
  periodLabel,
  metrics,
  loading = false,
}: SummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {periodLabel && (
          <span className="text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1">
            {periodLabel}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.key}
              className={
                metric.emphasized
                  ? "rounded-xl bg-white shadow-md ring-1 ring-gray-100 px-4 py-3.5"
                  : "rounded-xl px-4 py-3.5"
              }
            >
              <div className="flex items-center gap-1.5 text-gray-500">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium truncate">
                  {metric.label}
                </span>
              </div>

              {loading ? (
                <div className="mt-2.5 h-7 w-24 bg-gray-100 rounded animate-pulse" />
              ) : (
                <>
                  <div className="mt-2 text-2xl font-semibold text-gray-900 tabular-nums leading-none">
                    {metric.value}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {metric.growth !== null && metric.growth !== undefined && (
                      <GrowthBadge
                        growth={metric.growth}
                        invert={metric.invertGrowth}
                      />
                    )}
                    {metric.caption && (
                      <span className="text-[11px] text-gray-400">
                        {metric.caption}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
