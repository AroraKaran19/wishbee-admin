import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { AnalyticsPage as AnalyticsPageComponent } from '@/components/analytics/analytics-page';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.ANALYTICS}>
        <AnalyticsPageComponent />
      </PermissionGuard>
    </DashboardLayout>
  );
}
