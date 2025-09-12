'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface InventoryTableProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function InventoryTable({ products, currentPage, totalPages, onPageChange }: InventoryTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead className="bg-[#d9f4ff]">
            <tr>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-blue-200">
                Product Name
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-blue-200">
                Category
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-blue-200">
                Buying Price
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-blue-200">
                Stock Qty
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-blue-200">
                Last Sold Date
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-r border-blue-200">
                Expiry Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Availability
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 border-r border-gray-200">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 border-r border-gray-200">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 border-r border-gray-200">
                  {formatCurrency(product.buyingPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 border-r border-gray-200">
                  {product.stockQuantity} Pieces
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 border-r border-gray-200">
                  {product.lastSoldDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 border-r border-gray-200">
                  {product.expiryDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span 
                    className={`text-sm ${
                      product.availabilityStatus === 'in-stock' 
                        ? 'text-[#0b8f00]' 
                        : 'text-[#d65144]'
                    }`}
                  >
                    {product.availabilityStatus === 'in-stock' ? 'in-stock' : 'Out of stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="w-full py-4 border-t border-gray-200">
        <div className="flex items-center justify-between mx-8">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-[#00b7fb] hover:bg-[#0099d4] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors focus:outline-none"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-900 px-4 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-[#00b7fb] hover:bg-[#0099d4] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors focus:outline-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
