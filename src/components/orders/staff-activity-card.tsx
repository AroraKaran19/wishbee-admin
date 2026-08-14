"use client";

import React, { useEffect, useState } from "react";
import { orderApi, StatusActivityRow } from "@/lib/api/orders";
import { StatusActivityModal } from "./status-activity-modal";

interface StaffActivityCardProps {
  /** Bumped by the parent after an order changes, to re-read the counts. */
  refreshKey?: number;
}

/** Today in local time. `toISOString` would roll over early in UTC+ zones. */
const todayISO = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}`;
};

const formatDayLabel = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** Every status an order can hold, in lifecycle order. */
const CORE_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "RETURNED",
] as const;

const STATUS_STYLES: Record<
  string,
  { label: string; dot: string; value: string }
> = {
  PENDING: { label: "Pending", dot: "#2196f3", value: "text-gray-900" },
  PROCESSING: { label: "Processing", dot: "#00bcd4", value: "text-gray-900" },
  SHIPPED: { label: "Shipped", dot: "#ff9800", value: "text-gray-900" },
  DELIVERED: { label: "Delivered", dot: "#0b8f00", value: "text-[#0b8f00]" },
  CANCELLED: { label: "Cancelled", dot: "#dc2626", value: "text-[#dc2626]" },
  REFUNDED: { label: "Refunded", dot: "#7c3aed", value: "text-[#7c3aed]" },
  RETURNED: { label: "Returned", dot: "#db2777", value: "text-[#db2777]" },
};

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * What was moved into each status on the selected day, and who did it. Keyed on
 * when the change was made, not when the order was placed - so it is scoped by
 * its own date picker rather than the page filter, which drives the table below
 * on placement date. PENDING counts placements: that is the only way in.
 */
export function StaffActivityCard({ refreshKey = 0 }: StaffActivityCardProps) {
  const [rows, setRows] = useState<StatusActivityRow[] | null>(null);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openStatus, setOpenStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayISO);

  const isToday = selectedDate === todayISO();

  // A single day, expressed as a one-day range - the API takes a window and the
  // server widens it to that day's full 00:00-23:59.
  const filters = { startDate: selectedDate, endDate: selectedDate };

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const activity = await orderApi.getStatusActivity({
          startDate: selectedDate,
          endDate: selectedDate,
        });
        setRows(activity.rows);
        setTotals(activity.totals || {});
        setAmounts(activity.amounts || {});
      } catch (err) {
        console.error("Error fetching status activity:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load staff activity"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [selectedDate, refreshKey]);

  const visibleStatuses = CORE_STATUSES;

  const hasAnyChange = Object.values(totals).some((count) => count > 0);
  const actorRows = rows || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 min-w-0 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm text-gray-600">
          Orders marked into each status{" "}
          {isToday ? "today" : `on ${formatDayLabel(selectedDate)}`}
        </span>

        {/* This card has its own date, separate from the page filter above:
            it reports when a status was changed, while the table below filters
            on when the order was placed. */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setSelectedDate(todayISO())}
            disabled={isToday}
            className={`text-xs rounded-full px-3 py-1 border transition-colors ${
              isToday
                ? "bg-[#13aaff] border-[#13aaff] text-white cursor-default"
                : "border-gray-200 text-gray-600 hover:border-[#13aaff] cursor-pointer"
            }`}
          >
            Today
          </button>
          <input
            type="date"
            value={selectedDate}
            max={todayISO()}
            onChange={(event) =>
              event.target.value && setSelectedDate(event.target.value)
            }
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:border-[#13aaff] cursor-pointer"
          />
        </div>
      </div>

      <div className="p-4">
        {loading && !rows ? (
          <div className="py-6 text-center text-sm text-gray-500">
            Loading staff activity...
          </div>
        ) : error ? (
          <div className="py-2 text-sm text-red-600">{error}</div>
        ) : !hasAnyChange ? (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-500">
              No status changes {isToday ? "today" : "on this date"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
              {visibleStatuses.map((status) => {
                const style = STATUS_STYLES[status];
                const count = totals[status] || 0;
                const amount = amounts[status] || 0;
                // An empty status has nothing to list, so it stays inert.
                const interactive = count > 0;
                const body = (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: style.dot }}
                      />
                      <span className="text-[11px] font-medium text-gray-500 truncate">
                        {style.label}
                      </span>
                    </div>
                    <div
                      className={`mt-1.5 text-2xl font-semibold tabular-nums leading-none ${
                        count === 0 ? "text-gray-300" : style.value
                      }`}
                    >
                      {count}
                    </div>
                    <div
                      className={`mt-1.5 text-xs font-medium tabular-nums ${
                        amount === 0 ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {rupees.format(amount)}
                    </div>
                  </>
                );

                const tileClass = "rounded-xl border px-4 py-3 text-left";

                return interactive ? (
                  <button
                    key={status}
                    onClick={() => setOpenStatus(status)}
                    className={`${tileClass} border-gray-200 cursor-pointer transition-colors hover:border-[#13aaff] hover:bg-gray-50`}
                  >
                    {body}
                  </button>
                ) : (
                  <div key={status} className={`${tileClass} border-gray-200`}>
                    {body}
                  </div>
                );
              })}
            </div>

            {actorRows.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
                  Who changed them
                </div>
                <ul className="space-y-2">
                  {actorRows.map((row) => (
                    <li
                      key={row.userId ?? row.name}
                      className="flex items-center gap-3 text-sm flex-wrap"
                    >
                      <span className="text-gray-900 font-medium min-w-[8rem]">
                        {row.name}
                      </span>
                      <span className="flex items-center gap-3 flex-wrap text-xs text-gray-600">
                        {visibleStatuses
                          .filter((status) => (row.counts[status] || 0) > 0)
                          .map((status) => (
                            <span
                              key={status}
                              className="flex items-center gap-1"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: STATUS_STYLES[status].dot,
                                }}
                              />
                              {STATUS_STYLES[status].label}
                              <span className="font-semibold text-gray-900 tabular-nums">
                                {row.counts[status]}
                              </span>
                            </span>
                          ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <StatusActivityModal
        // Remounting per status resets pagination without an extra fetch.
        key={openStatus ?? "closed"}
        isOpen={openStatus !== null}
        onClose={() => setOpenStatus(null)}
        status={openStatus}
        statusLabel={openStatus ? STATUS_STYLES[openStatus].label : ""}
        amount={openStatus ? amounts[openStatus] || 0 : 0}
        filters={filters}
      />
    </div>
  );
}
