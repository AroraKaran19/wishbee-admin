'use client';

import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const allProfitRevenueData = {
  'Daily': [
    { day: 'Mon', value: 5000 },
    { day: 'Tue', value: 6000 },
    { day: 'Wed', value: 5500 },
    { day: 'Thu', value: 7000 },
    { day: 'Fri', value: 6500 },
    { day: 'Sat', value: 8000 },
    { day: 'Sun', value: 7500 },
  ],
  'Weekly': [
    { week: 'Week 1', value: 45000 },
    { week: 'Week 2', value: 50000 },
    { week: 'Week 3', value: 55000 },
    { week: 'Week 4', value: 60000 },
  ],
  'Monthly': [
    { month: 'JAN', value: 20000 },
    { month: 'FEB', value: 25000 },
    { month: 'MAR', value: 30000 },
    { month: 'APR', value: 35000 },
    { month: 'MAY', value: 40000 },
    { month: 'JUN', value: 50000 },
    { month: 'JUL', value: 63750 },
    { month: 'AUG', value: 55000 },
    { month: 'SEP', value: 60000 },
    { month: 'OCT', value: 65000 },
    { month: 'NOV', value: 70000 },
    { month: 'DEC', value: 80000 },
  ],
  'Quaterly': [
    { quarter: 'Q1', value: 75000 },
    { quarter: 'Q2', value: 125000 },
    { quarter: 'Q3', value: 168750 },
    { quarter: 'Q4', value: 215000 },
  ],
  'Anually': [
    { year: '2020', value: 500000 },
    { year: '2021', value: 600000 },
    { year: '2022', value: 700000 },
    { year: '2023', value: 800000 },
    { year: '2024', value: 900000 },
    { year: '2025', value: 1000000 },
  ],
  '10 Years': [
    { year: '2015', value: 300000 },
    { year: '2016', value: 350000 },
    { year: '2017', value: 400000 },
    { year: '2018', value: 450000 },
    { year: '2019', value: 500000 },
    { year: '2020', value: 550000 },
    { year: '2021', value: 600000 },
    { year: '2022', value: 700000 },
    { year: '2023', value: 800000 },
    { year: '2024', value: 900000 },
  ],
};

const pieData = [
  { name: 'Best Selling Products', value: 45, color: '#13aaff' },
  { name: 'Least Selling Products', value: 20, color: '#60a5fa' },
  { name: 'Expiring Products', value: 15, color: '#93c5fd' },
  { name: 'Short Expiry Products', value: 10, color: '#cbd5e1' },
  { name: 'Other Inventory', value: 10, color: '#e2e8f0' },
];

const COLORS = ['#13aaff', '#60a5fa', '#93c5fd', '#cbd5e1', '#e2e8f0'];

export function AnalyticsPage() {
  const [profitPeriod, setProfitPeriod] = useState('Monthly');
  const [statisticsPeriod, setStatisticsPeriod] = useState('This Month');

  const profitPeriods = ['Daily', 'Weekly', 'Monthly', 'Quaterly', 'Anually', '10 Years'];
  const statisticsPeriods = ['Today', 'This Month', 'This Year'];

  const getProfitRevenueData = () => {
    return allProfitRevenueData[profitPeriod as keyof typeof allProfitRevenueData] || allProfitRevenueData.Monthly;
  };

  const getDataKey = () => {
    if (profitPeriod === 'Daily') return 'day';
    if (profitPeriod === 'Weekly') return 'week';
    if (profitPeriod === 'Quaterly') return 'quarter';
    if (profitPeriod === 'Anually' || profitPeriod === '10 Years') return 'year';
    return 'month';
  };

  const profitRevenueData = getProfitRevenueData();
  const dataKey = getDataKey();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1 text-sm">View, filter, and manage all customer orders from one place.</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="text-sm text-blue-600 font-medium mb-2">Total Orders</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">1230</div>
          <div className="text-xs text-gray-500 mb-2">Last 30 Days</div>
          <div className="flex items-center text-blue-600 text-sm">
            <ArrowUp className="w-4 h-4 mr-1" />
            +16% ↑
          </div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="text-sm text-green-600 font-medium mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">₹25,000</div>
          <div className="text-xs text-gray-500">Last 30 days</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="text-sm text-blue-600 font-medium mb-2">New Customers</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">1230</div>
          <div className="text-xs text-gray-500 mb-2">Last 30 Days</div>
          <div className="flex items-center text-blue-600 text-sm">
            <ArrowUp className="w-4 h-4 mr-1" />
            +16% ↑
          </div>
        </div>
      </div>

      {/* Profit & Revenue Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Profit & Revenue</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">₹463,750</span>
              <span className="text-sm text-green-600 font-medium">+36% ↑ VS LAST YEAR</span>
            </div>
          </div>
          <div className="flex gap-2">
            {profitPeriods.map((period) => (
              <button
                key={period}
                onClick={() => setProfitPeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  profitPeriod === period
                    ? 'bg-[#13aaff] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={profitRevenueData}>
              <defs>
                <linearGradient id="colorProfitArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#13aaff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#13aaff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={dataKey} stroke="#6b7280" />
              <YAxis
                stroke="#6b7280"
                tickFormatter={(value) => {
                  if (value >= 1000) return `${value / 1000}k`;
                  return value.toString();
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-gray-900 text-white rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-semibold mb-1">1,348 sales</p>
                        <p className="text-sm">₹{data.value.toLocaleString('en-IN')}</p>
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
                fill="url(#colorProfitArea)"
                dot={false}
                activeDot={{ r: 6, fill: '#13aaff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Statistics</h2>
        <p className="text-sm text-gray-500 mb-6">Sales Breakdown by Category</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div>
            <div className="flex gap-2 mb-6">
              {statisticsPeriods.map((period) => (
                <button
                  key={period}
                  onClick={() => setStatisticsPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statisticsPeriod === period
                      ? 'bg-[#13aaff] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                  <div
                    className="px-3 py-1 rounded text-sm font-medium text-white"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {item.value}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
