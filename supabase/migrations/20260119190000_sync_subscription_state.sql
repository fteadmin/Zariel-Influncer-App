BEGIN;

CREATE OR REPLACE FUNCTION public.apply_stripe_subscription(stripe_row stripe_subscriptions)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user uuid;
  normalized_status text;
  plan_type text;
  period_start timestamptz;
  period_end timestamptz;
BEGIN
  SELECT user_id
    INTO target_user
  FROM stripe_customers
  WHERE customer_id = stripe_row.customer_id
  LIMIT 1;

  IF target_user IS NULL THEN
    RETURN;
  END IF;

  normalized_status := CASE
    WHEN stripe_row.status IN ('active', 'trialing', 'past_due') THEN 'active'
    WHEN stripe_row.status = 'canceled' THEN 'cancelled'
    ELSE 'expired'
  END;

  period_start := COALESCE(to_timestamp(stripe_row.current_period_start), now());
  period_end := COALESCE(to_timestamp(stripe_row.current_period_end), period_start + interval '30 days');

  plan_type := CASE
    WHEN stripe_row.current_period_start IS NOT NULL
         AND stripe_row.current_period_end IS NOT NULL
         AND (to_timestamp(stripe_row.current_period_end) - to_timestamp(stripe_row.current_period_start)) >= interval '300 days'
      THEN 'yearly'
    ELSE 'monthly'
  END;

  INSERT INTO subscriptions (
    user_id,
    plan_type,
    status,
    current_period_start,
    current_period_end,
    videos_uploaded_this_period,
    created_at,
    updated_at
  ) VALUES (
    target_user,
    plan_type,
    normalized_status,
    period_start,
    period_end,
    0,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET plan_type = EXCLUDED.plan_type,
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        videos_uploaded_this_period = CASE
          WHEN subscriptions.current_period_start IS DISTINCT FROM EXCLUDED.current_period_start THEN 0
          ELSE subscriptions.videos_uploaded_this_period
        END,
        updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_stripe_subscription_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.apply_stripe_subscription(NEW);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_app_subscription ON stripe_subscriptions;

CREATE TRIGGER trg_sync_app_subscription
AFTER INSERT OR UPDATE ON stripe_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_stripe_subscription_change();

-- backfill existing subscription rows so the application table is populated immediately
SELECT public.apply_stripe_subscription(s)
FROM stripe_subscriptions s
WHERE s.deleted_at IS NULL;

COMMIT;
