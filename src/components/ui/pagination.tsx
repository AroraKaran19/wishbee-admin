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
  nextLabel = 'Next'
}: PaginationProps) {
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

  return (
    <div className={`flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-white ${className}`}>
      <Button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        variant="primary"
        size="sm"
        className="text-white rounded-sm py-2 px-4"
      >
        {previousLabel}
      </Button>
      
      {showPageInfo && (
        <div className="text-xs md:text-sm text-gray-700 font-medium">
          Page {currentPage} of {totalPages}
        </div>
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
    </div>
  );
}
