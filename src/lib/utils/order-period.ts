import { OrderPeriod } from "@/lib/api/orders";

export type PeriodValue = OrderPeriod | "custom";

/** Period keys shown as buttons, in display order. */
export const periodMap: Record<string, OrderPeriod> = {
  today: "today",
  "7days": "7days",
  "30days": "30days",
  "6months": "6months",
  "12months": "12months",
  "all-time": "all-time",
};

export const DEFAULT_PERIOD: OrderPeriod = "30days";

/** Key used to remember the last period across sidebar navigation (which drops query params). */
const STORAGE_KEY = "wishbee.orders.period";

export const getPeriodLabel = (period: string): string => {
  const labels: Record<string, string> = {
    today: "Today",
    currentDate: "Today",
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
    lastMonth: "Last 30 Days",
    "6months": "Last 6 Months",
    "12months": "Last 12 Months",
    "all-time": "All Time",
  };
  return labels[period] || period;
};

export interface PeriodFilters {
  period?: OrderPeriod;
  startDate?: string;
  endDate?: string;
}

/**
 * Convert the selected period into the filter shape the orders API expects.
 * Custom ranges only produce dates once both have been applied; until then we
 * fall back to `fallback` so the page still has something to show.
 */
export const buildPeriodFilters = (
  period: PeriodValue,
  appliedStartDate: string,
  appliedEndDate: string,
  fallback?: OrderPeriod
): PeriodFilters => {
  if (period === "custom") {
    if (appliedStartDate && appliedEndDate) {
      return { startDate: appliedStartDate, endDate: appliedEndDate };
    }
    return fallback ? { period: fallback } : {};
  }
  return { period };
};

/** A custom range is only valid when both dates exist and start comes before end. */
export const isDateRangeValid = (
  startDate: string,
  endDate: string
): boolean => {
  if (!startDate || !endDate) return false;
  // Parse at midnight UTC so local timezone can't shift the comparison.
  const start = new Date(startDate + "T00:00:00.000Z");
  const end = new Date(endDate + "T00:00:00.000Z");
  return start < end;
};

/**
 * Names the window the API compares against: always the equally-sized stretch
 * immediately before the selected one. Null when there is nothing to compare
 * against (all-time has no preceding window).
 */
export const getComparisonLabel = (
  period: PeriodValue,
  appliedStartDate?: string,
  appliedEndDate?: string
): string | null => {
  switch (period) {
    case "today":
    case "currentDate":
      return "vs yesterday";
    case "7days":
      return "vs previous 7 days";
    case "30days":
    case "lastMonth":
      return "vs previous 30 days";
    case "6months":
      return "vs previous 6 months";
    case "12months":
      return "vs previous 12 months";
    case "all-time":
      return null;
    case "custom": {
      if (!appliedStartDate || !appliedEndDate) return null;
      const start = new Date(`${appliedStartDate}T00:00:00.000Z`).getTime();
      const end = new Date(`${appliedEndDate}T00:00:00.000Z`).getTime();
      const days = Math.max(
        1,
        Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1
      );
      return `vs previous ${days} day${days === 1 ? "" : "s"}`;
    }
    default:
      return null;
  }
};

export interface PeriodState {
  period: PeriodValue;
  startDate: string;
  endDate: string;
}

const isKnownPeriod = (value: string | null): value is PeriodValue =>
  !!value && (value === "custom" || Object.keys(periodMap).includes(value));

/**
 * Resolve the starting period: URL query params win, then the last period used
 * in this tab, then the default. The sidebar links to bare paths, so without the
 * sessionStorage step the selection would reset on every sidebar navigation.
 */
export const readPeriodState = (
  searchParams: URLSearchParams | null
): PeriodState => {
  const urlPeriod = searchParams?.get("period") ?? null;
  if (isKnownPeriod(urlPeriod)) {
    return {
      period: urlPeriod,
      startDate: searchParams?.get("start") ?? "",
      endDate: searchParams?.get("end") ?? "",
    };
  }

  if (typeof window !== "undefined") {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PeriodState;
        if (isKnownPeriod(parsed.period)) {
          return {
            period: parsed.period,
            startDate: parsed.startDate || "",
            endDate: parsed.endDate || "",
          };
        }
      }
    } catch {
      // Corrupt or unavailable storage is not worth failing the page over.
    }
  }

  return { period: DEFAULT_PERIOD, startDate: "", endDate: "" };
};

/** Serialize the period into a query string, omitting defaults to keep URLs clean. */
export const buildPeriodQuery = (state: PeriodState): string => {
  const params = new URLSearchParams();
  params.set("period", state.period);
  if (state.period === "custom" && state.startDate && state.endDate) {
    params.set("start", state.startDate);
    params.set("end", state.endDate);
  }
  return params.toString();
};

export const persistPeriodState = (state: PeriodState): void => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be disabled; the URL still carries the selection.
  }
};
