"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Shield } from "lucide-react";
import { AdminPermissionsModal } from "./admin-permissions-modal";
import { Badge } from "@/components/ui/badge";

interface Admin {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  permissions?: string[];
  createdAt?: string;
}

interface AdminTableProps {
  admins: Admin[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAdminUpdate?: () => Promise<void>;
}

const PERMISSION_LABELS: Record<string, string> = {
  DASHBOARD: "Dashboard",
  INVENTORY: "Inventory",
  ORDERS: "Orders",
  CUSTOMERS: "Customers",
  OFFERS_BANNERS: "Offers & Banners",
  ANALYTICS: "Analytics",
  MOST_SELLING: "Most Selling",
  SETTINGS: "Settings",
  ADMINS: "Admins",
  SUPPORT: "Support",
};

export function AdminTable({
  admins,
  currentPage,
  totalPages,
  onPageChange,
  onAdminUpdate,
}: AdminTableProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  const handleEditPermissions = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsPermissionsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPermissionsModalOpen(false);
    setSelectedAdmin(null);
  };

  const formatAdminName = (admin: Admin): string => {
    if (admin.firstName && admin.lastName) {
      return `${admin.firstName} ${admin.lastName}`;
    }
    if (admin.firstName) return admin.firstName;
    return admin.email || "Unknown";
  };

  const formatPermissions = (permissions?: string[]): string => {
    if (!permissions || permissions.length === 0) {
      return "No permissions";
    }
    if (permissions.length <= 3) {
      return permissions.map((p) => PERMISSION_LABELS[p] || p).join(", ");
    }
    return `${permissions
      .slice(0, 3)
      .map((p) => PERMISSION_LABELS[p] || p)
      .join(", ")} +${permissions.length - 3} more`;
  };

  const tableConfig = {
    columns: [
      {
        key: "name",
        title: "Name",
        render: (value: any, admin: Admin) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {formatAdminName(admin)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {formatAdminName(admin)}
              </div>
              <div className="text-sm text-gray-500">{admin.email}</div>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        title: "Role",
        render: (value: any, admin: Admin) => (
          <Badge
            variant={admin.role === "SUPER_ADMIN" ? "success" : "primary"}
          >
            {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
          </Badge>
        ),
      },
      {
        key: "permissions",
        title: "Permissions",
        render: (value: any, admin: Admin) => {
          if (admin.role === "SUPER_ADMIN") {
            return (
              <Badge variant="success" className="text-xs">
                All Permissions
              </Badge>
            );
          }
          return (
            <div className="text-sm text-gray-700">
              {formatPermissions(admin.permissions)}
            </div>
          );
        },
      },
      {
        key: "status",
        title: "Status",
        render: (value: any, admin: Admin) => (
          <Badge variant={admin.isActive ? "success" : "danger"}>
            {admin.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    actions: [
      {
        key: "edit",
        label: "",
        icon: <Shield className="h-4 w-4" />,
        onClick: (admin: Admin) => handleEditPermissions(admin),
        variant: "secondary" as const,
        size: "sm" as const,
        className:
          "text-blue-600 hover:text-blue-700 bg-transparent hover:bg-blue-50 border-0 shadow-none rounded-full pr-1.5 flex items-center justify-center",
        // Disable for SUPER_ADMIN users (they have all permissions)
        disabled: (admin: Admin) => admin.role === "SUPER_ADMIN",
      },
    ],
    pagination: {
      currentPage,
      totalPages,
      onPageChange,
      showPageInfo: true,
    },
    rowKey: "_id",
    className: "rounded-xl shadow-sm",
    rowClassName: () => "hover:bg-gray-50",
  };

  return (
    <div>
      <DataTable data={admins} config={tableConfig} />
      <div className="h-4"></div>

      {/* Permissions Modal */}
      <AdminPermissionsModal
        admin={selectedAdmin}
        isOpen={isPermissionsModalOpen}
        onClose={handleCloseModal}
        onPermissionsUpdate={onAdminUpdate}
      />
    </div>
  );
}
