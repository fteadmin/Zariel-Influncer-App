'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Edit, Trash2, Eye, ShieldCheck, ShieldX, ShieldAlert, Clock, CheckCircle, XCircle, AlertTriangle, Hash, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Content {
  id: string;
  title: string;
  description: string;
  content_url: string;
  original_url: string | null;
  watermarked_url: string | null;
  thumbnail_url: string;
  content_type: string;
  price_tokens: number;
  status: string;
  verification_status: string;
  integrity_check_passed: boolean;
  file_hash: string | null;
  file_size: number | null;
  file_extension: string | null;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  creator_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export function AdminContentManager() {
  const { profile } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [reviewingContent, setReviewingContent] = useState<Content | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: Content) => {
    setEditingContent(item);
    setNewPrice(item.price_tokens);
    setNewTitle(item.title);
    setNewDescription(item.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingContent) return;

    try {
      const { error } = await supabase
        .from('videos')
        .update({
          price_tokens: newPrice,
          title: newTitle,
          description: newDescription,
        })
        .eq('id', editingContent.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content updated successfully',
      });

      setEditingContent(null);
      loadContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update content',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content deleted successfully',
      });

      loadContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete content',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (contentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ status: newStatus })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Content status changed to ${newStatus}`,
      });

      loadContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  // Content verification review functions
  const handleApproveContent = async (item: Content) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          verification_status: 'verified',
          review_notes: reviewNotes || 'Approved by admin',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
          status: 'active',
        })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Content Approved ✅',
        description: `"${item.title}" has been verified and is now live on the marketplace.`,
      });

      setReviewingContent(null);
      setReviewNotes('');
      loadContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve content',
        variant: 'destructive',
      });
    }
  };

  const handleRejectContent = async (item: Content) => {
    if (!reviewNotes.trim()) {
      toast({
        title: 'Review Notes Required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('videos')
        .update({
          verification_status: 'rejected',
          review_notes: reviewNotes,
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
          status: 'archived',
        })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Content Rejected',
        description: `"${item.title}" has been rejected and archived.`,
      });

      setReviewingContent(null);
      setReviewNotes('');
      loadContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject content',
        variant: 'destructive',
      });
    }
  };

  const handleFlagContent = async (item: Content) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          verification_status: 'flagged',
          review_notes: reviewNotes || 'Flagged for further review',
          reviewed_by: profile?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Content Flagged ⚠️',
        description: `"${item.title}" has been flagged for further review.`,
      });

      setReviewingContent(null);
      setReviewNotes('');
      loadContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to flag content',
        variant: 'destructive',
      });
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><ShieldCheck className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><ShieldX className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'flagged':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200"><ShieldAlert className="h-3 w-3 mr-1" />Flagged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingContent = content.filter(c => c.verification_status === 'pending_review');
  const verifiedContent = content.filter(c => c.verification_status === 'verified');
  const rejectedContent = content.filter(c => c.verification_status === 'rejected');
  const flaggedContent = content.filter(c => c.verification_status === 'flagged');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading content...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#6A7B92]" />
            Content Verification & Management
          </CardTitle>
          <CardDescription>
            Review, verify, and manage all content uploaded to the marketplace. New uploads require admin approval before going live.
          </CardDescription>

          {/* Verification Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-amber-700">{pendingContent.length}</div>
              <div className="text-xs font-medium text-amber-600">Pending Review</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-green-700">{verifiedContent.length}</div>
              <div className="text-xs font-medium text-green-600">Verified</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-red-700">{rejectedContent.length}</div>
              <div className="text-xs font-medium text-red-600">Rejected</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-black text-orange-700">{flaggedContent.length}</div>
              <div className="text-xs font-medium text-orange-600">Flagged</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pending ({pendingContent.length})
              </TabsTrigger>
              <TabsTrigger value="verified" className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified ({verifiedContent.length})
              </TabsTrigger>
              <TabsTrigger value="flagged" className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Flagged ({flaggedContent.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-1">
                <ShieldX className="h-3 w-3" />
                Rejected ({rejectedContent.length})
              </TabsTrigger>
            </TabsList>

            {['pending', 'verified', 'flagged', 'rejected'].map((tab) => {
              const tabContent = tab === 'pending' ? pendingContent
                : tab === 'verified' ? verifiedContent
                : tab === 'flagged' ? flaggedContent
                : rejectedContent;

              return (
                <TabsContent key={tab} value={tab}>
                  {tabContent.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No {tab} content
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tabContent.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                            tab === 'pending' ? 'border-amber-200 bg-amber-50/30' :
                            tab === 'flagged' ? 'border-orange-200 bg-orange-50/30' :
                            tab === 'rejected' ? 'border-red-200 bg-red-50/30' : ''
                          }`}
                        >
                          {/* Content preview */}
                          <div className="w-32 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-100 relative">
                            {item.content_type === 'image' ? (
                              <img
                                src={item.watermarked_url || item.content_url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            {item.watermarked_url && (
                              <div className="absolute bottom-0 left-0 right-0 bg-[#6A7B92]/80 text-white text-[8px] text-center py-0.5">
                                WATERMARKED
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900 truncate">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                                  <span>Creator: {item.profiles?.full_name || 'Unknown'}</span>
                                  <span>•</span>
                                  <span>{item.profiles?.email}</span>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">{item.content_type}</Badge>
                                  {item.file_hash && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1" title={item.file_hash}>
                                        <Hash className="h-3 w-3" />
                                        {item.file_hash.substring(0, 8)}...
                                      </span>
                                    </>
                                  )}
                                  {item.integrity_check_passed && (
                                    <>
                                      <span>•</span>
                                      <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Integrity ✓
                                      </span>
                                    </>
                                  )}
                                </div>
                                {item.review_notes && (
                                  <div className="mt-2 text-xs bg-gray-100 rounded p-2 text-gray-700">
                                    <span className="font-semibold">Review notes:</span> {item.review_notes}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className="text-lg font-bold text-blue-600">
                                  {item.price_tokens} Zaryo
                                </div>
                                {getVerificationBadge(item.verification_status)}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              {/* Review Button - shown for pending and flagged */}
                              {(item.verification_status === 'pending_review' || item.verification_status === 'flagged') && (
                                <Button
                                  size="sm"
                                  className="bg-[#A7D129] hover:bg-[#A7D129]/90 text-white"
                                  onClick={() => { setReviewingContent(item); setReviewNotes(''); }}
                                >
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                  Review
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(item)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(item.original_url || item.content_url, '_blank')}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Original
                              </Button>

                              {item.watermarked_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(item.watermarked_url!, '_blank')}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Watermarked
                                </Button>
                              )}

                              {item.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(item.id, 'archived')}
                                >
                                  Archive
                                </Button>
                              )}

                              {item.status === 'archived' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(item.id, 'active')}
                                >
                                  Activate
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewingContent} onOpenChange={() => setReviewingContent(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#6A7B92]" />
              Content Review
            </DialogTitle>
            <DialogDescription>
              Review this content and decide whether to approve, flag, or reject it.
            </DialogDescription>
          </DialogHeader>

          {reviewingContent && (
            <div className="space-y-4 py-4">
              {/* Content Preview */}
              <div className="border rounded-lg overflow-hidden">
                {reviewingContent.content_type === 'image' ? (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Watermarked Preview</p>
                      <img
                        src={reviewingContent.watermarked_url || reviewingContent.content_url}
                        alt="Watermarked"
                        className="w-full h-40 object-cover rounded"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Original</p>
                      <img
                        src={reviewingContent.original_url || reviewingContent.content_url}
                        alt="Original"
                        className="w-full h-40 object-cover rounded"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center bg-gray-50">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <a
                      href={reviewingContent.original_url || reviewingContent.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Original Content
                    </a>
                  </div>
                )}
              </div>

              {/* Content Details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Title</span>
                  <span className="text-sm font-semibold">{reviewingContent.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Creator</span>
                  <span className="text-sm">{reviewingContent.profiles?.full_name || reviewingContent.profiles?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Type</span>
                  <Badge variant="outline">{reviewingContent.content_type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">File Size</span>
                  <span className="text-sm">{reviewingContent.file_size ? `${(reviewingContent.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Integrity Check</span>
                  <span className={`text-sm flex items-center gap-1 ${reviewingContent.integrity_check_passed ? 'text-green-600' : 'text-red-600'}`}>
                    {reviewingContent.integrity_check_passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {reviewingContent.integrity_check_passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
                {reviewingContent.file_hash && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">File Hash</span>
                    <span className="text-xs font-mono text-gray-600 truncate max-w-[250px]" title={reviewingContent.file_hash}>
                      {reviewingContent.file_hash}
                    </span>
                  </div>
                )}
              </div>

              {/* Review Notes */}
              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your review decision (required for rejection)..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setReviewingContent(null)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => reviewingContent && handleFlagContent(reviewingContent)}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Flag
            </Button>
            <Button
              variant="destructive"
              onClick={() => reviewingContent && handleRejectContent(reviewingContent)}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Reject
            </Button>
            <Button
              className="bg-[#A7D129] hover:bg-[#A7D129]/90 text-white"
              onClick={() => reviewingContent && handleApproveContent(reviewingContent)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Update the content details and pricing
            </DialogDescription>
          </DialogHeader>

          {editingContent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (Zaryo Tokens)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="text-xs text-gray-500">
                Creator: {editingContent.profiles?.full_name} ({editingContent.profiles?.email})
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContent(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
