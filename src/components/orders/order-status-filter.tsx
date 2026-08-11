"use client";

import React from "react";

/**
 * Empty string means "All". RETURNED is offered even though it is absent from
 * the status-change dropdown, so orders already carrying it stay reachable.
 */
export const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "RETURNED", label: "Returned" },
] as const;

export function getOrderStatusLabel(value: string): string {
  return (
    ORDER_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

interface OrderStatusFilterProps {
  value: string;
  onChange: (status: string) => void;
}

export function OrderStatusFilter({ value, onChange }: OrderStatusFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ORDER_STATUS_OPTIONS.map((option) => (
        <button
          key={option.value || "all"}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-colors ${
            value === option.value
              ? "bg-[#13aaff] text-white shadow-sm"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
