import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Profile type matching the mobile app's profiles table schema
export type UserRole = 'member' | 'admin' | 'superadmin';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  tier: string;
  role: UserRole;
  token_balance: number;
  membership_id: string | null;
  membership_qr_data: string | null;
  expo_push_token: string | null;
  stripe_customer_id: string | null;
  bio: string | null;
  website: string | null;
  user_type: string | null;
  banned: boolean;
  created_at: string;
  updated_at: string;
}
