"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import toast from "react-hot-toast";
import {
  DEFAULT_PERIOD,
  PeriodValue,
  buildPeriodQuery,
  getPeriodLabel,
  isDateRangeValid,
  periodMap,
  persistPeriodState,
  readPeriodState,
} from "@/lib/utils/order-period";

export interface UsePeriodFilterResult {
  period: PeriodValue;
  setPeriod: (period: PeriodValue) => void;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  appliedStartDate: string;
  appliedEndDate: string;
  applyCustomRange: () => void;
  /** False until the stored/URL period has been resolved — gate fetches on this. */
  ready: boolean;
}

/**
 * Owns the order date-period selection and keeps it in the URL so the view is
 * shareable, plus in sessionStorage so it survives sidebar navigation (sidebar
 * links are bare paths and drop query params).
 *
 * @param onChange Called when the effective filter changes, so pages can reset pagination.
 */
export function usePeriodFilter(onChange?: () => void): UsePeriodFilterResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [period, setPeriodState] = useState<PeriodValue>(DEFAULT_PERIOD);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [ready, setReady] = useState(false);

  // sessionStorage is unavailable during SSR, so resolve the initial period after
  // mount and hold fetches until then.
  useEffect(() => {
    const initial = readPeriodState(searchParams);
    setPeriodState(initial.period);
    if (initial.period === "custom" && initial.startDate && initial.endDate) {
      setStartDate(initial.startDate);
      setEndDate(initial.endDate);
      setAppliedStartDate(initial.startDate);
      setAppliedEndDate(initial.endDate);
    }
    setReady(true);
    // Runs once on mount; later changes flow through setPeriod/applyCustomRange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncUrl = useCallback(
    (next: { period: PeriodValue; startDate: string; endDate: string }) => {
      persistPeriodState(next);
      router.replace(`${pathname}?${buildPeriodQuery(next)}`, { scroll: false });
    },
    [pathname, router]
  );

  // Default a freshly-selected custom range to the last 30 days.
  const didSeedCustomDates = useRef(false);
  useEffect(() => {
    if (period !== "custom") {
      didSeedCustomDates.current = false;
      return;
    }
    if (didSeedCustomDates.current || startDate || endDate) return;

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    didSeedCustomDates.current = true;
  }, [period, startDate, endDate]);

  const setPeriod = useCallback(
    (next: PeriodValue) => {
      setPeriodState(next);
      // Switching period invalidates any applied custom range.
      setAppliedStartDate("");
      setAppliedEndDate("");
      syncUrl({ period: next, startDate: "", endDate: "" });
      onChange?.();
    },
    [onChange, syncUrl]
  );

  const applyCustomRange = useCallback(() => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (!isDateRangeValid(startDate, endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    syncUrl({ period: "custom", startDate, endDate });
    onChange?.();
  }, [startDate, endDate, onChange, syncUrl]);

  return {
    period,
    setPeriod,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    appliedStartDate,
    appliedEndDate,
    applyCustomRange,
    ready,
  };
}

interface PeriodFilterProps {
  filter: UsePeriodFilterResult;
}

/** Period buttons plus the custom date-range panel, shared by both order pages. */
export function PeriodFilter({ filter }: PeriodFilterProps) {
  const {
    period,
    setPeriod,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    appliedStartDate,
    appliedEndDate,
    applyCustomRange,
  } = filter;

  const rangeValid = isDateRangeValid(startDate, endDate);
  const canApply = Boolean(startDate && endDate && rangeValid);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {Object.keys(periodMap).map((periodKey) => (
          <button
            key={periodKey}
            onClick={() => setPeriod(periodMap[periodKey])}
            className={`px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-colors ${
              period === periodMap[periodKey]
                ? "bg-[#13aaff] text-white shadow-sm"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            {getPeriodLabel(periodKey)}
          </button>
        ))}
        <button
          onClick={() => setPeriod("custom")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
            period === "custom"
              ? "bg-[#13aaff] text-white shadow-sm"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Custom Range
        </button>
      </div>

      {period === "custom" && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700">
              Selected Range:{" "}
              {appliedStartDate && appliedEndDate ? (
                <span className="text-[#13aaff]">
                  {new Date(appliedStartDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  to{" "}
                  {new Date(appliedEndDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ) : startDate && endDate ? (
                <span className={rangeValid ? "text-gray-600" : "text-red-600"}>
                  {new Date(startDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  to{" "}
                  {new Date(endDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  (Not applied)
                </span>
              ) : (
                <span className="text-gray-400">No dates selected</span>
              )}
            </p>
            {startDate && endDate && !rangeValid && (
              <p className="text-sm text-red-600 mt-1">
                Start date must be before end date
              </p>
            )}
          </div>
          <div className="flex gap-4 items-end">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <button
              onClick={applyCustomRange}
              disabled={!canApply}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !canApply
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#13aaff] text-white hover:bg-[#0d8fd9] cursor-pointer"
              }`}
            >
              Apply Date Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
