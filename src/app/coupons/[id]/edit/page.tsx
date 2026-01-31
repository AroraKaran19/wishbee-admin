'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';
import { couponApi, Coupon, CreateCouponData } from '@/lib/api/coupons';
import { CouponForm } from '@/components/offers-banners/coupon-form';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchCoupon = async () => {
      try {
        setLoading(true);
        const data = await couponApi.getById(id);
        if (!cancelled) setCoupon(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          toast.error('Failed to load coupon');
          router.push('/coupons');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCoupon();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const handleSubmit = async (data: CreateCouponData) => {
    if (!id) return;
    await couponApi.update(id, data);
    toast.success('Coupon updated');
    router.push('/coupons');
  };

  const handleCancel = () => {
    router.push('/coupons');
  };

  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.OFFERS_BANNERS}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link
              href="/coupons"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to coupons
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit coupon</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Update coupon details, allowed users, and applicable products or categories.
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : coupon ? (
            <CouponForm
              coupon={coupon}
              isEdit={true}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          ) : null}
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}
