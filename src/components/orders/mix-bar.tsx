"use client";

import React, { useMemo } from "react";

export interface MixSlice {
  name: string;
  value: number;
  color: string;
}

export interface MixFooterItem {
  label: string;
  value: string;
  secondary?: string;
}

interface MixBarProps {
  title: string;
  slices: MixSlice[];
  /** Compact figures pinned below the legend (e.g. queue depths). */
  footer?: MixFooterItem[];
  emptyMessage?: string;
}

const percentOf = (value: number, total: number): number =>
  total > 0 ? (value / total) * 100 : 0;

const formatPercent = (value: number, total: number): string => {
  const percent = percentOf(value, total);
  if (percent === 0) return "0%";
  // Keep one decimal for slivers that would otherwise round away to 0%.
  return percent < 1 ? `${percent.toFixed(1)}%` : `${Math.round(percent)}%`;
};

/**
 * Composition as a single stacked bar with an inline legend. Segments share one
 * baseline so proportions compare directly, and unlike a donut it stays useful
 * when a single category holds nearly everything.
 */
export function MixBar({
  title,
  slices,
  footer,
  emptyMessage = "No orders in this period",
}: MixBarProps) {
  const total = useMemo(
    () => slices.reduce((sum, slice) => sum + slice.value, 0),
    [slices]
  );

  const filled = useMemo(
    () => slices.filter((slice) => slice.value > 0),
    [slices]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-baseline justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500 tabular-nums">
          {total} {total === 1 ? "order" : "orders"}
        </span>
      </div>

      {total === 0 ? (
        <div className="py-8 text-center flex-1">
          <p className="text-sm text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100 gap-0.5 mb-4">
            {filled.map((slice) => (
              <div
                key={slice.name}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${percentOf(slice.value, total)}%`,
                  backgroundColor: slice.color,
                }}
                title={`${slice.name}: ${slice.value}`}
              />
            ))}
          </div>

          <ul className="space-y-2.5 flex-1">
            {slices.map((slice) => (
              <li
                key={slice.name}
                className="flex items-center gap-2 text-xs min-w-0"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-gray-600 truncate flex-1">
                  {slice.name}
                </span>
                <span className="font-semibold text-gray-900 tabular-nums">
                  {slice.value}
                </span>
                <span className="text-gray-400 tabular-nums w-11 text-right">
                  {formatPercent(slice.value, total)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {footer && footer.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
          {footer.map((item) => (
            <div key={item.label} className="min-w-0">
              <div className="text-[11px] text-gray-500 truncate">
                {item.label}
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                <span className="text-base font-semibold text-gray-900 tabular-nums leading-none">
                  {item.value}
                </span>
                {item.secondary && (
                  <span className="text-[11px] text-gray-400 tabular-nums">
                    {item.secondary}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
