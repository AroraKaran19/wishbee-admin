import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MostSellingPage as MostSellingPageComponent } from '@/components/most-selling/most-selling-page';

export default function MostSellingPage() {
  return (
    <DashboardLayout>
      <MostSellingPageComponent />
    </DashboardLayout>
  );
}


