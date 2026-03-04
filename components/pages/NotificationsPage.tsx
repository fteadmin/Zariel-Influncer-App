'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Bell, Coins, Package, FileVideo, Briefcase, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'token' | 'purchase' | 'content' | 'system' | 'gig';
  title: string;
  description: string;
  amount?: number;
  incoming?: boolean;
  reference_number?: string;
  created_at: string;
  read: boolean;
}

export function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (profile) {
      // Load read notifications from localStorage
      const stored = localStorage.getItem(`read_notifications_${profile.id}`);
      if (stored) {
        setReadNotifications(new Set(JSON.parse(stored)));
      }
      loadNotifications();
    }
  }, [profile]);

  const loadNotifications = async () => {
    if (!profile) return;

    try {
      // Get recent token transactions
      const { data: transactions } = await supabase
        .from('token_transactions')
        .select('*, transaction_number')
        .or(`from_user_id.eq.${profile.id},to_user_id.eq.${profile.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get recent purchases
      const { data: purchases } = await supabase
        .from('purchases')
        .select('*, order_number, videos(title)')
        .eq('company_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get recent gigs (non-admins only — admins post gigs, not receive them)
      const isAdmin = profile.is_admin || profile.role === 'admin';
      const { data: gigs } = !isAdmin
        ? await supabase
            .from('gigs')
            .select('id, title, category, created_at')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(20)
        : { data: [] };

      // Get stored read status
      const stored = localStorage.getItem(`read_notifications_${profile.id}`);
      const readIds = stored ? new Set(JSON.parse(stored)) : new Set<string>();

      // Transform transactions into notifications
      const txNotifications: Notification[] = (transactions || []).map(tx => ({
        id: tx.id,
        type: 'token' as const,
        title: tx.from_user_id === profile.id ? 'Token Payment' : 'Token Received',
        description: tx.description || tx.transaction_type,
        amount: tx.amount,
        incoming: tx.to_user_id === profile.id,
        reference_number: tx.transaction_number,
        created_at: tx.created_at,
        read: readIds.has(tx.id),
      }));

      // Transform purchases into notifications
      const purchaseNotifications: Notification[] = (purchases || []).map(p => ({
        id: p.id,
        type: 'purchase' as const,
        title: 'Content Purchase',
        description: `Purchased: ${p.videos?.title || 'Content'}`,
        amount: p.price_tokens,
        incoming: false,
        reference_number: p.order_number,
        created_at: p.created_at,
        read: readIds.has(p.id),
      }));

      // Transform gigs into notifications
      const gigNotifications: Notification[] = (gigs || []).map(g => ({
        id: `gig-${g.id}`,
        type: 'gig' as const,
        title: 'New Gig Posted',
        description: `"${g.title}" — ${g.category}`,
        created_at: g.created_at,
        read: readIds.has(`gig-${g.id}`),
      }));

      // Combine and sort by date
      const allNotifications = [...txNotifications, ...purchaseNotifications, ...gigNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    if (!profile) return;
    
    const newReadSet = new Set(readNotifications);
    newReadSet.add(notificationId);
    setReadNotifications(newReadSet);
    
    // Update localStorage
    localStorage.setItem(`read_notifications_${profile.id}`, JSON.stringify(Array.from(newReadSet)));
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    if (!profile) return;
    
    const allIds = new Set(notifications.map(n => n.id));
    setReadNotifications(allIds);
    
    // Update localStorage
    localStorage.setItem(`read_notifications_${profile.id}`, JSON.stringify(Array.from(allIds)));
    
    // Update local state
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'token':
        return <Coins className="w-5 h-5" />;
      case 'purchase':
        return <Package className="w-5 h-5" />;
      case 'content':
        return <FileVideo className="w-5 h-5" />;
      case 'gig':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Bell className="h-12 w-12 text-gray-400 mx-auto animate-pulse" />
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-sm bg-[#A7D129]" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6A7B92]">
              Activity Center
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
            Notifications
          </h1>
          <p className="text-[#6A7B92] text-sm font-medium mt-1.5">
            All your activity and updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-gray-900 text-white' : ''}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? 'bg-gray-900 text-white' : ''}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </Button>
          {notifications.some(n => !n.read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-[#A7D129] hover:text-[#A7D129] hover:bg-[#A7D129]/10"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500 text-center">
              {filter === 'unread' 
                ? "You're all caught up!" 
                : 'Your activity and updates will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-[#A7D129]/5' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notification.type === 'token' && notification.incoming
                    ? 'bg-[#A7D129]/10 text-[#A7D129]'
                    : notification.type === 'token'
                    ? 'bg-[#6A7B92]/10 text-[#6A7B92]'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-gray-900">{notification.title}</h3>
                      {notification.reference_number && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#6A7B92]/10 text-[#6A7B92]">
                          {notification.reference_number}
                        </span>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-[#A7D129] flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-[#6A7B92] mb-2">{notification.description}</p>
                  <p className="text-[10px] text-gray-400">
                    {format(new Date(notification.created_at), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>

                {notification.amount != null && (
                  <div className={`text-right flex-shrink-0 ${
                    notification.incoming ? 'text-[#A7D129]' : 'text-[#6A7B92]'
                  }`}>
                    <p className="text-sm font-black">
                      {notification.incoming ? '+' : '-'}{notification.amount}
                    </p>
                    <p className="text-[10px] font-bold opacity-60">Zaryo</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
