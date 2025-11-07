import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AutoReorderDetailPage } from '@/components/auto-reorders/auto-reorder-detail-page';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AutoReorderDetailsRoute({ params }: PageProps) {
  const { id } = await params;

  // Mock lookup - in a real app, fetch from API using id
  const mock = {
    id,
    customer: {
      name: 'Aniket nayak',
      phone: '+91-9876543210',
      email: 'aniket@gmail.com',
      address: '123 Green Street, Gopalganj - 841428',
      gender: 'Male',
      gst: '1234567890',
    },
    products: 'Amul Milk (2), Bread (1)',
    frequency: 'Weekly (Every Monday)',
    nextDate: '15 July 2025',
    preferredSlot: '8:00 AM – 10:00 AM',
    paymentMethod: 'UPI',
    lastAutoReorder: '8 July 2025 – Delivered',
    status: 'Active' as const,
  };

  return (
    <DashboardLayout>
      <AutoReorderDetailPage data={mock} />
    </DashboardLayout>
  );
}


