import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CustomerPage } from '@/components/customers/customer-page';

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <CustomerPage />
    </DashboardLayout>
  );
}
