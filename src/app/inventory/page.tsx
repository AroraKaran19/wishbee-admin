import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { InventorySummary } from '@/components/dashboard/inventory-summary';

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <InventorySummary />
    </DashboardLayout>
  );
}
