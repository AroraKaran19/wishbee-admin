import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LowQuantityPage } from '@/components/inventory/low-quantity-page';

export default function LowQuantityStockPage() {
  return (
    <DashboardLayout>
      <LowQuantityPage />
    </DashboardLayout>
  );
}
