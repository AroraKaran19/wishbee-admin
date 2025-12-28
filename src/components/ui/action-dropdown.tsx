"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Edit, Trash2, Plus, Search, X } from "lucide-react";
import { Button } from "./button";

export interface DropdownOption {
  id: string;
  label: string;
  value: string;
  image?: string;
  disabled?: boolean;
}

export interface ActionDropdownProps {
  options: DropdownOption[];
  selectedValue?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  onSelect: (option: DropdownOption) => void;
  onEdit?: (option: DropdownOption) => void;
  onDelete?: (option: DropdownOption) => void;
  onAdd?: () => void;
  showActions?: boolean;
  showAddButton?: boolean;
  addButtonText?: string;
  className?: string;
  error?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  searchable?: boolean;
  onSearch?: (searchQuery: string) => void;
  searchPlaceholder?: string;
}

export function ActionDropdown({
  options,
  selectedValue,
  placeholder = "Select an option",
  disabled = false,
  loading = false,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
  showActions = true,
  showAddButton = true,
  addButtonText = "New",
  className = "",
  error,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  searchable = false,
  onSearch,
  searchPlaceholder = "Search...",
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    if (!searchable) return;

    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery, searchable]);

  // Call onSearch when debounced query changes
  useEffect(() => {
    if (searchable && onSearch && debouncedSearchQuery !== undefined) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchable, onSearch]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHoveredOption(null);
        if (searchable) {
          setSearchQuery("");
          setDebouncedSearchQuery("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchable]);

  // Handle scroll to load more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

    if (isNearBottom && hasMore && onLoadMore && !loadingMore) {
      onLoadMore();
    }
  };

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const handleOptionClick = (option: DropdownOption) => {
    if (!option.disabled) {
      onSelect(option);
      setIsOpen(false);
      setHoveredOption(null);
      if (searchable) {
        setSearchQuery("");
        setDebouncedSearchQuery("");
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery("");
    setDebouncedSearchQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  // Filter options based on search query (client-side filtering as fallback)
  const filteredOptions = searchable && debouncedSearchQuery
    ? options.filter((option) =>
        option.label.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    : options;

  const handleActionClick = (
    e: React.MouseEvent,
    action: "edit" | "delete",
    option: DropdownOption
  ) => {
    e.stopPropagation();
    if (action === "edit" && onEdit) {
      onEdit(option);
    } else if (action === "delete" && onDelete) {
      onDelete(option);
    }
    setIsOpen(false);
    setHoveredOption(null);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAdd) {
      onAdd();
    }
    setIsOpen(false);
    setHoveredOption(null);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Dropdown Button */}
      <div
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors cursor-pointer flex items-center justify-between ${
          error
            ? "border-red-300 focus:border-red-500"
            : "border-gray-200 focus:border-gray-400"
        } ${
          disabled || loading
            ? "bg-gray-100 cursor-not-allowed opacity-50"
            : "bg-white hover:border-gray-300"
        }`}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption?.image && (
            <img
              src={selectedOption.image}
              alt={selectedOption.label}
              className="w-5 h-5 rounded object-cover flex-shrink-0"
            />
          )}
          <span
            className={`text-sm truncate ${
              selectedOption ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {loading ? "Loading..." : selectedOption?.label || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {showAddButton && onAdd && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddClick}
              className="px-2 py-1 h-6 text-xs"
              icon={<Plus className="w-3 h-3" />}
            >
              {addButtonText}
            </Button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col"
          ref={scrollContainerRef}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
          <div
            className="overflow-y-auto flex-1"
            onScroll={handleScroll}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchable && debouncedSearchQuery
                  ? "No results found"
                  : "No options available"}
              </div>
            ) : (
              <>
                {filteredOptions.map((option, index) => (
                <div
                  key={option.id || `option-${index}`}
                  className={`px-3 py-2 text-sm transition-colors border-b border-gray-100 last:border-b-0 flex items-center justify-between group ${
                    option.disabled
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : option.value === selectedValue
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 cursor-pointer"
                  }`}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setHoveredOption(option.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {option.image && (
                      <img
                        src={option.image}
                        alt={option.label}
                        className="w-5 h-5 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>

                  {/* Action Buttons */}
                  {showActions &&
                    !option.disabled &&
                    hoveredOption === option.id && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {onEdit && (
                          <button
                            key={`edit-${option.id || index}`}
                            type="button"
                            onClick={(e) =>
                              handleActionClick(e, "edit", option)
                            }
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            key={`delete-${option.id || index}`}
                            type="button"
                            onClick={(e) =>
                              handleActionClick(e, "delete", option)
                            }
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                </div>
              ))}

              {/* Load More Indicator */}
              {hasMore && (
                <div className="px-3 py-2 text-sm text-center border-t border-gray-100">
                  {loadingMore ? (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      Loading more...
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      Scroll down to load more
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
