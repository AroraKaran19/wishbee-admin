import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AnalyticsPage as AnalyticsPageComponent } from '@/components/analytics/analytics-page';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <AnalyticsPageComponent />
    </DashboardLayout>
  );
}
