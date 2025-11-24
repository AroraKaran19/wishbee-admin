"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  ArrowUp,
  ArrowDown,
  Box,
  MapPin,
  Users,
  ListChecks,
  Package,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardApi } from "@/lib/api/dashboard";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DashboardStatistics {
  performanceSummary: {
    todaySales: number;
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
  };
  orderStatistics: {
    totalReceivedOrders: number;
    totalReceivedRevenue: number;
    totalReturnedOrders: number;
    totalReturnedRevenue: number;
    ordersOnTheWay: number;
    ordersOnTheWayCost: number;
  };
  salesReport: {
    salesTrend: Array<{ date: string; sales: number }>;
    ordersTrend: Array<{ date: string; orders: number }>;
  };
  inventorySummary: {
    totalProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalInventoryValue: number;
  };
  productAnalytics: {
    topSellingProducts: Array<{
      name: string;
      soldQuantity: number;
      revenue: number;
      stock: number;
    }>;
    lowQuantityStock: Array<{
      name: string;
      currentStock: number;
      threshold: number;
    }>;
  };
  customerAnalytics: {
    newCustomers: number;
    newCustomersGrowth: number;
  };
  categoryAnalytics: Array<{
    categoryName: string;
    totalSales: number;
    percentage: number;
  }>;
  growthMetrics: {
    todaySalesGrowth: number;
    totalSalesGrowth: number;
    totalOrdersGrowth: number;
    totalCustomersGrowth: number;
  };
}

