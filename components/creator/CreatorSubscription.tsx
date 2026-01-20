'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Subscription } from '@/lib/supabase';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';

export function CreatorSubscription() {
  const { profile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadSubscription();
    }
  }, [profile]);

  const loadSubscription = async () => {
    if (!profile) return;

    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      setSubscription(data ?? null);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Creator Subscription</h2>
        <p className="text-gray-600 mt-1">
          Manage your creator membership and upload limits
        </p>
      </div>

      <SubscriptionCard subscription={subscription} onUpdate={loadSubscription} />
    </div>
  );
}
