"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface BidWithContent {
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
  content: {
    id: string;
    title: string;
    price_tokens: number;
    thumbnail_url: string | null;
  };
}

export function CreatorBidsManager() {
  const [bids, setBids] = useState<BidWithContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [processingBidId, setProcessingBidId] = useState<string | null>(null);
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    loadAllBids();

    // Subscribe to bid changes
    const subscription = supabase
      .channel("creator-bids")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "content_bids",
        },
        () => {
          loadAllBids();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadAllBids = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get all bids on user's content with content and bidder details
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
          ),
          content:content_id (
            id,
            title,
            price_tokens,
            thumbnail_url,
            creator_id
          )
        `
        )
        .eq("content.creator_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter out any bids where content is null (in case content was deleted)
      const validBids = (data || []).filter((bid: any) => bid.content) as any[];
      setBids(validBids);
    } catch (error) {
      console.error("Error loading bids:", error);
      toast({
        title: "Error",
        description: "Failed to load bids. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBid = async (bid: BidWithContent) => {
    setProcessingBidId(bid.id);
    try {
      console.log("Accepting bid:", {
        bidId: bid.id,
        bidderId: bid.bidder.id,
        creatorId: (await supabase.auth.getUser()).data.user?.id,
        amount: bid.bid_amount,
        contentId: bid.content.id,
      });

      // Call the transfer function first
      const { error: transferError } = await supabase.rpc(
        "transfer_tokens_for_bid",
        {
          p_bid_id: bid.id,
          p_bidder_id: bid.bidder.id,
          p_creator_id: (await supabase.auth.getUser()).data.user?.id,
          p_amount: bid.bid_amount,
          p_content_id: bid.content.id,
        }
      );

      if (transferError) {
        console.error("Transfer error:", transferError);
        throw transferError;
      }

      console.log("Transfer successful, updating bid status");

      // Update bid status
      const { error: updateError } = await supabase
        .from("content_bids")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", bid.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      console.log("Bid accepted successfully");

      // Reject all other pending bids on this content
      const { error: rejectError } = await supabase
        .from("content_bids")
        .update({ status: "rejected" })
        .eq("content_id", bid.content.id)
        .eq("status", "pending")
        .neq("id", bid.id);

      if (rejectError) {
        console.error("Error rejecting other bids:", rejectError);
      }

      toast({
        title: "Bid Accepted",
        description: `You've accepted the bid of ${bid.bid_amount} Zaryo tokens. Content removed from marketplace.`,
      });

      // Refresh profile to update token balance in sidebar
      await refreshProfile();
      
      loadAllBids();
    } catch (error: any) {
      console.error("Error accepting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept bid. Please try again.",
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
        description: "The bid has been rejected.",
      });

      loadAllBids();
    } catch (error: any) {
      console.error("Error rejecting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject bid. Please try again.",
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

  const renderBidCard = (bid: BidWithContent) => (
    <Card key={bid.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {bid.content.thumbnail_url && (
                <img
                  src={bid.content.thumbnail_url}
                  alt={bid.content.title}
                  className="w-16 h-12 object-cover rounded"
                />
              )}
              <div>
                <CardTitle className="text-lg">{bid.content.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Original price: {bid.content.price_tokens} Zaryo
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl font-bold text-green-600">
                {bid.bid_amount} Zaryo Tokens
              </p>
              <p className="text-sm text-muted-foreground">
                From: {bid.bidder.full_name} (
                {bid.bidder.account_type === "company"
                  ? `Company ${bid.bidder.company_tier}`
                  : bid.bidder.account_type}
                )
              </p>
            </div>
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

        {bid.status === "pending" && (
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
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Content Bids</h2>
          <p className="text-gray-600 mt-1">
            Review and manage bids on your content
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No bids on your content yet. When companies or admins place bids,
              they'll appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingBids = bids.filter((b) => b.status === "pending");
  const acceptedBids = bids.filter((b) => b.status === "accepted");
  const rejectedBids = bids.filter((b) => b.status === "rejected");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Content Bids</h2>
        <p className="text-gray-600 mt-1">
          Review and manage all bids on your content
        </p>
      </div>

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
