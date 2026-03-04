'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Content } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Coins, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Content;
  onSuccess: () => void;
}

export function PurchaseDialog({ open, onOpenChange, content, onSuccess }: PurchaseDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  const userBalance = profile?.token_balance ?? 0;

  const handlePurchase = async () => {
    if (!profile) return;

    if (userBalance < content.price_tokens) {
      setError('Insufficient token balance');
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      // Step 1: Create purchase record with 'pending' status (escrow)
      const { error: purchaseError, data: purchaseData } = await supabase.from('purchases').insert({
        video_id: content.id,
        creator_id: content.creator_id,
        company_id: profile.id,
        tokens_paid: content.price_tokens,
        notes,
        status: 'pending', // Pending until content is approved/delivered
      }).select('id').single();

      if (purchaseError) throw purchaseError;

      // Step 2: Hold tokens in escrow (deducts from buyer, doesn't credit seller yet)
      const { data: escrowId, error: escrowError } = await supabase.rpc('hold_tokens_in_escrow', {
        p_buyer_id: profile.id,
        p_seller_id: content.creator_id,
        p_content_id: content.id,
        p_amount: content.price_tokens,
        p_escrow_type: 'purchase',
        p_reference_id: purchaseData.id,
      });

      if (escrowError) throw escrowError;

      // Step 3: Create token transaction record (as escrow)
      await supabase.from('token_transactions').insert({
        from_user_id: profile.id,
        to_user_id: content.creator_id,
        amount: content.price_tokens,
        transaction_type: 'purchase',
        reference_id: purchaseData.id,
        description: `Escrow: Purchase of content "${content.title}" — tokens held until delivery approved`,
        status: 'pending',
      });

      // Step 4: Update content status to sold
      await supabase
        .from('videos')
        .update({
          status: 'sold',
          updated_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      toast({
        title: 'Purchase Initiated — Tokens in Escrow 🔒',
        description: 'Your tokens are held securely in escrow. The full-resolution content will be available once the creator delivers and you approve it.',
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to complete purchase');
    } finally {
      setPurchasing(false);
    }
  };

  const canAfford = userBalance >= content.price_tokens;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Purchase Content Concept</DialogTitle>
          <DialogDescription>Review the details and complete your purchase. Tokens are held in escrow until delivery is approved.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!canAfford && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have enough Zaryo. Current balance: {userBalance} Zaryo. Required: {content.price_tokens} Zaryo.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {content.content_type === 'video' ? (
                <video src={content.content_url} className="w-full h-full object-cover" controls />
              ) : content.content_type === 'image' ? (
                <img src={content.content_url} alt={content.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <a href={content.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Content
                  </a>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
              {content.description && (
                <p className="text-muted-foreground">{content.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="font-medium">Purchase Price</span>
              <div className="flex items-center text-yellow-600">
                <Coins className="h-5 w-5 mr-2" />
                <span className="text-xl font-bold">{content.price_tokens} Zaryo</span>
              </div>
            </div>

            {/* Escrow explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Secure Escrow Protection</p>
                <p className="mt-1 text-xs">Your Zaryo tokens will be held securely in escrow — not transferred to the creator yet. Once the full-resolution content is delivered and you approve it, the tokens will be released to the creator. If there&apos;s an issue, you can request a refund.</p>
              </div>
            </div>

            {content.watermarked_url && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-[#6A7B92] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  The preview shown above is a watermarked version. After purchase and approval, you&apos;ll get access to the full-resolution, unwatermarked original.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or collaboration details..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={purchasing}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={purchasing || !canAfford}>
              {purchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Purchase with Escrow
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
