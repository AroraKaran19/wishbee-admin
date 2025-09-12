import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="w-full mt-6">
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
  );
}
