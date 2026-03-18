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
  FileDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

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

  const handleDownload = async () => {
    try {
      const response = await fetch(content.content_url);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename from content title and extension
      const extension = content.file_extension || content.content_type || 'file';
      const filename = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link
      window.location.href = content.content_url;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // Title
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Content Information', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      
      // Add image preview if content is an image
      if (content.content_type === 'image') {
        try {
          // Fetch and add the image
          const imgData = await fetch(content.content_url);
          const imgBlob = await imgData.blob();
          const imgUrl = URL.createObjectURL(imgBlob);
          
          const img = new Image();
          img.src = imgUrl;
          await new Promise((resolve) => { img.onload = resolve; });
          
          const imgWidth = 120;
          const imgHeight = (img.height / img.width) * imgWidth;
          const xPos = (pageWidth - imgWidth) / 2;
          
          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.addImage(img, 'JPEG', xPos, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
          
          URL.revokeObjectURL(imgUrl);
        } catch (error) {
          console.error('Failed to add image to PDF:', error);
        }
      }
      
      // Content Title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Title:', 20, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      const titleLines = pdf.splitTextToSize(content.title, pageWidth - 40);
      pdf.text(titleLines, 20, yPosition);
      yPosition += (titleLines.length * 7) + 8;
      
      // Description
      if (content.description) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Description:', 20, yPosition);
        yPosition += 7;
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const descLines = pdf.splitTextToSize(content.description, pageWidth - 40);
        pdf.text(descLines, 20, yPosition);
        yPosition += (descLines.length * 5) + 8;
      }
      
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Content Details Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Content Details', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      // Price
      pdf.setFont('helvetica', 'bold');
      pdf.text('Price:', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${content.price_tokens} Zaryo`, 70, yPosition);
      yPosition += 7;
      
      // Status
      pdf.setFont('helvetica', 'bold');
      pdf.text('Status:', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(content.status.charAt(0).toUpperCase() + content.status.slice(1), 70, yPosition);
      yPosition += 7;
      
      // Content Type
      pdf.setFont('helvetica', 'bold');
      pdf.text('Type:', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1), 70, yPosition);
      yPosition += 7;
      
      // File Size
      if (content.file_size) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('File Size:', 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${(content.file_size / 1024 / 1024).toFixed(2)} MB`, 70, yPosition);
        yPosition += 7;
      }
      
      // File Extension
      if (content.file_extension) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('File Type:', 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(content.file_extension.toUpperCase(), 70, yPosition);
        yPosition += 7;
      }
      
      // Published Date
      pdf.setFont('helvetica', 'bold');
      pdf.text('Published:', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(format(new Date(content.created_at), 'MMM dd, yyyy'), 70, yPosition);
      yPosition += 10;
      
      // Creator Information
      if (creatorProfile) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Creator Information', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Creator:', 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(creatorProfile.full_name || creatorProfile.email || 'Unknown', 70, yPosition);
        yPosition += 7;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Role:', 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        const roleText = creatorProfile.role === 'innovator' || creatorProfile.role === 'visionary' 
          ? 'Company' 
          : 'Creator';
        pdf.text(roleText, 70, yPosition);
        yPosition += 10;
      }
      
      // Bidding Information
      if (content.bid_count && content.bid_count > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Bidding Information', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Total Bids:', 20, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${content.bid_count}`, 70, yPosition);
        yPosition += 7;
        
        if (content.highest_bid) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Highest Bid:', 20, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${content.highest_bid} Zaryo`, 70, yPosition);
          yPosition += 7;
        }
      }
      
      // Footer
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      // Save the PDF
      const pdfFilename = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_info.pdf`;
      pdf.save(pdfFilename);
    } catch (error) {
      console.error('PDF generation failed:', error);
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
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              className="flex-1 min-w-[140px]"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 min-w-[140px]"
              onClick={handleDownloadPDF}
            >
              <FileDown className="mr-2 h-4 w-4" />
              PDF Info
            </Button>
            <Button variant="outline" className="flex-1 min-w-[140px]" asChild>
              <a href={content.content_url} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                View Full
              </a>
            </Button>
            {showPurchaseButton && onPurchase && content.status === 'active' && (
              <Button
                className="flex-1 min-w-[140px] bg-gradient-to-r from-[#A7D129] to-[#A7D129]/80 hover:from-[#A7D129]/90 hover:to-[#A7D129]/70"
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
