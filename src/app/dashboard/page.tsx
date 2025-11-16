import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { DashboardPage as DashboardPageComponent } from '@/components/dashboard/dashboard-page';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.DASHBOARD}>
        <DashboardPageComponent />
      </PermissionGuard>
    </DashboardLayout>
  );
}
