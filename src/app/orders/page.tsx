import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { OrderPage } from '@/components/orders/order-page';

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <OrderPage />
    </DashboardLayout>
  );
}
