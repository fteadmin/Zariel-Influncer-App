'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Subscription } from '@/lib/supabase';
import { CompanySubscriptionCard } from '@/components/dashboard/CompanySubscriptionCard';

export function CompanySubscription() {
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
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-sm bg-[#6A7B92]" />
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6A7B92]">
            Membership
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
          Company Subscription
        </h1>
        <p className="text-[#6A7B92] text-sm font-medium mt-1.5">
          Choose a plan to unlock premium features and benefits
        </p>
      </div>

      <CompanySubscriptionCard subscription={subscription} onUpdate={loadSubscription} />
    </div>
  );
}
