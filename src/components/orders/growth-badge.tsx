"use client";

import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface GrowthBadgeProps {
  /** Percent change vs the previous window. */
  growth: number;
  /** Inverts the colour scale for metrics where a rise is bad (e.g. cancellations). */
  invert?: boolean;
}

/** Delta pill: tinted, arrowed, and neutral when flat. */
export function GrowthBadge({ growth, invert = false }: GrowthBadgeProps) {
  const isFlat = growth === 0;
  const isUp = growth > 0;
  const isGood = invert ? !isUp : isUp;

  const tone = isFlat
    ? "text-gray-500 bg-gray-100"
    : isGood
    ? "text-[#0b8f00] bg-[#dbeed9]"
    : "text-[#d65144] bg-[#fdf2f2]";

  const Icon = isUp ? ArrowUp : ArrowDown;

  return (
    <span
      className={`inline-flex items-center gap-0.5 pl-1 pr-1.5 py-0.5 rounded-md text-[11px] font-semibold ${tone}`}
    >
      {!isFlat && <Icon className="w-3 h-3" />}
      {Math.abs(growth)}%
    </span>
  );
}
