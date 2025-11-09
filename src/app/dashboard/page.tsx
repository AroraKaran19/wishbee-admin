import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardPage as DashboardPageComponent } from '@/components/dashboard/dashboard-page';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardPageComponent />
    </DashboardLayout>
  );
}
