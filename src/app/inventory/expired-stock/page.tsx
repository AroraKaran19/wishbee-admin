import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ExpiredPage } from '@/components/inventory/expired-page';

export default function ExpiredStockPage() {
  return (
    <DashboardLayout>
      <ExpiredPage />
    </DashboardLayout>
  );
}
