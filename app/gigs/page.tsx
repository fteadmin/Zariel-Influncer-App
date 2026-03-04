import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GigsPage } from '@/components/gigs/GigsPage';

export const metadata = {
  title: 'Gigs | Zariel',
  description: 'Browse gig opportunities posted by the Zariel team.',
};

export default function GigsRoute() {
  return (
    <DashboardLayout>
      <GigsPage />
    </DashboardLayout>
  );
}
