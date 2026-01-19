BEGIN;

-- Ensure subscription records mirror the latest Stripe cancellation flags
UPDATE subscriptions s
SET cancel_at_period_end = COALESCE(ss.cancel_at_period_end, false),
    current_period_end = COALESCE(
      CASE WHEN ss.current_period_end IS NOT NULL THEN to_timestamp(ss.current_period_end) END,
      s.current_period_end
    ),
    status = CASE
      WHEN ss.status IN ('active', 'trialing', 'past_due') THEN 'active'
      WHEN ss.status = 'canceled' THEN 'cancelled'
      ELSE s.status
    END,
    updated_at = now()
FROM stripe_customers sc
JOIN stripe_subscriptions ss ON ss.customer_id = sc.customer_id
WHERE sc.user_id = s.user_id;

-- Re-run the sync helper to capture any rows the trigger may have missed
SELECT public.apply_stripe_subscription(ss)
FROM stripe_subscriptions ss
WHERE ss.deleted_at IS NULL;

COMMIT;
