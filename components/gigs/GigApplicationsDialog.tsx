'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ExternalLink, Loader2, User, MessageSquare, DollarSign, Clock } from 'lucide-react';

interface Application {
  id: string;
  user_id: string;
  message: string | null;
  portfolio: string | null;
  rate: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  profiles: { full_name: string; email: string; role: string } | null;
}

interface GigApplicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gigId: string;
  gigTitle: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:     { label: 'Pending',     color: 'bg-gray-100 text-gray-600' },
  shortlisted: { label: 'Shortlisted', color: 'bg-blue-50 text-blue-600' },
  accepted:    { label: 'Accepted',    color: 'bg-[#A7D129]/15 text-[#A7D129]' },
  rejected:    { label: 'Rejected',    color: 'bg-red-50 text-red-500' },
};

const roleLabels: Record<string, string> = {
  creator: 'Creator', innovator: 'Innovator', visionary: 'Visionary',
};

export function GigApplicationsDialog({ open, onOpenChange, gigId, gigTitle }: GigApplicationsDialogProps) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gig_applications')
        .select(`*, profiles:user_id (full_name, email, role)`)
        .eq('gig_id', gigId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const apps = (data || []) as Application[];
      setApplications(apps);
      // Pre-fill admin notes
      const n: Record<string, string> = {};
      apps.forEach(a => { n[a.id] = a.admin_note || ''; });
      setNotes(n);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) load(); }, [open, gigId]);

  // Realtime: new application comes in
  useEffect(() => {
    if (!open) return;
    const ch = supabase
      .channel(`applications-${gigId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gig_applications', filter: `gig_id=eq.${gigId}` }, () => {
        load();
        toast({ title: '📩 New application!', description: `Someone just applied to "${gigTitle}"` });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [open, gigId]);

  const updateStatus = async (appId: string, status: string) => {
    setSavingId(appId);
    const { error } = await supabase
      .from('gig_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      toast({ title: 'Status updated' });
    }
    setSavingId(null);
  };

  const saveNote = async (appId: string) => {
    setSavingId(appId);
    const { error } = await supabase
      .from('gig_applications')
      .update({ admin_note: notes[appId] || null, updated_at: new Date().toISOString() })
      .eq('id', appId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Note saved' });
    }
    setSavingId(null);
  };

  const counts = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Applications — {gigTitle}</DialogTitle>
          <DialogDescription className="flex items-center gap-4 mt-1">
            <span>{counts.total} total</span>
            {counts.pending > 0 && <span className="text-amber-600 font-bold">{counts.pending} pending review</span>}
            {counts.shortlisted > 0 && <span className="text-blue-600 font-bold">{counts.shortlisted} shortlisted</span>}
            {counts.accepted > 0 && <span className="text-[#A7D129] font-bold">{counts.accepted} accepted</span>}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#6A7B92]" />
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center">
            <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400">No applications yet</p>
            <p className="text-xs text-gray-400 mt-1">Check back once users start applying.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {applications.map(app => {
              const cfg = statusConfig[app.status] || statusConfig.pending;
              const profile = app.profiles;
              return (
                <div key={app.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
                  {/* Applicant header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#A7D129] flex items-center justify-center text-sm font-black text-white shrink-0">
                        {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm">{profile?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-[#6A7B92]">{profile?.email}</p>
                        <p className="text-[10px] font-bold text-[#6A7B92] uppercase tracking-wider mt-0.5">
                          {roleLabels[profile?.role || ''] || profile?.role || 'Member'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Pitch */}
                  {app.message && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#6A7B92] uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Pitch
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-xl p-3 border border-gray-100">
                        {app.message}
                      </p>
                    </div>
                  )}

                  {/* Portfolio + Rate */}
                  <div className="flex flex-wrap gap-4">
                    {app.portfolio && (
                      <a href={app.portfolio} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" /> View Portfolio
                      </a>
                    )}
                    {app.rate && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700">
                        <DollarSign className="w-3.5 h-3.5 text-[#A7D129]" /> {app.rate}
                      </span>
                    )}
                  </div>

                  {/* Admin controls */}
                  <div className="pt-2 border-t border-gray-200 space-y-3">
                    {/* Status picker */}
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wide w-14 shrink-0">Status</p>
                      <Select value={app.status} onValueChange={v => updateStatus(app.id, v)}>
                        <SelectTrigger className="h-8 text-xs font-bold flex-1 max-w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      {savingId === app.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6A7B92]" />}
                    </div>

                    {/* Admin note */}
                    <div className="flex items-start gap-3">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wide w-14 shrink-0 pt-2">Note</p>
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          value={notes[app.id] || ''}
                          onChange={e => setNotes(n => ({ ...n, [app.id]: e.target.value }))}
                          placeholder="Internal note (not visible to applicant)…"
                          rows={2}
                          className="text-xs resize-none"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 text-xs font-bold h-auto self-end"
                          onClick={() => saveNote(app.id)}
                          disabled={savingId === app.id}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
