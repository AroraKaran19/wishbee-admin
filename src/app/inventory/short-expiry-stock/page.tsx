import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ShortExpiryPage } from '@/components/inventory/short-expiry-page';

export default function ShortExpiryStockPage() {
  return (
    <DashboardLayout>
      <ShortExpiryPage />
    </DashboardLayout>
  );
}
