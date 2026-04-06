"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PermissionGuard } from "@/components/layout/permission-guard";
import { ADMIN_PERMISSIONS } from "@/lib/constants/permissions";
import {
  offlineConfigurationsApi,
  OfflineStoreStatus,
} from "@/lib/api/offline-configurations";
import { useSessionStore } from "@/stores/sessionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Store, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

function isStoreAcceptingOnlineOrders(status: OfflineStoreStatus): boolean {
  return status !== "CLOSED";
}

export default function OfflineStoreSettingsPage() {
  const admin = useSessionStore((s) => s.admin);
  const isSuperAdmin = admin?.role === "SUPER_ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<OfflineStoreStatus>("ACTIVE");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await offlineConfigurationsApi.get();
      const s = res.data?.status ?? "ACTIVE";
      setStatus(s);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to load offline configuration";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const accepting = isStoreAcceptingOnlineOrders(status);

  const handleToggle = async (nextOpen: boolean) => {
    if (!isSuperAdmin || saving) return;
    const nextStatus: OfflineStoreStatus = nextOpen ? "ACTIVE" : "CLOSED";
    try {
      setSaving(true);
      const res = await offlineConfigurationsApi.update(nextStatus);
      const s = res.data?.status ?? nextStatus;
      setStatus(s);
      toast.success(
        nextOpen
          ? "Online store is open — consumer orders are allowed."
          : "Store set to closed — new online orders will be blocked."
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to update configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.SETTINGS}>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Online store status</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Control whether the public website accepts new online orders. POS
              in-store orders are not affected.
            </p>
          </div>

          {!isSuperAdmin ? (
            <div className="flex gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>
                Only a <strong>super admin</strong> can change offline store
                settings. Contact a super admin if you need to close or reopen
                online ordering.
              </p>
            </div>
          ) : null}

          {error && isSuperAdmin && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Store className="h-5 w-5 text-gray-600" />
                Offline configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading…
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Accept online orders
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xl">
                        When off, the storefront should show that ordering is
                        paused and checkout returns a 403 for new consumer orders.
                        In-store POS is unchanged.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {saving && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={accepting}
                        aria-label="Accept online orders"
                        disabled={!isSuperAdmin || saving}
                        onClick={() => handleToggle(!accepting)}
                        className={cn(
                          "inline-flex w-14 h-8 shrink-0 cursor-pointer rounded-full p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13aaff] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                          accepting ? "bg-emerald-500 justify-end" : "bg-gray-300 justify-start"
                        )}
                      >
                        <span className="pointer-events-none h-6 w-6 rounded-full bg-white shadow-sm ring-1 ring-black/5" />
                      </button>
                      <span
                        className={cn(
                          "text-sm font-medium tabular-nums min-w-[4.5rem]",
                          accepting ? "text-emerald-700" : "text-gray-600"
                        )}
                      >
                        {accepting ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}
