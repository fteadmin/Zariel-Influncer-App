import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MyServicesManager } from '@/components/services/MyServicesManager';

export default function MyServicesPage() {
  return (
    <DashboardLayout>
      <MyServicesManager />
    </DashboardLayout>
  );
}
