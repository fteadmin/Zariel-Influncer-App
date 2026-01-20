-- Add admin role to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;

-- Add comment
COMMENT ON COLUMN profiles.is_admin IS 'TRUE if user is an admin with @futurtrendsent email';

-- Function to automatically set admin status based on email domain
CREATE OR REPLACE FUNCTION check_admin_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email ends with @futurtrendsent.com or @futurtrendsent.info
  IF NEW.email LIKE '%@futurtrendsent.com' OR NEW.email LIKE '%@futurtrendsent.info' THEN
    NEW.is_admin := TRUE;
  ELSE
    NEW.is_admin := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run on insert and update
DROP TRIGGER IF EXISTS set_admin_on_email ON profiles;
CREATE TRIGGER set_admin_on_email
  BEFORE INSERT OR UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_admin_email();

-- Update existing users with futurtrendsent email to admin
UPDATE profiles 
SET is_admin = TRUE 
WHERE email LIKE '%@futurtrendsent.com' OR email LIKE '%@futurtrendsent.info';
