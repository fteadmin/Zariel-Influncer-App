"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Bid {
  id: string;
  bid_amount: number;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  bidder: {
    id: string;
    full_name: string;
    account_type: string;
    company_tier: string | null;
  };
}

interface BidsListProps {
  contentId: string;
  isCreator: boolean;
  onBidAccepted?: () => void;
}

export function BidsList({
  contentId,
  isCreator,
  onBidAccepted,
}: BidsListProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBidId, setProcessingBidId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const { toast } = useToast();

  useEffect(() => {
    loadBids();

    // Subscribe to bid changes
    const subscription = supabase
      .channel(`bids-${contentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "content_bids",
          filter: `content_id=eq.${contentId}`,
        },
        () => {
          loadBids();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [contentId]);

  const loadBids = async () => {
    try {
      const { data, error } = await supabase
        .from("content_bids")
        .select(
          `
          id,
          bid_amount,
          message,
          status,
          created_at,
          bidder:bidder_id (
            id,
            full_name,
            account_type,
            company_tier
          )
        `
        )
        .eq("content_id", contentId)
        .order("bid_amount", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBids((data as any) || []);
    } catch (error) {
      console.error("Error loading bids:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBid = async (bid: Bid) => {
    setProcessingBidId(bid.id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Accepting bid:", {
        bidId: bid.id,
        bidderId: bid.bidder.id,
        creatorId: user.id,
        amount: bid.bid_amount,
        contentId: contentId
      });

      // Transfer tokens from bidder to creator
      const { data: transferData, error: transferError } = await supabase.rpc(
        "transfer_tokens_for_bid",
        {
          p_bid_id: bid.id,
          p_bidder_id: bid.bidder.id,
          p_creator_id: user.id,
          p_amount: bid.bid_amount,
          p_content_id: contentId,
        }
      );

      if (transferError) {
        console.error("Transfer error:", transferError);
        throw transferError;
      }

      console.log("Transfer successful, updating bid status");

      // Update bid status to accepted
      const { error: updateError } = await supabase
        .from("content_bids")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", bid.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      // Reject all other pending bids on this content
      const { error: rejectError } = await supabase
        .from("content_bids")
        .update({ status: "rejected" })
        .eq("content_id", contentId)
        .eq("status", "pending")
        .neq("id", bid.id);

      if (rejectError) {
        console.error("Reject other bids error:", rejectError);
      }

      toast({
        title: "Bid Accepted",
        description: `You've accepted the bid of ${bid.bid_amount} Zaryo tokens. Content removed from marketplace.`,
      });

      if (onBidAccepted) onBidAccepted();
      loadBids();
    } catch (error: any) {
      console.error("Error accepting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept bid",
        variant: "destructive",
      });
    } finally {
      setProcessingBidId(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setProcessingBidId(bidId);

    try {
      const { error } = await supabase
        .from("content_bids")
        .update({ status: "rejected" })
        .eq("id", bidId);

      if (error) throw error;

      toast({
        title: "Bid Rejected",
        description: "The bid has been rejected",
      });

      loadBids();
    } catch (error: any) {
      console.error("Error rejecting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject bid",
        variant: "destructive",
      });
    } finally {
      setProcessingBidId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderBidCard = (bid: Bid) => (
    <Card key={bid.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {bid.bid_amount} Zaryo Tokens
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {bid.bidder.full_name} (
              {bid.bidder.account_type === "company"
                ? `Company ${bid.bidder.company_tier}`
                : bid.bidder.account_type}
              )
            </p>
          </div>
          {getStatusBadge(bid.status)}
        </div>
      </CardHeader>

      <CardContent>
        {bid.message && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Message:</p>
            <p className="text-sm">{bid.message}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-4">
          Placed on {new Date(bid.created_at).toLocaleDateString()} at{" "}
          {new Date(bid.created_at).toLocaleTimeString()}
        </p>

        {isCreator && bid.status === "pending" && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleAcceptBid(bid)}
              disabled={processingBidId === bid.id}
              className="flex-1"
            >
              {processingBidId === bid.id ? "Processing..." : "Accept Bid"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRejectBid(bid.id)}
              disabled={processingBidId === bid.id}
              className="flex-1"
            >
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading bids...</div>;
  }

  if (bids.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No bids yet on this content
          </p>
        </CardContent>
      </Card>
    );
  }

  const pendingBids = bids.filter((b) => b.status === "pending");
  const acceptedBids = bids.filter((b) => b.status === "accepted");
  const rejectedBids = bids.filter((b) => b.status === "rejected");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingBids.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedBids.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedBids.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingBids.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No pending bids
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingBids.map(renderBidCard)
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4 mt-4">
          {acceptedBids.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No accepted bids
                </p>
              </CardContent>
            </Card>
          ) : (
            acceptedBids.map(renderBidCard)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {rejectedBids.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No rejected bids
                </p>
              </CardContent>
            </Card>
          ) : (
            rejectedBids.map(renderBidCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
