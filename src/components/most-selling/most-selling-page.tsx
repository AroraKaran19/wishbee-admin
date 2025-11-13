"use client";

import React, { useState, useEffect } from "react";
import { Upload, Loader2 } from "lucide-react";
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
import { mostSellingApi, PeriodType } from "@/lib/api/most-selling";
import toast from "react-hot-toast";

// Map UI period labels to API period types
const periodMap: Record<string, PeriodType> = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly",
  Quarterly: "quarterly",
  Annually: "annually",
  "10 Years": "10years",
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
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
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

  const periods = [
    "Daily",
    "Weekly",
    "Monthly",
    "Quarterly",
    "Annually",
    "10 Years",
  ];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const periodType = periodMap[selectedPeriod] || "monthly";
        const data = await mostSellingApi.getPage(periodType);

        setSalePerformance(data.salePerformance);

        // Transform top selling products
        const transformedTopSelling = data.topSellingProducts.map(
          (product, index) => ({
            id: product.productId,
            productName: product.productName,
            soldQuantity: product.soldQuantity,
            revenue: product.revenue,
            remainingQuantity: product.remainingQuantity,
          })
        );
        setTopSellingProducts(transformedTopSelling);

        // Transform least selling products
        const transformedLeastSelling = data.leastSellingProducts.map(
          (product) => ({
            id: product.productId,
            productName: product.productName,
            soldQuantity: product.soldQuantity,
            daysSinceLastOrder: product.daysSinceLastOrder,
            currentStock: product.currentStock,
          })
        );
        setLeastSellingProducts(transformedLeastSelling);

        // Transform short expiry products
        const transformedShortExpiry = data.shortToExpiryProducts.map(
          (product) => ({
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
          })
        );
        setShortExpiryProducts(transformedShortExpiry);
      } catch (err) {
        console.error("Error fetching most selling data:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load most selling data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  // Transform chart data for display
  const getChartData = () => {
    if (!salePerformance?.chartData) return [];

    return salePerformance.chartData.map((point: any) => {
      const date = new Date(point.date);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', point.date);
        return {
          date: point.date || 'Unknown',
          value: point.sales || 0,
        };
      }
      
      let dateLabel = "";

      if (selectedPeriod === "Daily") {
        dateLabel = date.toLocaleDateString("en-US", { 
          weekday: "short",
          month: "short",
          day: "numeric"
        });
      } else if (selectedPeriod === "Weekly") {
        // Get week number of the month
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const weekNum = Math.ceil((date.getDate() + firstDay.getDay()) / 7);
        dateLabel = `${date.toLocaleDateString("en-US", { month: "short" })} W${weekNum}`;
      } else if (selectedPeriod === "Monthly") {
        dateLabel = date
          .toLocaleDateString("en-US", { month: "short", year: "numeric" })
          .toUpperCase();
      } else if (selectedPeriod === "Quarterly") {
        const month = date.getMonth(); // 0-11
        const quarter = Math.floor(month / 3) + 1; // 1-4
        const year = date.getFullYear();
        dateLabel = `Q${quarter} ${year}`;
      } else if (
        selectedPeriod === "Annually" ||
        selectedPeriod === "10 Years"
      ) {
        dateLabel = date.getFullYear().toString();
      }

      return {
        date: dateLabel || point.date,
        value: point.sales || 0,
      };
    });
  };

  const getDataKey = () => {
    return "date";
  };

  const salesData = getChartData();
  const dataKey = getDataKey();

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
          <span>{value === null ? "Never sold" : `${value} days`}</span>
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
            <div className="flex gap-2 bg-[#ebf7ff] p-2 rounded-lg">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedPeriod === period
                      ? "bg-[#13aaff] text-white"
                      : "text-gray-700 hover:bg-[#dbf7ff]"
                  }`}
                >
                  {period}
                </button>
              ))}
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
                  <XAxis dataKey={dataKey} stroke="#6b7280" />
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
                              {data.date}
                            </p>
                            <p className="text-sm">
                              ₹{data.value?.toLocaleString("en-IN") || "0"}
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
        <div className="py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Top Selling Product
          </h2>
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
        <div className="py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Least Selling Product
          </h2>
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
