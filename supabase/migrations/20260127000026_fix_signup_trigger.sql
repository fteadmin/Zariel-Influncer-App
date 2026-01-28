-- Fix handle_new_user trigger to not reference deleted token_wallets table
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile with token_balance initialized to 0
  INSERT INTO public.profiles (id, email, full_name, role, token_balance, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'creator')::user_role,
    0, -- Initialize token_balance to 0
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Trigger already exists, no need to recreate
