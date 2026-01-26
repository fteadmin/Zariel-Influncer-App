'use client';

import { ServicesMarketplace } from '@/components/services/ServicesMarketplace';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <ServicesMarketplace />
    </DashboardLayout>
  );
}
