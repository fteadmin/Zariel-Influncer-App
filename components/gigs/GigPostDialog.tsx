'use client';

import { useState, useEffect } from 'react';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface GigForEdit {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget_type: string;
  budget: number | null;
  budget_max: number | null;
  location: string | null;
  deadline: string | null;
  requirements: string | null;
  image_url: string | null;
  status: string;
}

interface GigPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  /** Pass an existing gig to edit it instead of creating a new one */
  gig?: GigForEdit | null;
}

const gigCategories = [
  { value: 'general',        label: 'General' },
  { value: 'photography',    label: 'Photography' },
  { value: 'videography',    label: 'Videography' },
  { value: 'music',          label: 'Music / Audio' },
  { value: 'design',         label: 'Design & Branding' },
  { value: 'writing',        label: 'Writing & Copywriting' },
  { value: 'social_media',   label: 'Social Media' },
  { value: 'acting',         label: 'Acting / Talent' },
  { value: 'production',     label: 'Production' },
  { value: 'marketing',      label: 'Marketing' },
  { value: 'other',          label: 'Other' },
];

const budgetTypes = [
  { value: 'fixed',       label: 'Fixed Budget' },
  { value: 'range',       label: 'Budget Range' },
  { value: 'negotiable',  label: 'Negotiable' },
];

export function GigPostDialog({ open, onOpenChange, onSuccess, gig }: GigPostDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const isEdit = !!gig;
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    title: '', description: '', category: '', budget_type: 'fixed',
    budget: '', budget_max: '', location: '', deadline: '',
    requirements: '', image_url: '',
  };

  const [form, setForm] = useState(emptyForm);

  // Pre-fill when editing
  useEffect(() => {
    if (gig) {
      setForm({
        title:        gig.title,
        description:  gig.description ?? '',
        category:     gig.category,
        budget_type:  gig.budget_type,
        budget:       gig.budget != null ? String(gig.budget) : '',
        budget_max:   gig.budget_max != null ? String(gig.budget_max) : '',
        location:     gig.location ?? '',
        deadline:     gig.deadline ? gig.deadline.slice(0, 10) : '',
        requirements: gig.requirements ?? '',
        image_url:    gig.image_url ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gig, open]);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!form.title.trim() || !form.category) {
      toast({ title: 'Missing fields', description: 'Title and category are required.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title:        form.title.trim(),
        description:  form.description.trim() || null,
        category:     form.category,
        budget_type:  form.budget_type,
        budget:       form.budget ? parseInt(form.budget) : null,
        budget_max:   form.budget_type === 'range' && form.budget_max ? parseInt(form.budget_max) : null,
        location:     form.location.trim() || null,
        deadline:     form.deadline || null,
        requirements: form.requirements.trim() || null,
        image_url:    form.image_url.trim() || null,
      };

      if (isEdit && gig) {
        const { error } = await supabase.from('gigs').update(payload).eq('id', gig.id);
        if (error) throw error;
        toast({ title: '✅ Gig updated!', description: 'Changes saved successfully.' });
      } else {
        const { data: inserted, error } = await supabase
          .from('gigs')
          .insert({ ...payload, posted_by: profile.id, status: 'open' })
          .select()
          .single();
        if (error) throw error;

        // Fire email notifications to all users — non-blocking
        supabase.functions.invoke('notify-gig-posted', { body: { record: inserted } })
          .catch((err) => console.error('notify-gig-posted failed:', err));

        toast({ title: '🎉 Gig posted!', description: 'All users have been notified.' });
      }

      setForm(emptyForm);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Gig save error:', { message: err.message, details: err.details, hint: err.hint, code: err.code, err });
      const detail = err.details ? ` — ${err.details}` : '';
      toast({ title: 'Error', description: (err.message || 'Failed to save gig.') + detail, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">
            {isEdit ? 'Edit Gig' : 'Post a New Gig'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details below. Changes are saved immediately.'
              : "This gig will be visible to all creators, innovators, and visionaries — and they'll be notified instantly."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="gig-title">Gig Title *</Label>
            <Input
              id="gig-title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g., Looking for a music video director"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {gigCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="gig-desc">Description</Label>
            <Textarea
              id="gig-desc"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe what you're looking for…"
              rows={4}
            />
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <Label>Budget Type</Label>
            <Select value={form.budget_type} onValueChange={v => set('budget_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {budgetTypes.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {form.budget_type !== 'negotiable' && (
            <div className={`grid gap-4 ${form.budget_type === 'range' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="space-y-1.5">
                <Label htmlFor="gig-budget">{form.budget_type === 'range' ? 'Min Budget (ZARYO)' : 'Budget (ZARYO)'}</Label>
                <Input
                  id="gig-budget"
                  type="number"
                  min={0}
                  value={form.budget}
                  onChange={e => set('budget', e.target.value)}
                  placeholder="0"
                />
              </div>
              {form.budget_type === 'range' && (
                <div className="space-y-1.5">
                  <Label htmlFor="gig-budget-max">Max Budget (ZARYO)</Label>
                  <Input
                    id="gig-budget-max"
                    type="number"
                    min={0}
                    value={form.budget_max}
                    onChange={e => set('budget_max', e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          )}

          {/* Location + Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gig-loc">Location</Label>
              <Input
                id="gig-loc"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="e.g., Remote or New York"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gig-deadline">Deadline</Label>
              <Input
                id="gig-deadline"
                type="date"
                value={form.deadline}
                onChange={e => set('deadline', e.target.value)}
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-1.5">
            <Label htmlFor="gig-req">Requirements</Label>
            <Textarea
              id="gig-req"
              value={form.requirements}
              onChange={e => set('requirements', e.target.value)}
              placeholder="Any specific skills, gear, or experience needed…"
              rows={3}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label htmlFor="gig-img">Cover Image URL (optional)</Label>
            <Input
              id="gig-img"
              value={form.image_url}
              onChange={e => set('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
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
              {isEdit ? 'Save Changes' : 'Post Gig & Notify All Users'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
