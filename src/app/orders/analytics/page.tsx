import { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { OrderAnalyticsPage } from '@/components/orders/order-analytics-page';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function OrdersAnalyticsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.ORDERS}>
        <Suspense fallback={null}>
          <OrderAnalyticsPage />
        </Suspense>
      </PermissionGuard>
    </DashboardLayout>
  );
}
