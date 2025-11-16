import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { SupportPage as SupportPageComponent } from '@/components/support/support-page';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function SupportPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.SUPPORT}>
        <SupportPageComponent />
      </PermissionGuard>
    </DashboardLayout>
  );
}
