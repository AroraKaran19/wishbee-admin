'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi, AnalyticsPeriod } from '@/lib/api/analytics';
import toast from 'react-hot-toast';

const COLORS = ['#13aaff', '#60a5fa', '#93c5fd', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'];

// Map UI period labels to API period values
const periodMap: Record<string, AnalyticsPeriod> = {
  '7days': '7days',
  '30days': '30days',
  '6months': '6months',
  '12months': '12months',
  'all-time': 'all-time',
};

// Map API period to UI display label
const getPeriodLabel = (period: string): string => {
  const labels: Record<string, string> = {
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    '6months': 'Last 6 Months',
    '12months': 'Last 12 Months',
    'all-time': 'All Time',
  };
  return labels[period] || period;
};

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyticsApi.getPage(period);
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // Transform trend data for chart
  const getChartData = () => {
    if (!analyticsData?.profitAndRevenueChart?.trend) return [];
    
    return analyticsData.profitAndRevenueChart.trend.map((item: any) => {
      const date = new Date(item.date);
      // Format date based on period
      let dateLabel = '';
      if (period === '7days') {
        dateLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (period === '30days') {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === '6months' || period === '12months') {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      }
      
      return {
        date: dateLabel,
        revenue: item.revenue,
        profit: item.profit,
      };
    });
  };

  // Get data key for X-axis
  const getDataKey = () => 'date';

  // Format growth percentage
  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1 text-sm">View comprehensive analytics and insights.</p>
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
          <p className="text-gray-500 mt-1 text-sm">View comprehensive analytics and insights.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || 'Failed to load analytics data'}</p>
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
        <p className="text-gray-500 mt-1 text-sm">View comprehensive analytics and insights.</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(periodMap).map((periodKey) => (
          <button
            key={periodKey}
            onClick={() => setPeriod(periodMap[periodKey])}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === periodMap[periodKey]
                ? 'bg-[#13aaff] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getPeriodLabel(periodKey)}
          </button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="text-sm text-blue-600 font-medium mb-2">Total Orders</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {keyMetrics?.totalOrders?.count?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {keyMetrics?.totalOrders?.periodLabel || getPeriodLabel(period)}
          </div>
          {keyMetrics?.totalOrders?.growthPercentage !== undefined && (
            <div className={`flex items-center text-sm ${
              keyMetrics.totalOrders.growthPercentage >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
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
          <div className="text-sm text-green-600 font-medium mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ₹{keyMetrics?.totalRevenue?.amount?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {keyMetrics?.totalRevenue?.periodLabel || getPeriodLabel(period)}
          </div>
          {keyMetrics?.totalRevenue?.growthPercentage !== undefined && (
            <div className={`flex items-center text-sm ${
              keyMetrics.totalRevenue.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
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
          <div className="text-sm text-blue-600 font-medium mb-2">New Customers</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {keyMetrics?.newCustomers?.count?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {keyMetrics?.newCustomers?.periodLabel || getPeriodLabel(period)}
          </div>
          {keyMetrics?.newCustomers?.growthPercentage !== undefined && (
            <div className={`flex items-center text-sm ${
              keyMetrics.newCustomers.growthPercentage >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
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

      {/* Profit & Revenue Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Profit & Revenue</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-bold text-gray-900">
                ₹{profitAndRevenueChart?.totalRevenue?.toLocaleString('en-IN') || '0'}
              </span>
              {profitAndRevenueChart?.revenueGrowth !== undefined && (
                <span className={`text-sm font-medium ${
                  profitAndRevenueChart.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatGrowth(profitAndRevenueChart.revenueGrowth)} ↑ VS PREVIOUS PERIOD
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
                  <linearGradient id="colorProfitArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#13aaff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#13aaff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey={getDataKey()} stroke="#6b7280" />
                <YAxis
                  stroke="#6b7280"
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
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
                          <p className="text-sm font-semibold mb-1">{data.date}</p>
                          <p className="text-sm">Revenue: ₹{data.revenue?.toLocaleString('en-IN') || '0'}</p>
                          <p className="text-sm">Profit: ₹{data.profit?.toLocaleString('en-IN') || '0'}</p>
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
                  activeDot={{ r: 6, fill: '#10b981' }}
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#13aaff"
                  strokeWidth={2}
                  fill="url(#colorProfitArea)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#13aaff' }}
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
        <p className="text-sm text-gray-500 mb-6">Sales Breakdown by Category</p>
        {salesByCategory && salesByCategory.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByCategory.map((item: any, index: number) => ({
                      name: item.categoryName,
                      value: item.percentage,
                      color: COLORS[index % COLORS.length],
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${(props.percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesByCategory.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-white rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-semibold mb-1">{data.name}</p>
                            <p className="text-sm">Sales: ₹{salesByCategory.find((c: any) => c.categoryName === data.name)?.totalSales?.toLocaleString('en-IN') || '0'}</p>
                            <p className="text-sm">Percentage: {(data.value * 100).toFixed(2)}%</p>
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
                  <div key={item.categoryId || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-900">{item.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        ₹{item.totalSales?.toLocaleString('en-IN') || '0'}
                      </span>
                      <div
                        className="px-3 py-1 rounded text-sm font-medium text-white"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {item.percentage?.toFixed(1) || '0'}%
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