export function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30 Days");

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getStatistics();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format sales trend data for chart
  const getSalesChartData = () => {
    if (!stats?.salesReport?.salesTrend) return [];

    return stats.salesReport.salesTrend.map((item) => {
      const date = new Date(item.date);
      return {
        month: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: item.sales,
      };
    });
  };

  const salesData = getSalesChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div>
        <h1 className="text-base md:text-lg flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 font-bold text-gray-900">
          Hey Admin -
          <span className="text-gray-500 text-xs md:text-sm font-medium">
            Here&apos;s a quick look at your store performance today.
          </span>
        </h1>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sale Card */}
        <div className="bg-[#d9f4ff] rounded-lg shadow-sm">
          <div className="space-y-1">
            <div className="inline-block px-2 pt-2 pb-1 rounded-tr-2xl mr-6 mt-3 bg-[#00b7fb]">
              <h3 className="text-sm font-medium text-white">TODAY&apos;S SALE</h3>
            </div>
            <div className="text-xl md:text-2xl font-semibold text-gray-900 mt-3 px-3">
              ₹{stats.performanceSummary.todaySales.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-end text-sm px-3 pb-2">
              <span className="flex items-center">
                <span
                  className={`font-semibold ${
                    stats.growthMetrics.todaySalesGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.abs(stats.growthMetrics.todaySalesGrowth).toFixed(1)}%
                </span>
                {stats.growthMetrics.todaySalesGrowth >= 0 ? (
                  <ArrowUp className="w-4 h-4 ml-1 text-green-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 ml-1 text-red-600" />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Total Sale Card */}
        <div className="bg-[#dbeed9] rounded-lg shadow-sm">
          <div className="space-y-1">
            <div className="inline-block px-2 pt-2 pb-1 rounded-tr-2xl mr-6 mt-3 bg-[#0b8f00]">
              <h3 className="text-sm font-medium text-white">TOTAL SALE</h3>
            </div>
            <div className="text-xl md:text-2xl font-semibold text-gray-900 mt-3 px-3">
              ₹{stats.performanceSummary.totalSales.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-end text-sm px-3 pb-2">
              <span className="flex items-center">
                <span
                  className={`font-semibold ${
                    stats.growthMetrics.totalSalesGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.abs(stats.growthMetrics.totalSalesGrowth).toFixed(1)}%
                </span>
                {stats.growthMetrics.totalSalesGrowth >= 0 ? (
                  <ArrowUp className="w-4 h-4 ml-1 text-green-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 ml-1 text-red-600" />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-[#fff4e6] rounded-lg shadow-sm">
          <div className="space-y-1">
            <div className="inline-block px-2 pt-2 pb-1 rounded-tr-2xl mr-6 mt-3 bg-[#ff9800]">
              <h3 className="text-sm font-medium text-white">TOTAL ORDERS</h3>
            </div>
            <div className="text-xl md:text-2xl font-semibold text-gray-900 mt-3 px-3">
              {stats.performanceSummary.totalOrders.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-end text-sm px-3 pb-2">
              <span className="flex items-center">
                <span
                  className={`font-semibold ${
                    stats.growthMetrics.totalOrdersGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.abs(stats.growthMetrics.totalOrdersGrowth).toFixed(1)}%
                </span>
                {stats.growthMetrics.totalOrdersGrowth >= 0 ? (
                  <ArrowUp className="w-4 h-4 ml-1 text-green-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 ml-1 text-red-600" />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Total Customers Card */}
        <div className="bg-[#e6f3ff] rounded-lg shadow-sm">
          <div className="space-y-1">
            <div className="inline-block px-2 pt-2 pb-1 rounded-tr-2xl mr-6 mt-3 bg-[#2196f3]">
              <h3 className="text-sm font-medium text-white">TOTAL CUSTOMERS</h3>
            </div>
            <div className="text-xl md:text-2xl font-semibold text-gray-900 mt-3 px-3">
              {stats.performanceSummary.totalCustomers.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center justify-end text-sm px-3 pb-2">
              <span className="flex items-center">
                <span
                  className={`font-semibold ${
                    stats.growthMetrics.totalCustomersGrowth >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.abs(stats.growthMetrics.totalCustomersGrowth).toFixed(1)}%
                </span>
                {stats.growthMetrics.totalCustomersGrowth >= 0 ? (
                  <ArrowUp className="w-4 h-4 ml-1 text-green-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 ml-1 text-red-600" />
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Report - Left Column (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Sales Report (Last 30 Days)
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#13aaff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#13aaff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                          <p className="text-sm font-semibold text-gray-900">
                            {data.month} 2025
                          </p>
                          <p className="text-sm text-[#13aaff]">
                            ₹{data.value.toLocaleString("en-IN")}
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
                  fill="url(#colorArea)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#13aaff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column - Top */}
        <div className="space-y-6">
          {/* Inventory Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Inventory Summary
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Box className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Total Products</div>
                    <div className="text-xl font-bold text-gray-900">
                      {stats.inventorySummary.totalProducts}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-red-600" />
                  <div>
                    <div className="text-sm text-gray-500">Out of Stock</div>
                    <div className="text-xl font-bold text-gray-900">
                      {stats.inventorySummary.outOfStockProducts}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Box className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-500">Low Stock</div>
                    <div className="text-xl font-bold text-gray-900">
                      {stats.inventorySummary.lowStockProducts}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-500">
                      Total Inventory Value
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      ₹
                      {stats.inventorySummary.totalInventoryValue.toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Stock */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                Top Selling Stock
              </h2>
              <button
                onClick={() => router.push("/inventory/top-selling-stock")}
                className="text-primary cursor-pointer text-xs md:text-sm font-medium hover:underline"
              >
                See All
              </button>
            </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    Sold Quantity
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    Remaining Quantity
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.productAnalytics.topSellingProducts
                  .slice(0, 5)
                  .map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {item.soldQuantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {item.stock}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        ₹{item.revenue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                {stats.productAnalytics.topSellingProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-500 text-sm"
                    >
                      No top selling products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Quantity Stock */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            Low Quantity Stock
          </h2>
          <div className="space-y-4">
            {stats.productAnalytics.lowQuantityStock
              .slice(0, 5)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Current Stock: {item.currentStock} / Threshold:{" "}
                      {item.threshold}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      {item.currentStock}
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      Low
                    </span>
                  </div>
                </div>
              ))}
            {stats.productAnalytics.lowQuantityStock.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No low quantity products found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
