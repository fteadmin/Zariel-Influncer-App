'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users, FileVideo, Coins, TrendingUp, ShoppingBag, Shield, Settings, Package } from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalCreators: number;
  totalCompanies: number;
  totalAdmins: number;
  totalContent: number;
  activeContent: number;
  totalTransactions: number;
  totalTokensInCirculation: number;
  totalRevenue: number;
  totalPurchases: number;
}

export function AdminOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCreators: 0,
    totalCompanies: 0,
    totalAdmins: 0,
    totalContent: 0,
    activeContent: 0,
    totalTransactions: 0,
    totalTokensInCirculation: 0,
    totalRevenue: 0,
    totalPurchases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    try {
      // Get user counts
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalCreators } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'creator');

      const { count: totalCompanies } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['innovator', 'visionary', 'company']);

      const { count: totalAdmins } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', true);

      // Get content counts
      const { count: totalContent } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      const { count: activeContent } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get transaction counts
      const { count: totalTransactions } = await supabase
        .from('token_transactions')
        .select('*', { count: 'exact', head: true });

      const { count: totalPurchases } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true });

      // Get token circulation
      const { data: wallets } = await supabase
        .from('token_wallets')
        .select('balance');

      const totalTokens = wallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;

      // Calculate total revenue (sum of all transactions)
      const { data: transactions } = await supabase
        .from('token_transactions')
        .select('amount');

      const totalRevenue = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalCreators: totalCreators || 0,
        totalCompanies: totalCompanies || 0,
        totalAdmins: totalAdmins || 0,
        totalContent: totalContent || 0,
        activeContent: activeContent || 0,
        totalTransactions: totalTransactions || 0,
        totalTokensInCirculation: totalTokens,
        totalRevenue: totalRevenue,
        totalPurchases: totalPurchases || 0,
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-56 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-white rounded-2xl border border-gray-100" />)}
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
            Admin Dashboard 🛡️
          </h1>
          <p className="text-[#6A7B92] text-sm font-medium mt-1.5">
            Platform overview and management
          </p>
        </div>

        <Link href="/admin">
          <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-gray-900/10">
            <Settings className="w-4 h-4" />
            Admin Panel
          </button>
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1 — Users — lime accent */}
        <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#A7D129]/40 hover:shadow-lg hover:shadow-[#A7D129]/8 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-[#A7D129]/10 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-[#A7D129]" />
            </div>
            <span className="text-[10px] font-black text-[#A7D129] bg-[#A7D129]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Users</span>
          </div>
          <p className="text-3xl font-black text-gray-900 leading-none">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-xs font-bold text-[#6A7B92] mt-1.5 uppercase tracking-wider">{stats.totalCreators} Creators, {stats.totalCompanies} Companies</p>
        </div>

        {/* Card 2 — Content — slate accent */}
        <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#6A7B92]/30 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-[#6A7B92]/10 rounded-xl flex items-center justify-center">
              <FileVideo className="w-4 h-4 text-[#6A7B92]" />
            </div>
            <span className="text-[10px] font-black text-[#6A7B92] bg-[#6A7B92]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Content</span>
          </div>
          <p className="text-3xl font-black text-gray-900 leading-none">{stats.totalContent}</p>
          <p className="text-xs font-bold text-[#6A7B92] mt-1.5 uppercase tracking-wider">{stats.activeContent} Active Items</p>
        </div>

        {/* Card 3 — Purchases — white */}
        <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#6A7B92]/30 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-[#6A7B92]/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#6A7B92]" />
            </div>
            <span className="text-[10px] font-black text-[#6A7B92] bg-[#6A7B92]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Purchases</span>
          </div>
          <p className="text-3xl font-black text-gray-900 leading-none">{stats.totalPurchases}</p>
          <p className="text-xs font-bold text-[#6A7B92] mt-1.5 uppercase tracking-wider">Total Transactions</p>
        </div>

        {/* Card 4 — Token Circulation — lime accent, filled */}
        <div className="group bg-[#A7D129] rounded-2xl border border-[#A7D129] p-5 hover:shadow-lg hover:shadow-[#A7D129]/25 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-black text-white/80 bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Tokens</span>
          </div>
          <p className="text-3xl font-black text-white leading-none">{stats.totalTokensInCirculation.toLocaleString()}</p>
          <p className="text-xs font-black text-white/70 mt-1.5 uppercase tracking-wider">Zaryo in Circulation</p>
        </div>

        {/* Card 5 — Transactions — dark filled */}
        <div className="group bg-gray-900 rounded-2xl border border-gray-900 p-5 hover:shadow-lg hover:shadow-gray-900/20 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white/70" />
            </div>
            <span className="text-[10px] font-black text-white/50 bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Activity</span>
          </div>
          <p className="text-3xl font-black text-white leading-none">{stats.totalTransactions.toLocaleString()}</p>
          <p className="text-xs font-black text-white/60 mt-1.5 uppercase tracking-wider">Total Transactions</p>
        </div>

        {/* Card 6 — Revenue — slate filled */}
        <div className="group bg-[#6A7B92] rounded-2xl border border-[#6A7B92] p-5 hover:shadow-lg hover:shadow-[#6A7B92]/20 transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white/70" />
            </div>
            <span className="text-[10px] font-black text-white/50 bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Revenue</span>
          </div>
          <p className="text-3xl font-black text-white leading-none">{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs font-black text-white/60 mt-1.5 uppercase tracking-wider">Zaryo Platform Revenue</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/admin">
            <div className="p-4 rounded-xl border border-gray-100 hover:border-[#A7D129]/40 hover:bg-gray-50 transition-all cursor-pointer group">
              <Users className="w-5 h-5 text-[#6A7B92] mb-2 group-hover:text-[#A7D129] transition-colors" />
              <p className="text-sm font-black text-gray-900">Manage Users</p>
              <p className="text-xs text-[#6A7B92] mt-0.5">View all users</p>
            </div>
          </Link>
          <Link href="/admin/products">
            <div className="p-4 rounded-xl border border-gray-100 hover:border-[#A7D129]/40 hover:bg-gray-50 transition-all cursor-pointer group">
              <Package className="w-5 h-5 text-[#6A7B92] mb-2 group-hover:text-[#A7D129] transition-colors" />
              <p className="text-sm font-black text-gray-900">Products</p>
              <p className="text-xs text-[#6A7B92] mt-0.5">Manage products</p>
            </div>
          </Link>
          <Link href="/admin/product-sales">
            <div className="p-4 rounded-xl border border-gray-100 hover:border-[#A7D129]/40 hover:bg-gray-50 transition-all cursor-pointer group">
              <ShoppingBag className="w-5 h-5 text-[#6A7B92] mb-2 group-hover:text-[#A7D129] transition-colors" />
              <p className="text-sm font-black text-gray-900">Sales</p>
              <p className="text-xs text-[#6A7B92] mt-0.5">View sales</p>
            </div>
          </Link>
          <Link href="/marketplace">
            <div className="p-4 rounded-xl border border-gray-100 hover:border-[#A7D129]/40 hover:bg-gray-50 transition-all cursor-pointer group">
              <Shield className="w-5 h-5 text-[#6A7B92] mb-2 group-hover:text-[#A7D129] transition-colors" />
              <p className="text-sm font-black text-gray-900">Platform</p>
              <p className="text-xs text-[#6A7B92] mt-0.5">View as user</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
