'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, User, MessageSquare, Coins, Loader2, AlertCircle, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface Booking {
  id: string;
  service_id: string;
  booking_date: string;
  duration: string;
  message: string;
  status: string;
  tokens_paid: number;
  created_at: string;
  services: Service;
}

export function MyBookingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  // Debug: Log profile when it changes
  useEffect(() => {
    console.log('MyBookingsPage Profile:', profile);
  }, [profile]);

  useEffect(() => {
    if (profile) {
      loadBookings();
      const unsubscribe = subscribeToBookings();
      return unsubscribe;
    }
  }, [profile]);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          services!inner (
            id,
            title,
            description,
            category,
            location,
            profiles:user_id (
              full_name,
              email
            )
          )
        `)
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToBookings = () => {
    const channel = supabase
      .channel('my_bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_bookings',
          filter: `user_id=eq.${profile?.id}`,
        },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handlePayment = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    console.log('Payment Debug:', {
      bookingId,
      requiredAmount: booking?.tokens_paid,
      profileBalance: profile?.token_balance,
      fullProfile: profile
    });
    
    // Check balance before attempting payment
    if (booking && (profile?.token_balance || 0) < booking.tokens_paid) {
      toast({
        title: 'Insufficient Tokens',
        description: `You need ${booking.tokens_paid} ZARYO tokens but only have ${profile?.token_balance || 0}. Please purchase more tokens.`,
        variant: 'destructive',
      });
      return;
    }

    setPayingBookingId(bookingId);
    try {
      const { data, error } = await supabase.rpc('pay_for_booking', {
        p_booking_id: bookingId,
      });

      if (error) throw error;
      
      if (data && !data.success) {
        throw new Error(data.error || 'Payment failed');
      }

      toast({
        title: 'Payment Successful!',
        description: `${data.tokens_paid} ZARYO tokens transferred to service provider`,
      });

      // Refresh profile to update token balance
      await refreshProfile();
      loadBookings();
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setPayingBookingId(null);
    }
  };

  const filterBookingsByStatus = (status: string) => {
    if (status === 'confirmed') {
      // Show both confirmed (awaiting payment) and paid bookings in confirmed tab
      return bookings.filter((b) => b.status === 'confirmed' || b.status === 'paid');
    }
    return bookings.filter((b) => b.status === status);
  };

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{booking.services.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <User className="h-4 w-4 text-[#6A7B92]" />
              <span className="text-sm text-[#6A7B92]">
                Provider: {booking.services.profiles.full_name}
              </span>
            </div>
          </div>
          <Badge
            variant={
              booking.status === 'paid' || booking.status === 'confirmed'
                ? 'default'
                : booking.status === 'pending'
                ? 'secondary'
                : booking.status === 'cancelled'
                ? 'destructive'
                : 'outline'
            }
          >
            {booking.status === 'paid' ? 'Paid' : booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-[#6A7B92]" />
            {new Date(booking.booking_date).toLocaleString()}
          </div>
          {booking.duration && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-[#6A7B92]" />
              {booking.duration}
            </div>
          )}
          {booking.services.location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-[#6A7B92]" />
              {booking.services.location}
            </div>
          )}
          {booking.tokens_paid > 0 && (
            <div className="flex items-center text-sm font-semibold text-[#A7D129]">
              <Coins className="h-4 w-4 mr-1" />
              {booking.tokens_paid} ZARYO Paid
            </div>
          )}
        </div>

        {booking.message && (
          <div className="flex items-start gap-2 p-3 bg-[#6A7B92]/5 border border-[#6A7B92]/20 rounded-lg">
            <MessageSquare className="h-4 w-4 mt-0.5 text-[#6A7B92] flex-shrink-0" />
            <p className="text-sm text-[#6A7B92]">{booking.message}</p>
          </div>
        )}

        {booking.status === 'pending' && (
          <div className="flex items-start gap-2 p-3 bg-[#6A7B92]/10 border border-[#6A7B92]/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-[#6A7B92] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#6A7B92]">
              Awaiting confirmation from the provider
            </p>
          </div>
        )}

        {booking.status === 'confirmed' && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-[#A7D129]/10 border border-[#A7D129]/20 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-[#A7D129] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#6A7B92] mb-2">
                  Booking confirmed! Complete payment to secure your booking.
                </p>
                <Button
                  onClick={() => handlePayment(booking.id)}
                  disabled={payingBookingId === booking.id}
                  size="sm"
                  className="w-full bg-[#A7D129] hover:bg-[#A7D129]/90"
                >
                  <Coins className="h-4 w-4 mr-1" />
                  {payingBookingId === booking.id
                    ? 'Processing...'
                    : `Pay ${booking.tokens_paid} ZARYO`}
                </Button>
              </div>
            </div>
          </div>
        )}

        {booking.status === 'paid' && (
          <div className="flex items-start gap-2 p-3 bg-[#A7D129]/10 border border-[#A7D129]/20 rounded-lg">
            <DollarSign className="h-4 w-4 text-[#A7D129] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#6A7B92]">
              Payment received. Your booking is confirmed!
            </p>
          </div>
        )}

        {booking.status === 'completed' && (
          <div className="flex items-start gap-2 p-3 bg-[#A7D129]/10 border border-[#A7D129]/20 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-[#A7D129] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#6A7B92]">Service completed successfully!</p>
          </div>
        )}

        {booking.status === 'cancelled' && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#6A7B92]">
              This booking has been cancelled
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading your bookings...</div>;
  }

  const pendingBookings = filterBookingsByStatus('pending');
  const confirmedBookings = filterBookingsByStatus('confirmed');
  const completedBookings = filterBookingsByStatus('completed');
  const cancelledBookings = filterBookingsByStatus('cancelled');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Bookings</h1>
        <p className="text-[#6A7B92] mt-2">
          Track and manage your service booking requests
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#6A7B92]">No pending bookings</p>
              </CardContent>
            </Card>
          ) : (
            pendingBookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          {confirmedBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#6A7B92]">No confirmed bookings</p>
              </CardContent>
            </Card>
          ) : (
            confirmedBookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#6A7B92]">No completed bookings</p>
              </CardContent>
            </Card>
          ) : (
            completedBookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {cancelledBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-[#6A7B92]">No cancelled bookings</p>
              </CardContent>
            </Card>
          ) : (
            cancelledBookings.map(renderBookingCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
