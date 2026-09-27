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
import { GroupRow, ROW_GRID } from '@/components/settings/heavy-lift/group-row';
import {
  NEW_GROUP_ID,
  diffDraft,
  emptyGroup,
  type GroupDraft,
} from '@/components/settings/heavy-lift/draft';

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

export default function HeavyLiftSettingsPage() {
  const [groups, setGroups] = useState<HeavyLiftGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, GroupDraft>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HeavyLiftGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const data = await heavyLiftApi.list();
      setGroups(data);
      setLoadError(null);
      return data;
    } catch (err) {
      setLoadError(errorMessage(err, 'Could not load Heavy Lift groups.'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups().then((data) => {
      if (data?.length === 1) setExpanded(new Set([data[0]._id]));
    });
  }, [loadGroups]);

  const savedGroupOf = useMemo(() => {
    const map = new Map<string, HeavyLiftGroup>();
    groups.forEach((g) => g.products.forEach((p) => map.set(p._id, g)));
    return map;
  }, [groups]);

  const hasUnsaved = useMemo(
    () =>
      Object.entries(drafts).some(([id, draft]) => {
        if (id === NEW_GROUP_ID) return true;
        const group = groups.find((g) => g._id === id);
        return group ? diffDraft(group, draft).count > 0 : false;
      }),
    [drafts, groups]
  );

  useEffect(() => {
    if (!hasUnsaved) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsaved]);

  const setDraft = (id: string, draft: GroupDraft) => setDrafts((prev) => ({ ...prev, [id]: draft }));

  const clearDraft = (id: string) =>
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const startNewGroup = () => {
    setDraft(NEW_GROUP_ID, { name: '', fee: '', products: [] });
    setExpanded((prev) => new Set(prev).add(NEW_GROUP_ID));
  };

  const saveProducts = (groupId: string, draft: GroupDraft) =>
    heavyLiftApi.setProducts(groupId, draft.products.map((p) => p._id));

  const createGroup = async () => {
    const draft = drafts[NEW_GROUP_ID];
    if (!draft) return;
    setSavingId(NEW_GROUP_ID);
    try {
      const created = await heavyLiftApi.create({ name: draft.name.trim(), fee: parseFloat(draft.fee) });
      if (draft.products.length > 0) await saveProducts(created._id, draft);
      clearDraft(NEW_GROUP_ID);
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(NEW_GROUP_ID);
        next.add(created._id);
        return next;
      });
      await loadGroups();
      toast.success(`Created ${created.name}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the group.'));
    } finally {
      setSavingId(null);
    }
  };

  const saveGroup = async (group: HeavyLiftGroup) => {
    const draft = drafts[group._id];
    if (!draft) return;
    const diff = diffDraft(group, draft);
    setSavingId(group._id);
    try {
      if (diff.nameChanged || diff.feeChanged) {
        await heavyLiftApi.update(group._id, { name: draft.name.trim(), fee: parseFloat(draft.fee) });
      }
      if (diff.productsChanged) await saveProducts(group._id, draft);
      clearDraft(group._id);
      await loadGroups();
      toast.success(`Saved ${draft.name.trim()}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save changes.'));
    } finally {
      setSavingId(null);
    }
  };

  const discard = (id: string) => {
    clearDraft(id);
    if (id === NEW_GROUP_ID) {
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(NEW_GROUP_ID);
        return next;
      });
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await heavyLiftApi.remove(pendingDelete._id);
      clearDraft(pendingDelete._id);
      setPendingDelete(null);
      await loadGroups();
      toast.success(`Deleted ${pendingDelete.name}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the group.'));
    } finally {
      setDeleting(false);
    }
  };

  const newDraft = drafts[NEW_GROUP_ID];
  const isEmpty = !loading && !loadError && groups.length === 0 && !newDraft;

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
            <Button type="button" onClick={startNewGroup} disabled={Boolean(newDraft)}>
              <Plus className="mr-1.5 h-4 w-4" />
              New group
            </Button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div
              className={`${ROW_GRID} hidden rounded-t-xl border-b border-gray-200 bg-primary-light px-4 py-3 text-sm font-semibold text-gray-900 md:grid`}
            >
              <span className="pl-7">Group</span>
              <span>Charge per unit</span>
              <span>Products</span>
              <span />
            </div>

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
            ) : isEmpty ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm font-medium text-gray-900">No Heavy Lift groups yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Create a group such as 10 to 15 kg, set its charge, and add the products it covers.
                </p>
                <Button type="button" onClick={startNewGroup} className="mt-4">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New group
                </Button>
              </div>
            ) : (
              <ul>
                {newDraft && (
                  <GroupRow
                    group={emptyGroup}
                    draft={newDraft}
                    isNew
                    expanded={expanded.has(NEW_GROUP_ID)}
                    saving={savingId === NEW_GROUP_ID}
                    savedGroupOf={savedGroupOf}
                    onToggle={() => toggle(NEW_GROUP_ID)}
                    onDraftChange={(d) => setDraft(NEW_GROUP_ID, d)}
                    onSave={createGroup}
                    onDiscard={() => discard(NEW_GROUP_ID)}
                  />
                )}
                {groups.map((group) => (
                  <GroupRow
                    key={group._id}
                    group={group}
                    draft={drafts[group._id]}
                    expanded={expanded.has(group._id)}
                    saving={savingId === group._id}
                    savedGroupOf={savedGroupOf}
                    onToggle={() => toggle(group._id)}
                    onDraftChange={(d) => setDraft(group._id, d)}
                    onSave={() => saveGroup(group)}
                    onDiscard={() => discard(group._id)}
                    onDelete={() => setPendingDelete(group)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <Modal
          isOpen={pendingDelete !== null}
          onClose={() => !deleting && setPendingDelete(null)}
          title={`Delete ${pendingDelete?.name ?? 'group'}?`}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Its {pendingDelete?.products.length ?? 0} product(s) will stop carrying a Heavy Lift Charge.
              Past orders keep the amount they were charged.
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
