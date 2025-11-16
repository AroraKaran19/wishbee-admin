import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { OrderPage } from '@/components/orders/order-page';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.ORDERS}>
        <OrderPage />
      </PermissionGuard>
    </DashboardLayout>
  );
}
