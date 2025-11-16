import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ProfilePage } from '@/components/settings/profile-page';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.SETTINGS}>
        <ProfilePage />
      </PermissionGuard>
    </DashboardLayout>
  );
}
