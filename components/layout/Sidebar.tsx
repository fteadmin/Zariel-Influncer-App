'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Store, FileVideo, ShoppingBag,
  Coins, CreditCard, LogOut, Menu, X, Settings,
  HelpCircle, Gavel, Briefcase, Package, ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AccountSettingsDialog } from '@/components/layout/AccountSettingsDialog';
import { HelpDialog } from '@/components/layout/HelpDialog';

const NAV = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  {
    name: 'Services', icon: Briefcase, isDropdown: true,
    children: [
      { name: 'Services', href: '/services', icon: Briefcase },
      { name: 'Booking Requests', href: '/my-services', icon: Briefcase },
      { name: 'My Bookings', href: '/my-bookings', icon: ShoppingBag },
    ],
  },
  {
    name: 'Marketplace', icon: Store, isDropdown: true,
    children: [
      { name: 'Marketplace', href: '/marketplace', icon: Store },
      { name: 'My Content', href: '/my-content', icon: FileVideo },
      { name: 'Content Bids', href: '/content-bids', icon: Gavel },
    ],
  },
  { name: 'My Purchases', href: '/my-purchases', icon: ShoppingBag },
  { name: 'Subscription', href: '/subscription', icon: CreditCard },
  { name: 'Tokens', href: '/token-management', icon: Coins },
];

export function Sidebar() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const auto: Record<string, boolean> = {};
    NAV.forEach((item) => {
      if (item.isDropdown && item.children?.some((c) => pathname === c.href)) auto[item.name] = true;
    });
    setOpenDropdowns((p) => ({ ...p, ...auto }));
  }, [pathname]);

  const toggle = (name: string) => setOpenDropdowns((p) => ({ ...p, [name]: !p[name] }));

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      try { localStorage.clear(); sessionStorage.clear(); } catch {}
      window.location.href = '/';
    }
  };

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A7D129] to-[#A7D129]/80 rounded-xl flex items-center justify-center shadow-lg shadow-[#A7D129]/25 flex-shrink-0">
                <span className="text-base font-black text-white">Z</span>
              </div>
              <div>
                <p className="text-gray-900 font-black text-lg leading-none tracking-tight">Zariel</p>
                <p className="text-[#6A7B92] text-[10px] font-bold mt-0.5 uppercase tracking-widest">Creator Platform</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 mb-4">
            <div className="h-px bg-gray-200" />
          </div>

          {/* Nav label */}
          <p className="px-6 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2">Menu</p>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 space-y-1">
            {NAV.map((item) => {
              if (item.isDropdown) {
                const hasActive = item.children?.some((c) => pathname === c.href);
                const isOpen = openDropdowns[item.name];

                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggle(item.name)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all',
                        hasActive || isOpen
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </div>
                      <ChevronDown className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isOpen ? 'rotate-180' : '',
                      )} />
                    </button>

                    <div className={cn(
                      'grid transition-all duration-200',
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}>
                      <div className="overflow-hidden">
                        <div className="ml-7 mt-1 mb-1 space-y-1">
                          {item.children?.map((child) => {
                            const isActive = pathname === child.href;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                  isActive
                                    ? 'bg-[#A7D129]/10 text-gray-900 font-semibold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                                )}
                              >
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href || '/'}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 pt-3 pb-5 border-t border-gray-200">
            <p className="px-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2">Account</p>

            <button onClick={() => setSettingsOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all">
              <Settings className="h-4 w-4" /> Settings
            </button>
            <button onClick={() => setHelpOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all">
              <HelpCircle className="h-4 w-4" /> Help
            </button>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>

            {/* User profile card */}
            {profile && (
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
                      profile.role === 'company' ? 'Company' :
                      profile.role === 'admin' ? 'Admin' : 'Member'
                    )}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <AccountSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}