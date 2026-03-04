'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, DollarSign, Calendar, Briefcase } from 'lucide-react';

interface Gig {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget: number | null;
  budget_type: string;
  budget_max: number | null;
  location: string | null;
  deadline: string | null;
}

interface GigApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gig: Gig;
  onSuccess: () => void;
}

const categoryLabels: Record<string, string> = {
  general: 'General', photography: 'Photography', videography: 'Videography',
  music: 'Music / Audio', design: 'Design & Branding', writing: 'Writing & Copywriting',
  social_media: 'Social Media', acting: 'Acting / Talent', production: 'Production',
  marketing: 'Marketing', other: 'Other',
};

export function GigApplyDialog({ open, onOpenChange, gig, onSuccess }: GigApplyDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ message: '', portfolio: '', rate: '' });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const budgetDisplay = () => {
    if (gig.budget_type === 'negotiable') return 'Negotiable';
    if (!gig.budget) return 'TBD';
    if (gig.budget_type === 'range' && gig.budget_max) return `${gig.budget}–${gig.budget_max} ZARYO`;
    return `${gig.budget} ZARYO`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!form.message.trim()) {
      toast({ title: 'Add a message', description: 'Tell the team why you\'re a great fit.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('gig_applications').insert({
        gig_id:    gig.id,
        user_id:   profile.id,
        message:   form.message.trim(),
        portfolio: form.portfolio.trim() || null,
        rate:      form.rate.trim() || null,
        status:    'pending',
      });

      if (error) {
        // Unique constraint = already applied
        if (error.code === '23505') {
          toast({ title: 'Already applied', description: 'You\'ve already submitted an application for this gig.', variant: 'destructive' });
        } else {
          throw error;
        }
        return;
      }

      toast({ title: '🎉 Application submitted!', description: 'The team will review your application and be in touch.' });
      setForm({ message: '', portfolio: '', rate: '' });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to submit application.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Apply for this Gig</DialogTitle>
          <DialogDescription>
            Submit your interest — the Zariel team will review and follow up.
          </DialogDescription>
        </DialogHeader>

        {/* Gig summary */}
        <div className="bg-[#A7D129]/8 border border-[#A7D129]/20 rounded-xl p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-gray-900 text-base">{gig.title}</p>
              <Badge className="mt-1 bg-[#A7D129]/10 text-[#A7D129] border-0 text-xs font-bold">
                {categoryLabels[gig.category] || gig.category}
              </Badge>
            </div>
            <Briefcase className="w-5 h-5 text-[#A7D129] shrink-0 mt-0.5" />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6A7B92] font-medium pt-1">
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{budgetDisplay()}</span>
            {gig.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{gig.location}</span>}
            {gig.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due {new Date(gig.deadline).toLocaleDateString()}</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Pitch / Cover message */}
          <div className="space-y-1.5">
            <Label htmlFor="apply-msg">
              Why are you a great fit? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="apply-msg"
              value={form.message}
              onChange={e => set('message', e.target.value)}
              placeholder="Introduce yourself, describe your relevant experience, and explain why you'd be perfect for this gig…"
              rows={5}
              required
            />
          </div>

          {/* Portfolio */}
          <div className="space-y-1.5">
            <Label htmlFor="apply-portfolio">Portfolio / Work Samples URL</Label>
            <Input
              id="apply-portfolio"
              value={form.portfolio}
              onChange={e => set('portfolio', e.target.value)}
              placeholder="https://yourportfolio.com or Instagram / Behance link"
            />
          </div>

          {/* Proposed rate */}
          <div className="space-y-1.5">
            <Label htmlFor="apply-rate">Your Proposed Rate or Terms</Label>
            <Input
              id="apply-rate"
              value={form.rate}
              onChange={e => set('rate', e.target.value)}
              placeholder="e.g., 300 ZARYO flat, or open to negotiation"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#A7D129] hover:bg-[#A7D129]/90 text-gray-900 font-black"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
