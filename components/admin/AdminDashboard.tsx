'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileVideo, Coins, TrendingUp, DollarSign, ShoppingBag, LayoutDashboard, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminContentManager } from './AdminContentManager';
import { AdminUserManager } from './AdminUserManager';

interface AdminStats {
  totalUsers: number;
  totalCreators: number;
  totalCompanies: number;
  totalContent: number;
  totalTransactions: number;
  totalTokensInCirculation: number;
  totalRevenue: number;
}

export function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCreators: 0,
    totalCompanies: 0,
    totalContent: 0,
    totalTransactions: 0,
    totalTokensInCirculation: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && isAdmin(profile)) {
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
        .eq('role', 'company');

      // Get content count
      const { count: totalContent } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

      // Get transaction count
      const { count: totalTransactions } = await supabase
        .from('token_transactions')
        .select('*', { count: 'exact', head: true });

      // Get total tokens in circulation
      const { data: wallets } = await supabase
        .from('token_wallets')
        .select('balance');

      const totalTokens = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0) || 0;

      // Get total revenue from orders
      const { data: orders } = await supabase
        .from('stripe_orders')
        .select('amount_total');

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount_total || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalCreators: totalCreators || 0,
        totalCompanies: totalCompanies || 0,
        totalContent: totalContent || 0,
        totalTransactions: totalTransactions || 0,
        totalTokensInCirculation: totalTokens,
        totalRevenue: totalRevenue / 100, // Convert from cents to dollars
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile || !isAdmin(profile)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#A7D129] to-green-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6A7B92]">
              Admin Control Center
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
            Platform Management 🚀
          </h1>
          <p className="text-[#6A7B92] text-sm font-bold mt-1.5 uppercase tracking-wide">
            Overview and management tools
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-[#A7D129] to-green-600 border-0 text-white font-black px-4 py-2 text-sm">
          Admin Access
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#A7D129] data-[state=active]:text-white font-black rounded-lg">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-[#A7D129] data-[state=active]:text-white font-black rounded-lg">
            <FileVideo className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#A7D129] data-[state=active]:text-white font-black rounded-lg">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-36 bg-white rounded-2xl border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 — Total Users — gradient lime */}
              <div className="group bg-gradient-to-br from-[#A7D129] to-green-600 rounded-2xl p-6 hover:shadow-xl hover:shadow-[#A7D129]/30 transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">Total</span>
                </div>
                <p className="text-4xl font-black text-white leading-none mb-1">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs font-black text-white/80 uppercase tracking-wider">Registered Users</p>
              </div>

              {/* Card 2 — Creators — white with purple accent */}
              <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-100 transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Creators</span>
                </div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1">{stats.totalCreators.toLocaleString()}</p>
                <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Content Creators</p>
              </div>

              {/* Card 3 — Companies — white with cyan accent */}
              <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-100 transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-cyan-600" />
                  </div>
                  <span className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Companies</span>
                </div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1">{stats.totalCompanies.toLocaleString()}</p>
                <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Company Accounts</p>
              </div>

              {/* Card 4 — Content — white with green accent */}
              <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-500/40 hover:shadow-xl hover:shadow-green-100 transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <FileVideo className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Content</span>
                </div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1">{stats.totalContent.toLocaleString()}</p>
                <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Uploaded Items</p>
              </div>

              {/* Card 5 — Transactions — white with orange accent */}
              <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-100 transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Activity</span>
                </div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1">{stats.totalTransactions.toLocaleString()}</p>
                <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Total Transactions</p>
              </div>

              {/* Card 6 — Tokens — golden gradient */}
              <div className="group bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl p-6 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">Tokens</span>
                </div>
                <p className="text-4xl font-black text-white leading-none mb-1">{stats.totalTokensInCirculation.toLocaleString()}</p>
                <p className="text-xs font-black text-white/80 uppercase tracking-wider">Zaryo Circulation</p>
              </div>

              {/* Card 7 — Revenue — dark gradient */}
              <div className="group bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-900/40 transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-white/70 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">Revenue</span>
                </div>
                <p className="text-4xl font-black text-white leading-none mb-1">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs font-black text-white/70 uppercase tracking-wider">Token Sales</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="content">
          <AdminContentManager />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
