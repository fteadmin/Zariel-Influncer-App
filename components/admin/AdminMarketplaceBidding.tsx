'use client';

import { useEffect, useState } from 'react';
import { supabase, Content, TokenWallet } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BidDialog } from '@/components/dashboard/BidDialog';
import { BidsList } from '@/components/dashboard/BidsList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Gavel, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentWithCreator extends Content {
  profiles: {
    full_name: string;
    email: string;
  };
}

export function AdminMarketplaceBidding() {
  const [content, setContent] = useState<ContentWithCreator[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentWithCreator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<TokenWallet | null>(null);
  const [selectedContentForBids, setSelectedContentForBids] = useState<ContentWithCreator | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
    loadWallet();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = content.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.profiles.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContent(filtered);
    } else {
      setFilteredContent(content);
    }
  }, [searchQuery, content]);

  const loadWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load balance from profiles.token_balance
      const { data } = await supabase
        .from('profiles')
        .select('token_balance')
        .eq('id', user.id)
        .single();

      // Create wallet object for compatibility
      if (data) {
        setWallet({
          id: user.id,
          user_id: user.id,
          balance: data.token_balance || 0,
          total_earned: 0,
          total_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:creator_id (
            full_name,
            email
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
      setFilteredContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Admin Marketplace - Bidding</h2>
        <p className="text-muted-foreground mt-1">
          Place bids on creator content using Zaryo tokens
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Zaryo Balance</CardTitle>
          <CardDescription>
            <span className="text-2xl font-bold text-yellow-600">
              {wallet?.balance.toLocaleString() || 0} Zaryo
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title, description, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Loading content...</div>
      ) : filteredContent.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No content found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContent.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {item.thumbnail_url && (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-32 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {item.profiles.full_name}
                        </p>
                      </div>
                      <Badge className="bg-yellow-600">
                        {item.price_tokens} Zaryo
                      </Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {(item.bid_count && item.bid_count > 0) && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <Gavel className="h-3 w-3 mr-1" />
                          {item.bid_count} {item.bid_count === 1 ? 'Bid' : 'Bids'}
                        </Badge>
                        {item.highest_bid && (
                          <span className="text-sm text-green-600 font-medium">
                            Highest: {item.highest_bid} Zaryo
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <BidDialog
                        contentId={item.id}
                        contentTitle={item.title}
                        currentPrice={item.price_tokens}
                        currentHighestBid={item.highest_bid || undefined}
                        userBalance={wallet?.balance || 0}
                        trigger={
                          <Button variant="default">
                            <Gavel className="mr-2 h-4 w-4" />
                            Place Bid
                          </Button>
                        }
                      />
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Bids
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Bids on "{item.title}"</DialogTitle>
                          </DialogHeader>
                          <BidsList
                            contentId={item.id}
                            isCreator={false}
                          />
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" asChild>
                        <a href={item.content_url} target="_blank" rel="noopener noreferrer">
                          Preview
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
