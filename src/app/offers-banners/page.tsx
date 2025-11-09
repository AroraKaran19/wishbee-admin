import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { OffersBannersPage } from '@/components/offers-banners/offers-banners-page';

export default function OffersBannersPageRoute() {
  return (
    <DashboardLayout>
      <OffersBannersPage />
    </DashboardLayout>
  );
}
