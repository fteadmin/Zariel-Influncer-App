'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';
import { AdminTokenManagement } from '@/components/admin/AdminTokenManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { createCheckoutSession, redirectToCheckout } from '@/lib/stripe-client';
import { STRIPE_PRODUCTS } from '@/lib/stripe-config';
import { useToast } from '@/hooks/use-toast';
import { RedeemTokensDialog } from '@/components/dashboard/RedeemTokensDialog';

interface Transaction {
  id: string;
  transaction_number: string;
  amount: number;
  transaction_type: string;
  description: string;
  status: string;
  created_at: string;
  from_user_id: string | null;
  to_user_id: string | null;
}

export function TokenManagementPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  // Route admin users to AdminTokenManagement
  if (profile && isAdmin(profile)) {
    return <AdminTokenManagement />;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptionRequests, setRedemptionRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (profile) {
      loadData();
      
      // Subscribe to transaction changes for real-time updates
      const transactionSubscription = supabase
        .channel(`transactions-${profile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'token_transactions',
          },
          (payload: any) => {
            console.log('Transaction changed, reloading data', payload);

            if (payload.eventType === 'INSERT') {
              const tx = payload.new as Transaction;
              const isIncoming = tx.to_user_id === profile.id;

              toast({
                title: isIncoming ? 'Tokens received' : 'Tokens updated',
                description:
                  (tx.description || tx.transaction_type || 'New transaction') +
                  ` · ${tx.amount} Zaryo · ID: ${tx.id}`,
              });
            }

            loadData();
            refreshProfile();
          }
        )
        .subscribe();

      return () => {
        transactionSubscription.unsubscribe();
      };
    }
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    await Promise.all([
      loadTransactions(),
      loadRedemptionRequests(),
    ]);
    setLoading(false);
  };

  const loadTransactions = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*, transaction_number')
        .or(`from_user_id.eq.${profile.id},to_user_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const allTransactions = data || [];
      setTransactions(allTransactions);

      // Calculate total earned (money received from sales/bids, NOT purchases or issuance)
      // Only count: bid_accepted, bid_received, ecosystem_purchase (when you're the seller)
      const earned = allTransactions
        .filter(t => 
          t.to_user_id === profile.id && 
          ['bid_accepted', 'bid_received'].includes(t.transaction_type)
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate total spent (money sent for purchases/bids)
      // Count: purchase, bid_payment, ecosystem_purchase (when you're the buyer)
      const spent = allTransactions
        .filter(t => 
          t.from_user_id === profile.id &&
          ['purchase', 'bid_payment', 'ecosystem_purchase'].includes(t.transaction_type)
        )
        .reduce((sum, t) => sum + t.amount, 0);

      console.log('Total Earned (from sales):', earned);
      console.log('Total Spent (on purchases):', spent);
      
      setTotalEarned(earned);
      setTotalSpent(spent);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadRedemptionRequests = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('redemption_requests')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedemptionRequests(data || []);
    } catch (error) {
      console.error('Error loading redemption requests:', error);
    }
  };

  const handlePurchaseZaryo = async (productId: string) => {
    setPurchaseLoading(productId);

    try {
      const product = STRIPE_PRODUCTS.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const { url } = await createCheckoutSession({
        priceId: product.priceId,
        mode: 'payment',
      });

      redirectToCheckout(url);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to start checkout',
        variant: 'destructive',
      });
      setPurchaseLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentBalance = profile?.token_balance || 0;

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
          <p className="text-4xl font-black text-white leading-none mb-1">{currentBalance.toLocaleString()}</p>
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
          <p className="text-4xl font-black text-gray-900 leading-none mb-1">{totalEarned.toLocaleString()}</p>
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
          <p className="text-4xl font-black text-gray-900 leading-none mb-1">{totalSpent.toLocaleString()}</p>
          <p className="text-xs font-bold text-[#6A7B92] uppercase tracking-wider">Total Spent</p>
        </div>
      </div>

      {/* ── Redeem Tokens Section ── */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-black text-gray-900">Redeem Tokens</h3>
          <p className="text-xs text-[#6A7B92] font-bold mt-1 uppercase tracking-wider">Convert Zaryo to Cash</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-[#6A7B92] mb-2">
              You can redeem your earned tokens for cash payment. An admin will review your
              request and process the payment through your preferred method.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-8 h-8 bg-[#A7D129]/10 rounded-lg flex items-center justify-center">
                <Coins className="w-4 h-4 text-[#A7D129]" />
              </div>
              <p className="text-sm font-black text-gray-900">
                Available: <span className="text-[#A7D129]">{currentBalance.toLocaleString()} Zaryo</span>
              </p>
            </div>
          </div>
          <div>
            <RedeemTokensDialog
              walletBalance={currentBalance}
              onSuccess={() => {
                loadData();
                refreshProfile();
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Purchase Tokens Section ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-black text-gray-900">Purchase Zaryo Tokens</h3>
          <p className="text-xs text-[#6A7B92] font-bold mt-1 uppercase tracking-wider">Buy tokens to purchase content</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STRIPE_PRODUCTS.filter(p => p.mode === 'payment').map((product) => (
            <div
              key={product.id}
              className="group bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 p-5 hover:border-[#A7D129] hover:shadow-lg hover:shadow-[#A7D129]/10 transition-all duration-200 cursor-pointer"
              onClick={() => handlePurchaseZaryo(product.id)}
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-[#A7D129]/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-[#A7D129] transition-colors">
                  <Coins className="w-6 h-6 text-[#A7D129] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#6A7B92] uppercase tracking-wider mb-1">{product.name}</p>
                  <p className="text-3xl font-black text-gray-900">${product.price}</p>
                </div>
                <Button
                  className="w-full bg-gray-900 hover:bg-[#A7D129] text-white font-black rounded-lg transition-all"
                  size="sm"
                  disabled={purchaseLoading !== null}
                >
                  {purchaseLoading === product.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Redemption Requests History ── */}
      {redemptionRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-black text-gray-900">Redemption Requests</h3>
            <p className="text-xs text-[#6A7B92] font-bold mt-1 uppercase tracking-wider">Your token redemption history</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {redemptionRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#A7D129]/10 rounded-xl flex items-center justify-center">
                      <Coins className="h-5 w-5 text-[#A7D129]" />
                    </div>
                    <div>
                      <div className="font-black text-gray-900">
                        {request.token_count.toLocaleString()} Zaryo
                      </div>
                      <div className="text-xs text-[#6A7B92] font-medium">
                        {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')} • {request.payment_method}
                      </div>
                      {request.notes && (
                        <div className="text-xs text-[#6A7B92] mt-1">
                          {request.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        request.status === 'completed'
                          ? 'bg-green-600 text-white border-0 font-black'
                          : request.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 border-0 font-black'
                          : request.status === 'approved'
                          ? 'bg-blue-600 text-white border-0 font-black'
                          : 'bg-red-600 text-white border-0 font-black'
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                <Coins className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-900">No transactions yet</p>
              <p className="text-xs text-[#6A7B92] mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.amount > 0
                          ? 'bg-green-50'
                          : 'bg-red-50'
                      }`}
                    >
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-black text-gray-900">
                        {transaction.description || transaction.transaction_type}
                      </div>
                      <div className="text-xs text-[#6A7B92] font-medium">
                        {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="text-[10px] text-[#6A7B92] font-mono mt-1">
                        {transaction.transaction_number || transaction.id.slice(0, 16)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xl font-black ${
                        transaction.amount > 0
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount.toLocaleString()}
                    </div>
                    <Badge
                      className={
                        transaction.status === 'completed'
                          ? 'bg-[#A7D129]/10 text-[#A7D129] border-0 font-black text-[10px]'
                          : 'bg-[#6A7B92]/10 text-[#6A7B92] border-0 font-black text-[10px]'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
