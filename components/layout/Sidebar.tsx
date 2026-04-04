'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users, UserCircle, LogOut, Menu, X, Home,
  // PRESERVED: Old sidebar icons — uncomment if re-enabling old nav items
  // LayoutDashboard, Store, FileVideo, ShoppingBag,
  // Coins, CreditCard, Settings, HelpCircle, Gavel,
  // Briefcase, Package, Zap, ClipboardList, CalendarCheck,
  // Receipt, Shield,
} from 'lucide-react';
import { useState } from 'react';
// PRESERVED: Old sidebar imports — uncomment if re-enabling old features
// import { supabase } from '@/lib/supabase';
// import { AccountSettingsDialog } from '@/components/layout/AccountSettingsDialog';
// import { HelpDialog } from '@/components/layout/HelpDialog';

// ============================================================
// ACTIVE NAV: Simplified for landing page + profiles webapp
// ============================================================
const NAV = [
  { name: 'Profiles',    href: '/profiles',    icon: Users },
  { name: 'My Profile',  href: '/my-profile',  icon: UserCircle },
];

// ============================================================
// PRESERVED: Old nav items (for dashboard/marketplace/admin features)
// Uncomment and replace NAV above to re-enable.
// ============================================================
// const OLD_NAV = [
//   { name: 'Dashboard',        href: '/dashboard',       icon: LayoutDashboard },
//   { name: 'Profiles',         href: '/profiles',        icon: Users },
//   { name: 'Products',         href: '/products',        icon: Package },
//   { name: 'Services',         href: '/services',        icon: Briefcase },
//   { name: 'Gigs',             href: '/gigs',            icon: Zap },
//   { name: 'Booking Requests', href: '/my-services',     icon: ClipboardList },
//   { name: 'My Bookings',      href: '/my-bookings',     icon: CalendarCheck },
//   { name: 'Marketplace',      href: '/marketplace',     icon: Store },
//   { name: 'My Content',       href: '/my-content',      icon: FileVideo },
//   { name: 'Content Bids',     href: '/content-bids',    icon: Gavel },
//   { name: 'My Purchases',     href: '/my-purchases',    icon: Receipt },
//   { name: 'Subscription',     href: '/subscription',    icon: CreditCard },
//   { name: 'Tokens',           href: '/token-management',icon: Coins },
// ];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // PRESERVED: Old sidebar state — uncomment if re-enabling settings/help dialogs
  // const [settingsOpen, setSettingsOpen] = useState(false);
  // const [helpOpen, setHelpOpen] = useState(false);
  // const [unreadGigs, setUnreadGigs] = useState(0);
  // const isAdmin = profile?.is_admin || profile?.role === 'admin';

  // PRESERVED: Old gig notification logic
  // const fetchUnread = async () => {
  //   if (!profile || isAdmin) return;
  //   try {
  //     const { count } = await supabase
  //       .from('gig_notifications')
  //       .select('*', { count: 'exact', head: true })
  //       .eq('user_id', profile.id)
  //       .eq('read', false);
  //     setUnreadGigs(count || 0);
  //   } catch {}
  // };
  //
  // useEffect(() => { fetchUnread(); }, [profile]);
  //
  // useEffect(() => {
  //   if (pathname === '/gigs' && unreadGigs > 0 && profile && !isAdmin) {
  //     supabase
  //       .from('gig_notifications')
  //       .update({ read: true })
  //       .eq('user_id', profile.id)
  //       .eq('read', false)
  //       .then(() => setUnreadGigs(0));
  //   }
  // }, [pathname]);
  //
  // useEffect(() => {
  //   if (!profile || isAdmin) return;
  //   const ch = supabase
  //     .channel(`sidebar-gig-${profile.id}`)
  //     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gig_notifications', filter: `user_id=eq.${profile.id}` }, () => { fetchUnread(); })
  //     .subscribe();
  //   return () => { supabase.removeChannel(ch); };
  // }, [profile]);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm"
      >
        {mobileOpen ? <X className="h-4 w-4 text-gray-700" /> : <Menu className="h-4 w-4 text-gray-500" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 bg-white/95 backdrop-blur-xl border-r border-gray-200/80 shadow-sm',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex flex-col h-full">

          {/* Logo area */}
          <div className="px-6 pt-6 pb-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A7D129] to-[#A7D129]/80 rounded-xl flex items-center justify-center shadow-lg shadow-[#A7D129]/25 flex-shrink-0">
                <span className="text-base font-black text-white">Z</span>
              </div>
              <div>
                <p className="text-gray-900 font-black text-lg leading-none tracking-tight">Zariel & Co</p>
                <p className="text-[#6A7B92] text-[10px] font-bold mt-0.5 uppercase tracking-widest">Creator Marketplace</p>
              </div>
            </Link>
          </div>

          {/* Divider */}
          <div className="mx-6 mb-4">
            <div className="h-px bg-gray-200" />
          </div>

          {/* Nav label */}
          <p className="px-6 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2">Menu</p>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all',
                pathname === '/'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <Home className="h-4 w-4" />
              <span className="flex-1">Home</span>
            </Link>

            {NAV.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.name}</span>
                </Link>
              );
            })}

            {/* PRESERVED: Old admin link — uncomment if re-enabling admin features */}
            {/* {isAdmin && (
              <>
                <div className="pt-2 pb-1">
                  <div className="h-px bg-gray-200" />
                </div>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all',
                    pathname.startsWith('/admin')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <Shield className="h-4 w-4" />
                  <span className="flex-1">Admin</span>
                </Link>
              </>
            )} */}
          </nav>

          {/* Footer */}
          <div className="px-4 pt-3 pb-5 border-t border-gray-200">
            {/* PRESERVED: Old settings/help buttons — uncomment if re-enabling */}
            {/* <p className="px-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2">Account</p>
            <button onClick={() => setSettingsOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all">
              <Settings className="h-4 w-4" /> Settings
            </button>
            <button onClick={() => setHelpOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all">
              <HelpCircle className="h-4 w-4" /> Help
            </button> */}

            <button
              onClick={() => { signOut(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>

            {/* User profile card */}
            {profile && (
              <Link href="/my-profile" onClick={() => setMobileOpen(false)}>
                <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#A7D129]/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#A7D129] flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                        {(profile.display_name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-gray-900 truncate leading-tight">{profile.display_name || 'Unnamed'}</p>
                      <p className="text-[10px] text-[#6A7B92] font-bold mt-1 capitalize">{profile.role}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* PRESERVED: Old profile card with full_name/email and old role labels */}
            {/* {profile && (
              <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#A7D129] flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                    {(profile.full_name || profile.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-gray-900 truncate leading-tight">{profile.full_name || profile.email}</p>
                    <p className="text-[10px] text-[#6A7B92] font-bold mt-1">{(
                      profile.role === 'creator' ? 'Creator' :
                      profile.role === 'innovator' ? 'Innovator' :
                      profile.role === 'visionary' ? 'Visionary' :
                      profile.role === 'admin' ? 'Admin' : 'Member'
                    )}</p>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </aside>

      {/* PRESERVED: Old settings/help dialogs — uncomment if re-enabling */}
      {/* <AccountSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} /> */}
    </>
  );
}
