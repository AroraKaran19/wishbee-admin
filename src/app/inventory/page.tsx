import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { InventorySummary } from '@/components/dashboard/inventory-summary';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.INVENTORY}>
        <InventorySummary />
      </PermissionGuard>
    </DashboardLayout>
  );
}
