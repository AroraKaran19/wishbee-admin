import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AutoReordersPage as AutoReordersPageComponent } from '@/components/auto-reorders/auto-reorders-page';

export default function AutoReordersPage() {
  return (
    <DashboardLayout>
      <AutoReordersPageComponent />
    </DashboardLayout>
  );
}
