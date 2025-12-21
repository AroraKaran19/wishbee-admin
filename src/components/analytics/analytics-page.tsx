"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Loader2, Calendar, Search } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { analyticsApi, AnalyticsPeriod } from "@/lib/api/analytics";
import toast from "react-hot-toast";
import { DateRangePicker } from "@/components/ui/date-range-picker";

const COLORS = [
  "#13aaff",
  "#60a5fa",
  "#93c5fd",
  "#cbd5e1",
  "#e2e8f0",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
];

// Map UI period labels to API period values
const periodMap: Record<string, AnalyticsPeriod> = {
  "today": "today",
  "7days": "7days",
  "30days": "30days",
  "6months": "6months",
  "12months": "12months",
  "all-time": "all-time",
};

// Map API period to UI display label
const getPeriodLabel = (period: string): string => {
  const labels: Record<string, string> = {
    "today": "Today",
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
    "6months": "Last 6 Months",
    "12months": "Last 12 Months",
    "all-time": "All Time",
  };
  return labels[period] || period;
};

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod | "custom">("30days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Set default date range (last 30 days) when custom is first selected
  useEffect(() => {
    if (period === "custom" && !startDate && !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setEndDate(today.toISOString().split("T")[0]);
      setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    }
  }, [period, startDate, endDate]);

  // Fetch analytics data - only for non-custom periods or initial custom load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Only fetch for non-custom periods (custom will use submit button)
        if (period !== "custom") {
          const data = await analyticsApi.getPage(period as AnalyticsPeriod);
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load analytics data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch for non-custom periods
    if (period !== "custom") {
      fetchData();
    }
  }, [period]);

  // Validate date range
  const isDateRangeValid = (): boolean => {
    if (!startDate || !endDate) return false;
    
    // Create date objects at midnight UTC to avoid timezone issues
    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T00:00:00.000Z");
    
    // Start date must be before end date (not equal, not after)
    return start < end;
  };

  // Handle custom date range submit
  const handleCustomRangeSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    // Validate date range
    if (!isDateRangeValid()) {
      toast.error("Start date must be before end date");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await analyticsApi.getPage(undefined, startDate, endDate);
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load analytics data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Transform trend data for chart
  const getChartData = () => {
    if (!analyticsData?.profitAndRevenueChart?.trend) return [];

    const trendData = analyticsData.profitAndRevenueChart.trend;

    // For custom range, calculate the number of days
    let customRangeDays = 0;
    if (period === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      customRangeDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // For all-time or custom, check if dates span multiple months/years
    let dateFormat: "day" | "month" | "year-month" = "day";
    if (
      (period === "all-time" || period === "custom") &&
      trendData.length > 0
    ) {
      const dates = trendData.map((item: any) => new Date(item.date));
      const uniqueMonths = new Set(
        dates.map((d: Date) => `${d.getFullYear()}-${d.getMonth()}`)
      );
      const uniqueYears = new Set(dates.map((d: Date) => d.getFullYear()));

      // For custom ranges less than 90 days, always show day
      if (period === "custom" && customRangeDays <= 90) {
        dateFormat = "day";
      } else if (uniqueYears.size > 1) {
        dateFormat = "year-month";
      } else if (uniqueMonths.size > 1) {
        dateFormat = "month";
      } else {
        dateFormat = "day";
      }
    }

    return trendData.map((item: any) => {
      const date = new Date(item.date);
      // Format date based on period
      let dateLabel = "";
      if (period === "today") {
        // For today, show hour format (e.g., "12 AM", "1 PM")
        dateLabel = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        });
      } else if (period === "7days") {
        dateLabel = date.toLocaleDateString("en-US", { weekday: "short" });
      } else if (period === "30days") {
        dateLabel = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } else if (period === "6months") {
        dateLabel = date.toLocaleDateString("en-US", { month: "short" });
      } else if (period === "12months") {
        dateLabel = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } else if (period === "custom") {
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
      } else if (period === "all-time") {
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
      } else {
        dateLabel = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
      }

      return {
        date: dateLabel,
        dateValue: date, // Keep original date for sorting/interval calculation
        fullDate: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }), // Full date for tooltip
        revenue: item.revenue,
        profit: item.profit,
      };
    });
  };

  // Calculate interval for X-axis ticks based on data length and period
  const getXAxisInterval = () => {
    const data = getChartData();
    if (data.length === 0) return 0;

    // For 7 days: show every day (interval 0)
    if (period === "7days") return 0;

    // For 30 days: show approximately 6 dates evenly spaced
    if (period === "30days") {
      // Show every 5th data point to get ~6 labels for 30 days
      return Math.max(0, Math.floor((data.length - 1) / 5));
    }

    // For 6 months: show approximately 6 dates
    if (period === "6months") {
      return Math.max(0, Math.floor((data.length - 1) / 5));
    }

    // For 12 months: show approximately 6 dates
    if (period === "12months") {
      return Math.max(0, Math.floor((data.length - 1) / 5));
    }

    // For all-time or custom: show approximately 8 dates
    if (period === "all-time" || period === "custom") {
      return Math.max(0, Math.floor((data.length - 1) / 7));
    }

    return 0;
  };

  // Get data key for X-axis
  const getDataKey = () => "date";

  // Format growth percentage
  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? "+" : "";
    return `${sign}${growth.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1 text-sm">
            View comprehensive analytics and insights.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="text-gray-500">Loading analytics data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1 text-sm">
            View comprehensive analytics and insights.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">
            {error || "Failed to load analytics data"}
          </p>
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const { keyMetrics, profitAndRevenueChart, salesByCategory } = analyticsData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1 text-sm">
          View comprehensive analytics and insights.
        </p>
      </div>

      {/* Period Selector */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {Object.keys(periodMap).map((periodKey) => (
            <button
              key={periodKey}
              onClick={() => setPeriod(periodMap[periodKey])}
              className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors ${
                period === periodMap[periodKey]
                  ? "bg-[#13aaff] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {getPeriodLabel(periodKey)}
            </button>
          ))}
          <button
            onClick={() => setPeriod("custom")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              period === "custom"
                ? "bg-[#13aaff] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Custom Range
          </button>
        </div>

        {/* Custom Date Range Picker */}
        {period === "custom" && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">
                Selected Range:{" "}
                {startDate && endDate ? (
                  <span className={isDateRangeValid() ? "text-[#13aaff]" : "text-red-600"}>
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
                  <span className="text-gray-500">Please select dates</span>
                )}
              </p>
              {startDate && endDate && !isDateRangeValid() && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Start date must be before end date
                </p>
              )}
            </div>
            <div className="space-y-3">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
              <button
                onClick={handleCustomRangeSubmit}
                disabled={!startDate || !endDate || !isDateRangeValid() || loading}
                className="w-full sm:w-auto px-4 py-2 bg-[#13aaff] text-white rounded-lg text-sm font-medium hover:bg-[#0f8fd6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Apply Date Range
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="text-sm text-blue-600 font-medium mb-2">
            Total Orders
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {keyMetrics?.totalOrders?.count?.toLocaleString("en-IN") || "0"}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {keyMetrics?.totalOrders?.periodLabel || getPeriodLabel(period)}
          </div>
          {keyMetrics?.totalOrders?.growthPercentage !== undefined && (
            <div
              className={`flex items-center text-sm ${
                keyMetrics.totalOrders.growthPercentage >= 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {keyMetrics.totalOrders.growthPercentage >= 0 ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {formatGrowth(keyMetrics.totalOrders.growthPercentage)} ↑
            </div>
          )}
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="text-sm text-green-600 font-medium mb-2">
            Total Revenue
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ₹{keyMetrics?.totalRevenue?.amount?.toLocaleString("en-IN") || "0"}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {keyMetrics?.totalRevenue?.periodLabel || getPeriodLabel(period)}
          </div>
          {keyMetrics?.totalRevenue?.growthPercentage !== undefined && (
            <div
              className={`flex items-center text-sm ${
                keyMetrics.totalRevenue.growthPercentage >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {keyMetrics.totalRevenue.growthPercentage >= 0 ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {formatGrowth(keyMetrics.totalRevenue.growthPercentage)} ↑
            </div>
          )}
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="text-sm text-blue-600 font-medium mb-2">
            New Customers
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {keyMetrics?.newCustomers?.count?.toLocaleString("en-IN") || "0"}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {keyMetrics?.newCustomers?.periodLabel || getPeriodLabel(period)}
          </div>
          {keyMetrics?.newCustomers?.growthPercentage !== undefined && (
            <div
              className={`flex items-center text-sm ${
                keyMetrics.newCustomers.growthPercentage >= 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {keyMetrics.newCustomers.growthPercentage >= 0 ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {formatGrowth(keyMetrics.newCustomers.growthPercentage)} ↑
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Revenue
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-bold text-gray-900">
                ₹
                {profitAndRevenueChart?.totalRevenue?.toLocaleString("en-IN") ||
                  "0"}
              </span>
              {profitAndRevenueChart?.revenueGrowth !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    profitAndRevenueChart.revenueGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatGrowth(profitAndRevenueChart.revenueGrowth)} ↑ VS
                  PREVIOUS PERIOD
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {profitAndRevenueChart?.periodLabel || getPeriodLabel(period)}
            </div>
          </div>
        </div>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="colorProfitArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#13aaff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#13aaff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorRevenueArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey={getDataKey()}
                  stroke="#6b7280"
                  interval={getXAxisInterval()}
                  angle={
                    period === "30days" ||
                    period === "7days" ||
                    period === "custom"
                      ? -30
                      : 0
                  }
                  textAnchor={
                    period === "30days" ||
                    period === "7days" ||
                    period === "custom"
                      ? "end"
                      : "middle"
                  }
                  height={
                    period === "30days" ||
                    period === "7days" ||
                    period === "custom"
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
                    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
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
                            {period === "custom" ||
                            period === "all-time" ||
                            period === "12months" ||
                            period === "6months" ||
                            period === "30days" ||
                            period === "7days"
                              ? data.fullDate
                              : data.date}
                          </p>
                          <p className="text-sm">
                            Revenue: ₹
                            {data.revenue?.toLocaleString("en-IN") || "0"}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorRevenueArea)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#10b981" }}
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#13aaff"
                  strokeWidth={2}
                  fill="url(#colorProfitArea)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#13aaff" }}
                  name="Profit"
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

      {/* Statistics Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Statistics</h2>
        <p className="text-sm text-gray-500 mb-6">
          Sales Breakdown by Category
        </p>
        {salesByCategory && salesByCategory.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByCategory.map((item: any, index: number) => ({
                      name: item.categoryName,
                      value: item.totalSales, // Use totalSales for pie chart calculation
                      percentage: item.percentage, // Keep API percentage for display
                      color: COLORS[index % COLORS.length],
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      // Display the API's percentage, not Recharts' calculated one
                      const categoryData = salesByCategory.find(
                        (c: any) => c.categoryName === props.name
                      );
                      return categoryData
                        ? `${categoryData.percentage.toFixed(1)}%`
                        : `${(props.percent * 100).toFixed(1)}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesByCategory.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const categoryData = salesByCategory.find(
                          (c: any) => c.categoryName === data.name
                        );
                        return (
                          <div className="bg-gray-900 text-white rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-semibold mb-1">
                              {data.name}
                            </p>
                            <p className="text-sm">
                              Sales: ₹
                              {categoryData?.totalSales?.toLocaleString(
                                "en-IN"
                              ) || "0"}
                            </p>
                            <p className="text-sm">
                              Percentage:{" "}
                              {categoryData
                                ? categoryData.percentage.toFixed(1)
                                : "0"}
                              %
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category List */}
            <div>
              <div className="space-y-4">
                {salesByCategory.map((item: any, index: number) => (
                  <div
                    key={item.categoryId || index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm text-gray-900">
                        {item.categoryName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        ₹{item.totalSales?.toLocaleString("en-IN") || "0"}
                      </span>
                      <div
                        className="px-3 py-1 rounded text-sm font-medium text-white"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      >
                        {item.percentage ? item.percentage.toFixed(1) : "0"}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No sales data available for this period
          </div>
        )}
      </div>
    </div>
  );
}
