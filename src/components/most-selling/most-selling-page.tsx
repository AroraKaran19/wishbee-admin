'use client';

import React, { useState } from 'react';
import { Download, TrendingUp, Eye, Percent, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { TableConfig } from '@/lib/types/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const allSalesData = {
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
  'Quarterly': [
    { quarter: 'Q1', value: 75000 },
    { quarter: 'Q2', value: 125000 },
    { quarter: 'Q3', value: 168750 },
    { quarter: 'Q4', value: 215000 },
  ],
  'Annually': [
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

interface TopSellingProduct {
  id: string;
  productName: string;
  soldQuantity: number;
  revenue: number;
  remainingQuantity: number;
  suggestedAction: string;
}

interface LeastSellingProduct {
  id: string;
  productName: string;
  soldQuantity: number;
  daysSinceLastOrder: number;
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
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const itemsPerPage = 10;
  const [topSellingPage, setTopSellingPage] = useState(1);
  const [leastSellingPage, setLeastSellingPage] = useState(1);
  const [shortExpiryPage, setShortExpiryPage] = useState(1);

  const periods = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', '10 Years'];

  const getSalesData = () => {
    return allSalesData[selectedPeriod as keyof typeof allSalesData] || allSalesData.Monthly;
  };

  const getDataKey = () => {
    if (selectedPeriod === 'Daily') return 'day';
    if (selectedPeriod === 'Weekly') return 'week';
    if (selectedPeriod === 'Quarterly') return 'quarter';
    if (selectedPeriod === 'Annually' || selectedPeriod === '10 Years') return 'year';
    return 'month';
  };

  const salesData = getSalesData();
  const dataKey = getDataKey();

  const allTopSellingProducts: TopSellingProduct[] = [
    {
      id: '1',
      productName: 'Dettol Handwash',
      soldQuantity: 1348,
      revenue: 63750,
      remainingQuantity: 120,
      suggestedAction: 'Boost Promo',
    },
    {
      id: '2',
      productName: 'Tata Salt 1kg',
      soldQuantity: 920,
      revenue: 36800,
      remainingQuantity: 85,
      suggestedAction: 'View Trends',
    },
    {
      id: '3',
      productName: 'Aashirvaad Atta 5kg',
      soldQuantity: 870,
      revenue: 25750,
      remainingQuantity: 40,
      suggestedAction: 'Boost Promo',
    },
    {
      id: '4',
      productName: 'Maggi Noodles',
      soldQuantity: 750,
      revenue: 22500,
      remainingQuantity: 60,
      suggestedAction: 'Boost Promo',
    },
    {
      id: '5',
      productName: 'Parle-G Biscuits',
      soldQuantity: 680,
      revenue: 17000,
      remainingQuantity: 95,
      suggestedAction: 'View Trends',
    },
    {
      id: '6',
      productName: 'Amul Milk',
      soldQuantity: 620,
      revenue: 18600,
      remainingQuantity: 50,
      suggestedAction: 'Boost Promo',
    },
    {
      id: '7',
      productName: 'Haldiram Namkeen',
      soldQuantity: 580,
      revenue: 23200,
      remainingQuantity: 70,
      suggestedAction: 'View Trends',
    },
    {
      id: '8',
      productName: 'Britannia Bread',
      soldQuantity: 540,
      revenue: 10800,
      remainingQuantity: 45,
      suggestedAction: 'Boost Promo',
    },
    {
      id: '9',
      productName: 'Colgate Toothpaste',
      soldQuantity: 520,
      revenue: 15600,
      remainingQuantity: 80,
      suggestedAction: 'Boost Promo',
    },
    {
      id: '10',
      productName: 'Surf Excel',
      soldQuantity: 480,
      revenue: 19200,
      remainingQuantity: 35,
      suggestedAction: 'View Trends',
    },
    {
      id: '11',
      productName: 'Dabur Honey',
      soldQuantity: 450,
      revenue: 18000,
      remainingQuantity: 55,
      suggestedAction: 'Boost Promo',
    },
    {
      id: '12',
      productName: 'Red Label Tea',
      soldQuantity: 420,
      revenue: 16800,
      remainingQuantity: 65,
      suggestedAction: 'View Trends',
    },
  ];

  const allLeastSellingProducts: LeastSellingProduct[] = [
    {
      id: '1',
      productName: 'Tomato Ketchup',
      soldQuantity: 5,
      daysSinceLastOrder: 85,
      currentStock: 100,
    },
    {
      id: '2',
      productName: 'Face Tissue',
      soldQuantity: 8,
      daysSinceLastOrder: 70,
      currentStock: 80,
    },
    {
      id: '3',
      productName: 'Green Tea',
      soldQuantity: 10,
      daysSinceLastOrder: 60,
      currentStock: 90,
    },
    {
      id: '4',
      productName: 'Olive Oil',
      soldQuantity: 12,
      daysSinceLastOrder: 55,
      currentStock: 75,
    },
    {
      id: '5',
      productName: 'Coconut Oil',
      soldQuantity: 15,
      daysSinceLastOrder: 50,
      currentStock: 85,
    },
    {
      id: '6',
      productName: 'Hair Shampoo',
      soldQuantity: 18,
      daysSinceLastOrder: 45,
      currentStock: 70,
    },
    {
      id: '7',
      productName: 'Body Lotion',
      soldQuantity: 20,
      daysSinceLastOrder: 40,
      currentStock: 65,
    },
    {
      id: '8',
      productName: 'Face Wash',
      soldQuantity: 22,
      daysSinceLastOrder: 35,
      currentStock: 55,
    },
    {
      id: '9',
      productName: 'Soap Bar',
      soldQuantity: 25,
      daysSinceLastOrder: 30,
      currentStock: 60,
    },
    {
      id: '10',
      productName: 'Hand Sanitizer',
      soldQuantity: 28,
      daysSinceLastOrder: 25,
      currentStock: 50,
    },
    {
      id: '11',
      productName: 'Detergent Powder',
      soldQuantity: 30,
      daysSinceLastOrder: 20,
      currentStock: 45,
    },
    {
      id: '12',
      productName: 'Dish Soap',
      soldQuantity: 32,
      daysSinceLastOrder: 15,
      currentStock: 40,
    },
  ];

  const allShortExpiryProducts: ShortExpiryProduct[] = [
    {
      id: '1',
      productName: 'Amul Butter',
      expiryDate: '10 Aug 2025',
      daysLeft: 14,
      currentStock: 100,
    },
    {
      id: '2',
      productName: 'Bread Pack',
      expiryDate: '10 Aug 2025',
      daysLeft: 14,
      currentStock: 80,
    },
    {
      id: '3',
      productName: 'Curd Cup',
      expiryDate: '10 Aug 2025',
      daysLeft: 14,
      currentStock: 90,
    },
    {
      id: '4',
      productName: 'Milk Pack',
      expiryDate: '12 Aug 2025',
      daysLeft: 16,
      currentStock: 75,
    },
    {
      id: '5',
      productName: 'Paneer',
      expiryDate: '11 Aug 2025',
      daysLeft: 15,
      currentStock: 65,
    },
    {
      id: '6',
      productName: 'Cheese Slice',
      expiryDate: '13 Aug 2025',
      daysLeft: 17,
      currentStock: 55,
    },
    {
      id: '7',
      productName: 'Yogurt',
      expiryDate: '9 Aug 2025',
      daysLeft: 13,
      currentStock: 70,
    },
    {
      id: '8',
      productName: 'Fresh Cream',
      expiryDate: '8 Aug 2025',
      daysLeft: 12,
      currentStock: 45,
    },
    {
      id: '9',
      productName: 'Buttermilk',
      expiryDate: '14 Aug 2025',
      daysLeft: 18,
      currentStock: 60,
    },
    {
      id: '10',
      productName: 'Ice Cream',
      expiryDate: '7 Aug 2025',
      daysLeft: 11,
      currentStock: 50,
    },
    {
      id: '11',
      productName: 'Frozen Vegetables',
      expiryDate: '15 Aug 2025',
      daysLeft: 19,
      currentStock: 40,
    },
    {
      id: '12',
      productName: 'Fresh Juice',
      expiryDate: '6 Aug 2025',
      daysLeft: 10,
      currentStock: 35,
    },
  ];

  const topSellingTotalPages = Math.ceil(allTopSellingProducts.length / itemsPerPage);
  const topSellingStartIndex = (topSellingPage - 1) * itemsPerPage;
  const topSellingProducts = allTopSellingProducts.slice(topSellingStartIndex, topSellingStartIndex + itemsPerPage);

  const leastSellingTotalPages = Math.ceil(allLeastSellingProducts.length / itemsPerPage);
  const leastSellingStartIndex = (leastSellingPage - 1) * itemsPerPage;
  const leastSellingProducts = allLeastSellingProducts.slice(leastSellingStartIndex, leastSellingStartIndex + itemsPerPage);

  const shortExpiryTotalPages = Math.ceil(allShortExpiryProducts.length / itemsPerPage);
  const shortExpiryStartIndex = (shortExpiryPage - 1) * itemsPerPage;
  const shortExpiryProducts = allShortExpiryProducts.slice(shortExpiryStartIndex, shortExpiryStartIndex + itemsPerPage);

  const topSellingTableConfig: TableConfig<TopSellingProduct> = {
    columns: [
      {
        key: 'productName',
        title: 'Product Name',
        align: 'left',
      },
      {
        key: 'soldQuantity',
        title: 'Sold Quantity',
        align: 'center',
        render: (value) => <span>{value} Units</span>,
      },
      {
        key: 'revenue',
        title: 'Revenue (₹)',
        align: 'center',
        render: (value) => <span>₹{value.toLocaleString('en-IN')}</span>,
      },
      {
        key: 'remainingQuantity',
        title: 'Remaining Quantity',
        align: 'center',
        render: (value) => <span>{value} Units</span>,
      },
      {
        key: 'suggestedAction',
        title: 'Suggested Action',
        align: 'center',
        render: (value, record) => (
          <div className="flex justify-center">
            <button className="px-3 py-1 bg-[#13aaff] text-white rounded-lg text-sm font-medium hover:bg-[#0f8fd4] flex items-center gap-2 cursor-pointer">
              {value === 'Boost Promo' ? (
                <>
                  <TrendingUp className="w-4 h-4" />
                  {value}
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  {value}
                </>
              )}
            </button>
          </div>
        ),
      },
    ],
    pagination: topSellingTotalPages > 1 ? {
      currentPage: topSellingPage,
      totalPages: topSellingTotalPages,
      onPageChange: setTopSellingPage,
      showPageInfo: true,
    } : undefined,
    rowKey: 'id',
    className: 'rounded-xl shadow-sm',
    rowClassName: () => 'hover:bg-gray-50',
  };

  const leastSellingTableConfig: TableConfig<LeastSellingProduct> = {
    columns: [
      {
        key: 'productName',
        title: 'Product Name',
        align: 'left',
      },
      {
        key: 'soldQuantity',
        title: 'Sold Quantity',
        align: 'center',
        render: (value) => <span>{value} Units</span>,
      },
      {
        key: 'daysSinceLastOrder',
        title: 'Days Since Last Order',
        align: 'center',
      },
      {
        key: 'currentStock',
        title: 'Current Stock',
        align: 'center',
        render: (value) => <span>{value} Units</span>,
      },
      {
        key: 'action',
        title: 'Action',
        align: 'center',
        render: () => (
          <div className="flex justify-center">
            <button className="px-3 py-1 bg-[#13aaff] text-white rounded-lg text-sm font-medium hover:bg-[#0f8fd4] flex items-center gap-2 cursor-pointer">
              <Percent className="w-4 h-4" />
              Add Discount
            </button>
          </div>
        ),
      },
    ],
    pagination: leastSellingTotalPages > 1 ? {
      currentPage: leastSellingPage,
      totalPages: leastSellingTotalPages,
      onPageChange: setLeastSellingPage,
      showPageInfo: true,
    } : undefined,
    rowKey: 'id',
    className: 'rounded-xl shadow-sm',
    rowClassName: () => 'hover:bg-gray-50',
  };

  const shortExpiryTableConfig: TableConfig<ShortExpiryProduct> = {
    columns: [
      {
        key: 'productName',
        title: 'Product Name',
        align: 'left',
      },
      {
        key: 'expiryDate',
        title: 'Expiry Date',
        align: 'center',
      },
      {
        key: 'daysLeft',
        title: 'Days Left',
        align: 'center',
      },
      {
        key: 'currentStock',
        title: 'Current Stock',
        align: 'center',
        render: (value) => <span>{value} Units</span>,
      },
      {
        key: 'action',
        title: 'Action',
        align: 'center',
        render: () => (
          <div className="flex justify-center">
            <button className="px-3 py-1 bg-[#13aaff] text-white rounded-lg text-sm font-medium hover:bg-[#0f8fd4] flex items-center gap-2 cursor-pointer">
              <Percent className="w-4 h-4" />
              Add Discount
            </button>
          </div>
        ),
      },
    ],
    pagination: shortExpiryTotalPages > 1 ? {
      currentPage: shortExpiryPage,
      totalPages: shortExpiryTotalPages,
      onPageChange: setShortExpiryPage,
      showPageInfo: true,
    } : undefined,
    rowKey: 'id',
    className: 'rounded-xl shadow-sm',
    rowClassName: () => 'hover:bg-gray-50',
  };

  const handleExportCSV = (section: string) => {
    console.log(`Export CSV for ${section}`);
  };

  return (
    <div className="space-y-6">
      {/* Sale Performance Over The Time */}
        <h2 className="text-lg font-semibold text-gray-900">Sale Performance Over The Time</h2>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Sales 2025</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">₹63,750</span>
              <span className="text-sm text-green-600 font-medium">+36% VS LAST YEAR</span>
            </div>
          </div>
          <div className="flex gap-2 bg-[#ebf7ff] p-2 rounded-lg">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedPeriod === period
                    ? 'bg-[#13aaff] text-white'
                    : 'text-gray-700 hover:bg-[#dbf7ff]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSalesArea" x1="0" y1="0" x2="0" y2="1">
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
                domain={[0, 100000]}
                ticks={[0, 20000, 40000, 60000, 80000, 100000]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-gray-900 text-white rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-semibold mb-1">Dettol HandWash</p>
                        <p className="text-sm mb-1">1,348 sales</p>
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
                fill="url(#colorSalesArea)"
                dot={false}
                activeDot={{ r: 6, fill: '#13aaff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Product */}
      <div className="">
        <div className="py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Top Selling Product</h2>
          <Button onClick={() => handleExportCSV('Top Selling')} variant="danger" size="sm" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
        <div>
          <DataTable data={topSellingProducts} config={topSellingTableConfig} />
        </div>
      </div>

      {/* Least Selling Product */}
      <div className="">
        <div className="py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Least Selling Product</h2>
          <Button onClick={() => handleExportCSV('Least Selling')} variant="danger" size="sm" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
        <div>
          <DataTable data={leastSellingProducts} config={leastSellingTableConfig} />
        </div>
      </div>

      {/* Short to Expiry Products */}
      <div className="">
        <div className="py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Short to Expiry Products</h2>
          <Button onClick={() => handleExportCSV('Short Expiry')} variant="danger" size="sm" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
        <div className="pb-12 sm:pb-0">
          <DataTable data={shortExpiryProducts} config={shortExpiryTableConfig} />
        </div>
      </div>
    </div>
  );
}
