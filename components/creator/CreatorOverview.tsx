'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Coins, FileVideo, TrendingUp, ShoppingCart, ArrowRight,
  Zap, ArrowUpRight, ArrowDownLeft, ChevronRight,
  Rocket, BarChart3, Upload, Clock,
} from 'lucide-react';
import Link from 'next/link';

interface Stats { tokenBalance: number; totalContent: number; totalEarned: number; totalSpent: number; }

const ACTIONS = [
  { href: '/my-content', icon: Upload, label: 'Upload Content', sub: 'Share videos & images' },
  { href: '/marketplace', icon: BarChart3, label: 'Explore Marketplace', sub: 'Discover content & services' },
  { href: '/token-management', icon: Coins, label: 'Buy Tokens', sub: 'Top up your Zaryo balance' },
  { href: '/subscription', icon: Rocket, label: 'Go Pro', sub: 'Lower fees & priority access' },
];

export function CreatorOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ tokenBalance: 0, totalContent: 0, totalEarned: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [recentTx, setRecentTx] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    loadAll();
    const sub = supabase.channel(`dash-${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'token_transactions' }, loadAll)
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, [profile]); // re-runs whenever profile (including token_balance) changes

  const loadAll = () => Promise.all([loadStats(), loadTx()]);

  const loadStats = async () => {
    if (!profile) return;
    try {
      const tokenBalance = profile.token_balance || 0;
      const { count } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('creator_id', profile.id);
      const { data: tx } = await supabase.from('token_transactions').select('*').or(`from_user_id.eq.${profile.id},to_user_id.eq.${profile.id}`);
      const totalEarned = (tx || []).filter(t => t.to_user_id === profile.id && ['bid_accepted', 'bid_received'].includes(t.transaction_type)).reduce((s, t) => s + t.amount, 0);
      const totalSpent = (tx || []).filter(t => t.from_user_id === profile.id && ['purchase', 'bid_payment', 'ecosystem_purchase'].includes(t.transaction_type)).reduce((s, t) => s + t.amount, 0);
      setStats({ tokenBalance, totalContent: count || 0, totalEarned, totalSpent });
    } catch {} finally { setLoading(false); }
  };

  const loadTx = async () => {
    if (!profile) return;
    try {
      const { data } = await supabase.from('token_transactions')
        .select('id,amount,transaction_type,description,status,created_at,from_user_id,to_user_id')
        .or(`from_user_id.eq.${profile.id},to_user_id.eq.${profile.id}`)
        .order('created_at', { ascending: false }).limit(8);
      setRecentTx(data || []);
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-56 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      </div>
    );
  }

  return (
    // Page background: light gray
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-sm bg-[#A7D129]" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6A7B92]">
              {format(new Date(), 'EEEE, MMMM d')}
            </span>
          </div>
          {/* Big editorial headline */}
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
            Hey, {profile?.full_name?.split(' ')[0] || 'Creator'} 👋
          </h1>
          <p className="text-[#6A7B92] text-sm font-medium mt-1.5">
            Here's everything happening in your workspace.
          </p>
        </div>

        <Link href="/my-content">
          <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-gray-900/10">
            <Upload className="w-4 h-4" />
            Upload Content
          </button>
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1 — Zaryo Balance — lime accent */}
        <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#A7D129]/40 hover:shadow-lg hover:shadow-[#A7D129]/8 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-[#A7D129]/10 rounded-xl flex items-center justify-center">
              <Coins className="w-4 h-4 text-[#A7D129]" />
            </div>
            <span className="text-[10px] font-black text-[#A7D129] bg-[#A7D129]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Balance</span>
          </div>
          <p className="text-3xl font-black text-gray-900 leading-none">{stats.tokenBalance.toLocaleString()}</p>
          <p className="text-xs font-bold text-[#6A7B92] mt-1.5 uppercase tracking-wider">Zaryo Tokens</p>
        </div>

        {/* Card 2 — Content — slate accent */}
        <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#6A7B92]/30 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-[#6A7B92]/10 rounded-xl flex items-center justify-center">
              <FileVideo className="w-4 h-4 text-[#6A7B92]" />
            </div>
            <span className="text-[10px] font-black text-[#6A7B92] bg-[#6A7B92]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Published</span>
          </div>
          <p className="text-3xl font-black text-gray-900 leading-none">{stats.totalContent}</p>
          <p className="text-xs font-bold text-[#6A7B92] mt-1.5 uppercase tracking-wider">Content Items</p>
        </div>

        {/* Card 3 — Earned — lime accent, filled */}
        <div className="group bg-[#A7D129] rounded-2xl border border-[#A7D129] p-5 hover:shadow-lg hover:shadow-[#A7D129]/25 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-black text-white/80 bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Earned</span>
          </div>
          <p className="text-3xl font-black text-white leading-none">{stats.totalEarned.toLocaleString()}</p>
          <p className="text-xs font-black text-white/70 mt-1.5 uppercase tracking-wider">Zaryo Received</p>
        </div>

        {/* Card 4 — Spent — dark filled */}
        <div className="group bg-gray-900 rounded-2xl border border-gray-900 p-5 hover:shadow-lg hover:shadow-gray-900/20 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white/70" />
            </div>
            <span className="text-[10px] font-black text-white/50 bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Spent</span>
          </div>
          <p className="text-3xl font-black text-white leading-none">{stats.totalSpent.toLocaleString()}</p>
          <p className="text-xs font-black text-white/40 mt-1.5 uppercase tracking-wider">Zaryo Used</p>
        </div>
      </div>

      {/* ── Body Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-1.5 h-5 bg-[#A7D129] rounded-full" />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Quick Actions</h3>
          </div>
          <div className="p-3 space-y-1">
            {ACTIONS.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="group flex items-center gap-3.5 px-4 py-3.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                  <div className="w-9 h-9 bg-gray-100 group-hover:bg-[#A7D129]/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                    <action.icon className="w-4 h-4 text-gray-400 group-hover:text-[#A7D129] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-800 leading-none">{action.label}</p>
                    <p className="text-[11px] text-[#6A7B92] mt-0.5">{action.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#A7D129] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 bg-[#6A7B92] rounded-full" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Recent Transactions</h3>
            </div>
            <Link href="/token-management">
              <button className="text-xs font-black text-[#6A7B92] hover:text-gray-900 flex items-center gap-1 transition-colors uppercase tracking-wide">
                All <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          {/* Column headers */}
          <div className="px-5 py-2.5 grid grid-cols-12 gap-2 bg-gray-50 border-b border-gray-100">
            <span className="col-span-7 text-[10px] font-black uppercase tracking-widest text-gray-400">Description</span>
            <span className="col-span-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:block">Date</span>
            <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Amount</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {recentTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14">
                <Clock className="w-8 h-8 text-gray-200 mb-3" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-wide">No transactions yet</p>
                <p className="text-xs text-gray-300 mt-1">Activity will appear here</p>
              </div>
            ) : recentTx.map((tx) => {
              const isIn = tx.to_user_id === profile?.id;
              return (
                <div key={tx.id} className="px-5 py-3.5 grid grid-cols-12 gap-2 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-7 flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isIn ? 'bg-[#A7D129]/10' : 'bg-[#6A7B92]/10'}`}>
                      {isIn
                        ? <ArrowDownLeft className="w-3.5 h-3.5 text-[#A7D129]" />
                        : <ArrowUpRight className="w-3.5 h-3.5 text-[#6A7B92]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{tx.description || tx.transaction_type}</p>
                      <span className={`inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md mt-0.5 ${
                        tx.status === 'completed' ? 'bg-[#A7D129]/10 text-[#A7D129]' : 'bg-gray-100 text-[#6A7B92]'
                      }`}>
                        {tx.status || 'pending'}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 hidden sm:block">
                    <p className="text-[10px] text-gray-400 font-medium">{format(new Date(tx.created_at), 'MMM d, h:mm a')}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-black ${isIn ? 'text-[#A7D129]' : 'text-[#6A7B92]'}`}>
                      {isIn ? '+' : '-'}{Math.abs(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Pro Upgrade Banner ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-900">
        {/* Subtle dot texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '18px 18px' }} />
        {/* Lime glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#A7D129]/15 to-transparent" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#A7D129] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#A7D129]/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white font-black text-base leading-none tracking-tight">Upgrade to Pro Creator</h4>
              <p className="text-gray-400 text-xs mt-1 font-medium">10% fees · Unlimited listings · Priority placement</p>
            </div>
          </div>
          <Link href="/subscription">
            <button className="flex-shrink-0 flex items-center gap-2 bg-[#A7D129] hover:bg-[#bde83a] text-gray-900 font-black px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 shadow-lg shadow-[#A7D129]/25">
              Upgrade Now <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

    </div>
  );
}