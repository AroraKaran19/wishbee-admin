'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';
import { couponApi, CreateCouponData } from '@/lib/api/coupons';
import { CouponForm } from '@/components/offers-banners/coupon-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function NewCouponPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateCouponData) => {
    await couponApi.create(data);
    toast.success('Coupon created');
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
            <h1 className="text-xl font-bold text-gray-900">Create coupon</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Add a new coupon. Optionally restrict by users, products, or categories.
            </p>
          </div>
          <CouponForm
            coupon={null}
            isEdit={false}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}
