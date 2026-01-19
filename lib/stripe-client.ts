import { supabase, supabaseAnonKey } from './supabase';

export interface CheckoutSessionParams {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession(params: CheckoutSessionParams) {
  const { priceId, mode, successUrl, cancelUrl } = params;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const success = successUrl || `${currentUrl}/?success=true`;
  const cancel = cancelUrl || `${currentUrl}/?canceled=true`;
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  if (!accessToken) {
    throw new Error('Please sign in to continue with checkout.');
  }

  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      'x-user-token': `Bearer ${accessToken}`,
    },
    body: {
      price_id: priceId,
      mode,
      success_url: success,
      cancel_url: cancel,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return data;
}

export function redirectToCheckout(sessionUrl: string) {
  if (typeof window !== 'undefined') {
    window.location.href = sessionUrl;
  }
}

interface ManageSubscriptionPayload {
  action: 'billing_portal' | 'cancel_subscription';
  return_url?: string;
  cancel_at_period_end?: boolean;
}

async function invokeManageSubscription(body: ManageSubscriptionPayload) {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;

  if (!accessToken) {
    throw new Error('Please sign in to manage your subscription.');
  }

  const { data, error } = await supabase.functions.invoke('stripe-manage-subscription', {
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      'x-user-token': `Bearer ${accessToken}`,
    },
    body,
  });

  if (error) {
    throw new Error(error.message || 'Failed to manage subscription');
  }

  return data as { url?: string } & Record<string, any>;
}

export async function createBillingPortalSession(returnUrl?: string) {
  const fallbackReturnUrl =
    returnUrl || (typeof window !== 'undefined' ? window.location.origin : undefined);

  return invokeManageSubscription({
    action: 'billing_portal',
    return_url: fallbackReturnUrl,
  });
}

export async function cancelActiveSubscription(options?: { cancelAtPeriodEnd?: boolean }) {
  return invokeManageSubscription({
    action: 'cancel_subscription',
    cancel_at_period_end: options?.cancelAtPeriodEnd ?? true,
  });
}
