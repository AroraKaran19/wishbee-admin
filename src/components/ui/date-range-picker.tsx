"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = "",
}: DateRangePickerProps) {
  const today = new Date().toISOString().split("T")[0];

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    onStartDateChange(selectedDate);
    
    // If start date is after end date, update end date
    if (selectedDate && endDate && selectedDate > endDate) {
      onEndDateChange(selectedDate);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    onEndDateChange(selectedDate);
    
    // If end date is before start date, update start date
    if (selectedDate && startDate && selectedDate < startDate) {
      onStartDateChange(selectedDate);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <label className="text-sm text-gray-600">From:</label>
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          max={today}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#13aaff] focus:border-transparent"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">To:</label>
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          min={startDate || undefined}
          max={today}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#13aaff] focus:border-transparent"
        />
      </div>
    </div>
  );
}

