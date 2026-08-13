'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calculator, User } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { CashierSessionsTable } from './cashier-sessions-table';
import { cashierSessionsApi, CashierSession } from '@/lib/api/cashier-sessions';
import { CashierSelectDropdown } from '@/components/cashier/cashier-select-dropdown';
import { orderApi, CashierPosOrdersResponse } from '@/lib/api/orders';
import toast from 'react-hot-toast';

interface CashierSummaryByMethod {
  orders: number;
  amount: number;
}

interface CashierSummary {
  totalOrders: number;
  totalCustomers: number;
  totalSale: number;
  totalCash: number;
  byMethod: {
    COD: CashierSummaryByMethod;
    UPI: CashierSummaryByMethod;
    CARD: CashierSummaryByMethod;
    NET_BANKING: CashierSummaryByMethod;
  };
  openingBalance: number | null;
  finalAmount: number;
}

const ITEMS_PER_PAGE = 20;

export function CashierManagementPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate] = useState('');
  const [cashierId, setCashierId] = useState<string>('');
  const [cashierSummaryLabel, setCashierSummaryLabel] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'CLOSED' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sessions, setSessions] = useState<CashierSession[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const hasMore = currentPage < totalPages && total > 0;
  const selectedCashierLabel =
    cashierSummaryLabel ?? (cashierId ? `ID: ${cashierId.slice(-6)}` : null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [summaryStartDate, setSummaryStartDate] = useState(todayStr);
  const [summaryEndDate, setSummaryEndDate] = useState(todayStr);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CashierSummary | null>(null);

  useEffect(() => {
    if (!fromDate && !toDate) {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 30);
      const endStr = end.toISOString().split('T')[0];
      const startStr = start.toISOString().split('T')[0];
      setToDate(endStr);
      setFromDate(startStr);
      setAppliedToDate(endStr);
      setAppliedFromDate(startStr);
    }
  }, []);

  useEffect(() => {
    if (!appliedFromDate || !appliedToDate) return;

    const isFirstPage = currentPage === 1;

    const fetchSessions = async () => {
      try {
        if (isFirstPage) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const res = await cashierSessionsApi.getSessions({
          fromDate: appliedFromDate,
          toDate: appliedToDate,
          cashierId: cashierId || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });

        setTotalPages(res.totalPages);
        setTotal(res.total);
        setSessions((prev) =>
          isFirstPage ? res.sessions : [...prev, ...res.sessions]
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch sessions';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchSessions();
  }, [appliedFromDate, appliedToDate, cashierId, statusFilter, currentPage]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setCurrentPage((p) => p + 1);
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => (el ? observer.unobserve(el) : undefined);
  }, [hasMore, loading, loadingMore]);

  const handleApplyFilters = useCallback(() => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setCurrentPage(1);
  }, [fromDate, toDate]);

  const handleLoadSummary = useCallback(async () => {
    if (!cashierId) {
      toast.error('Select a cashier to view summary');
      return;
    }

    if (!summaryStartDate || !summaryEndDate) {
      toast.error('Select a date range for summary');
      return;
    }

    // Prevent future dates
    if (summaryStartDate > todayStr || summaryEndDate > todayStr) {
      toast.error('Summary cannot be viewed for future dates');
      return;
    }

    if (summaryStartDate > summaryEndDate) {
      toast.error('Start date must be on or before end date');
      return;
    }

    try {
      setSummaryLoading(true);
      setSummaryError(null);

      const [ordersRes, sessionsRes] = await Promise.all([
        orderApi.getCashierPosOrders({
          cashierId,
          fromDate: summaryStartDate,
          toDate: summaryEndDate,
        }),
        cashierSessionsApi.getSessions({
          cashierId,
          fromDate: summaryStartDate,
          toDate: summaryEndDate,
          page: 1,
          limit: 100,
        }),
      ]);

      const orders = (ordersRes as CashierPosOrdersResponse).orders || [];

      const byMethod: CashierSummary['byMethod'] = {
        COD: { orders: 0, amount: 0 },
        UPI: { orders: 0, amount: 0 },
        CARD: { orders: 0, amount: 0 },
        NET_BANKING: { orders: 0, amount: 0 },
      };

      let totalSale = 0;

      orders.forEach((order: any) => {
        const methodRaw = (order.payment?.method || '').toUpperCase();
        const method =
          methodRaw === 'CARD' ||
          methodRaw === 'UPI' ||
          methodRaw === 'COD' ||
          methodRaw === 'NET_BANKING'
            ? methodRaw
            : 'COD';

        const amount =
          typeof order.totalAmount === 'number'
            ? order.totalAmount
            : typeof order.payment?.amount === 'number'
            ? order.payment.amount
            : 0;

        totalSale += amount;

        const bucket = byMethod[method as keyof CashierSummary['byMethod']];
        bucket.orders += 1;
        bucket.amount += amount;
      });

      const totalOrders = orders.length;
      const totalCustomers = totalOrders; // each order = one served customer
      const totalCash = byMethod.COD.amount;

      const openingBalanceTotal =
        sessionsRes.sessions?.reduce(
          (sum: number, s: any) =>
            sum +
            (typeof s.openingBalance === 'number' ? s.openingBalance : 0),
          0
        ) ?? 0;
      const openingBalance =
        openingBalanceTotal > 0 ? openingBalanceTotal : null;

      const finalAmount =
        openingBalanceTotal +
        byMethod.COD.amount +
        byMethod.UPI.amount +
        byMethod.CARD.amount +
        byMethod.NET_BANKING.amount;

      setSummary({
        totalOrders,
        totalCustomers,
        totalSale,
        totalCash,
        byMethod,
        openingBalance,
        finalAmount,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to load cashier summary';
      setSummaryError(msg);
      toast.error(msg);
    } finally {
      setSummaryLoading(false);
    }
  }, [cashierId, summaryStartDate, summaryEndDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-gray-600" />
          Cashier Management
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          View and manage cashier sessions, opening and closing balances, and POS activity.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            Sessions history
          </h2>

          <div className="flex flex-wrap items-end gap-4">
            <DateRangePicker
              startDate={fromDate}
              endDate={toDate}
              onStartDateChange={setFromDate}
              onEndDateChange={setToDate}
            />
            <CashierSelectDropdown
              value={cashierId}
              onChange={setCashierId}
              onPick={(_id, label) => {
                setCashierSummaryLabel(label);
                setCurrentPage(1);
              }}
              label="Cashier"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'ACTIVE' | 'CLOSED' | '');
                  setCurrentPage(1);
                }}
                className="min-w-[120px] px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#13aaff] focus:border-transparent appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem', paddingRight: '2rem' }}
              >
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <Button variant="primary" size="sm" onClick={handleApplyFilters} className="h-[42px] px-4">
              Apply
            </Button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Summary section */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Summary</p>
                <p className="text-xs text-gray-500">
                  POS overview for{' '}
                  <span className="font-medium">
                    {selectedCashierLabel || 'select a cashier above'}
                  </span>
                </p>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">
                    Date range
                  </label>
                  <DateRangePicker
                    startDate={summaryStartDate}
                    endDate={summaryEndDate}
                    onStartDateChange={setSummaryStartDate}
                    onEndDateChange={setSummaryEndDate}
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!cashierId || summaryLoading}
                  onClick={handleLoadSummary}
                  className="h-[42px] px-4"
                >
                  {summaryLoading ? 'Loading...' : 'View Summary'}
                </Button>
              </div>
            </div>

            {summaryError && (
              <p className="mt-2 text-xs text-red-600">{summaryError}</p>
            )}

            {summary && !summaryLoading && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#d9f4ff] rounded-lg px-3 py-3">
                  <p className="text-[11px] text-gray-600">
                    Total customers served
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {summary.totalCustomers}
                  </p>
                </div>
                <div className="bg-[#fff3e0] rounded-lg px-3 py-3">
                  <p className="text-[11px] text-gray-600">
                    Total cash (incoming)
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    ₹{summary.totalCash.toFixed(2)}
                  </p>
                </div>
                <div className="bg-[#e8f5e9] rounded-lg px-3 py-3">
                  <p className="text-[11px] text-gray-600">Total sale</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    ₹{summary.totalSale.toFixed(2)}
                  </p>
                </div>
                <div className="bg-[#f3e8ff] rounded-lg px-3 py-3">
                  <p className="text-[11px] text-gray-600">
                    Final amount (EOD incl. opening)
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    ₹{summary.finalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white border border-dashed border-gray-200 rounded-lg px-3 py-3 sm:col-span-2 lg:col-span-4">
                  <p className="text-[11px] font-medium text-gray-700 mb-1">
                    By payment method (amount • orders)
                  </p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-gray-700">
                    <span>
                      Cash: ₹{summary.byMethod.COD.amount.toFixed(2)} •{' '}
                      {summary.byMethod.COD.orders}
                    </span>
                    <span>
                      UPI: ₹{summary.byMethod.UPI.amount.toFixed(2)} •{' '}
                      {summary.byMethod.UPI.orders}
                    </span>
                    <span>
                      Card: ₹{summary.byMethod.CARD.amount.toFixed(2)} •{' '}
                      {summary.byMethod.CARD.orders}
                    </span>
                    <span>
                      Net banking: ₹
                      {summary.byMethod.NET_BANKING.amount.toFixed(2)} •{' '}
                      {summary.byMethod.NET_BANKING.orders}
                    </span>
                  </div>
                  {summary.openingBalance != null && (
                    <p className="mt-1 text-[11px] text-gray-500">
                      Opening balance: ₹{summary.openingBalance.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {!appliedFromDate || !appliedToDate ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              Select a date range and click Apply to load sessions.
            </div>
          ) : loading && sessions.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13aaff] mx-auto mb-4" />
                <p className="text-gray-500">Loading sessions...</p>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No sessions found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting the date range or filters.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">
                Showing {sessions.length} of {total} session{total !== 1 ? 's' : ''}
                {hasMore && ' · scroll for more'}
              </p>
              <CashierSessionsTable sessions={sessions} loadingMore={loadingMore} />
              <div ref={loadMoreRef} className="h-4 flex items-center justify-center py-4" aria-hidden>
                {loadingMore && (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-[#13aaff]" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
