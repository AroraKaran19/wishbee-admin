"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { OrderSummary } from "@/lib/types";

interface OrderSummaryCardsProps {
  summary: OrderSummary;
}

export function OrderSummaryCards({ summary }: OrderSummaryCardsProps) {
  if (!summary) {
    return (
      <div className="flex flex-wrap gap-6 justify-start">
        <div className="bg-gray-100 rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px] animate-pulse">
          <div className="bg-gray-300 text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
            <span className="text-sm font-medium">Loading...</span>
          </div>
          <div className="flex flex-col items-start justify-center pl-4">
            <div className="text-2xl font-semibold text-gray-400 text-center">
              --
            </div>
            <div className="text-xs text-gray-500 text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6 justify-start">
      {/* Total Orders Card */}
      <div className="bg-[#d9f4ff] rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px]">
        <div className="bg-[#00b7fb] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
          <span className="text-sm font-medium">Total Orders</span>
        </div>
        <div className="flex flex-col items-start justify-center pl-4">
          <div className="text-2xl font-semibold text-gray-900 text-center">
            {summary.totalOrders}
          </div>
          <div className="text-xs text-gray-600 text-center">
            {summary.period || "Last Seven Days"}
          </div>
        </div>
      </div>

      {/* Total Received Card */}
      <div className="bg-[#dbeed9] rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px]">
        <div className="bg-[#0b8f00] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
          <span className="text-sm font-medium">Total Received</span>
        </div>
        <div className="flex justify-between items-start px-4">
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-semibold text-gray-900 break-words">
              {summary.totalReceived}
            </div>
            <div className="text-xs text-gray-600">Delivered</div>
          </div>
          <div className="text-right min-w-0 flex-1">
            <div className="text-2xl font-semibold text-gray-900 break-words">
              {formatCurrency(summary.revenue)}
            </div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
        </div>
      </div>

      {/* Refunded Card */}
      <div className="bg-[#fce4e6] rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px]">
        <div className="bg-[#dc2626] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
          <span className="text-sm font-medium">Refunded</span>
        </div>
        <div className="flex justify-between items-start px-4">
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-semibold text-gray-900 break-words">
              {summary.totalReturned}
            </div>
            <div className="text-xs text-gray-600">Refunded Orders</div>
          </div>
          <div className="text-right min-w-0 flex-1">
            <div className="text-2xl font-semibold text-gray-900 break-words">
              {formatCurrency(summary.returnAmount)}
            </div>
            <div className="text-xs text-gray-600">Refund Amount</div>
          </div>
        </div>
      </div>

      {/* On the way Card */}
      <div className="bg-[#fff4e6] rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px]">
        <div className="bg-[#ff9800] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
          <span className="text-sm font-medium">On the way</span>
        </div>
        <div className="flex justify-between items-start px-4">
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-semibold text-gray-900 break-words">
              {summary.onTheWay}
            </div>
            <div className="text-xs text-gray-600">In Transit</div>
          </div>
          <div className="text-right min-w-0 flex-1">
            <div className="text-2xl font-semibold text-gray-900 break-words">
              {formatCurrency(summary.onTheWayCost)}
            </div>
            <div className="text-xs text-gray-600">Value</div>
          </div>
        </div>
      </div>

      {/* Total Pending Card */}
      {summary.totalPending !== undefined && (
        <div className="bg-[#e6f3ff] rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px]">
          <div className="bg-[#2196f3] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
            <span className="text-sm font-medium">Pending</span>
          </div>
          <div className="flex flex-col items-start justify-center pl-4">
            <div className="text-2xl font-semibold text-gray-900 text-center">
              {summary.totalPending}
            </div>
            <div className="text-xs text-gray-600 text-center">
              Awaiting Processing
            </div>
          </div>
        </div>
      )}

      {/* Total Cancelled Card */}
      {summary.totalCancelled !== undefined && (
        <div className="bg-[#fce4e6] rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px]">
          <div className="bg-[#dc2626] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
            <span className="text-sm font-medium">Cancelled</span>
          </div>
          <div className="flex flex-col items-start justify-center pl-4">
            <div className="text-2xl font-semibold text-gray-900 text-center">
              {summary.totalCancelled}
            </div>
            <div className="text-xs text-gray-600 text-center">
              Cancelled Orders
            </div>
          </div>
        </div>
      )}

      {/* Total Delivered Card */}
      {summary.totalDelivered !== undefined && (
        <div className="bg-[#dbeed9] rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px]">
          <div className="bg-[#0b8f00] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
            <span className="text-sm font-medium">Delivered</span>
          </div>
          <div className="flex flex-col items-start justify-center pl-4">
            <div className="text-2xl font-semibold text-gray-900 text-center">
              {summary.totalDelivered}
            </div>
            <div className="text-xs text-gray-600 text-center">
              Completed Orders
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Cards */}
      {(summary.totalUPIOrders !== undefined ||
        summary.totalCODOrders !== undefined ||
        summary.totalCardOrders !== undefined) && (
        <>
          {summary.totalUPIOrders !== undefined && (
            <div className="bg-[#e8f5e9] rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px]">
              <div className="bg-[#4caf50] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
                <span className="text-sm font-medium">UPI Orders</span>
              </div>
              <div className="flex flex-col items-start justify-center pl-4">
                <div className="text-2xl font-semibold text-gray-900 text-center">
                  {summary.totalUPIOrders}
                </div>
                <div className="text-xs text-gray-600 text-center">
                  UPI Payments
                </div>
              </div>
            </div>
          )}

          {summary.totalCODOrders !== undefined && (
            <div className="bg-[#fff3e0] rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px]">
              <div className="bg-[#ff9800] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
                <span className="text-sm font-medium">COD Orders</span>
              </div>
              <div className="flex flex-col items-start justify-center pl-4">
                <div className="text-2xl font-semibold text-gray-900 text-center">
                  {summary.totalCODOrders}
                </div>
                <div className="text-xs text-gray-600 text-center">
                  Cash on Delivery
                </div>
              </div>
            </div>
          )}

          {summary.totalCardOrders !== undefined && (
            <div className="bg-[#e3f2fd] rounded-lg pt-4 pb-2 w-[calc(33.333%-1rem)] min-w-[180px]">
              <div className="bg-[#2196f3] text-white px-3 py-2 rounded-tr-2xl inline-block mb-3">
                <span className="text-sm font-medium">Card Orders</span>
              </div>
              <div className="flex flex-col items-start justify-center pl-4">
                <div className="text-2xl font-semibold text-gray-900 text-center">
                  {summary.totalCardOrders}
                </div>
                <div className="text-xs text-gray-600 text-center">
                  Card Payments
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
