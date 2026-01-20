'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Content {
  id: string;
  title: string;
  description: string;
  content_url: string;
  thumbnail_url: string;
  content_type: string;
  price_tokens: number;
  status: string;
  creator_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export function AdminContentManager() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
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
        .from('content')
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
        .from('content')
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
        .from('content')
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
          <CardTitle>All Platform Content</CardTitle>
          <CardDescription>
            Manage all content uploaded by creators - edit prices, titles, descriptions, and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No content available</div>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {item.thumbnail_url && (
                    <div className="w-32 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>Creator: {item.profiles?.full_name || 'Unknown'}</span>
                          <span>•</span>
                          <span>{item.profiles?.email}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {item.content_type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-lg font-bold text-blue-600">
                          {item.price_tokens} Zaryo
                        </div>
                        <Badge
                          variant={
                            item.status === 'active'
                              ? 'default'
                              : item.status === 'sold'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
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
                        onClick={() => window.open(item.content_url, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>

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
        </CardContent>
      </Card>

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
