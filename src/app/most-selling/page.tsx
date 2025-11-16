import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { MostSellingPage as MostSellingPageComponent } from '@/components/most-selling/most-selling-page';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function MostSellingPage() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.MOST_SELLING}>
        <MostSellingPageComponent />
      </PermissionGuard>
    </DashboardLayout>
  );
}


