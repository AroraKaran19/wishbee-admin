import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { OutOfStockPage } from '@/components/inventory/out-of-stock-page';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function OutOfStockItemsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.INVENTORY}>
        <OutOfStockPage />
      </PermissionGuard>
    </DashboardLayout>
  );
}
