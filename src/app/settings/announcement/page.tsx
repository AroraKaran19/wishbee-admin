"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PermissionGuard } from "@/components/layout/permission-guard";
import { ADMIN_PERMISSIONS } from "@/lib/constants/permissions";
import {
  offlineConfigurationsApi,
  ANNOUNCEMENT_MESSAGE_MAX_LENGTH,
} from "@/lib/api/offline-configurations";
import { useSessionStore } from "@/stores/sessionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Loader2, Megaphone, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function AnnouncementSettingsPage() {
  const admin = useSessionStore((s) => s.admin);
  const isSuperAdmin = admin?.role === "SUPER_ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await offlineConfigurationsApi.get();
      setEnabled(res.data?.announcement?.enabled ?? false);
      setMessage(res.data?.announcement?.message ?? "");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to load announcement settings";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const applyUpdate = async (nextEnabled: boolean, nextMessage: string) => {
    setSaving(true);
    try {
      const res = await offlineConfigurationsApi.updateAnnouncement(
        nextEnabled,
        nextMessage
      );
      setEnabled(res.data?.enabled ?? nextEnabled);
      setMessage(res.data?.message ?? nextMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (nextOn: boolean) => {
    if (!isSuperAdmin || saving) return;

    if (nextOn) {
      setDraft(message);
      setModalError(null);
      setModalOpen(true);
      return;
    }

    try {
      await applyUpdate(false, "");
      toast.success("Announcement banner is off.");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to update announcement"
      );
    }
  };

  const openEditMessage = () => {
    if (!isSuperAdmin || saving) return;
    setDraft(message);
    setModalError(null);
    setModalOpen(true);
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const trimmed = draft.trim();
    if (!trimmed) {
      setModalError("An announcement message is required.");
      return;
    }
    if (trimmed.length > ANNOUNCEMENT_MESSAGE_MAX_LENGTH) {
      setModalError(
        `Keep the message to ${ANNOUNCEMENT_MESSAGE_MAX_LENGTH} characters or fewer.`
      );
      return;
    }

    const wasOn = enabled;
    setModalError(null);
    try {
      await applyUpdate(true, trimmed);
      setModalOpen(false);
      toast.success(
        wasOn ? "Announcement updated." : "Announcement banner is now live."
      );
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Failed to update announcement"
      );
    }
  };

  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.SETTINGS}>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Announcement banner
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              A notice strip across the top of the storefront. Independent of
              online store status, so it shows whether the store is open or
              closed.
            </p>
          </div>

          {!isSuperAdmin ? (
            <div className="flex gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>
                Only a <strong>super admin</strong> can change the announcement
                banner. Contact a super admin if you need it turned on or off.
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
                <Megaphone className="h-5 w-5 text-gray-600" />
                Storefront notice
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
                        Show announcement banner
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xl">
                        Appears above the navigation on every storefront page.
                        When the store is also closed, the closure notice sits
                        above this one.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {saving && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label="Show announcement banner"
                        disabled={!isSuperAdmin || saving}
                        onClick={() => handleToggle(!enabled)}
                        className={cn(
                          "inline-flex w-14 h-8 shrink-0 cursor-pointer rounded-full p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13aaff] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                          enabled
                            ? "bg-emerald-500 justify-end"
                            : "bg-gray-300 justify-start"
                        )}
                      >
                        <span className="pointer-events-none h-6 w-6 rounded-full bg-white shadow-sm ring-1 ring-black/5" />
                      </button>
                      <span
                        className={cn(
                          "text-sm font-medium tabular-nums min-w-[3.5rem]",
                          enabled ? "text-emerald-700" : "text-gray-600"
                        )}
                      >
                        {enabled ? "On" : "Off"}
                      </span>
                    </div>
                  </div>

                  {enabled && (
                    <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-sky-900">
                            Message shown to customers
                          </p>
                          <p className="mt-1 text-sm text-sky-950 break-words whitespace-pre-line">
                            {message}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={openEditMessage}
                          disabled={!isSuperAdmin || saving}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => {
            if (!saving) setModalOpen(false);
          }}
          title={enabled ? "Edit announcement" : "Turn on announcement banner"}
          size="md"
        >
          <form onSubmit={handleMessageSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">
              This shows as a strip across the top of every storefront page. A
              message is required to turn the banner on.
            </p>
            <div>
              <label
                htmlFor="announcement-message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Announcement message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="announcement-message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                maxLength={ANNOUNCEMENT_MESSAGE_MAX_LENGTH}
                autoFocus
                placeholder="e.g. Free delivery on orders above Rs 499 this week."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#13aaff] focus:border-transparent"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span>Write it in the language your customers read.</span>
                <span className="tabular-nums">
                  {draft.trim().length}/{ANNOUNCEMENT_MESSAGE_MAX_LENGTH}
                </span>
              </div>
            </div>
            {modalError && <p className="text-sm text-red-600">{modalError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving || !draft.trim()}
              >
                {saving ? "Saving..." : enabled ? "Save message" : "Turn on"}
              </Button>
            </div>
          </form>
        </Modal>
      </PermissionGuard>
    </DashboardLayout>
  );
}
