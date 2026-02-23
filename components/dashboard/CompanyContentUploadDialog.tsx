'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, ContentType, Subscription } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, AlertCircle, ShieldCheck, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface CompanyContentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  subscription: Subscription | null;
}

const CONTENT_TYPE_CONFIG = {
  video: {
    label: 'Video',
    accept: 'video/*',
    maxSize: 50,
    description: 'Marketing videos, brand content, campaigns',
  },
  image: {
    label: 'Image',
    accept: 'image/*',
    maxSize: 10,
    description: 'Logos, graphics, promotional images',
  },
  audio: {
    label: 'Audio',
    accept: 'audio/*',
    maxSize: 20,
    description: 'Jingles, voiceovers, audio branding',
  },
  document: {
    label: 'Document',
    accept: '.pdf,.doc,.docx,.txt,.ppt,.pptx',
    maxSize: 15,
    description: 'Briefs, guidelines, templates',
  },
  other: {
    label: 'Other',
    accept: '*',
    maxSize: 25,
    description: 'Any other content type',
  },
};

export function CompanyContentUploadDialog({ open, onOpenChange, onSuccess, subscription }: CompanyContentUploadDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>('video');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStep, setUploadStep] = useState<'idle' | 'checking' | 'uploading' | 'watermarking' | 'done'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Allowed MIME types for integrity checking
  const ALLOWED_MIME_TYPES: Record<ContentType, string[]> = {
    video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/mp4'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    other: [],
  };

  const computeFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const runIntegrityChecks = (file: File, type: ContentType): { passed: boolean; errors: string[] } => {
    const errors: string[] = [];
    const config = CONTENT_TYPE_CONFIG[type];
    const maxSizeBytes = config.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) errors.push(`File exceeds maximum size of ${config.maxSize}MB`);
    if (file.size === 0) errors.push('File is empty (0 bytes)');
    const allowedTypes = ALLOWED_MIME_TYPES[type];
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File format "${file.type || 'unknown'}" is not compatible with content type "${type}"`);
    }
    if (!file.name.split('.').pop()) errors.push('File has no extension');
    if (/[<>:"/\\|?*\x00-\x1f]/.test(file.name)) errors.push('File name contains prohibited characters');
    return { passed: errors.length === 0, errors };
  };

  const generateWatermarkedPreview = async (file: File): Promise<Blob | null> => {
    if (!file.type.startsWith('image/')) return null;
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      img.onload = () => {
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#6A7B92';
        ctx.font = `bold ${Math.max(20, canvas.width / 15)}px Arial`;
        ctx.textAlign = 'center';
        const text = 'ZARIEL & CO';
        const stepX = canvas.width / 3;
        const stepY = canvas.height / 3;
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#6A7B92';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Preview Only — Purchase for Full Resolution', canvas.width / 2, canvas.height - 15);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.6);
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !file) return;

    setUploading(true);
    setError('');
    setUploadStep('checking');
    setUploadProgress(10);

    try {
      // Step 1: Automated Integrity Check
      const integrityResult = runIntegrityChecks(file, contentType);
      if (!integrityResult.passed) {
        throw new Error(`Integrity check failed:\n${integrityResult.errors.join('\n')}`);
      }
      setUploadProgress(25);

      // Step 2: Compute file hash
      const fileHash = await computeFileHash(file);
      setUploadProgress(35);

      // Step 3: Upload original file
      setUploadStep('uploading');
      const fileExt = file.name.split('.').pop();
      const originalPath = `${profile.id}/originals/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(originalPath, file);

      if (uploadError) throw uploadError;
      setUploadProgress(60);

      const { data: { publicUrl: originalUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(originalPath);

      // Step 4: Generate watermarked preview
      setUploadStep('watermarking');
      let watermarkedUrl: string | null = null;

      const watermarkedBlob = await generateWatermarkedPreview(file);
      if (watermarkedBlob) {
        const watermarkPath = `${profile.id}/watermarked/${Date.now()}_preview.jpg`;
        const { error: watermarkUploadError } = await supabase.storage
          .from('content')
          .upload(watermarkPath, watermarkedBlob, { contentType: 'image/jpeg' });

        if (!watermarkUploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('content')
            .getPublicUrl(watermarkPath);
          watermarkedUrl = publicUrl;
        }
      }
      setUploadProgress(80);

      // Step 5: Insert with pending_review status
      const { error: insertError } = await supabase.from('videos').insert({
        creator_id: profile.id,
        title,
        description,
        content_url: watermarkedUrl || originalUrl,
        original_url: originalUrl,
        watermarked_url: watermarkedUrl,
        content_type: contentType,
        price_tokens: 0,
        file_size: file.size,
        file_extension: fileExt,
        file_hash: fileHash,
        integrity_check_passed: true,
        verification_status: 'pending_review',
        status: 'active',
      });

      if (insertError) throw insertError;
      setUploadProgress(95);

      // Only update subscription counter for non-admin users
      if (subscription && !profile.is_admin) {
        await supabase
          .from('subscriptions')
          .update({
            videos_uploaded_this_period: subscription.videos_uploaded_this_period + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);
      }

      setUploadStep('done');
      setUploadProgress(100);

      toast({
        title: 'Content Submitted for Review',
        description: 'Your content has been uploaded and is pending admin verification.',
      });

      setTitle('');
      setDescription('');
      setFile(null);
      setContentType('video');
      setUploadStep('idle');
      setUploadProgress(0);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload content');
      setUploadStep('idle');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const config = CONTENT_TYPE_CONFIG[contentType];
  const isAdminUser = profile ? isAdmin(profile) : false;
  const subscriptionAllowsUploads =
    !!subscription && subscription.status === 'active' && new Date(subscription.current_period_end).getTime() > Date.now();
  // Admins can upload for free, tier 2/3 users need subscription
  const uploadLocked = !isAdminUser && !subscriptionAllowsUploads;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Content to the Marketplace</DialogTitle>
          <DialogDescription>
            Share your content idea - videos, images, audio, documents, and more.
            {isAdminUser && (
              <span className="block mt-1 text-sm text-blue-600 font-medium">
                Admin: Unlimited uploads
              </span>
            )}
            {!isAdminUser && subscription && (
              <span className="block mt-1 text-sm">
                {subscription.videos_uploaded_this_period}/10 items uploaded this period
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {uploadLocked ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-amber-600" />
            <p className="text-sm text-muted-foreground">
              Uploads unlock once you activate a membership.
            </p>
            <Button asChild>
              <Link href="/subscription">View membership plans</Link>
            </Button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your content"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your content offering"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept={config.accept}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Max file size: {config.maxSize}MB
            </p>
            {file && (
              <p className="text-xs text-green-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadStep === 'checking' && 'Running Integrity Checks...'}
                  {uploadStep === 'uploading' && 'Uploading Content...'}
                  {uploadStep === 'watermarking' && 'Generating Preview...'}
                  {uploadStep === 'done' && 'Complete!'}
                  {uploadStep === 'idle' && 'Processing...'}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Content
                </>
              )}
            </Button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-3 pt-2">
              <Progress value={uploadProgress} className="h-2" />
              <div className="flex items-center gap-3 text-sm">
                <div className={`flex items-center gap-1.5 ${uploadStep === 'checking' ? 'text-blue-600 font-medium' : uploadProgress > 25 ? 'text-green-600' : 'text-gray-400'}`}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Integrity Check</span>
                </div>
                <span className="text-gray-300">→</span>
                <div className={`flex items-center gap-1.5 ${uploadStep === 'uploading' ? 'text-blue-600 font-medium' : uploadProgress > 60 ? 'text-green-600' : 'text-gray-400'}`}>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
                </div>
                <span className="text-gray-300">→</span>
                <div className={`flex items-center gap-1.5 ${uploadStep === 'watermarking' ? 'text-blue-600 font-medium' : uploadProgress > 80 ? 'text-green-600' : 'text-gray-400'}`}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Watermark</span>
                </div>
                <span className="text-gray-300">→</span>
                <div className={`flex items-center gap-1.5 ${uploadStep === 'done' ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>Review</span>
                </div>
              </div>
            </div>
          )}

          {/* Info banner about verification */}
          {!uploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold">Content Verification Workflow</p>
                <p className="mt-0.5">Your content will undergo automated integrity checks, then be watermarked for marketplace display. An admin will review and approve it before it goes live. Buyers will only see the watermarked preview until purchase.</p>
              </div>
            </div>
          )}
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
