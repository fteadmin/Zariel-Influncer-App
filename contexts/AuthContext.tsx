'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('AuthContext: Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*, token_balance')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      console.log('AuthContext: Loaded profile:', data);
      console.log('AuthContext: Token balance:', data.token_balance);
      setProfile(data as Profile);
    } else if (error) {
      console.error('AuthContext: Error loading profile:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('AuthContext: No profile found for user:', userId);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to profile changes for real-time updates
  useEffect(() => {
    if (!user) return;

    console.log('AuthContext: Setting up real-time subscription for profile updates');
    const profileSubscription = supabase
      .channel(`profile-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('AuthContext: Profile updated via real-time:', payload);
          if (payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('AuthContext: Cleaning up profile subscription');
      profileSubscription.unsubscribe();
    };
  }, [user]);

  const signOut = async () => {
    console.log('🔓 SignOut: Starting sign out process...');
    try {
      // Clear local state first
      console.log('🔓 SignOut: Clearing React state...');
      setUser(null);
      setProfile(null);
      
      // Sign out from Supabase
      console.log('🔓 SignOut: Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ SignOut: Supabase error:', error);
      } else {
        console.log('✅ SignOut: Supabase signOut successful');
      }
      
      // Clear any auth-related items from localStorage/sessionStorage
      if (typeof window !== 'undefined') {
        console.log('🔓 SignOut: Clearing localStorage and sessionStorage...');
        
        // Clear all Supabase auth keys from localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('supabase')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('🔓 SignOut: Removed Supabase keys:', keysToRemove);
        
        sessionStorage.clear();
        console.log('🔓 SignOut: Storage cleared');
        
        // Use location.replace instead of href for better cache clearing
        console.log('🔓 SignOut: Redirecting to home page...');
        setTimeout(() => {
          window.location.replace('/');
        }, 100);
      }
    } catch (error) {
      console.error('❌ SignOut: Caught error:', error);
      // Force reload anyway to clear state
      if (typeof window !== 'undefined') {
        console.log('🔓 SignOut: Force clearing all storage...');
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.error('❌ SignOut: Error clearing storage:', e);
        }
        console.log('🔓 SignOut: Force redirecting...');
        window.location.replace('/');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
