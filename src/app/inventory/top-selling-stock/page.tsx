import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TopSellingPage } from '@/components/inventory/top-selling-page';

export default function TopSellingStockPage() {
  return (
    <DashboardLayout>
      <TopSellingPage />
    </DashboardLayout>
  );
}
