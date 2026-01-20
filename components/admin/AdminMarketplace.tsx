'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Content } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Archive, CheckCircle, FileVideo, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminMarketplace() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<(Content & { creator?: any })[]>([]);
  const [filteredContent, setFilteredContent] = useState<(Content & { creator?: any })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContent(content);
    } else {
      const filtered = content.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.creator?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContent(filtered);
    }
  }, [searchQuery, content]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          creator:profiles!videos_creator_id_fkey (
            id,
            full_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
      setFilteredContent(data || []);
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
    setSelectedContent(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditPrice(item.price_tokens.toString());
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedContent) return;

    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title: editTitle,
          description: editDescription,
          price_tokens: parseInt(editPrice),
        })
        .eq('id', selectedContent.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content updated successfully',
      });

      setEditDialogOpen(false);
      loadContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update content',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);

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

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';

    try {
      const { error } = await supabase
        .from('videos')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Content ${newStatus === 'active' ? 'activated' : 'archived'} successfully`,
      });

      loadContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update content status',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading marketplace content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Marketplace</h2>
          <p className="text-gray-600 mt-1">
            View and manage all platform content
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Search</CardTitle>
          <CardDescription>Search by title, description, or creator name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Content ({filteredContent.length})</CardTitle>
          <CardDescription>Manage pricing, status, and details for all content</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileVideo className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No content found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.creator?.full_name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{item.creator?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.content_type || 'video'}</Badge>
                      </TableCell>
                      <TableCell>{item.price_tokens} Zaryo</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(item.id, item.status)}
                          >
                            {item.status === 'active' ? (
                              <Archive className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>Update content details and pricing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (Zaryo Tokens)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                min="0"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
