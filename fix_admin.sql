-- Run this in your Supabase SQL Editor to fix admin access

-- Update all users with futurtrendsent emails to be admins
UPDATE profiles 
SET is_admin = TRUE 
WHERE email LIKE '%@futurtrendsent.com' 
   OR email LIKE '%@futurtrendsent.info';

-- Verify the update
SELECT id, email, role, is_admin 
FROM profiles 
WHERE email LIKE '%@futurtrendsent.com' 
   OR email LIKE '%@futurtrendsent.info';
