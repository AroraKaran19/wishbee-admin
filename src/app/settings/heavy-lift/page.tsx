'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dumbbell, Plus, Trash2, Save, Loader2, Search, X, PackagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { heavyLiftApi, type HeavyLiftGroup } from '@/lib/api/heavy-lift';
import { productApi } from '@/lib/api/products';
import { formatCurrency } from '@/lib/utils';

interface SearchProduct {
  _id: string;
  name?: string;
  sku?: string;
}

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

export default function HeavyLiftSettingsPage() {
  const [groups, setGroups] = useState<HeavyLiftGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newFee, setNewFee] = useState('');
  const [creating, setCreating] = useState(false);

  const [edits, setEdits] = useState<Record<string, { name: string; fee: string }>>({});
  const [pickerGroupId, setPickerGroupId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HeavyLiftGroup | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const data = await heavyLiftApi.list();
      setGroups(data);
      setEdits(
        Object.fromEntries(data.map((g) => [g._id, { name: g.name, fee: String(g.fee) }]))
      );
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to load Heavy Lift groups'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!pickerGroupId || !debouncedSearch) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    productApi
      .getAll({ page: 1, limit: 20, search: debouncedSearch })
      .then((response: any) => {
        const products = response.data?.products || response.data || response;
        if (!cancelled) setResults(Array.isArray(products) ? products : []);
      })
      .catch(() => !cancelled && setResults([]))
      .finally(() => !cancelled && setSearching(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, pickerGroupId]);

  const groupOfProduct = useMemo(() => {
    const map = new Map<string, HeavyLiftGroup>();
    groups.forEach((g) => g.products.forEach((p) => map.set(p._id, g)));
    return map;
  }, [groups]);

  const parseFee = (value: string): number | null => {
    const fee = parseFloat(value);
    return Number.isFinite(fee) && fee >= 0 ? fee : null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFee(newFee);
    if (!newName.trim()) return toast.error('Give the group a name, e.g. 10 to 15 kg');
    if (fee === null) return toast.error('Enter a charge of 0 or more');
    try {
      setCreating(true);
      await heavyLiftApi.create({ name: newName.trim(), fee });
      setNewName('');
      setNewFee('');
      toast.success('Group created');
      await loadGroups();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to create group'));
    } finally {
      setCreating(false);
    }
  };

  const handleSaveGroup = async (group: HeavyLiftGroup) => {
    const edit = edits[group._id];
    const fee = parseFee(edit?.fee ?? '');
    if (!edit?.name.trim()) return toast.error('Group name is required');
    if (fee === null) return toast.error('Enter a charge of 0 or more');
    try {
      setBusyGroupId(group._id);
      await heavyLiftApi.update(group._id, { name: edit.name.trim(), fee });
      toast.success('Group updated');
      await loadGroups();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update group'));
    } finally {
      setBusyGroupId(null);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      setBusyGroupId(pendingDelete._id);
      await heavyLiftApi.remove(pendingDelete._id);
      toast.success('Group deleted');
      if (pickerGroupId === pendingDelete._id) setPickerGroupId(null);
      setPendingDelete(null);
      await loadGroups();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete group'));
    } finally {
      setBusyGroupId(null);
    }
  };

  const saveProducts = async (group: HeavyLiftGroup, productIds: string[], success: string) => {
    try {
      setBusyGroupId(group._id);
      await heavyLiftApi.setProducts(group._id, productIds);
      toast.success(success);
      await loadGroups();
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update products'));
    } finally {
      setBusyGroupId(null);
    }
  };

  const addProduct = (group: HeavyLiftGroup, product: SearchProduct) =>
    saveProducts(
      group,
      [...group.products.map((p) => p._id), product._id],
      `${product.name || 'Product'} added to ${group.name}`
    );

  const removeProduct = (group: HeavyLiftGroup, productId: string) =>
    saveProducts(
      group,
      group.products.filter((p) => p._id !== productId).map((p) => p._id),
      'Product removed'
    );

  const togglePicker = (groupId: string) => {
    setPickerGroupId((current) => (current === groupId ? null : groupId));
    setSearch('');
    setResults([]);
  };

  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.SETTINGS}>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Heavy Lift Charge</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Group heavy products and set a charge per unit. Customers see it as the Heavy Lift
              Charge, noted as paid in full to the delivery partner. A product can be in only one
              group; adding it to another group moves it.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-5 w-5 text-gray-600" />
                New group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="new-group-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    id="new-group-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. 10 to 15 kg"
                    className="w-56"
                    disabled={creating}
                  />
                </div>
                <div>
                  <label htmlFor="new-group-fee" className="block text-sm font-medium text-gray-700 mb-1">
                    Charge per unit (₹)
                  </label>
                  <Input
                    id="new-group-fee"
                    type="number"
                    min={0}
                    step={1}
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-32"
                    disabled={creating}
                  />
                </div>
                <Button type="submit" disabled={creating} className="cursor-pointer">
                  {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create group
                </Button>
              </form>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : groups.length === 0 ? (
            <p className="text-sm text-gray-500">No groups yet. No product carries a Heavy Lift Charge.</p>
          ) : (
            groups.map((group) => {
              const busy = busyGroupId === group._id;
              const edit = edits[group._id] ?? { name: group.name, fee: String(group.fee) };
              const pickerOpen = pickerGroupId === group._id;
              return (
                <Card key={group._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Dumbbell className="h-5 w-5 text-gray-600" />
                      {group.name}
                      <span className="text-sm font-normal text-gray-500">
                        {formatCurrency(group.fee)} per unit, {group.products.length} product
                        {group.products.length === 1 ? '' : 's'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-end gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`name-${group._id}`}>
                          Name
                        </label>
                        <Input
                          id={`name-${group._id}`}
                          value={edit.name}
                          onChange={(e) =>
                            setEdits((prev) => ({ ...prev, [group._id]: { ...edit, name: e.target.value } }))
                          }
                          className="w-56"
                          disabled={busy}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`fee-${group._id}`}>
                          Charge per unit (₹)
                        </label>
                        <Input
                          id={`fee-${group._id}`}
                          type="number"
                          min={0}
                          step={1}
                          value={edit.fee}
                          onChange={(e) =>
                            setEdits((prev) => ({ ...prev, [group._id]: { ...edit, fee: e.target.value } }))
                          }
                          className="w-32"
                          disabled={busy}
                        />
                      </div>
                      <Button type="button" variant="secondary" onClick={() => handleSaveGroup(group)} disabled={busy} className="cursor-pointer">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button type="button" variant="danger" onClick={() => setPendingDelete(group)} disabled={busy} className="cursor-pointer">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.products.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No products in this group yet.</p>
                      )}
                      {group.products.map((p) => (
                        <span
                          key={p._id}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
                        >
                          {p.name}
                          <button
                            type="button"
                            onClick={() => removeProduct(group, p._id)}
                            disabled={busy}
                            className="text-gray-400 hover:text-red-600 cursor-pointer"
                            aria-label={`Remove ${p.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <Button type="button" variant="secondary" onClick={() => togglePicker(group._id)} className="cursor-pointer">
                      <PackagePlus className="h-4 w-4 mr-2" />
                      {pickerOpen ? 'Close product search' : 'Add products'}
                    </Button>

                    {pickerOpen && (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products by name or SKU..."
                            className="pl-9"
                            autoFocus
                          />
                        </div>
                        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto bg-white">
                          {results.map((product) => {
                            const current = groupOfProduct.get(product._id);
                            const inThisGroup = current?._id === group._id;
                            return (
                              <div
                                key={product._id}
                                className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name || product.sku || product._id}
                                  </p>
                                  {current && !inThisGroup && (
                                    <p className="text-xs text-amber-700">Currently in {current.name}</p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  disabled={inThisGroup || busy}
                                  onClick={() => addProduct(group, product)}
                                  className="cursor-pointer shrink-0"
                                >
                                  {inThisGroup ? 'Added' : current ? 'Move here' : 'Add'}
                                </Button>
                              </div>
                            );
                          })}
                          {searching && (
                            <div className="flex justify-center py-3">
                              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            </div>
                          )}
                          {!searching && results.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                              {debouncedSearch ? 'No products found' : 'Type to search products'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
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
              <Button type="button" variant="secondary" onClick={() => setPendingDelete(null)} className="cursor-pointer">
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={busyGroupId === pendingDelete?._id}
                className="cursor-pointer"
              >
                Delete group
              </Button>
            </div>
          </div>
        </Modal>
      </PermissionGuard>
    </DashboardLayout>
  );
}
