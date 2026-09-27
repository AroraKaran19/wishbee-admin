'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { heavyLiftApi, type HeavyLiftGroup, type HeavyLiftGroupProduct } from '@/lib/api/heavy-lift';
import { GroupRow } from '@/components/settings/heavy-lift/group-row';
import { NewGroupRow } from '@/components/settings/heavy-lift/new-group-row';

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

const validate = (name: string, fee: number): string | null => {
  if (!name.trim()) return 'Group name is required';
  if (!Number.isFinite(fee) || fee < 0) return 'Enter a charge of 0 or more';
  return null;
};

export default function HeavyLiftSettingsPage() {
  const [groups, setGroups] = useState<HeavyLiftGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<HeavyLiftGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  const groupsRef = useRef<HeavyLiftGroup[]>([]);
  const syncQueue = useRef<Promise<void>>(Promise.resolve());

  const commit = (next: HeavyLiftGroup[]) => {
    groupsRef.current = next;
    setGroups(next);
  };

  const loadGroups = useCallback(async () => {
    try {
      const data = await heavyLiftApi.list();
      groupsRef.current = data;
      setGroups(data);
      if (data.length === 1) setExpanded(new Set([data[0]._id]));
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load Heavy Lift groups'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const groupOfProduct = useMemo(() => {
    const map = new Map<string, HeavyLiftGroup>();
    groups.forEach((g) => g.products.forEach((p) => map.set(p._id, g)));
    return map;
  }, [groups]);

  // Saves run in order and send the latest list, so rapid edits cannot overwrite each other.
  const syncGroupProducts = (groupId: string) => {
    syncQueue.current = syncQueue.current.then(async () => {
      const group = groupsRef.current.find((g) => g._id === groupId);
      if (!group) return;
      try {
        await heavyLiftApi.setProducts(groupId, group.products.map((p) => p._id));
      } catch (err) {
        toast.error(errorMessage(err, 'Could not save products; reloaded the latest list'));
        await loadGroups();
      }
    });
  };

  const addProduct = (groupId: string, product: HeavyLiftGroupProduct) => {
    commit(
      groupsRef.current.map((g) => {
        const others = g.products.filter((p) => p._id !== product._id);
        return g._id === groupId ? { ...g, products: [product, ...others] } : { ...g, products: others };
      })
    );
    syncGroupProducts(groupId);
  };

  const removeProduct = (groupId: string, productId: string) => {
    commit(
      groupsRef.current.map((g) =>
        g._id === groupId ? { ...g, products: g.products.filter((p) => p._id !== productId) } : g
      )
    );
    syncGroupProducts(groupId);
  };

  const createGroup = async (name: string, fee: number): Promise<boolean> => {
    const problem = validate(name, fee);
    if (problem) {
      toast.error(problem);
      return false;
    }
    try {
      const created = await heavyLiftApi.create({ name: name.trim(), fee });
      commit([...groupsRef.current, { ...created, products: [] }]);
      setExpanded((prev) => new Set(prev).add(created._id));
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to create group'));
      return false;
    }
  };

  const renameGroup = async (groupId: string, name: string, fee: number): Promise<boolean> => {
    const problem = validate(name, fee);
    if (problem) {
      toast.error(problem);
      return false;
    }
    try {
      await heavyLiftApi.update(groupId, { name: name.trim(), fee });
      commit(groupsRef.current.map((g) => (g._id === groupId ? { ...g, name: name.trim(), fee } : g)));
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update group'));
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await heavyLiftApi.remove(pendingDelete._id);
      commit(groupsRef.current.filter((g) => g._id !== pendingDelete._id));
      setPendingDelete(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete group'));
    } finally {
      setDeleting(false);
    }
  };

  const toggle = (groupId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });

  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.SETTINGS}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Heavy Lift Charge</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Charged per unit and paid in full to the delivery partner. A product belongs to one group at most.
              </p>
            </div>
            <Button type="button" onClick={() => setCreating(true)} disabled={creating}>
              <Plus className="h-4 w-4 mr-1.5" />
              New group
            </Button>
          </div>

          <Card className="overflow-visible">
            {creating && <NewGroupRow onCreate={createGroup} onCancel={() => setCreating(false)} />}

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : groups.length === 0 && !creating ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No groups yet, so no product carries a Heavy Lift Charge.{' '}
                <button type="button" onClick={() => setCreating(true)} className="text-primary hover:underline cursor-pointer">
                  Create the first group
                </button>
              </div>
            ) : (
              <ul>
                {groups.map((group) => (
                  <GroupRow
                    key={group._id}
                    group={group}
                    expanded={expanded.has(group._id)}
                    groupOfProduct={groupOfProduct}
                    onToggle={() => toggle(group._id)}
                    onRename={(name, fee) => renameGroup(group._id, name, fee)}
                    onDelete={() => setPendingDelete(group)}
                    onAddProduct={(product) => addProduct(group._id, product)}
                    onRemoveProduct={(productId) => removeProduct(group._id, productId)}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Modal
          isOpen={pendingDelete !== null}
          onClose={() => setPendingDelete(null)}
          title="Delete group?"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {pendingDelete?.name} will be deleted and its {pendingDelete?.products.length ?? 0}{' '}
              product(s) will stop carrying a Heavy Lift Charge. Past orders keep what they were charged.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={confirmDelete} disabled={deleting}>
                Delete group
              </Button>
            </div>
          </div>
        </Modal>
      </PermissionGuard>
    </DashboardLayout>
  );
}
