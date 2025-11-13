import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SupportPage as SupportPageComponent } from '@/components/support/support-page';

export default function SupportPage() {
  return (
    <DashboardLayout>
      <SupportPageComponent />
    </DashboardLayout>
  );
}
