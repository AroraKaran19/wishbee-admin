'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ShoppingCart } from 'lucide-react';
import { categories } from '@/lib/data/mockData';

export function Header() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    console.log('Clicking dropdown, current state:', isDropdownOpen);
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                >
                  <span className="text-sm font-medium">{selectedCategory}</span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                </div>
              </div>
            
              <div className="w-px h-6 bg-gray-300"></div>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for items..."
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>
              
              <button 
                className="bg-[#00b7fb] hover:bg-[#0099d4] text-white p-3 cursor-pointer transition-colors focus:outline-none"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-[#00b7fb] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                1
              </span>
            </div>
            <span className="text-sm text-gray-700 font-medium">My cart</span>
          </div>
        </div>
      </header>

      {isDropdownOpen && (
        <div className="fixed top-16 left-68 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
          {categories.map((category) => (
            <div
              key={category}
              className={`px-4 py-2 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                category === selectedCategory
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 cursor-pointer hover:bg-gray-100'
              }`}
              onClick={() => {
                if (category !== selectedCategory) {
                  setSelectedCategory(category);
                  setIsDropdownOpen(false);
                }
              }}
            >
              {category}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
