'use client';

import { CreatorBidsManager } from '@/components/dashboard/CreatorBidsManager';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ContentBidsPage() {
  return (
    <DashboardLayout>
      <CreatorBidsManager />
    </DashboardLayout>
  );
}
