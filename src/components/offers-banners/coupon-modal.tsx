'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Coupon,
  CreateCouponData,
  CouponType,
  CouponAccessType,
} from '@/lib/api/coupons';
import { customerApi } from '@/lib/api/customers';

export interface SelectedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCouponData) => Promise<void>;
  coupon?: Coupon | null;
}

const emptyForm: CreateCouponData = {
  code: '',
  type: 'percentage',
  description: '',
  value: 0,
  validFrom: '',
  validUntil: '',
  accessType: 'GENERAL',
  minimumPurchaseAmount: undefined,
  maximumDiscountAmount: undefined,
  maxUses: undefined,
  isActive: true,
};

export function CouponModal({
  isOpen,
  onClose,
  onSubmit,
  coupon,
}: CouponModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState<CreateCouponData>(emptyForm);
  const [selectedUsers, setSelectedUsers] = React.useState<SelectedUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = React.useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = React.useState('');
  const [userSearchResults, setUserSearchResults] = React.useState<any[]>([]);
  const [userSearchPage, setUserSearchPage] = React.useState(1);
  const [userSearchHasMore, setUserSearchHasMore] = React.useState(false);
  const [userSearchLoading, setUserSearchLoading] = React.useState(false);
  const [limitedError, setLimitedError] = React.useState('');
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const isEdit = !!coupon?._id;
  const selectedIds = new Set(selectedUsers.map((u) => u._id));

  useEffect(() => {
    if (!isOpen) {
      setForm(emptyForm);
      setSelectedUsers([]);
      setUserSearchQuery('');
      setDebouncedUserSearch('');
      setUserSearchResults([]);
      setUserSearchPage(1);
      return;
    }
    if (coupon) {
      setForm({
        code: coupon.code || '',
        type: coupon.type || 'percentage',
        description: coupon.description || '',
        value: coupon.value ?? 0,
        validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 16) : '',
        validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 16) : '',
        accessType: coupon.accessType || 'GENERAL',
        allowedUserIds: coupon.allowedUserIds?.length ? coupon.allowedUserIds : undefined,
        minimumPurchaseAmount: coupon.minimumPurchaseAmount,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
        maxUses: coupon.maxUses,
        isActive: coupon.isActive ?? true,
      });
      if (coupon.allowedUserIds?.length) {
        setSelectedUsers(
          coupon.allowedUserIds.map((id) => ({ _id: id }))
        );
        Promise.all(
          coupon.allowedUserIds.map((id) =>
            customerApi.getById(id).catch(() => null)
          )
        ).then((users) => {
          setSelectedUsers((prev) =>
            prev.map((p) => {
              const u = users.find((x) => x?._id === p._id);
              if (!u) return p;
              return {
                _id: u._id,
                firstName: u.firstName,
                lastName: u.lastName,
                phoneNumber: u.phoneNumber,
                email: u.email,
              };
            })
          );
        });
      } else {
        setSelectedUsers([]);
      }
    } else {
      const from = new Date();
      const to = new Date();
      to.setMonth(to.getMonth() + 1);
      setForm({
        ...emptyForm,
        validFrom: from.toISOString().slice(0, 16),
        validUntil: to.toISOString().slice(0, 16),
      });
      setSelectedUsers([]);
    }
  }, [isOpen, coupon]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUserSearch(userSearchQuery), 400);
    return () => clearTimeout(t);
  }, [userSearchQuery]);

  const fetchUserSearch = useCallback(
    async (page: number, append: boolean) => {
      setUserSearchLoading(true);
      try {
        const data = await customerApi.getAll({
          page,
          limit: 20,
          search: debouncedUserSearch || undefined,
          role: 'CUSTOMER',
        });
        const users = data.users || [];
        setUserSearchResults((prev) => (append ? [...prev, ...users] : users));
        const totalPages = data.pagination?.pages ?? 1;
        setUserSearchHasMore(page < totalPages);
        setUserSearchPage(page);
      } catch (err) {
        console.error(err);
        if (!append) setUserSearchResults([]);
      } finally {
        setUserSearchLoading(false);
      }
    },
    [debouncedUserSearch]
  );

  useEffect(() => {
    if (form.accessType !== 'LIMITED') return;
    setUserSearchPage(1);
    if (debouncedUserSearch.trim()) {
      fetchUserSearch(1, false);
    } else {
      setUserSearchResults([]);
      setUserSearchHasMore(false);
    }
  }, [form.accessType, debouncedUserSearch]);

  const loadMoreUsers = useCallback(() => {
    if (userSearchLoading || !userSearchHasMore) return;
    fetchUserSearch(userSearchPage + 1, true);
  }, [userSearchLoading, userSearchHasMore, userSearchPage, fetchUserSearch]);

  const handleSearchResultsScroll = useCallback(() => {
    const el = searchResultsRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 80) {
      loadMoreUsers();
    }
  }, [loadMoreUsers]);

  const addUser = (user: any) => {
    if (selectedIds.has(user._id)) return;
    setSelectedUsers((prev) => [
      ...prev,
      {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
      },
    ]);
  };

  const removeUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const displayName = (u: SelectedUser) => {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return name || u.phoneNumber || u.email || u._id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLimitedError('');
    if (!form.code.trim()) return;
    if (!form.validFrom || !form.validUntil) return;
    if (form.accessType === 'LIMITED' && selectedUsers.length === 0) {
      setLimitedError('Add at least one user for limited access.');
      return;
    }
    try {
      setLoading(true);
      const payload: CreateCouponData = {
        ...form,
        code: form.code.trim().toUpperCase(),
        validFrom: new Date(form.validFrom).toISOString(),
        validUntil: new Date(form.validUntil).toISOString(),
      };
      if (form.accessType === 'GENERAL') {
        delete payload.allowedUserIds;
      } else {
        payload.allowedUserIds = selectedUsers.map((u) => u._id);
      }
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="flex-1 overflow-y-auto flex flex-col"
        >
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. SAVE20"
              disabled={isEdit}
              className="uppercase"
              required
            />
            {isEdit && (
              <p className="text-xs text-gray-500 mt-1">Code cannot be changed after creation.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CouponType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
            <Input
              type="number"
              min={0}
              step={form.type === 'percentage' ? 1 : 0.01}
              value={form.value || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))
              }
              placeholder={form.type === 'percentage' ? 'e.g. 10' : 'e.g. 50'}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.type === 'percentage' ? 'Discount percentage (e.g. 10 = 10%)' : 'Discount amount (₹)'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short description for customers"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access type</label>
            <select
              value={form.accessType}
              onChange={(e) => {
                setForm((f) => ({ ...f, accessType: e.target.value as CouponAccessType }));
                setLimitedError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
            >
              <option value="GENERAL">General (everyone)</option>
              <option value="LIMITED">Limited (specific users)</option>
            </select>
          </div>
          {form.accessType === 'LIMITED' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Allowed users *
              </label>
              <p className="text-xs text-gray-500">
                Add at least one user who can use this coupon.
              </p>
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 max-h-24 overflow-y-auto">
                  {selectedUsers.map((u) => (
                    <span
                      key={u._id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-sm"
                    >
                      <span className="text-gray-800 truncate max-w-[140px]">
                        {displayName(u)}
                        {(u.phoneNumber || u.email) && (
                          <span className="text-gray-500 text-xs ml-1">
                            {u.phoneNumber || u.email}
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeUser(u._id)}
                        className="text-gray-400 hover:text-red-600 cursor-pointer p-0.5"
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Search and add users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, email..."
                    className="pl-9"
                  />
                </div>
                <div
                  ref={searchResultsRef}
                  onScroll={handleSearchResultsScroll}
                  className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto"
                >
                  {userSearchResults.map((user) => {
                    const added = selectedIds.has(user._id);
                    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.phoneNumber || user.email || user._id;
                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                          {(user.phoneNumber || user.email) && (
                            <p className="text-xs text-gray-500 truncate">
                              {user.phoneNumber || user.email}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={added}
                          onClick={() => addUser(user)}
                          className="cursor-pointer shrink-0 ml-2"
                        >
                          {added ? 'Added' : (
                            <>
                              <UserPlus className="h-3.5 w-3.5 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                  {userSearchLoading && (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                  )}
                  {!userSearchLoading && debouncedUserSearch && userSearchResults.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No users found</p>
                  )}
                  {!debouncedUserSearch && userSearchResults.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Type to search users</p>
                  )}
                </div>
                {limitedError && (
                  <p className="text-sm text-red-600 mt-1">{limitedError}</p>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid from *</label>
              <Input
                type="datetime-local"
                value={form.validFrom}
                onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid until *</label>
              <Input
                type="datetime-local"
                value={form.validUntil}
                onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min. purchase (₹)
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={form.minimumPurchaseAmount ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    minimumPurchaseAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max discount (₹)
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={form.maximumDiscountAmount ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maximumDiscountAmount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="Optional"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max uses</label>
            <Input
              type="number"
              min={0}
              value={form.maxUses ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  maxUses: e.target.value ? parseInt(e.target.value, 10) : undefined,
                }))
              }
              placeholder="Unlimited if empty"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-gray-300 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
              Active
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <Button type="button" variant="secondary" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
}
