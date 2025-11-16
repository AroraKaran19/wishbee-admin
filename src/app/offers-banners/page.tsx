import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { OffersBannersPage } from '@/components/offers-banners/offers-banners-page';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

export default function OffersBannersPageRoute() {
  return (
    <DashboardLayout>
      <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.OFFERS_BANNERS}>
        <OffersBannersPage />
      </PermissionGuard>
    </DashboardLayout>
  );
}
