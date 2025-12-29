'use client';

import React from 'react';
import { Button } from './button';
import { PaginationProps } from '@/lib/types/table';

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageInfo = true,
  className = '',
  previousLabel = 'Previous',
  nextLabel = 'Next',
}: PaginationProps) {
  const handleFirst = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLast = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  // Calculate page number window (max 5 pages visible)
  const maxVisiblePages = 5;
  const pages: number[] = [];

  if (totalPages > 0) {
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(i);
    }
  }

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-3 border-t border-gray-200 bg-white ${className}`}
    >
      <div className="flex items-center gap-2">
        <Button
          onClick={handleFirst}
          disabled={currentPage === 1}
          variant="secondary"
          size="sm"
          className="px-3 py-2 text-xs md:text-sm"
        >
          First
        </Button>
        <Button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          variant="primary"
          size="sm"
          className="text-white rounded-sm py-2 px-4"
        >
          {previousLabel}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2">
        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant={page === currentPage ? 'primary' : 'secondary'}
            size="sm"
            className={`px-3 py-1 text-xs md:text-sm ${
              page === currentPage
                ? 'text-white'
                : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {page}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2">
        {showPageInfo && (
          <span className="hidden md:inline text-xs md:text-sm text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
        )}
        <Button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          variant="primary"
          size="sm"
          className="text-white py-2 px-7 rounded-sm"
        >
          {nextLabel}
        </Button>
        <Button
          onClick={handleLast}
          disabled={currentPage === totalPages}
          variant="secondary"
          size="sm"
          className="px-3 py-2 text-xs md:text-sm"
        >
          Last
        </Button>
      </div>
    </div>
  );
}
