'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProfilesGrid } from '@/components/profiles/ProfilesGrid';
import { Loader2 } from 'lucide-react';

export default function ProfilesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center h-screen gradient-bg">
        <div className="text-center space-y-4 animate-scale-in glass-card p-8 rounded-2xl border border-primary/30">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <ProfilesGrid />
    </DashboardLayout>
  );
}
