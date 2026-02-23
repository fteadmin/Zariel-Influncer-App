'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, TokenWallet } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, Info, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TokenTransaction {
  id: string;
  transaction_number: string;
  created_at: string;
  amount: number;
  transaction_type: string;
  description: string | null;
}

export function AdminTokenManagement() {
  const { profile } = useAuth();
  const [wallet, setWallet] = useState<TokenWallet | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadWalletData();
    }
  }, [profile]);

  const loadWalletData = async () => {
    if (!profile) return;

    try {
      // Load balance from profiles.token_balance instead of token_wallets
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('id', profile.id)
        .single();

      if (profileError) throw profileError;

      // Create a wallet object for compatibility
      const walletData: TokenWallet = {
        id: profile.id,
        user_id: profile.id,
        balance: profileData?.token_balance || 0,
        total_earned: 0,
        total_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setWallet(walletData);

      // Load transactions
      const { data: transData, error: transError } = await supabase
        .from('token_transactions')
        .select('*, transaction_number')
        .or(`from_user_id.eq.${profile.id},to_user_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transError) throw transError;
      setTransactions(transData || []);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading token data...</div>;
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
              Token Management
            </span>
          </div>
          {/* Big editorial headline */}
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
            Zaryo Wallet 💰
          </h1>
          <p className="text-[#6A7B92] text-sm font-medium mt-1.5">
            Manage your tokens and view transaction history
          </p>
        </div>
      </div>

      {/* Admin Info Banner */}
      <div className="bg-gradient-to-r from-[#6A7B92]/5 to-[#A7D129]/5 rounded-2xl border border-[#6A7B92]/20 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#6A7B92] rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">Admin Account</p>
            <p className="text-xs text-[#6A7B92] mt-1 leading-relaxed">
              You can purchase Zaryo tokens at standard rates. Tokens can be used to purchase content or test platform functionality.
            </p>
          </div>
        </div>
      </div>

      {/* ── Balance Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 — Current Balance — lime filled */}
        <div className="group bg-[#A7D129] rounded-2xl border border-[#A7D129] p-6 hover:shadow-lg hover:shadow-[#A7D129]/25 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black text-white/80 bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Balance</span>
          </div>
          <p className="text-4xl font-black text-white leading-none mb-1">{wallet?.balance?.toLocaleString() || 0}</p>
          <p className="text-xs font-black text-white/70 uppercase tracking-wider">Zaryo Tokens</p>
        </div>

        {/* Card 2 — Total Earned — green outline */}
        <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-100 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Earned</span>
          </div>
          <p className="text-4xl font-black text-gray-900 leading-none mb-1">{wallet?.total_earned?.toLocaleString() || 0}</p>
          <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Total Earned</p>
        </div>

        {/* Card 3 — Total Spent — red outline */}
        <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-100 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Spent</span>
          </div>
          <p className="text-4xl font-black text-gray-900 leading-none mb-1">{wallet?.total_spent?.toLocaleString() || 0}</p>
          <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Total Spent</p>
        </div>
      </div>

      {/* ── Purchase Tokens Section ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-black text-gray-900">Purchase Zaryo Tokens</h3>
          <p className="text-xs text-[#6A7B92] font-bold mt-1 uppercase tracking-wider">Rate: $1 = 100 Zaryo</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Token Package 1 */}
          <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 p-5 hover:border-[#A7D129] hover:shadow-lg hover:shadow-[#A7D129]/10 transition-all duration-200 cursor-pointer">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-[#A7D129]/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-[#A7D129] transition-colors">
                <Coins className="w-6 h-6 text-[#A7D129] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">100</p>
                <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Zaryo</p>
              </div>
              <p className="text-xl font-black text-gray-900">$1.00</p>
              <Button className="w-full bg-gray-900 hover:bg-[#A7D129] text-white font-black rounded-lg transition-all" size="sm">
                Purchase
              </Button>
            </div>
          </div>

          {/* Token Package 1 */}
          <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 p-5 hover:border-[#A7D129] hover:shadow-lg hover:shadow-[#A7D129]/10 transition-all duration-200 cursor-pointer">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-[#A7D129]/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-[#A7D129] transition-colors">
                <Coins className="w-6 h-6 text-[#A7D129] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">100</p>
                <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Zaryo</p>
              </div>
              <p className="text-xl font-black text-gray-900">$1.00</p>
              <Button className="w-full bg-gray-900 hover:bg-[#A7D129] text-white font-black rounded-lg transition-all" size="sm">
                Purchase
              </Button>
            </div>
          </div>

          {/* Token Package 2 */}
          <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 p-5 hover:border-[#A7D129] hover:shadow-lg hover:shadow-[#A7D129]/10 transition-all duration-200 cursor-pointer">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-[#A7D129]/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-[#A7D129] transition-colors">
                <Coins className="w-6 h-6 text-[#A7D129] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">500</p>
                <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Zaryo</p>
              </div>
              <p className="text-xl font-black text-gray-900">$5.00</p>
              <Button className="w-full bg-gray-900 hover:bg-[#A7D129] text-white font-black rounded-lg transition-all" size="sm">
                Purchase
              </Button>
            </div>
          </div>

          {/* Token Package 3 */}
          <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 p-5 hover:border-[#A7D129] hover:shadow-lg hover:shadow-[#A7D129]/10 transition-all duration-200 cursor-pointer">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-[#A7D129]/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-[#A7D129] transition-colors">
                <Coins className="w-6 h-6 text-[#A7D129] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">1,000</p>
                <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Zaryo</p>
              </div>
              <p className="text-xl font-black text-gray-900">$10.00</p>
              <Button className="w-full bg-gray-900 hover:bg-[#A7D129] text-white font-black rounded-lg transition-all" size="sm">
                Purchase
              </Button>
            </div>
          </div>

          {/* Token Package 4 */}
          <div className="group bg-gradient-to-br from-[#A7D129]/5 to-white rounded-xl border-2 border-[#A7D129] p-5 hover:border-[#A7D129] hover:shadow-lg hover:shadow-[#A7D129]/20 transition-all duration-200 cursor-pointer">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-[#A7D129] rounded-xl flex items-center justify-center mx-auto">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">5,000</p>
                <p className="text-xs font-bold text-[#A7D129] uppercase tracking-wider">Zaryo • Popular</p>
              </div>
              <p className="text-xl font-black text-gray-900">$50.00</p>
              <Button className="w-full bg-[#A7D129] hover:bg-gray-900 text-white font-black rounded-lg transition-all" size="sm">
                Purchase
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Transaction History ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-900">Transaction History</h3>
          <p className="text-xs text-[#6A7B92] font-bold mt-1 uppercase tracking-wider">Recent Token Activity</p>
        </div>
        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Info className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-900">No transactions yet</p>
              <p className="text-xs text-[#6A7B92] mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="font-black text-[#6A7B92] text-[10px] uppercase tracking-wider">Date</TableHead>
                    <TableHead className="font-black text-[#6A7B92] text-[10px] uppercase tracking-wider">Type</TableHead>
                    <TableHead className="font-black text-[#6A7B92] text-[10px] uppercase tracking-wider">Description</TableHead>
                    <TableHead className="font-black text-[#6A7B92] text-[10px] uppercase tracking-wider">Txn ID</TableHead>
                    <TableHead className="text-right font-black text-[#6A7B92] text-[10px] uppercase tracking-wider">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="border-gray-100 hover:bg-gray-50/50">
                      <TableCell className="text-xs font-medium text-[#6A7B92]">
                        {new Date(transaction.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            transaction.transaction_type === 'purchase' || transaction.transaction_type === 'credit'
                              ? 'bg-[#A7D129]/10 text-[#A7D129] hover:bg-[#A7D129]/20 border-0 font-black text-[10px] uppercase tracking-wider'
                              : 'bg-[#6A7B92]/10 text-[#6A7B92] hover:bg-[#6A7B92]/20 border-0 font-black text-[10px] uppercase tracking-wider'
                          }
                        >
                          {transaction.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {transaction.description || '-'}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-[#6A7B92] max-w-[120px] truncate">
                        {transaction.transaction_number || transaction.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`text-sm font-black ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
