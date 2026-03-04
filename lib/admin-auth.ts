import { supabase, Profile } from '@/lib/supabase';

/**
 * Checks if a user has admin access based on email domain
 */
export function isAdminEmail(email: string): boolean {
  const lowerEmail = email.toLowerCase();
  return lowerEmail.endsWith('@futuretrendsent.info');
}

/**
 * Checks if the current profile has admin privileges
 * Now auto-updates the is_admin flag if email domain is correct
 */
export function isAdmin(profile: Profile | null): boolean {
  if (!profile) return false;
  
  // Check email domain first - this is the source of truth
  const hasAdminEmail = isAdminEmail(profile.email);
  
  // If they have admin email but role/is_admin is not set, update it in background
  if (hasAdminEmail && (profile.role !== 'admin' || !profile.is_admin)) {
    console.log('isAdmin: Fixing admin role for', profile.email, 'Current role:', profile.role);
    // Update the flag in the background (don't block)
    supabase
      .from('profiles')
      .update({ is_admin: true, role: 'admin' })
      .eq('id', profile.id)
      .then(({ error }) => {
        if (error) {
          console.error('isAdmin: Failed to auto-update admin role:', error);
        } else {
          console.log('isAdmin: Successfully auto-updated admin role for', profile.email);
        }
      });
  }
  
  // Allow access IMMEDIATELY if they have the correct email domain
  // Don't wait for database update
  return hasAdminEmail;
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

    // Check if email is from futuretrendsent.info domain
    if (!isAdminEmail(profile.email)) {
      // Sign out unauthorized user
      await supabase.auth.signOut();
      return { 
        isValid: false, 
        error: 'Access denied. Only @futuretrendsent.info accounts are allowed.' 
      };
    }

    // Ensure is_admin flag and role are set
    if (!profile.is_admin) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true, role: 'admin' })
        .eq('id', userId);
      
      if (updateError) {
        console.error('validateAdminAccess: Failed to update admin flags:', updateError);
      } else {
        console.log('validateAdminAccess: Updated admin flags for', profile.email);
      }
    }

    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err.message };
  }
}
