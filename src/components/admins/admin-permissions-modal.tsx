"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { customerApi } from "@/lib/api/customers";
import { ALL_PERMISSIONS } from "@/lib/constants/permissions";
import toast from "react-hot-toast";

interface AdminPermissionsModalProps {
  admin: any | null;
  isOpen: boolean;
  onClose: () => void;
  onPermissionsUpdate?: () => Promise<void>;
}

const PERMISSION_LABELS: Record<string, string> = {
  DASHBOARD: "Dashboard",
  INVENTORY: "Inventory",
  ORDERS: "Orders",
  CUSTOMERS: "Customers",
  CASHIER: "Cashier",
  OFFERS_BANNERS: "Offers & Banners",
  ANALYTICS: "Analytics",
  MOST_SELLING: "Most Selling",
  SETTINGS: "Settings",
  ADMINS: "Admins",
  SUPPORT: "Support",
};

export function AdminPermissionsModal({
  admin,
  isOpen,
  onClose,
  onPermissionsUpdate,
}: AdminPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize selected permissions when admin changes
  useEffect(() => {
    if (admin && isOpen) {
      setSelectedPermissions(admin.permissions || []);
    }
  }, [admin, isOpen]);

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === ALL_PERMISSIONS.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions([...ALL_PERMISSIONS]);
    }
  };

  const handleSubmit = async () => {
    if (!admin) return;

    try {
      setIsUpdating(true);
      await customerApi.updatePermissions(admin._id, selectedPermissions);
      toast.success("Permissions updated successfully");
      onPermissionsUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update permissions"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !admin) return null;

  const adminName =
    admin.firstName && admin.lastName
      ? `${admin.firstName} ${admin.lastName}`
      : admin.firstName || admin.email || "Admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Manage Permissions
            </h2>
            <p className="text-sm text-gray-500 mt-1">{adminName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedPermissions.length === ALL_PERMISSIONS.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          <div className="space-y-3">
            {ALL_PERMISSIONS.map((permission) => {
              const isSelected = selectedPermissions.includes(permission);
              return (
                <label
                  key={permission}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handlePermissionToggle(permission)}
                    disabled={isUpdating}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {PERMISSION_LABELS[permission] || permission}
                  </span>
                </label>
              );
            })}
          </div>

          {selectedPermissions.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No permissions selected. This admin will not have access to any
                sections.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
