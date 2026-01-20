'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileVideo, Coins, TrendingUp, DollarSign, ShoppingBag, Building2, Sparkles } from 'lucide-react';

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
        .eq('role', 'company');

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
    return <div className="flex items-center justify-center h-64">Loading admin statistics...</div>;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: `${stats.totalCreators} creators, ${stats.totalCompanies} companies, ${stats.totalAdmins} admins`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Content',
      value: stats.totalContent,
      icon: FileVideo,
      description: `${stats.activeContent} active items`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Purchases',
      value: stats.totalPurchases,
      icon: ShoppingBag,
      description: 'Content transactions',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Tokens in Circulation',
      value: stats.totalTokensInCirculation.toLocaleString(),
      icon: Coins,
      description: 'Total Zaryo tokens',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total Transactions',
      value: stats.totalTransactions,
      icon: TrendingUp,
      description: 'All token movements',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Platform Revenue',
      value: `${stats.totalRevenue.toLocaleString()} Zaryo`,
      icon: DollarSign,
      description: 'Total platform earnings',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            Admin Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Platform overview and management tools
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Quick Actions</CardTitle>
          <CardDescription>Manage platform content, users, and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            Use the tabs above to manage content pricing, view all users, and monitor platform activity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
