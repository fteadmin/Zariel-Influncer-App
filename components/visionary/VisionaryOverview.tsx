'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Coins, ShoppingBag, TrendingUp, TrendingDown, BarChart3, Rocket } from 'lucide-react';
import Link from 'next/link';

interface VisionaryStats {
  tokenBalance: number;
  totalPurchases: number;
  totalEarned: number;
  totalSpent: number;
}

export function VisionaryOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<VisionaryStats>({
    tokenBalance: 0,
    totalPurchases: 0,
    totalEarned: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    if (!profile) return;

    try {
      const { data: wallet } = await supabase
        .from('token_wallets')
        .select('balance, total_earned, total_spent')
        .eq('user_id', profile.id)
        .maybeSingle();

      const { count: purchaseCount } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.id);

      setStats({
        tokenBalance: wallet?.balance || 0,
        totalPurchases: purchaseCount || 0,
        totalEarned: wallet?.total_earned || 0,
        totalSpent: wallet?.total_spent || 0,
      });
    } catch (error) {
      console.error('Error loading company stats:', error);
    } finally {
      setLoading(false);
    }
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
            Hey, {profile?.full_name?.split(' ')[0] || 'Visionary'} 👋
          </h1>
          <p className="text-[#6A7B92] text-sm font-medium mt-1.5">
            Here's everything happening in your workspace.
          </p>
        </div>

        <Link href="/marketplace">
          <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-gray-900/10">
            <BarChart3 className="w-4 h-4" />
            Browse Marketplace
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

        {/* Card 2 — Purchases — slate accent */}
        <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#6A7B92]/30 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-[#6A7B92]/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#6A7B92]" />
            </div>
            <span className="text-[10px] font-black text-[#6A7B92] bg-[#6A7B92]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Purchased</span>
          </div>
          <p className="text-3xl font-black text-gray-900 leading-none">{stats.totalPurchases}</p>
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
              <TrendingDown className="w-4 h-4 text-white/70" />
            </div>
            <span className="text-[10px] font-black text-white/50 bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Spent</span>
          </div>
          <p className="text-3xl font-black text-white leading-none">{stats.totalSpent.toLocaleString()}</p>
          <p className="text-xs font-black text-white/60 mt-1.5 uppercase tracking-wider">Zaryo Used</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/marketplace">
            <div className="p-4 rounded-xl border border-gray-100 hover:border-[#A7D129]/40 hover:bg-gray-50 transition-all cursor-pointer group">
              <BarChart3 className="w-5 h-5 text-[#6A7B92] mb-2 group-hover:text-[#A7D129] transition-colors" />
              <p className="text-sm font-black text-gray-900">Explore Marketplace</p>
              <p className="text-xs text-[#6A7B92] mt-0.5">Browse content & services</p>
            </div>
          </Link>
          <Link href="/token-management">
            <div className="p-4 rounded-xl border border-gray-100 hover:border-[#A7D129]/40 hover:bg-gray-50 transition-all cursor-pointer group">
              <Coins className="w-5 h-5 text-[#6A7B92] mb-2 group-hover:text-[#A7D129] transition-colors" />
              <p className="text-sm font-black text-gray-900">Buy Tokens</p>
              <p className="text-xs text-[#6A7B92] mt-0.5">Top up balance</p>
            </div>
          </Link>
          <Link href="/my-purchases">
            <div className="p-4 rounded-xl border border-gray-100 hover:border-[#A7D129]/40 hover:bg-gray-50 transition-all cursor-pointer group">
              <ShoppingBag className="w-5 h-5 text-[#6A7B92] mb-2 group-hover:text-[#A7D129] transition-colors" />
              <p className="text-sm font-black text-gray-900">My Purchases</p>
              <p className="text-xs text-[#6A7B92] mt-0.5">View content</p>
            </div>
          </Link>
          <Link href="/subscription">
            <div className="p-4 rounded-xl border border-gray-100 hover:border-[#A7D129]/40 hover:bg-gray-50 transition-all cursor-pointer group">
              <Rocket className="w-5 h-5 text-[#6A7B92] mb-2 group-hover:text-[#A7D129] transition-colors" />
              <p className="text-sm font-black text-gray-900">Premium</p>
              <p className="text-xs text-[#6A7B92] mt-0.5">Exclusive access</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
