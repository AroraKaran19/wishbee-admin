import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { CustomerPage } from '@/components/customers/customer-page';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.CUSTOMERS}>
        <CustomerPage />
      </PermissionGuard>
    </DashboardLayout>
  );
}
