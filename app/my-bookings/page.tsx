import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MyBookingsPage } from '@/components/services/MyBookingsPage';

export default function BookingsPage() {
  return (
    <DashboardLayout>
      <MyBookingsPage />
    </DashboardLayout>
  );
}
