'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { supabase, Profile } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProfileDetail } from '@/components/profiles/ProfileDetail';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfileDetailPage() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profileId || !user) return;

    async function fetchProfile() {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        setError('Failed to load profile.');
      } else if (!data) {
        setError('Profile not found.');
      } else {
        setProfile(data as Profile);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [profileId, user]);

  if (authLoading || !user || !authProfile) {
    return (
      <div className="flex items-center justify-center h-screen gradient-bg">
        <div className="text-center space-y-4 animate-scale-in glass-card p-8 rounded-2xl border border-primary/30">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-[#A7D129]" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-gray-700 font-semibold">{error}</p>
          <Link href="/profiles">
            <Button variant="outline">Back to Profiles</Button>
          </Link>
        </div>
      ) : profile ? (
        <ProfileDetail profile={profile} />
      ) : null}
    </DashboardLayout>
  );
}
