import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LongUnsoldPage } from '@/components/inventory/long-unsold-page';

export default function LongUnsoldStockPage() {
  return (
    <DashboardLayout>
      <LongUnsoldPage />
    </DashboardLayout>
  );
}
