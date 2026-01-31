'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Search, UserPlus, X, Package, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Coupon,
  CreateCouponData,
  CouponType,
  CouponAccessType,
} from '@/lib/api/coupons';
import { customerApi } from '@/lib/api/customers';
import { productApi } from '@/lib/api/products';
import { categoryApi } from '@/lib/api/categories';

export interface SelectedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface SelectedProduct {
  _id: string;
  name?: string;
  sku?: string;
}

export interface SelectedCategory {
  _id: string;
  name?: string;
  slug?: string;
}

interface CouponFormProps {
  coupon?: Coupon | null;
  isEdit: boolean;
  onSubmit: (data: CreateCouponData) => Promise<void>;
  onCancel: () => void;
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

export function CouponForm({
  coupon,
  isEdit,
  onSubmit,
  onCancel,
}: CouponFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateCouponData>(emptyForm);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategory[]>([]);
  const [limitedError, setLimitedError] = useState('');

  // User search
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [userSearchPage, setUserSearchPage] = useState(1);
  const [userSearchHasMore, setUserSearchHasMore] = useState(false);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const userResultsRef = useRef<HTMLDivElement>(null);

  // Product search
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<any[]>([]);
  const [productSearchPage, setProductSearchPage] = useState(1);
  const [productSearchHasMore, setProductSearchHasMore] = useState(false);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const productResultsRef = useRef<HTMLDivElement>(null);

  // Category search
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [debouncedCategorySearch, setDebouncedCategorySearch] = useState('');
  const [categorySearchResults, setCategorySearchResults] = useState<any[]>([]);
  const [categorySearchPage, setCategorySearchPage] = useState(1);
  const [categorySearchHasMore, setCategorySearchHasMore] = useState(false);
  const [categorySearchLoading, setCategorySearchLoading] = useState(false);
  const categoryResultsRef = useRef<HTMLDivElement>(null);

  const selectedUserIds = new Set(selectedUsers.map((u) => u._id));
  const selectedProductIds = new Set(selectedProducts.map((p) => p._id));
  const selectedCategoryIds = new Set(selectedCategories.map((c) => c._id));

  // Initialize form from coupon (edit mode)
  useEffect(() => {
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
        applicableProducts: coupon.applicableProducts,
        applicableCategories: coupon.applicableCategories,
        minimumPurchaseAmount: coupon.minimumPurchaseAmount,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
        maxUses: coupon.maxUses,
        isActive: coupon.isActive ?? true,
      });
      if (coupon.allowedUserIds?.length) {
        setSelectedUsers(coupon.allowedUserIds.map((id) => ({ _id: id })));
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
      // Pre-fill products/categories as IDs only; we'll show names when we fetch
      if (coupon.applicableProducts?.length) {
        setSelectedProducts(
          coupon.applicableProducts.map((id) => ({ _id: id }))
        );
        Promise.all(
          coupon.applicableProducts.map((id) =>
            productApi.getById(id).catch(() => null)
          )
        ).then((prods) => {
          setSelectedProducts((prev) =>
            prev.map((p) => {
              const raw = prods.find((x) => (x && ((x as any).data?._id ?? (x as any)._id) === p._id));
              const prod = raw && (raw as any).data ? (raw as any).data : raw;
              if (!prod) return p;
              return {
                _id: prod._id,
                name: prod.name,
                sku: prod.sku,
              };
            })
          );
        });
      } else {
        setSelectedProducts([]);
      }
      if (coupon.applicableCategories?.length) {
        setSelectedCategories(
          coupon.applicableCategories.map((id) => ({ _id: id }))
        );
        Promise.all(
          coupon.applicableCategories.map((id) =>
            categoryApi.getById(id).catch(() => null)
          )
        ).then((res) => {
          const cats = res.map((r: any) => (r && r.data ? r.data : r));
          setSelectedCategories((prev) =>
            prev.map((p) => {
              const cat = cats.find((x: any) => x?._id === p._id);
              if (!cat) return p;
              return {
                _id: cat._id,
                name: cat.name,
                slug: cat.slug,
              };
            })
          );
        });
      } else {
        setSelectedCategories([]);
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
      setSelectedProducts([]);
      setSelectedCategories([]);
    }
  }, [coupon]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUserSearch(userSearchQuery), 400);
    return () => clearTimeout(t);
  }, [userSearchQuery]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedProductSearch(productSearchQuery), 400);
    return () => clearTimeout(t);
  }, [productSearchQuery]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCategorySearch(categorySearchQuery), 400);
    return () => clearTimeout(t);
  }, [categorySearchQuery]);

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

  const fetchProductSearch = useCallback(
    async (page: number, append: boolean) => {
      setProductSearchLoading(true);
      try {
        const response = await productApi.getAll({
          page,
          limit: 20,
          search: debouncedProductSearch || undefined,
          status: 'ACTIVE',
        });
        const products = response.data?.products || response.data || response;
        const list = Array.isArray(products) ? products : [];
        setProductSearchResults((prev) => (append ? [...prev, ...list] : list));
        const totalPages = response.data?.totalPages ?? 1;
        setProductSearchHasMore(page < totalPages);
        setProductSearchPage(page);
      } catch (err) {
        console.error(err);
        if (!append) setProductSearchResults([]);
      } finally {
        setProductSearchLoading(false);
      }
    },
    [debouncedProductSearch]
  );

  const fetchCategorySearch = useCallback(
    async (page: number, append: boolean) => {
      setCategorySearchLoading(true);
      try {
        const response = await categoryApi.getAll({
          page,
          limit: 20,
          isActive: true,
          search: debouncedCategorySearch || undefined,
        });
        const categories = response.data?.categories || response.data || response;
        const list = Array.isArray(categories) ? categories : [];
        setCategorySearchResults((prev) => (append ? [...prev, ...list] : list));
        const totalPages = response.data?.totalPages ?? 1;
        setCategorySearchHasMore(page < totalPages);
        setCategorySearchPage(page);
      } catch (err) {
        console.error(err);
        if (!append) setCategorySearchResults([]);
      } finally {
        setCategorySearchLoading(false);
      }
    },
    [debouncedCategorySearch]
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

  useEffect(() => {
    setProductSearchPage(1);
    fetchProductSearch(1, false);
  }, [debouncedProductSearch, fetchProductSearch]);

  useEffect(() => {
    setCategorySearchPage(1);
    fetchCategorySearch(1, false);
  }, [debouncedCategorySearch, fetchCategorySearch]);

  const loadMoreUsers = useCallback(() => {
    if (userSearchLoading || !userSearchHasMore) return;
    fetchUserSearch(userSearchPage + 1, true);
  }, [userSearchLoading, userSearchHasMore, userSearchPage, fetchUserSearch]);

  const loadMoreProducts = useCallback(() => {
    if (productSearchLoading || !productSearchHasMore) return;
    fetchProductSearch(productSearchPage + 1, true);
  }, [productSearchLoading, productSearchHasMore, productSearchPage, fetchProductSearch]);

  const loadMoreCategories = useCallback(() => {
    if (categorySearchLoading || !categorySearchHasMore) return;
    fetchCategorySearch(categorySearchPage + 1, true);
  }, [categorySearchLoading, categorySearchHasMore, categorySearchPage, fetchCategorySearch]);

  const handleUserResultsScroll = useCallback(() => {
    const el = userResultsRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 80) loadMoreUsers();
  }, [loadMoreUsers]);

  const handleProductResultsScroll = useCallback(() => {
    const el = productResultsRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 80) loadMoreProducts();
  }, [loadMoreProducts]);

  const handleCategoryResultsScroll = useCallback(() => {
    const el = categoryResultsRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 80) loadMoreCategories();
  }, [loadMoreCategories]);

  const addUser = (user: any) => {
    if (selectedUserIds.has(user._id)) return;
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

  const addProduct = (product: any) => {
    if (selectedProductIds.has(product._id)) return;
    setSelectedProducts((prev) => [
      ...prev,
      { _id: product._id, name: product.name, sku: product.sku },
    ]);
  };

  const removeProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const addCategory = (category: any) => {
    if (selectedCategoryIds.has(category._id)) return;
    setSelectedCategories((prev) => [
      ...prev,
      { _id: category._id, name: category.name, slug: category.slug },
    ]);
  };

  const removeCategory = (id: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c._id !== id));
  };

  const displayUserName = (u: SelectedUser) => {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return name || u.phoneNumber || u.email || u._id;
  };

  const displayProductName = (p: SelectedProduct) =>
    p.name || p.sku || p._id;

  const displayCategoryName = (c: SelectedCategory) =>
    c.name || c.slug || c._id;

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
      // Always send arrays so backend persists/clears product and category restrictions correctly
      payload.applicableProducts = selectedProducts.map((p) => p._id);
      payload.applicableCategories = selectedCategories.map((c) => c._id);
      await onSubmit(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chip = (
    label: string,
    onRemove: () => void,
    key: string
  ) => (
    <span
      key={key}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm"
    >
      <span className="text-gray-800 truncate max-w-[160px]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-600 cursor-pointer p-0.5"
        aria-label="Remove"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            {form.type === 'percentage' ? 'Discount %' : 'Discount amount (₹)'}
          </p>
        </div>
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
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700">Allowed users *</label>
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {selectedUsers.map((u) =>
                chip(displayUserName(u), () => removeUser(u._id), u._id)
              )}
            </div>
          )}
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
            ref={userResultsRef}
            onScroll={handleUserResultsScroll}
            className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white"
          >
            {userSearchResults.map((user) => {
              const added = selectedUserIds.has(user._id);
              const name =
                [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                user.phoneNumber ||
                user.email ||
                user._id;
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
              <div className="flex justify-center py-3">
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
          {limitedError && <p className="text-sm text-red-600">{limitedError}</p>}
        </div>
      )}

      {/* Applicable products */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700">
          <Package className="inline h-4 w-4 mr-1.5" />
          Applicable products (optional)
        </label>
        <p className="text-xs text-gray-500">
          Leave empty to apply to all products. Add products to restrict this coupon to specific items.
        </p>
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {selectedProducts.map((p) =>
              chip(displayProductName(p), () => removeProduct(p._id), p._id)
            )}
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="pl-9"
          />
        </div>
        <div
          ref={productResultsRef}
          onScroll={handleProductResultsScroll}
          className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white"
        >
          {productSearchResults.map((product) => {
            const added = selectedProductIds.has(product._id);
            const name = product.name || product.sku || product._id;
            return (
              <div
                key={product._id}
                className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                  {product.sku && (
                    <p className="text-xs text-gray-500 truncate">{product.sku}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={added}
                  onClick={() => addProduct(product)}
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
          {productSearchLoading && (
            <div className="flex justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
          {!productSearchLoading && productSearchResults.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              {debouncedProductSearch ? 'No products found' : 'Type to search products'}
            </p>
          )}
        </div>
      </div>

      {/* Applicable categories */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700">
          <FolderOpen className="inline h-4 w-4 mr-1.5" />
          Applicable categories (optional)
        </label>
        <p className="text-xs text-gray-500">
          Leave empty to apply to all categories. Add categories to restrict this coupon.
        </p>
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {selectedCategories.map((c) =>
              chip(displayCategoryName(c), () => removeCategory(c._id), c._id)
            )}
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={categorySearchQuery}
            onChange={(e) => setCategorySearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="pl-9"
          />
        </div>
        <div
          ref={categoryResultsRef}
          onScroll={handleCategoryResultsScroll}
          className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white"
        >
          {categorySearchResults.map((category) => {
            const added = selectedCategoryIds.has(category._id);
            const name = category.name || category.slug || category._id;
            return (
              <div
                key={category._id}
                className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={added}
                  onClick={() => addCategory(category)}
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
          {categorySearchLoading && (
            <div className="flex justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
          {!categorySearchLoading && categorySearchResults.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              {debouncedCategorySearch ? 'No categories found' : 'Type to search categories'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min. purchase (₹)</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Max discount (₹)</label>
          <Input
            type="number"
            min={0}
            step={1}
            value={form.maximumDiscountAmount ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                maximumDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined,
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

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel} className="cursor-pointer">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading ? 'Saving...' : isEdit ? 'Update coupon' : 'Create coupon'}
        </Button>
      </div>
    </form>
  );
}
