'use client';

import React, { useState } from 'react';
import { Download, ArrowUp, ArrowDown, Box, MapPin, Users, ListChecks, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const allSalesData = [
  { month: 'Feb', value: 200000 },
  { month: 'Mar', value: 250000 },
  { month: 'Apr', value: 300000 },
  { month: 'May', value: 350000 },
  { month: 'Jun', value: 455591 },
  { month: 'Jul', value: 400000 },
  { month: 'Aug', value: 450000 },
  { month: 'Sep', value: 500000 },
  { month: 'Oct', value: 480000 },
  { month: 'Nov', value: 520000 },
  { month: 'Dec', value: 550000 },
  { month: 'Jan', value: 600000 },
];

const topSellingData = [
  { name: 'Dettol Hand...', sold: 30, remaining: 12, price: '₹100' },
  { name: 'Dettol Hand...', sold: 30, remaining: 12, price: '₹100' },
  { name: 'Dettol Hand...', sold: 30, remaining: 12, price: '₹100' },
];

const lowQuantityData = [
  { name: 'Moong Daal', quantity: 10, unit: 'Packet' },
  { name: 'Moong Daal', quantity: 14, unit: 'Packet' },
  { name: 'Moong Daal', quantity: 12, unit: 'Packet' },
];

export function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('12 Months');

  const periods = ['12 Months', '6 Months', '3 Months', '7 Days'];

  const getFilteredData = () => {
    switch (selectedPeriod) {
      case '12 Months':
        return allSalesData;
      case '6 Months':
        return allSalesData.slice(-6);
      case '3 Months':
        return allSalesData.slice(-3);
      case '7 Days':
        return allSalesData.slice(-1);
      default:
        return allSalesData;
    }
  };

  const salesData = getFilteredData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg flex items-center gap-2 font-bold text-gray-900">
          Hey Raj - 
          <span className="text-gray-500 text-sm font-medium">
          Here&apos;s a quick look at your store performance today.
          </span>
        </h1>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">TODAY&apos;S SALE</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">₹12,426</div>
          <div className="flex items-center text-green-600 text-sm">
            <ArrowUp className="w-4 h-4 mr-1" />
            +36%↑
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">TOTAL SALE</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">₹122,426</div>
          <div className="flex items-center text-red-600 text-sm">
            <ArrowDown className="w-4 h-4 mr-1" />
            +14%↓
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">TOTAL ORDERS</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">92,426</div>
          <div className="flex items-center text-green-600 text-sm">
            <ArrowUp className="w-4 h-4 mr-1" />
            +36%↑
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-2">TOTAL CUSTOMERS</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">22,426</div>
          <div className="flex items-center text-green-600 text-sm">
            <ArrowUp className="w-4 h-4 mr-1" />
            +36%↑
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Report - Left Column (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Sales Report</h2>
            <Button variant="danger" size="sm" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
          <div className="flex gap-2 mb-6">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
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
                           <p className="text-sm font-semibold text-gray-900">{data.month} 2025</p>
                           <p className="text-sm text-[#13aaff]">₹{data.value.toLocaleString('en-IN')}</p>
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
                   activeDot={{ r: 6, fill: '#13aaff' }}
                 />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Right Column - Top */}
        <div className="space-y-6">
          {/* Inventory Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Box className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-500">Quantity in Hand</div>
                    <div className="text-xl font-bold text-gray-900">868</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">To be received</div>
                    <div className="text-xl font-bold text-gray-900">200</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-sm text-gray-500">Number of Suppliers</div>
                    <div className="text-xl font-bold text-gray-900">31</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ListChecks className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Number of Categories</div>
                    <div className="text-xl font-bold text-gray-900">10</div>
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Selling Stock</h2>
            <button className="text-primary cursor-pointer text-sm font-medium">See All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Sold Quantity</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Remaining Quantity</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topSellingData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.sold}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.remaining}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Quantity Stock */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Quantity Stock</h2>
          <div className="space-y-4">
            {lowQuantityData.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{item.name}</div>
                  <div className="text-sm text-gray-500">Remaining Quantity</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {item.quantity} {item.unit}
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Low</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
