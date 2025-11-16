import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { AdminsPage as AdminsPageComponent } from "@/components/admins/admins-page";
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function AdminsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.ADMINS}>
        <AdminsPageComponent />
      </PermissionGuard>
    </DashboardLayout>
  );
}
