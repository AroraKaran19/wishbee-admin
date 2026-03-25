'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { getCashierAdminsForDropdown } from '@/lib/api/customers';

export interface CashierOption {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

const DEFAULT_PAGE_SIZE = 20;

function getCashierLabel(c: CashierOption): string {
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || '—';
}

export interface CashierSelectDropdownProps {
  value: string;
  onChange: (cashierId: string) => void;
  label?: string;
  disabled?: boolean;
  /** Change when the list should reload (e.g. modal `isOpen`) */
  resetKey?: string | number | boolean;
  className?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  pageSize?: number;
  /** Fires after a choice; `displayLabel` is null for “all cashiers” */
  onPick?: (cashierId: string, displayLabel: string | null) => void;
}

export function CashierSelectDropdown({
  value,
  onChange,
  label = 'Cashier',
  disabled = false,
  resetKey,
  className = '',
  showAllOption = true,
  allOptionLabel = 'All cashiers',
  pageSize = DEFAULT_PAGE_SIZE,
  onPick,
}: CashierSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [cashiers, setCashiers] = useState<CashierOption[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const hasMore = page < totalPages;

  const loadFirstPage = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCashierAdminsForDropdown(1, pageSize);
      setCashiers((res.users || []) as CashierOption[]);
      setPage(1);
      setTotalPages(res.pagination?.pages ?? 1);
    } catch {
      setCashiers([]);
      setTotalPages(1);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage, resetKey]);

  useEffect(() => {
    if (page <= 1) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoadingMore(true);
        const res = await getCashierAdminsForDropdown(page, pageSize);
        if (cancelled) return;
        const incoming = (res.users || []) as CashierOption[];
        const apiPages = res.pagination?.pages ?? 1;

        setCashiers((prev) => {
          const ids = new Set(prev.map((c) => c._id));
          const merged = [...prev];
          for (const c of incoming) {
            if (!ids.has(c._id)) {
              ids.add(c._id);
              merged.push(c);
            }
          }
          return merged;
        });
        setTotalPages(incoming.length === 0 ? page : apiPages);
      } catch {
        if (!cancelled) setPage((p) => Math.max(1, p - 1));
      } finally {
        if (!cancelled) setLoadingMore(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  useEffect(() => {
    if (!open || !hasMore || loading || loadingMore) return;

    const root = listRef.current;
    const el = loadMoreRef.current;
    if (!el || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { root, rootMargin: '80px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, hasMore, loading, loadingMore]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectedLabel = value
    ? cashiers.find((c) => c._id === value)
      ? getCashierLabel(cashiers.find((c) => c._id === value)!)
      : `ID: ${value.slice(-6)}`
    : null;

  const pick = (id: string) => {
    onChange(id);
    if (id === '') {
      onPick?.(id, null);
    } else {
      const c = cashiers.find((x) => x._id === id);
      onPick?.(id, c ? getCashierLabel(c) : null);
    }
    setOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1 relative ${className}`} ref={containerRef}>
      {label ? (
        <label className="text-xs font-medium text-gray-500">{label}</label>
      ) : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="w-full min-w-[180px] px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#13aaff] focus:border-transparent flex items-center justify-between gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">{selectedLabel ?? allOptionLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] max-h-[280px] flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div
            ref={listRef}
            className="overflow-y-auto overscroll-contain flex-1 py-1"
            style={{ maxHeight: 260 }}
          >
            {showAllOption && (
              <button
                type="button"
                onClick={() => pick('')}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                  !value ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                }`}
              >
                {allOptionLabel}
              </button>
            )}
            {loading ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">Loading cashiers...</div>
            ) : (
              <>
                {cashiers.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => pick(c._id)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 truncate ${
                      value === c._id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                    }`}
                  >
                    {getCashierLabel(c)}
                  </button>
                ))}
                {hasMore && <div ref={loadMoreRef} className="h-4 w-full shrink-0" aria-hidden />}
                {loadingMore && (
                  <div className="px-3 py-2 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-gray-200 border-t-[#13aaff]" />
                    Loading more...
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
