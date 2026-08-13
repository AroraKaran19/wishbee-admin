"use client";

import React, { useState, useEffect } from "react";
import { Upload, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { TableConfig } from "@/lib/types/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { mostSellingApi, MostSellingPeriod } from "@/lib/api/most-selling";
import toast from "react-hot-toast";
import { DateRangePicker } from "@/components/ui/date-range-picker";

// Map UI period labels to API period values
const periodMap: Record<string, MostSellingPeriod> = {
  "7days": "7days",
  "30days": "30days",
  "6months": "6months",
  "12months": "12months",
  "all-time": "all-time",
};

// Map API period to UI display label
const getPeriodLabel = (period: string): string => {
  const labels: Record<string, string> = {
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
    "6months": "Last 6 Months",
    "12months": "Last 12 Months",
    "all-time": "All Time",
  };
  return labels[period] || period;
};

interface TopSellingProduct {
  id: string;
  productName: string;
  soldQuantity: number;
  revenue: number;
  remainingQuantity: number;
}

interface LeastSellingProduct {
  id: string;
  productName: string;
  soldQuantity: number;
  daysSinceLastOrder: number | null;
  currentStock: number;
}

interface ShortExpiryProduct {
  id: string;
  productName: string;
  expiryDate: string;
  daysLeft: number;
  currentStock: number;
}

export function MostSellingPage() {
  // Separate period states for each section
  const [salePerformancePeriod, setSalePerformancePeriod] = useState<
    MostSellingPeriod | "custom"
  >("30days");
  const [topProductsPeriod, setTopProductsPeriod] = useState<
    MostSellingPeriod | "custom"
  >("30days");
  const [leastProductsPeriod, setLeastProductsPeriod] = useState<
    MostSellingPeriod | "custom"
  >("30days");

  // Separate date ranges for each section
  const [salePerformanceStartDate, setSalePerformanceStartDate] =
    useState<string>("");
  const [salePerformanceEndDate, setSalePerformanceEndDate] =
    useState<string>("");
  const [topProductsStartDate, setTopProductsStartDate] = useState<string>("");
  const [topProductsEndDate, setTopProductsEndDate] = useState<string>("");
  const [leastProductsStartDate, setLeastProductsStartDate] =
    useState<string>("");
  const [leastProductsEndDate, setLeastProductsEndDate] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salePerformance, setSalePerformance] = useState<any>(null);
  const [topSellingProducts, setTopSellingProducts] = useState<
    TopSellingProduct[]
  >([]);
  const [leastSellingProducts, setLeastSellingProducts] = useState<
    LeastSellingProduct[]
  >([]);
  const [shortExpiryProducts, setShortExpiryProducts] = useState<
    ShortExpiryProduct[]
  >([]);
  const itemsPerPage = 10;
  const [topSellingPage, setTopSellingPage] = useState(1);
  const [leastSellingPage, setLeastSellingPage] = useState(1);
  const [shortExpiryPage, setShortExpiryPage] = useState(1);

  // Set default date ranges (last 30 days) for custom periods
  useEffect(() => {
    const setDefaultDates = (
      period: MostSellingPeriod | "custom",
      startDate: string,
      endDate: string,
      setStart: (val: string) => void,
      setEnd: (val: string) => void
    ) => {
      if (period === "custom" && !startDate && !endDate) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setEnd(today.toISOString().split("T")[0]);
        setStart(thirtyDaysAgo.toISOString().split("T")[0]);
      }
    };

    setDefaultDates(
      salePerformancePeriod,
      salePerformanceStartDate,
      salePerformanceEndDate,
      setSalePerformanceStartDate,
      setSalePerformanceEndDate
    );
    setDefaultDates(
      topProductsPeriod,
      topProductsStartDate,
      topProductsEndDate,
      setTopProductsStartDate,
      setTopProductsEndDate
    );
    setDefaultDates(
      leastProductsPeriod,
      leastProductsStartDate,
      leastProductsEndDate,
      setLeastProductsStartDate,
      setLeastProductsEndDate
    );
  }, [
    salePerformancePeriod,
    salePerformanceStartDate,
    salePerformanceEndDate,
    topProductsPeriod,
    topProductsStartDate,
    topProductsEndDate,
    leastProductsPeriod,
    leastProductsStartDate,
    leastProductsEndDate,
  ]);

  // Validate date range helper
  const isDateRangeValid = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return false;

    // Create date objects at midnight UTC to avoid timezone issues
    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T00:00:00.000Z");

    // Equal dates are a valid single-day range; only start-after-end is wrong.
    return start <= end;
  };

  // Fetch Sale Performance data
  useEffect(() => {
    const fetchSalePerformance = async () => {
      // Don't auto-fetch for custom period - user must click submit
      if (salePerformancePeriod === "custom") {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiPeriod = salePerformancePeriod as MostSellingPeriod;
        const pageData = await mostSellingApi.getPage(apiPeriod);

        setSalePerformance(pageData.salePerformance);
        setShortExpiryProducts(
          pageData.shortToExpiryProducts.map((product) => ({
            id: product.productId,
            productName: product.productName,
            expiryDate: new Date(product.expiryDate).toLocaleDateString(
              "en-US",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            ),
            daysLeft: product.daysLeft,
            currentStock: product.currentStock,
          }))
        );
      } catch (err) {
        console.error("Error fetching sale performance:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load sale performance data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (salePerformancePeriod !== "custom") {
      fetchSalePerformance();
    }
  }, [salePerformancePeriod]);

  // Fetch Top Selling Products
  useEffect(() => {
    const fetchTopProducts = async () => {
      // Don't auto-fetch for custom period - user must click submit
      if (topProductsPeriod === "custom") {
        return;
      }

      try {
        setError(null);

        const apiPeriod = topProductsPeriod as MostSellingPeriod;
        const topProducts = await mostSellingApi.getTopProducts(
          apiPeriod,
          undefined,
          undefined,
          100
        );

        setTopSellingProducts(
          topProducts.map((product) => ({
            id: product.productId,
            productName: product.productName,
            soldQuantity: product.soldQuantity,
            revenue: product.revenue,
            remainingQuantity: product.remainingQuantity,
          }))
        );
      } catch (err) {
        console.error("Error fetching top products:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load top products";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    if (topProductsPeriod !== "custom") {
      fetchTopProducts();
    }
  }, [topProductsPeriod]);

  // Fetch Least Selling Products
  useEffect(() => {
    const fetchLeastProducts = async () => {
      // Don't auto-fetch for custom period - user must click submit
      if (leastProductsPeriod === "custom") {
        return;
      }

      try {
        setError(null);

        const apiPeriod = leastProductsPeriod as MostSellingPeriod;
        const leastProducts = await mostSellingApi.getLeastProducts(
          apiPeriod,
          undefined,
          undefined,
          100,
          5
        );

        setLeastSellingProducts(
          leastProducts.map((product) => ({
            id: product.productId,
            productName: product.productName,
            soldQuantity: product.soldQuantity,
            daysSinceLastOrder: product.daysSinceLastOrder,
            currentStock: product.currentStock,
          }))
        );
      } catch (err) {
        console.error("Error fetching least products:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load least products";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    if (leastProductsPeriod !== "custom") {
      fetchLeastProducts();
    }
  }, [leastProductsPeriod]);

  // Handle custom date range submit for Sale Performance
  const handleSalePerformanceCustomRangeSubmit = async () => {
    if (!salePerformanceStartDate || !salePerformanceEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (!isDateRangeValid(salePerformanceStartDate, salePerformanceEndDate)) {
      toast.error("Start date must be on or before end date");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const pageData = await mostSellingApi.getPage(
        undefined,
        salePerformanceStartDate,
        salePerformanceEndDate
      );

      setSalePerformance(pageData.salePerformance);
      setShortExpiryProducts(
        pageData.shortToExpiryProducts.map((product) => ({
          id: product.productId,
          productName: product.productName,
          expiryDate: new Date(product.expiryDate).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          daysLeft: product.daysLeft,
          currentStock: product.currentStock,
        }))
      );
    } catch (err) {
      console.error("Error fetching sale performance:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load sale performance data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle custom date range submit for Top Products
  const handleTopProductsCustomRangeSubmit = async () => {
    if (!topProductsStartDate || !topProductsEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (!isDateRangeValid(topProductsStartDate, topProductsEndDate)) {
      toast.error("Start date must be on or before end date");
      return;
    }

    try {
      setError(null);

      const topProducts = await mostSellingApi.getTopProducts(
        undefined,
        topProductsStartDate,
        topProductsEndDate,
        100
      );

      setTopSellingProducts(
        topProducts.map((product) => ({
          id: product.productId,
          productName: product.productName,
          soldQuantity: product.soldQuantity,
          revenue: product.revenue,
          remainingQuantity: product.remainingQuantity,
        }))
      );
    } catch (err) {
      console.error("Error fetching top products:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load top products";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Handle custom date range submit for Least Products
  const handleLeastProductsCustomRangeSubmit = async () => {
    if (!leastProductsStartDate || !leastProductsEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (!isDateRangeValid(leastProductsStartDate, leastProductsEndDate)) {
      toast.error("Start date must be on or before end date");
      return;
    }

    try {
      setError(null);

      const leastProducts = await mostSellingApi.getLeastProducts(
        undefined,
        leastProductsStartDate,
        leastProductsEndDate,
        100,
        5
      );

      setLeastSellingProducts(
        leastProducts.map((product) => ({
          id: product.productId,
          productName: product.productName,
          soldQuantity: product.soldQuantity,
          daysSinceLastOrder: product.daysSinceLastOrder,
          currentStock: product.currentStock,
        }))
      );
    } catch (err) {
      console.error("Error fetching least products:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load least products";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Transform chart data for display
  const getChartData = () => {
    if (!salePerformance?.chartData) return [];

    const chartData = salePerformance.chartData;

    // For custom range, calculate the number of days
    let customRangeDays = 0;
    if (
      salePerformancePeriod === "custom" &&
      salePerformanceStartDate &&
      salePerformanceEndDate
    ) {
      const start = new Date(salePerformanceStartDate);
      const end = new Date(salePerformanceEndDate);
      customRangeDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // For all-time or custom, check if dates span multiple months/years
    let dateFormat: "day" | "month" | "year-month" = "day";
    if (
      (salePerformancePeriod === "all-time" ||
        salePerformancePeriod === "custom") &&
      chartData.length > 0
    ) {
      const dates = chartData.map((item: any) => new Date(item.date));
      const uniqueMonths = new Set(
        dates.map((d: Date) => `${d.getFullYear()}-${d.getMonth()}`)
      );
      const uniqueYears = new Set(dates.map((d: Date) => d.getFullYear()));

      // For custom ranges less than 90 days, always show day
      if (salePerformancePeriod === "custom" && customRangeDays <= 90) {
        dateFormat = "day";
      } else if (uniqueYears.size > 1) {
        dateFormat = "year-month";
      } else if (uniqueMonths.size > 1) {
        dateFormat = "month";
      } else {
        dateFormat = "day";
      }
    }

    return chartData.map((point: any) => {
      const date = new Date(point.date);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", point.date);
        return {
          date: point.date || "Unknown",
          dateValue: date,
          fullDate: point.date || "Unknown",
          value: point.sales || 0,
        };
      }

      // Format date based on period
      let dateLabel = "";
      if (salePerformancePeriod === "7days") {
        dateLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      } else if (salePerformancePeriod === "30days") {
        dateLabel = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } else if (salePerformancePeriod === "6months") {
        dateLabel = date.toLocaleDateString("en-US", { month: "short" });
      } else if (salePerformancePeriod === "12months") {
        dateLabel = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } else if (salePerformancePeriod === "custom") {
        // For custom ranges, always show day when range is <= 90 days
        if (customRangeDays <= 90) {
          dateLabel = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        } else if (dateFormat === "day") {
          dateLabel = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        } else if (dateFormat === "month") {
          dateLabel = date.toLocaleDateString("en-US", { month: "short" });
        } else {
          dateLabel = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });
        }
      } else if (salePerformancePeriod === "all-time") {
        // Smart formatting based on date span
        if (dateFormat === "day") {
          dateLabel = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        } else if (dateFormat === "month") {
          dateLabel = date.toLocaleDateString("en-US", { month: "short" });
        } else {
          dateLabel = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });
        }
      }

      return {
        date: dateLabel || point.date,
        dateValue: date, // Keep original date for sorting/interval calculation
        fullDate: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }), // Full date for tooltip
        value: point.sales || 0,
      };
    });
  };

  // Calculate interval for X-axis ticks based on data length and period
  const getXAxisInterval = () => {
    const data = getChartData();
    if (data.length === 0) return 0;

    // For 7 days: show every day (interval 0)
    if (salePerformancePeriod === "7days") return 0;

    // For 30 days: show approximately 6 dates evenly spaced
    if (salePerformancePeriod === "30days") {
      return Math.max(0, Math.floor((data.length - 1) / 5));
    }

    // For 6 months: show approximately 6 dates
    if (salePerformancePeriod === "6months") {
      return Math.max(0, Math.floor((data.length - 1) / 5));
    }

    // For 12 months: show approximately 6 dates
    if (salePerformancePeriod === "12months") {
      return Math.max(0, Math.floor((data.length - 1) / 5));
    }

    // For all-time or custom: show approximately 8 dates
    if (
      salePerformancePeriod === "all-time" ||
      salePerformancePeriod === "custom"
    ) {
      return Math.max(0, Math.floor((data.length - 1) / 7));
    }

    return 0;
  };

  const salesData = getChartData();
  const dataKey = "date";

  // Helper function to render period selector
  const renderPeriodSelector = (
    currentPeriod: MostSellingPeriod | "custom",
    setPeriod: (period: MostSellingPeriod | "custom") => void,
    startDate: string,
    endDate: string,
    setStartDate: (date: string) => void,
    setEndDate: (date: string) => void,
    onSubmit: () => void
  ) => (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {Object.keys(periodMap).map((periodKey) => (
          <button
            key={periodKey}
            onClick={() => {
              setPeriod(periodMap[periodKey]);
            }}
            className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors ${
              currentPeriod === periodMap[periodKey]
                ? "bg-[#13aaff] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {getPeriodLabel(periodKey)}
          </button>
        ))}
        <button
          onClick={() => {
            setPeriod("custom");
            if (!startDate || !endDate) {
              const today = new Date();
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(today.getDate() - 30);
              setEndDate(today.toISOString().split("T")[0]);
              setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
            }
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            currentPeriod === "custom"
              ? "bg-[#13aaff] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Custom Range
        </button>
      </div>

      {/* Custom Date Range Picker */}
      {currentPeriod === "custom" && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700">
              Selected Range:{" "}
              {startDate && endDate ? (
                <span
                  className={
                    isDateRangeValid(startDate, endDate)
                      ? "text-[#13aaff]"
                      : "text-red-600"
                  }
                >
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
                  })}
                </span>
              ) : (
                <span className="text-gray-400">No dates selected</span>
              )}
            </p>
            {startDate && endDate && !isDateRangeValid(startDate, endDate) && (
              <p className="text-sm text-red-600 mt-1">
                Start date must be on or before end date
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
              onClick={onSubmit}
              disabled={
                !startDate || !endDate || !isDateRangeValid(startDate, endDate)
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !startDate || !endDate || !isDateRangeValid(startDate, endDate)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#13aaff] text-white hover:bg-[#0d8fd9]"
              }`}
            >
              Apply Date Range
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Pagination calculations
  const topSellingTotalPages = Math.ceil(
    topSellingProducts.length / itemsPerPage
  );
  const topSellingStartIndex = (topSellingPage - 1) * itemsPerPage;
  const paginatedTopSelling = topSellingProducts.slice(
    topSellingStartIndex,
    topSellingStartIndex + itemsPerPage
  );

  const leastSellingTotalPages = Math.ceil(
    leastSellingProducts.length / itemsPerPage
  );
  const leastSellingStartIndex = (leastSellingPage - 1) * itemsPerPage;
  const paginatedLeastSelling = leastSellingProducts.slice(
    leastSellingStartIndex,
    leastSellingStartIndex + itemsPerPage
  );

  const shortExpiryTotalPages = Math.ceil(
    shortExpiryProducts.length / itemsPerPage
  );
  const shortExpiryStartIndex = (shortExpiryPage - 1) * itemsPerPage;
  const paginatedShortExpiry = shortExpiryProducts.slice(
    shortExpiryStartIndex,
    shortExpiryStartIndex + itemsPerPage
  );

  const topSellingTableConfig: TableConfig<TopSellingProduct> = {
    columns: [
      {
        key: "productName",
        title: "Product Name",
        align: "left",
      },
      {
        key: "soldQuantity",
        title: "Sold Quantity",
        align: "center",
        render: (value) => <span>{value} Units</span>,
      },
      {
        key: "revenue",
        title: "Revenue (₹)",
        align: "center",
        render: (value) => <span>₹{value.toLocaleString("en-IN")}</span>,
      },
      {
        key: "remainingQuantity",
        title: "Remaining Quantity",
        align: "center",
        render: (value) => <span>{value} Units</span>,
      },
    ],
    pagination:
      topSellingTotalPages > 1
        ? {
            currentPage: topSellingPage,
            totalPages: topSellingTotalPages,
            onPageChange: setTopSellingPage,
            showPageInfo: true,
          }
        : undefined,
    rowKey: "id",
    className: "rounded-xl shadow-sm",
    rowClassName: () => "hover:bg-gray-50",
  };

  const leastSellingTableConfig: TableConfig<LeastSellingProduct> = {
    columns: [
      {
        key: "productName",
        title: "Product Name",
        align: "left",
      },
      {
        key: "soldQuantity",
        title: "Sold Quantity",
        align: "center",
        render: (value) => <span>{value} Units</span>,
      },
      {
        key: "daysSinceLastOrder",
        title: "Days Since Last Order",
        align: "center",
        render: (value) => (
          <span>
            {value === null
              ? "Never sold"
              : value === 0
              ? "Today"
              : `${value} days`}
          </span>
        ),
      },
      {
        key: "currentStock",
        title: "Current Stock",
        align: "center",
        render: (value) => <span>{value} Units</span>,
      },
    ],
    pagination:
      leastSellingTotalPages > 1
        ? {
            currentPage: leastSellingPage,
            totalPages: leastSellingTotalPages,
            onPageChange: setLeastSellingPage,
            showPageInfo: true,
          }
        : undefined,
    rowKey: "id",
    className: "rounded-xl shadow-sm",
    rowClassName: () => "hover:bg-gray-50",
  };

  const shortExpiryTableConfig: TableConfig<ShortExpiryProduct> = {
    columns: [
      {
        key: "productName",
        title: "Product Name",
        align: "left",
      },
      {
        key: "expiryDate",
        title: "Expiry Date",
        align: "center",
      },
      {
        key: "daysLeft",
        title: "Days Left",
        align: "center",
      },
      {
        key: "currentStock",
        title: "Current Stock",
        align: "center",
        render: (value) => <span>{value} Units</span>,
      },
    ],
    pagination:
      shortExpiryTotalPages > 1
        ? {
            currentPage: shortExpiryPage,
            totalPages: shortExpiryTotalPages,
            onPageChange: setShortExpiryPage,
            showPageInfo: true,
          }
        : undefined,
    rowKey: "id",
    className: "rounded-xl shadow-sm",
    rowClassName: () => "hover:bg-gray-50",
  };

  const handleExportCSV = (section: string) => {
    console.log(`Export CSV for ${section}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Most Selling</h1>
          <p className="text-gray-500 mt-1 text-sm">
            View sales performance and product analytics.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="text-gray-500">Loading most selling data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Most Selling</h1>
          <p className="text-gray-500 mt-1 text-sm">
            View sales performance and product analytics.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Most Selling</h1>
        <p className="text-gray-500 mt-1 text-sm">
          View sales performance and product analytics.
        </p>
      </div>

      {/* Sale Performance Over The Time */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sale Performance Over The Time
        </h2>

        {/* Period Selector for Sale Performance */}
        <div className="mb-4">
          {renderPeriodSelector(
            salePerformancePeriod,
            setSalePerformancePeriod,
            salePerformanceStartDate,
            salePerformanceEndDate,
            setSalePerformanceStartDate,
            setSalePerformanceEndDate,
            handleSalePerformanceCustomRangeSubmit
          )}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">
                {salePerformance?.period || "Sales"}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl font-bold text-gray-900">
                  ₹
                  {salePerformance?.salesAmount?.toLocaleString("en-IN") || "0"}
                </span>
                {salePerformance?.growthPercentage !== undefined && (
                  <span
                    className={`text-sm font-medium ${
                      salePerformance.growthPercentage >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {salePerformance.growthPercentage >= 0 ? "+" : ""}
                    {salePerformance.growthPercentage.toFixed(2)}% VS PREVIOUS
                    PERIOD
                  </span>
                )}
              </div>
            </div>
          </div>
          {salesData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient
                      id="colorSalesArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#13aaff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#13aaff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey={dataKey}
                    stroke="#6b7280"
                    interval={getXAxisInterval()}
                    angle={
                      salePerformancePeriod === "30days" ||
                      salePerformancePeriod === "7days" ||
                      salePerformancePeriod === "custom"
                        ? -30
                        : 0
                    }
                    textAnchor={
                      salePerformancePeriod === "30days" ||
                      salePerformancePeriod === "7days" ||
                      salePerformancePeriod === "custom"
                        ? "end"
                        : "middle"
                    }
                    height={
                      salePerformancePeriod === "30days" ||
                      salePerformancePeriod === "7days" ||
                      salePerformancePeriod === "custom"
                        ? 70
                        : 50
                    }
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tickFormatter={(value) => {
                      if (value >= 1000000)
                        return `₹${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000)
                        return `₹${(value / 1000).toFixed(1)}k`;
                      return `₹${value}`;
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-white rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-semibold mb-1">
                              {salePerformancePeriod === "custom" ||
                              salePerformancePeriod === "all-time" ||
                              salePerformancePeriod === "12months" ||
                              salePerformancePeriod === "6months" ||
                              salePerformancePeriod === "30days" ||
                              salePerformancePeriod === "7days"
                                ? data.fullDate
                                : data.date}
                            </p>
                            <p className="text-sm">
                              Sales: ₹
                              {data.value?.toLocaleString("en-IN") || "0"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#13aaff"
                    strokeWidth={2}
                    fill="url(#colorSalesArea)"
                    dot={false}
                    activeDot={{ r: 6, fill: "#13aaff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No chart data available for this period
            </div>
          )}
        </div>
      </div>

      {/* Top Selling Product */}
      <div className="">
        <div className="py-3 flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Top Selling Product
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Products with sold quantity &gt; 5 units, sorted by sold quantity
              (highest first), showing top 100 products
            </p>
          </div>
          <Button
            onClick={() => handleExportCSV("Top Selling")}
            variant="danger"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Period Selector for Top Selling Products */}
        <div className="mb-4">
          {renderPeriodSelector(
            topProductsPeriod,
            setTopProductsPeriod,
            topProductsStartDate,
            topProductsEndDate,
            setTopProductsStartDate,
            setTopProductsEndDate,
            handleTopProductsCustomRangeSubmit
          )}
        </div>
        <div>
          {paginatedTopSelling.length > 0 ? (
            <DataTable
              data={paginatedTopSelling}
              config={topSellingTableConfig}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No top selling products found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Least Selling Product */}
      <div className="">
        <div className="py-3 flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Least Selling Product
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Products with sold quantity ≤ 5 units, sorted by days since last
              order (most recent first), showing top 100 products
            </p>
          </div>
          <Button
            onClick={() => handleExportCSV("Least Selling")}
            variant="danger"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Period Selector for Least Selling Products */}
        <div className="mb-4">
          {renderPeriodSelector(
            leastProductsPeriod,
            setLeastProductsPeriod,
            leastProductsStartDate,
            leastProductsEndDate,
            setLeastProductsStartDate,
            setLeastProductsEndDate,
            handleLeastProductsCustomRangeSubmit
          )}
        </div>
        <div>
          {paginatedLeastSelling.length > 0 ? (
            <DataTable
              data={paginatedLeastSelling}
              config={leastSellingTableConfig}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No least selling products found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Short to Expiry Products */}
      <div className="">
        <div className="py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Short to Expiry Products
          </h2>
          <Button
            onClick={() => handleExportCSV("Short Expiry")}
            variant="danger"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
        <div className="pb-12 sm:pb-0">
          {paginatedShortExpiry.length > 0 ? (
            <DataTable
              data={paginatedShortExpiry}
              config={shortExpiryTableConfig}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No short expiry products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
