'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, MessageCircle, Zap, ArrowDownLeft, ArrowUpRight, Briefcase } from 'lucide-react';
import { AccountSettingsDialog } from './AccountSettingsDialog';

interface Notif {
  id: string; title: string; time: string;
  type: 'transaction' | 'booking' | 'gig'; amount?: number; incoming?: boolean;
}

interface GigNotifRow {
  id: string;
  read: boolean;
  created_at: string;
  gigs: { title: string }[] | { title: string } | null;
}

export function TopNav() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unreadGigs, setUnreadGigs] = useState(0);
  const chatActive = pathname?.startsWith('/chat');
  const isAdmin = profile?.is_admin || profile?.role === 'admin';

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      try { localStorage.clear(); sessionStorage.clear(); } catch {}
      window.location.href = '/';
    }
  };

  const loadNotifs = useCallback(async () => {
    if (!profile) return;
    try {
      const uid = profile.id;
      const [txRes, bRes, gigRes] = await Promise.all([
        supabase.from('token_transactions').select('id,amount,transaction_type,description,created_at,from_user_id,to_user_id').or(`from_user_id.eq.${uid},to_user_id.eq.${uid}`).order('created_at', { ascending: false }).limit(5),
        supabase.from('service_bookings').select('id,created_at,status,services(title)').or(`service_owner_id.eq.${uid},user_id.eq.${uid}`).order('created_at', { ascending: false }).limit(5),
        // Non-admins get gig notifications; admins don't need them
        !isAdmin
          ? supabase.from('gig_notifications').select('id,read,created_at,gigs(title)').eq('user_id', uid).order('created_at', { ascending: false }).limit(5)
          : Promise.resolve({ data: [] }),
      ]);
      const gigNotifs: GigNotifRow[] = (gigRes.data || []) as GigNotifRow[];
      const unread = gigNotifs.filter(g => !g.read).length;
      setUnreadGigs(unread);
      const all: Notif[] = [
        ...(txRes.data || []).map((t: any) => ({ id: `tx-${t.id}`, type: 'transaction' as const, title: t.description || t.transaction_type, time: new Date(t.created_at).toLocaleString(), amount: t.amount, incoming: t.to_user_id === uid })),
        ...(bRes.data || []).map((b: any) => ({ id: `bk-${b.id}`, type: 'booking' as const, title: `Booking ${b.status} · ${(b.services as any)?.title || 'Service'}`, time: new Date(b.created_at).toLocaleString() })),
        ...gigNotifs.map((g) => { const gigsData = g.gigs; const title = Array.isArray(gigsData) ? gigsData[0]?.title : gigsData?.title; return { id: `gig-${g.id}`, type: 'gig' as const, title: `New Gig: ${title || 'Untitled'}`, time: new Date(g.created_at).toLocaleString() }; }),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
      setNotifs(all);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, isAdmin]);

  useEffect(() => {
    if (!profile) return;
    loadNotifs();
  }, [profile, loadNotifs]);

  // Realtime: re-fetch when a new gig_notification lands for this user
  useEffect(() => {
    if (!profile || isAdmin) return;
    const ch = supabase
      .channel(`topnav-gig-notifs-${profile.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gig_notifications', filter: `user_id=eq.${profile.id}` }, () => {
        loadNotifs();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile, loadNotifs]);

  return (
    <>
      <nav className="h-16 flex items-center justify-end px-6 bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-20 shadow-sm">
        {/* Right side only - Token balance, Chat, Notifications */}
        <div className="flex items-center gap-2">
          
          {/* Token pill */}
          {profile && (
            <div className="flex items-center gap-1.5 bg-[#A7D129]/10 border border-[#A7D129]/20 px-3 py-1.5 rounded-full">
              <Zap className="w-3 h-3 text-[#A7D129]" />
              <span className="text-xs font-black text-gray-900">{(profile.token_balance || 0).toLocaleString()}</span>
              <span className="text-[10px] text-[#6A7B92] font-bold uppercase tracking-wide">Zaryo</span>
            </div>
          )}

          {/* Chat */}
          <Link href="/chat">
            <button className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
              chatActive
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}>
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </button>
          </Link>

          {/* Notifications */}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all">
                <Bell className="h-4.5 w-4.5" />
                {(notifs.length > 0 || unreadGigs > 0) && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#A7D129] rounded-full border-2 border-white flex items-center justify-center">
                    {unreadGigs > 0 && (
                      <span className="text-[9px] font-black text-gray-900 px-0.5">{unreadGigs > 9 ? '9+' : unreadGigs}</span>
                    )}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white border border-gray-100 shadow-xl shadow-gray-200/80 rounded-2xl overflow-hidden" align="end" sideOffset={12}>

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Notifications</h3>
                  <p className="text-xs text-[#6A7B92] mt-0.5">
                    {notifs.length} updates{unreadGigs > 0 ? ` · ${unreadGigs} new gig${unreadGigs > 1 ? 's' : ''}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#A7D129]/10 border border-[#A7D129]/20 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-[#A7D129] rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-[#A7D129] uppercase tracking-wider">Live</span>
                </div>
              </div>

              {/* Items */}
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifs.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-400">No activity yet</p>
                  </div>
                ) : notifs.map((n) => (
                  <div key={n.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        n.type === 'transaction'
                          ? n.incoming ? 'bg-[#A7D129]/12 text-[#A7D129]' : 'bg-[#6A7B92]/10 text-[#6A7B92]'
                          : n.type === 'gig'
                          ? 'bg-[#A7D129]/15 text-[#A7D129]'
                          : 'bg-[#6A7B92]/10 text-[#6A7B92]'
                      }`}>
                        {n.type === 'transaction'
                          ? n.incoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />
                          : n.type === 'gig'
                          ? <Briefcase className="w-4 h-4" />
                          : <Bell className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{n.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                      {n.amount != null && (
                        <span className={`text-xs font-black flex-shrink-0 ${n.incoming ? 'text-[#A7D129]' : 'text-[#6A7B92]'}`}>
                          {n.incoming ? '+' : '-'}{n.amount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <Link href="/notifications" onClick={() => setNotifOpen(false)}>
                  <button className="text-xs font-black text-[#6A7B92] hover:text-gray-900 transition-colors">
                    View all activity →
                  </button>
                </Link>
                <Link href="/gigs" onClick={() => setNotifOpen(false)}>
                  <button className="text-xs font-black text-[#A7D129] hover:text-[#A7D129]/80 transition-colors flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Gigs board
                  </button>
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      <AccountSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}