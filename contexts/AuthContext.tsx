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

  const fetchProfile = async (userId: string, retries = 4) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Retry for signup race condition
    if (!error && !data && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return fetchProfile(userId, retries - 1);
    }

    if (!error && data) {
      // ============================================================
      // PRESERVED: Old admin auto-fix logic (for old webapp Supabase)
      // Uncomment if re-enabling admin features with @futuretrendsent.info domain.
      // ============================================================
      // const email = data.email?.toLowerCase() || '';
      // const shouldBeAdmin = email.endsWith('@futuretrendsent.info');
      // const needsUpdate = shouldBeAdmin && (data.role !== 'admin' || !data.is_admin);
      //
      // if (needsUpdate) {
      //   try {
      //     const { data: updated, error: updateError } = await supabase
      //       .from('profiles')
      //       .update({ role: 'admin', is_admin: true })
      //       .eq('id', userId)
      //       .select('*, token_balance')
      //       .single();
      //
      //     if (!updateError && updated) {
      //       setProfile(updated as Profile);
      //       return;
      //     }
      //   } catch (err) {
      //     console.error('AuthContext: Error updating admin role:', err);
      //   }
      // }

      setProfile(data as Profile);
    } else if (error) {
      console.error('AuthContext: Error loading profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
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

  // Real-time profile updates
  useEffect(() => {
    if (!user) return;

    const profileSubscription = supabase
      .channel(`profile-updates-${user.id}`)
      // PRESERVED: Old INSERT listener (for signup flow that creates profile client-side)
      // .on(
      //   'postgres_changes',
      //   { event: 'INSERT', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
      //   (payload) => {
      //     if (payload.new) setProfile(payload.new as Profile);
      //   }
      // )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => { profileSubscription.unsubscribe(); };
  }, [user]);

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      await supabase.auth.signOut();

      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('supabase')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        sessionStorage.clear();
        setTimeout(() => { window.location.replace('/'); }, 100);
      }
    } catch {
      if (typeof window !== 'undefined') {
        try { localStorage.clear(); sessionStorage.clear(); } catch {}
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
