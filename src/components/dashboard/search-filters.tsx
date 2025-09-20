'use client';

import React from 'react';
import { Search, Mic, SlidersHorizontal } from 'lucide-react';

export function SearchFilters() {
  return (
    <div className="flex items-center space-x-3 w-lg">
      <div className="w-lg">
        <div className="relative w-lg">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Search className="w-4 h-4" />
          </div>
          
          <input
            type="text"
            placeholder="Search by: Product Name, Category, Brand"
            className="w-full pl-10 pr-20 py-3 bg-gray-100 border-0 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:bg-white transition-colors"
          />
          
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 w-px h-6 bg-gray-300"></div>
          
          <div className="absolute right-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-500">
            <Mic className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>
      
      <button 
        className="bg-[#d9f4ff] hover:text-[#00b8fbc9] hover:bg-[#00b8fb28]/20 text-[#00b7fb] p-3 rounded-lg cursor-pointer transition-colors focus:outline-none relative"
        aria-label="Filter options"
      >
        <SlidersHorizontal className="w-5 h-5" />
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-4 bg-blue-300 opacity-50"></div>
      </button>
    </div>
  );
}
