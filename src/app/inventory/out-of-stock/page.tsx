import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { OutOfStockPage } from '@/components/inventory/out-of-stock-page';

export default function OutOfStockItemsPage() {
  return (
    <DashboardLayout>
      <OutOfStockPage />
    </DashboardLayout>
  );
}
