'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type ExportRangeType = 'current' | 'all' | 'pages';

export interface CustomerExportRange {
  rangeType: ExportRangeType;
  fromPage?: number;
  toPage?: number;
}

interface CustomerExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (range: CustomerExportRange) => void;
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
}

export function CustomerExportModal({
  isOpen,
  onClose,
  onExport,
  currentPage,
  totalPages,
  isLoading = false,
}: CustomerExportModalProps) {
  const [rangeType, setRangeType] = useState<ExportRangeType>('current');
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRangeType('current');
      setFromPage(1);
      setToPage(Math.max(1, totalPages));
      setError(null);
    }
  }, [isOpen, totalPages]);

  useEffect(() => {
    if (rangeType === 'pages') {
      setFromPage((p) => Math.min(p, totalPages));
      setToPage((p) => Math.min(Math.max(p, 1), totalPages));
    }
  }, [rangeType, totalPages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rangeType === 'pages') {
      const from = Math.max(1, Math.min(fromPage, totalPages));
      const to = Math.max(1, Math.min(toPage, totalPages));
      if (from > to) {
        setError('From page must be less than or equal to To page.');
        return;
      }
      onExport({ rangeType: 'pages', fromPage: from, toPage: to });
    } else {
      onExport({ rangeType });
    }
    // Parent closes modal when export finishes (or on error)
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Export customer list
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Choose which customers to include in the CSV export.
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="rangeType"
                value="current"
                checked={rangeType === 'current'}
                onChange={() => setRangeType('current')}
                className="mt-1 h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <div>
                <span className="font-medium text-gray-900">Current page only</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Export only the customers on the current page ({currentPage} of {totalPages || 1}).
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="rangeType"
                value="all"
                checked={rangeType === 'all'}
                onChange={() => setRangeType('all')}
                className="mt-1 h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <div>
                <span className="font-medium text-gray-900">All customers</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Export all customers (uses current search and sort).
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="rangeType"
                value="pages"
                checked={rangeType === 'pages'}
                onChange={() => setRangeType('pages')}
                className="mt-1 h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">Custom page range</span>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">
                  Export customers from specific pages (1 to {totalPages || 1}).
                </p>
                {rangeType === 'pages' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-600">From</span>
                      <Input
                        type="number"
                        min={1}
                        max={totalPages || 1}
                        value={fromPage}
                        onChange={(e) =>
                          setFromPage(Math.max(1, parseInt(e.target.value, 10) || 1))
                        }
                        className="w-20 h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-600">To</span>
                      <Input
                        type="number"
                        min={1}
                        max={totalPages || 1}
                        value={toPage}
                        onChange={(e) =>
                          setToPage(Math.max(1, parseInt(e.target.value, 10) || 1))
                        }
                        className="w-20 h-8 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
