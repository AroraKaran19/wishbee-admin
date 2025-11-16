"use client";

import React, { useState, useEffect } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import { AdminTable } from "./admin-table";
import { CreateAdminModal } from "./create-admin-modal";
import { customerApi } from "@/lib/api/customers";
import { useSessionStore } from "@/stores/sessionStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

export function AdminsPage() {
  const admin = useSessionStore((state) => state.admin);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Check if current admin is SUPER_ADMIN
  const isSuperAdmin = admin?.role === "SUPER_ADMIN";

  // Debounce search query - update debouncedSearchQuery after 500ms of no typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  // Fetch admins with pagination and search
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch admins by filtering with role="ADMIN" or role="SUPER_ADMIN"
        // Note: The API returns CUSTOMER by default, so we need to filter for ADMIN role
        const adminResponse = await customerApi.getAll({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchQuery || undefined,
          role: "ADMIN", // This should fetch both ADMIN and SUPER_ADMIN
        });

        // Filter to only show ADMIN and SUPER_ADMIN users
        const adminUsers = adminResponse.users.filter(
          (user: any) => user.role === "ADMIN" || user.role === "SUPER_ADMIN"
        ) as Admin[];

        setAdmins(adminUsers);
        // Calculate total pages based on filtered results
        // Note: This is approximate since we're filtering client-side
        const filteredTotal = adminUsers.length;
        setTotalPages(
          Math.max(1, Math.ceil(filteredTotal / itemsPerPage)) ||
            adminResponse.pagination.pages
        );
      } catch (err) {
        console.error("Error fetching admins:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch admins");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [currentPage, debouncedSearchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAdminUpdate = async () => {
    // Refetch admins after update
    try {
      setLoading(true);
      setError(null);

      const adminResponse = await customerApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery || undefined,
        role: "ADMIN",
      });

      const adminUsers = adminResponse.users.filter(
        (user: any) => user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      ) as Admin[];

      setAdmins(adminUsers);
      const filteredTotal = adminUsers.length;
      setTotalPages(
        Math.max(1, Math.ceil(filteredTotal / itemsPerPage)) ||
          adminResponse.pagination.pages
      );
    } catch (err) {
      console.error("Error refetching admins after update:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh admins");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage admin users and their permissions to control access to
          different sections of the admin panel.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-shrink-0 mb-4 flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by: Name, Email"
              onSearch={handleSearch}
              onSearchChange={setSearchQuery}
              searchValue={searchQuery}
            />
          </div>
          {isSuperAdmin && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Admin
            </Button>
          )}
        </div>

        <div className="flex-1 min-h-0">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading admins...</p>
              </div>
            </div>
          ) : admins.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No admins found</p>
                <p className="text-gray-400 text-sm">
                  {debouncedSearchQuery
                    ? "Try adjusting your search terms"
                    : "No admins available"}
                </p>
              </div>
            </div>
          ) : (
            <AdminTable
              admins={admins}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onAdminUpdate={handleAdminUpdate}
            />
          )}
        </div>
      </div>

      <CreateAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAdminUpdate}
      />
    </div>
  );
}
