import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';
import { CashierManagementPage as CashierManagementPageComponent } from '@/components/cashier/cashier-management-page';

export default function CashierManagementPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.ADMINS}>
        <CashierManagementPageComponent />
      </PermissionGuard>
    </DashboardLayout>
  );
}
