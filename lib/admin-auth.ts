import { supabase, Profile } from '@/lib/supabase';

/**
 * Checks if a user has admin access based on email domain
 */
export function isAdminEmail(email: string): boolean {
  const lowerEmail = email.toLowerCase();
  return lowerEmail.endsWith('@futuretrendsent.com') || lowerEmail.endsWith('@futuretrendsent.info');
}

/**
 * Checks if the current profile has admin privileges
 */
export function isAdmin(profile: Profile | null): boolean {
  if (!profile) return false;
  return profile.is_admin === true && isAdminEmail(profile.email);
}

/**
 * Validates admin access on authentication callback
 */
export async function validateAdminAccess(userId: string): Promise<{ 
  isValid: boolean; 
  error?: string 
}> {
  try {
    // Fetch the user's profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email, is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      return { isValid: false, error: 'Failed to verify admin status' };
    }

    if (!profile) {
      return { isValid: false, error: 'Profile not found' };
    }

    // Check if email is from futurtrendsent domain
    if (!isAdminEmail(profile.email)) {
      // Sign out unauthorized user
      await supabase.auth.signOut();
      return { 
        isValid: false, 
        error: 'Access denied. Only @futurtrendsent.com accounts are allowed.' 
      };
    }

    // Ensure is_admin flag is set
    if (!profile.is_admin) {
      await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId);
    }

    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.message };
  }
}
