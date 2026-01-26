"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BidsList } from "./BidsList";

interface ContentWithBids {
  id: string;
  title: string;
  price: number;
  thumbnail_url: string;
  bid_count: number;
  highest_bid: number | null;
  bids: Array<{
    id: string;
    bid_amount: number;
    status: string;
  }>;
}

export function CreatorBidsManager() {
  const [content, setContent] = useState<ContentWithBids[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  useEffect(() => {
    loadContentWithBids();

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
          loadContentWithBids();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadContentWithBids = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get all creator's content with bid information
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select(
          `
          id,
          title,
          price,
          thumbnail_url,
          bid_count,
          highest_bid
        `
        )
        .eq("user_id", user.id)
        .gt("bid_count", 0)
        .order("bid_count", { ascending: false });

      if (videosError) throw videosError;

      // Get all bids for these videos
      const videoIds = videosData?.map((v) => v.id) || [];
      if (videoIds.length === 0) {
        setContent([]);
        setIsLoading(false);
        return;
      }

      const { data: bidsData, error: bidsError } = await supabase
        .from("content_bids")
        .select("id, content_id, bid_amount, status")
        .in("content_id", videoIds);

      if (bidsError) throw bidsError;

      // Combine data
      const contentWithBids = videosData.map((video) => ({
        ...video,
        bids: bidsData?.filter((bid) => bid.content_id === video.id) || [],
      }));

      setContent(contentWithBids);

      // Auto-select first content if none selected
      if (!selectedContent && contentWithBids.length > 0) {
        setSelectedContent(contentWithBids[0].id);
      }
    } catch (error) {
      console.error("Error loading content with bids:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPendingBidsCount = (contentBids: ContentWithBids["bids"]) => {
    return contentBids.filter((bid) => bid.status === "pending").length;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading bids...</div>;
  }

  if (content.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No bids on your content yet. When companies or admins place bids,
            they'll appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedContentData = content.find((c) => c.id === selectedContent);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Content Bids</h2>
        <p className="text-gray-600 mt-1">
          Review and manage bids on your content
        </p>
      </div>

      {content.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {item.thumbnail_url && (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary">
                      {item.bid_count} {item.bid_count === 1 ? 'Bid' : 'Bids'}
                    </Badge>
                    {getPendingBidsCount(item.bids) > 0 && (
                      <Badge variant="destructive">
                        {getPendingBidsCount(item.bids)} Pending
                      </Badge>
                    )}
                    {item.highest_bid && (
                      <span className="text-sm text-green-600 font-medium">
                        Highest: {item.highest_bid} Zaryo
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Original: {item.price} Zaryo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BidsList
              contentId={item.id}
              isCreator={true}
              onBidAccepted={() => loadContentWithBids()}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
