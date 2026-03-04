"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface BidDialogProps {
  contentId: string;
  contentTitle: string;
  currentPrice: number;
  currentHighestBid?: number;
  userBalance: number;
  trigger?: React.ReactNode;
}

export function BidDialog({
  contentId,
  contentTitle,
  currentPrice,
  currentHighestBid,
  userBalance,
  trigger,
}: BidDialogProps) {
  const [open, setOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Minimum bid: at least 1, or 1 above current highest bid if one exists
  const minBid = currentHighestBid
    ? Math.max(currentHighestBid + 1, 1)
    : 1;

  const handleSubmitBid = async () => {
    const amount = parseInt(bidAmount);

    // Validation
    if (!bidAmount || isNaN(amount) || amount < minBid) {
      toast({
        title: "Invalid Bid Amount",
        description: `Bid must be at least ${minBid} Zaryo token${minBid !== 1 ? "s" : ""}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${userBalance} Zaryo tokens available`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Use the escrow RPC — locks tokens immediately and handles re-bids safely
      const { error } = await supabase.rpc("place_bid_with_escrow", {
        p_content_id:  contentId,
        p_bidder_id:   user.id,
        p_bid_amount:  amount,
        p_message:     message.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Bid Placed! 🔒",
        description: `${amount} Zaryo tokens are held in escrow until the creator responds.`,
      });

      setBidAmount("");
      setMessage("");
      setOpen(false);
    } catch (error: any) {
      console.error("Error placing bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to place bid",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Place Bid</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Place a Bid</DialogTitle>
          <DialogDescription>
            Submit your offer for "{contentTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Listed Price: <span className="font-medium text-foreground">{currentPrice} Zaryo</span></p>
              {currentHighestBid ? (
                <p>Current Highest Bid: <span className="font-medium text-foreground">{currentHighestBid} Zaryo</span></p>
              ) : null}
              <p>Your Balance: <span className="font-medium text-foreground">{userBalance} Zaryo</span></p>
              <p className="text-xs text-amber-500 font-medium">🔒 Tokens will be held in escrow until the creator responds.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bidAmount">
              Bid Amount (minimum: {minBid} Zaryo)
            </Label>
            <Input
              id="bidAmount"
              type="number"
              min={minBid}
              max={userBalance}
              step={1}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Enter at least ${minBid}`}
              style={{
                MozAppearance: 'textfield',
                WebkitAppearance: 'none',
              }}
              className="[&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message to Creator (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to the creator..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmitBid} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Place Bid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
