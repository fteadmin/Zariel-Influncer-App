BEGIN;

-- Remove duplicate subscriptions so we can enforce a single record per user
DELETE FROM subscriptions a
USING subscriptions b
WHERE a.user_id = b.user_id
  AND a.id < b.id;

-- Ensure each user has at most one subscription record
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);

COMMIT;
