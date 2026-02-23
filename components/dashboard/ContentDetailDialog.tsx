'use client';

import { useState, useEffect } from 'react';
import { Content, Profile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Music,
  Image as ImageIcon,
  Film,
  Download,
  Calendar,
  Coins,
  Eye,
  User,
  Building2,
  Gavel,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';

interface ContentDetailDialogProps {
  content: Content;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showPurchaseButton?: boolean;
  onPurchase?: (content: Content) => void;
}

export function ContentDetailDialog({
  content,
  open,
  onOpenChange,
  showPurchaseButton = false,
  onPurchase,
}: ContentDetailDialogProps) {
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (open && content.creator_id) {
      fetchCreatorProfile();
    }
  }, [open, content.creator_id]);

  const fetchCreatorProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', content.creator_id)
      .maybeSingle();

    if (data) {
      setCreatorProfile(data as Profile);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Film className="h-5 w-5" />;
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sold':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderPreview = () => {
    switch (content.content_type) {
      case 'video':
        return (
          <video
            src={content.content_url}
            className="w-full rounded-xl"
            controls
            preload="metadata"
          />
        );
      case 'image':
        return (
          <img
            src={content.content_url}
            alt={content.title}
            className="w-full rounded-xl object-contain max-h-96"
          />
        );
      case 'audio':
        return (
          <div className="w-full p-8 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <Music className="h-16 w-16 text-purple-600 mb-4" />
            <audio src={content.content_url} controls className="w-full" />
          </div>
        );
      case 'document':
        return (
          <div className="w-full p-8 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
            <FileText className="h-16 w-16 text-blue-600 mb-4" />
            <p className="text-sm text-blue-700 font-medium mb-4">
              {content.file_extension?.toUpperCase()} Document
            </p>
            <Button variant="outline" asChild>
              <a
                href={content.content_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Open Document
              </a>
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 pr-8">
            {getContentTypeIcon(content.content_type)}
            <DialogTitle className="text-2xl font-black">{content.title}</DialogTitle>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`${getStatusColor(content.status)} font-semibold`}>
              {content.status}
            </Badge>
          </div>
          <DialogDescription className="text-base mt-2">
            {content.description || 'No description provided'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-4 relative">
            {renderPreview()}
            {content.watermarked_url && (
              <div className="mt-2 bg-[#6A7B92]/10 border border-[#6A7B92]/20 rounded-lg p-2 flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-[#6A7B92]" />
                <span className="text-xs text-[#6A7B92] font-medium">
                  Watermarked preview — full resolution available after purchase
                </span>
              </div>
            )}
          </div>

          {/* Content Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-[#A7D129]" />
                <div>
                  <p className="text-xs text-[#6A7B92] font-medium">Price</p>
                  <p className="font-black text-lg text-gray-900">
                    {content.price_tokens} Zaryo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-[#6A7B92]" />
                <div>
                  <p className="text-xs text-[#6A7B92] font-medium">Published</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(content.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {content.file_size && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-[#6A7B92]" />
                  <div>
                    <p className="text-xs text-[#6A7B92] font-medium">File Size</p>
                    <p className="font-semibold text-gray-900">
                      {(content.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {creatorProfile && (
                <div className="flex items-center gap-2 text-sm">
                  {creatorProfile.role === 'innovator' || creatorProfile.role === 'visionary' ? (
                    <Building2 className="h-4 w-4 text-[#6A7B92]" />
                  ) : (
                    <User className="h-4 w-4 text-[#6A7B92]" />
                  )}
                  <div>
                    <p className="text-xs text-[#6A7B92] font-medium">
                      {creatorProfile.role === 'innovator' || creatorProfile.role === 'visionary'
                        ? 'Company'
                        : 'Creator'}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {creatorProfile.full_name || creatorProfile.email || 'Unknown'}
                    </p>
                  </div>
                </div>
              )}

              {content.bid_count && content.bid_count > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Gavel className="h-4 w-4 text-[#6A7B92]" />
                  <div>
                    <p className="text-xs text-[#6A7B92] font-medium">Active Bids</p>
                    <p className="font-semibold text-gray-900">
                      {content.bid_count} {content.bid_count === 1 ? 'bid' : 'bids'}
                      {content.highest_bid && (
                        <span className="text-[#A7D129] ml-2">
                          (Highest: {content.highest_bid} Zaryo)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {content.file_extension && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-[#6A7B92]" />
                  <div>
                    <p className="text-xs text-[#6A7B92] font-medium">File Type</p>
                    <p className="font-semibold text-gray-900 uppercase">
                      {content.file_extension}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <a
                href={content.content_url}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href={content.content_url} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                View Full
              </a>
            </Button>
            {showPurchaseButton && onPurchase && content.status === 'active' && (
              <Button
                className="flex-1 bg-gradient-to-r from-[#A7D129] to-[#A7D129]/80 hover:from-[#A7D129]/90 hover:to-[#A7D129]/70"
                onClick={() => {
                  onPurchase(content);
                  onOpenChange(false);
                }}
              >
                <Coins className="mr-2 h-4 w-4" />
                Purchase
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
