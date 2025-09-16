'use client';

import React, { useState } from 'react';
import { Search, Mic, SlidersHorizontal, Download, Plus } from 'lucide-react';
import { Button } from './button';

export interface SearchBarAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'muted';
  onClick: () => void;
  href?: string;
  className?: string;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onVoiceSearch?: () => void;
  actions?: SearchBarAction[];
  showVoiceSearch?: boolean;
  showFilter?: boolean;
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function SearchBar({
  placeholder = "Search by: Product Name, Category, Brand",
  onSearch,
  onFilter,
  onVoiceSearch,
  actions = [],
  showVoiceSearch = true,
  showFilter = true,
  className = "",
  searchValue = "",
  onSearchChange
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(searchValue);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleVoiceClick = () => {
    onVoiceSearch?.();
  };

  const handleFilterClick = () => {
    onFilter?.();
  };

  const defaultActions: SearchBarAction[] = [
    {
      key: 'add',
      label: 'Add Products',
      icon: <Plus className="w-4 h-4" />,
      variant: 'primary',
      onClick: () => console.log('Add products clicked')
    },
    {
      key: 'export',
      label: 'Export CSV',
      icon: <Download className="w-4 h-4" />,
      variant: 'danger',
      onClick: () => console.log('Export CSV clicked')
    }
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Search Section */}
      <div className="flex items-center space-x-3">
        <form onSubmit={handleSearchSubmit} className="w-lg">
          <div className="relative w-lg">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <Search className="w-4 h-4" />
            </div>
            
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-20 py-3 bg-gray-100 border-0 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:bg-white transition-colors"
            />
            
            {showVoiceSearch && (
              <>
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2 w-px h-6 bg-gray-300"></div>
                <button
                  type="button"
                  onClick={handleVoiceClick}
                  className="absolute right-3 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Voice search"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </form>
        
        {showFilter && (
          <button 
            onClick={handleFilterClick}
            className="bg-[#d9f4ff] hover:text-[#00b8fbc9] hover:bg-[#00b8fb28] hover:bg-opacity-20 text-[#00b7fb] p-3 rounded-lg cursor-pointer transition-colors focus:outline-none relative"
            aria-label="Filter options"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-4 bg-blue-300 opacity-50"></div>
          </button>
        )}
      </div>

      {/* Action Buttons Section */}
      <div className="flex items-center space-x-3">
        {allActions.map((action) => {
          const buttonContent = (
            <Button
              key={action.key}
              variant={action.variant || 'primary'}
              icon={action.icon}
              onClick={action.onClick}
              className={action.className}
            >
              {action.label}
            </Button>
          );

          if (action.href) {
            return (
              <a key={action.key} href={action.href}>
                {buttonContent}
              </a>
            );
          }

          return buttonContent;
        })}
      </div>
    </div>
  );
}
