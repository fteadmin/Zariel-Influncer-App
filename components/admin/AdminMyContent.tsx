'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContentUploadDialog } from '@/components/dashboard/ContentUploadDialog';
import { ContentCard } from '@/components/dashboard/ContentCard';
import { Plus, FileVideo, Search } from 'lucide-react';
import { Content } from '@/lib/supabase';

export function AdminMyContent() {
  const { profile } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      loadContent();
    }
  }, [profile]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContent(content);
    } else {
      const filtered = content.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContent(filtered);
    }
  }, [searchQuery, content]);

  const loadContent = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('creator_id', profile.id)
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

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    loadContent();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Content Library</h2>
          <p className="text-gray-600 mt-1">
            Upload and manage your content (no membership required)
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Content
        </Button>
      </div>

      {content.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Your Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredContent.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileVideo className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No content found' : 'No content yet'}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Start uploading your first content'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Content
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <ContentCard key={item.id} content={item} onUpdate={loadContent} />
          ))}
        </div>
      )}

      <ContentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        subscription={null} // Admin doesn't need subscription
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
