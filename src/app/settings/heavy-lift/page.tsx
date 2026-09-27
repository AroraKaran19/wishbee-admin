'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { heavyLiftApi, type HeavyLiftGroup } from '@/lib/api/heavy-lift';
import { GroupModal } from '@/components/settings/heavy-lift/group-modal';
import { GroupTable } from '@/components/settings/heavy-lift/group-table';

type Editing = { group: HeavyLiftGroup | null } | null;

export default function HeavyLiftSettingsPage() {
  const [groups, setGroups] = useState<HeavyLiftGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [pendingDelete, setPendingDelete] = useState<HeavyLiftGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      setGroups(await heavyLiftApi.list());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load Heavy Lift groups.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const groupNames = useMemo(() => new Map(groups.map((g) => [g._id, g.name])), [groups]);

  const finishModal = (message: string) => {
    setEditing(null);
    toast.success(message);
    loadGroups();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await heavyLiftApi.remove(pendingDelete._id);
      toast.success(`Deleted ${pendingDelete.name}`);
      setPendingDelete(null);
      await loadGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete the group.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.SETTINGS}>
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Heavy Lift Charge</h1>
              <p className="mt-1 text-sm text-gray-500">
                Per-unit charge on heavy products, paid in full to the delivery partner.
              </p>
            </div>
            <Button type="button" onClick={() => setEditing({ group: null })}>
              <Plus className="mr-1.5 h-4 w-4" />
              New group
            </Button>
          </div>

          <GroupTable
            groups={groups}
            onManage={(group) => setEditing({ group })}
            onDelete={setPendingDelete}
          >
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : loadError ? (
              <div className="px-4 py-10 text-center text-sm">
                <p className="text-danger">{loadError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    loadGroups();
                  }}
                  className="mt-2 text-primary hover:underline cursor-pointer"
                >
                  Try again
                </button>
              </div>
            ) : groups.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm font-medium text-gray-900">No Heavy Lift groups yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Create a group such as 10 to 15 kg, set its charge, and add the products it covers.
                </p>
                <Button type="button" onClick={() => setEditing({ group: null })} className="mt-4">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New group
                </Button>
              </div>
            ) : undefined}
          </GroupTable>
        </div>

        {editing && (
          <GroupModal
            key={editing.group?._id ?? 'new'}
            group={editing.group}
            groupNames={groupNames}
            onClose={() => setEditing(null)}
            onSaved={finishModal}
            onDeleted={finishModal}
          />
        )}

        <Modal
          isOpen={pendingDelete !== null}
          onClose={() => !deleting && setPendingDelete(null)}
          title={`Delete ${pendingDelete?.name ?? 'group'}?`}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Its {pendingDelete?.productCount ?? 0} product(s) will stop carrying a Heavy Lift Charge. Past
              orders keep the amount they were charged.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="muted" onClick={() => setPendingDelete(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={confirmDelete} disabled={deleting}>
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete group
              </Button>
            </div>
          </div>
        </Modal>
      </PermissionGuard>
    </DashboardLayout>
  );
}
