'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Coins, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ServiceBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: any;
  onSuccess: () => void;
}

export function ServiceBookingDialog({ open, onOpenChange, service, onSuccess }: ServiceBookingDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');

  const servicePrice = service?.price_type === 'negotiable' ? 0 : (service?.price_amount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !bookingDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a booking date',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Send booking request (no payment yet)
      const { data, error } = await supabase.rpc('book_service_with_tokens', {
        p_service_id: service.id,
        p_booking_date: bookingDate,
        p_duration: duration || null,
        p_message: message || null,
        p_tokens_amount: servicePrice,
      });

      if (error) throw error;
      
      if (data && !data.success) {
        throw new Error(data.error || 'Booking failed');
      }

      toast({
        title: 'Booking Request Sent!',
        description: 'Service provider will review your request. You will pay after they confirm.',
      });

      setBookingDate('');
      setDuration('');
      setMessage('');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send booking request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Service</DialogTitle>
          <DialogDescription>
            {service?.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {servicePrice > 0 && (
            <Alert>
              <Coins className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold">Service Price: {servicePrice} ZARYO Tokens</div>
                <div className="text-sm mt-1 text-muted-foreground">
                  Note: Payment will be required only after the service provider confirms your request
                </div>
              </AlertDescription>
            </Alert>
          )}

          {service?.price_type === 'negotiable' && (
            <Alert>
              <AlertDescription>
                Price is negotiable. Discuss with the service provider after they confirm.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="booking_date">Preferred Date & Time *</Label>
            <Input
              id="booking_date"
              type="datetime-local"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (optional)</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 2 hours, 1 day"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any special requests or details..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Booking Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
