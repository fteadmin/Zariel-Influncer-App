import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!stripeSecret || !supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing required environment variables for Stripe subscription management function.');
}

const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Zariel Subscription Management',
    version: '1.0.0',
  },
});

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type ManageAction = 'billing_portal' | 'cancel_subscription';

interface ManageRequestBody {
  action: ManageAction;
  return_url?: string;
  cancel_at_period_end?: boolean;
}

function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

async function getAuthenticatedUser(req: Request) {
  const tokenHeader = req.headers.get('x-user-token') ?? req.headers.get('Authorization');

  if (!tokenHeader) {
    return { error: 'Missing authentication token' } as const;
  }

  const token = tokenHeader.replace('Bearer', '').trim();

  if (!token) {
    return { error: 'Missing authentication token' } as const;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { error: 'Failed to authenticate user' } as const;
  }

  return { user } as const;
}

async function getCustomerIdForUser(userId: string) {
  const { data, error } = await supabase
    .from('stripe_customers')
    .select('customer_id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new Error('Failed to fetch customer mapping');
  }

  return data?.customer_id ?? null;
}

async function getSubscriptionIdForCustomer(customerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('stripe_subscriptions')
    .select('subscription_id')
    .eq('customer_id', customerId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new Error('Failed to fetch subscription record');
  }

  if (data?.subscription_id) {
    return data.subscription_id;
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 1,
  });

  const subscription = subscriptions.data.at(0);

  return subscription?.id ?? null;
}

async function syncStripeSubscriptionRow(customerId: string, subscription: Stripe.Subscription) {
  const primaryItem = subscription.items.data[0];

  const payload = {
    customer_id: customerId,
    subscription_id: subscription.id,
    price_id: primaryItem?.price?.id ?? null,
    current_period_start: subscription.current_period_start ?? null,
    current_period_end: subscription.current_period_end ?? null,
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    status: subscription.status,
  };

  const { error } = await supabase.from('stripe_subscriptions').upsert(payload, {
    onConflict: 'customer_id',
  });

  if (error) {
    throw new Error('Failed to persist subscription changes');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse(null, 204);
  }

  if (req.method !== 'POST') {
    return corsResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const authResult = await getAuthenticatedUser(req);

    if ('error' in authResult) {
      return corsResponse({ error: authResult.error }, 401);
    }

    const { user } = authResult;

    let body: ManageRequestBody;

    try {
      body = await req.json();
    } catch {
      return corsResponse({ error: 'Invalid request payload' }, 400);
    }

    if (!body?.action) {
      return corsResponse({ error: 'Missing action' }, 400);
    }

    const customerId = await getCustomerIdForUser(user.id);

    if (!customerId) {
      return corsResponse({ error: 'No Stripe customer found for user' }, 400);
    }

    if (body.action === 'billing_portal') {
      const fallbackReturnUrl =
        body.return_url || req.headers.get('origin') || new URL(req.url).origin;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: fallbackReturnUrl,
      });

      return corsResponse({ url: portalSession.url });
    }

    if (body.action === 'cancel_subscription') {
      const cancelAtPeriodEnd = body.cancel_at_period_end ?? true;
      const subscriptionId = await getSubscriptionIdForCustomer(customerId);

      if (!subscriptionId) {
        return corsResponse({ error: 'No active subscription to cancel' }, 400);
      }

      const subscription = cancelAtPeriodEnd
        ? await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
        : await stripe.subscriptions.cancel(subscriptionId);

      await syncStripeSubscriptionRow(customerId, subscription);

      return corsResponse({
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
        subscription_id: subscription.id,
      });
    }

    return corsResponse({ error: 'Unsupported action' }, 400);
  } catch (error: any) {
    console.error('Stripe manage subscription error:', error);
    return corsResponse({ error: error.message || 'Unexpected error' }, 500);
  }
});
