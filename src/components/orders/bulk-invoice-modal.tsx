"use client";

import React, { useState } from "react";
import { X, Download, Calendar } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { generateBulkInvoices, downloadBlob } from "@/lib/utils/bulk-invoice";
import toast from "react-hot-toast";

interface BulkInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ORDER_STATUSES = [
  { value: "DELIVERED", label: "Delivered" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function BulkInvoiceModal({ isOpen, onClose }: BulkInvoiceModalProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "DELIVERED",
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Set default date range (last 30 days) when modal opens
  React.useEffect(() => {
    if (isOpen && !startDate && !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setEndDate(today.toISOString().split("T")[0]);
      setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    }
  }, [isOpen, startDate, endDate]);

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStatuses.length === ORDER_STATUSES.length) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(ORDER_STATUSES.map((s) => s.value));
    }
  };

  const isDateRangeValid = () => {
    if (!startDate || !endDate) return false;
    return new Date(startDate) <= new Date(endDate);
  };

  const handleDownload = async () => {
    if (!isDateRangeValid()) {
      toast.error("Please select a valid date range");
      return;
    }

    if (selectedStatuses.length === 0) {
      toast.error("Please select at least one order status");
      return;
    }

    setIsGenerating(true);
    setProgress({ current: 0, total: 0 });

    try {
      const toastId = toast.loading("Generating invoices...", {
        id: "bulk-invoice",
      });

      const zipBlob = await generateBulkInvoices(
        {
          startDate,
          endDate,
          statuses: selectedStatuses,
        },
        (current, total) => {
          setProgress({ current, total });
          toast.loading(`Generating invoices... ${current}/${total}`, {
            id: "bulk-invoice",
          });
        }
      );

      // Generate filename with date range
      const startDateStr = startDate.replace(/-/g, "");
      const endDateStr = endDate.replace(/-/g, "");
      const filename = `WishBee_Invoices_${startDateStr}_${endDateStr}.zip`;

      // Download zip file
      downloadBlob(zipBlob, filename);

      toast.success("Invoices downloaded successfully!", {
        id: "bulk-invoice",
      });
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    } catch (error) {
      console.error("Error generating bulk invoices:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate invoices",
        { id: "bulk-invoice" }
      );
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Bulk Invoice Download
              </h3>
              <p className="text-sm text-gray-500">
                Download invoices for multiple orders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date Range
            </label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            {!isDateRangeValid() && startDate && endDate && (
              <p className="text-red-500 text-xs mt-1">
                End date must be after start date
              </p>
            )}
          </div>

          {/* Order Statuses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Order Status
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedStatuses.length === ORDER_STATUSES.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ORDER_STATUSES.map((status) => (
                <label
                  key={status.value}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status.value)}
                    onChange={() => handleStatusToggle(status.value)}
                    disabled={isGenerating}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
            {selectedStatuses.length === 0 && (
              <p className="text-red-500 text-xs mt-2">
                Please select at least one order status
              </p>
            )}
          </div>

          {/* Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only orders with status{" "}
              <strong>DELIVERED</strong> and payment status{" "}
              <strong>COMPLETED</strong> will have invoices generated. Other
              orders will be filtered out automatically.
            </p>
          </div>

          {/* Progress */}
          {isGenerating && progress.total > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Generating invoices...
                </span>
                <span className="text-sm text-gray-500">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-sm cursor-pointer font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={
              !isDateRangeValid() ||
              selectedStatuses.length === 0 ||
              isGenerating
            }
            className="px-4 py-2 text-sm cursor-pointer font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Invoices
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
