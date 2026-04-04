'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Zap } from 'lucide-react';

// ============================================================
// SIMPLIFIED TopNav for landing page + profiles webapp.
// PRESERVED: Old TopNav code is below (commented out).
// It had notifications popover, chat link, gig notifications,
// token_transactions/service_bookings queries, and AccountSettingsDialog.
// ============================================================

export function TopNav() {
  const { profile } = useAuth();

  return (
    <nav className="h-16 flex items-center justify-end px-6 bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2">
        {/* Token pill */}
        {profile && (
          <div className="flex items-center gap-1.5 bg-[#A7D129]/10 border border-[#A7D129]/20 px-3 py-1.5 rounded-full">
            <Zap className="w-3 h-3 text-[#A7D129]" />
            <span className="text-xs font-black text-gray-900">{(profile.token_balance || 0).toLocaleString()}</span>
            <span className="text-[10px] text-[#6A7B92] font-bold uppercase tracking-wide">Zaryo</span>
          </div>
        )}

        {profile && (
          <Link href="/my-profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-lg object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-[#A7D129] flex items-center justify-center text-[10px] font-black text-white">
                {(profile.display_name || '?')[0].toUpperCase()}
              </div>
            )}
            <span className="hidden sm:inline">{profile.display_name || 'Profile'}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

// ============================================================
// PRESERVED: Old TopNav with full notifications, chat, settings
// ============================================================
//
// import { useEffect, useState, useCallback } from 'react';
// import { usePathname } from 'next/navigation';
// import { supabase } from '@/lib/supabase';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Bell, MessageCircle, Zap, ArrowDownLeft, ArrowUpRight, Briefcase } from 'lucide-react';
// import { AccountSettingsDialog } from './AccountSettingsDialog';
//
// interface Notif {
//   id: string; title: string; time: string;
//   type: 'transaction' | 'booking' | 'gig'; amount?: number; incoming?: boolean;
// }
//
// interface GigNotifRow {
//   id: string;
//   read: boolean;
//   created_at: string;
//   gigs: { title: string }[] | { title: string } | null;
// }
//
// export function OldTopNav() {
//   const { profile } = useAuth();
//   const pathname = usePathname();
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const [notifOpen, setNotifOpen] = useState(false);
//   const [notifs, setNotifs] = useState<Notif[]>([]);
//   const [unreadGigs, setUnreadGigs] = useState(0);
//   const chatActive = pathname?.startsWith('/chat');
//   const isAdmin = profile?.is_admin || profile?.role === 'admin';
//
//   const handleSignOut = () => {
//     if (typeof window !== 'undefined') {
//       try { localStorage.clear(); sessionStorage.clear(); } catch {}
//       window.location.href = '/';
//     }
//   };
//
//   const loadNotifs = useCallback(async () => {
//     if (!profile) return;
//     try {
//       const uid = profile.id;
//       const [txRes, bRes, gigRes] = await Promise.all([
//         supabase.from('token_transactions').select('id,amount,transaction_type,description,created_at,from_user_id,to_user_id').or(`from_user_id.eq.${uid},to_user_id.eq.${uid}`).order('created_at', { ascending: false }).limit(5),
//         supabase.from('service_bookings').select('id,created_at,status,services(title)').or(`service_owner_id.eq.${uid},user_id.eq.${uid}`).order('created_at', { ascending: false }).limit(5),
//         !isAdmin
//           ? supabase.from('gig_notifications').select('id,read,created_at,gigs(title)').eq('user_id', uid).order('created_at', { ascending: false }).limit(5)
//           : Promise.resolve({ data: [] }),
//       ]);
//       const gigNotifs: GigNotifRow[] = (gigRes.data || []) as GigNotifRow[];
//       const unread = gigNotifs.filter(g => !g.read).length;
//       setUnreadGigs(unread);
//       const all: Notif[] = [
//         ...(txRes.data || []).map((t: any) => ({ id: `tx-${t.id}`, type: 'transaction' as const, title: t.description || t.transaction_type, time: new Date(t.created_at).toLocaleString(), amount: t.amount, incoming: t.to_user_id === uid })),
//         ...(bRes.data || []).map((b: any) => ({ id: `bk-${b.id}`, type: 'booking' as const, title: `Booking ${b.status} · ${(b.services as any)?.title || 'Service'}`, time: new Date(b.created_at).toLocaleString() })),
//         ...gigNotifs.map((g) => { const gigsData = g.gigs; const title = Array.isArray(gigsData) ? gigsData[0]?.title : gigsData?.title; return { id: `gig-${g.id}`, type: 'gig' as const, title: `New Gig: ${title || 'Untitled'}`, time: new Date(g.created_at).toLocaleString() }; }),
//       ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
//       setNotifs(all);
//     } catch {}
//   }, [profile, isAdmin]);
//
//   useEffect(() => {
//     if (!profile) return;
//     loadNotifs();
//   }, [profile, loadNotifs]);
//
//   // ... rest of old TopNav JSX with notifications popover, chat button, etc.
//   // ... AccountSettingsDialog
// }
