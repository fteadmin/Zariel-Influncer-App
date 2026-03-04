'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search, Plus, MapPin, Calendar, DollarSign,
  Briefcase, Clock, CheckCircle, XCircle, Users, Send, Pencil, Trash2,
} from 'lucide-react';
import { GigPostDialog } from './GigPostDialog';
import { GigApplyDialog } from './GigApplyDialog';
import { GigApplicationsDialog } from './GigApplicationsDialog';

interface Gig {
  id: string;
  posted_by: string;
  title: string;
  description: string | null;
  category: string;
  budget: number | null;
  budget_type: string;
  budget_max: number | null;
  location: string | null;
  deadline: string | null;
  requirements: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
  profiles: { full_name: string; email: string };
}

const categoryLabels: Record<string, string> = {
  general:      'General',
  photography:  'Photography',
  videography:  'Videography',
  music:        'Music / Audio',
  design:       'Design & Branding',
  writing:      'Writing & Copywriting',
  social_media: 'Social Media',
  acting:       'Acting / Talent',
  production:   'Production',
  marketing:    'Marketing',
  other:        'Other',
};

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  open:   { label: 'Open',   icon: CheckCircle, color: 'text-[#A7D129] bg-[#A7D129]/10' },
  filled: { label: 'Filled', icon: CheckCircle, color: 'text-blue-600 bg-blue-50'        },
  closed: { label: 'Closed', icon: XCircle,     color: 'text-gray-500 bg-gray-100'       },
};

export function GigsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const isAdmin = profile?.is_admin || profile?.role === 'admin';

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filtered, setFiltered] = useState<Gig[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [postOpen, setPostOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  // Apply dialog
  const [applyGig, setApplyGig] = useState<Gig | null>(null);
  // Admin: applications dialog
  const [applicationsGig, setApplicationsGig] = useState<Gig | null>(null);
  // Admin: edit dialog
  const [editGig, setEditGig] = useState<Gig | null>(null);
  // Admin: delete confirmation
  const [deleteGig, setDeleteGig] = useState<Gig | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Track which gigs the current user has already applied to
  const [appliedGigIds, setAppliedGigIds] = useState<Set<string>>(new Set());
  // Application counts per gig (admin only)
  const [appCounts, setAppCounts] = useState<Record<string, number>>({});

  /* ── Load gigs ─────────────────────────────────────── */
  const loadGigs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('gigs')
        .select(`*, profiles:posted_by (full_name, email)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setGigs(data || []);

      if (!profile) return;

      if (isAdmin) {
        // Load application counts for each gig
        const gigIds = (data || []).map((g: Gig) => g.id);
        if (gigIds.length > 0) {
          const { data: appData } = await supabase
            .from('gig_applications')
            .select('gig_id')
            .in('gig_id', gigIds);
          const counts: Record<string, number> = {};
          (appData || []).forEach((a: { gig_id: string }) => {
            counts[a.gig_id] = (counts[a.gig_id] || 0) + 1;
          });
          setAppCounts(counts);
        }
      } else {
        // Load which gigs the user already applied to
        const { data: myApps } = await supabase
          .from('gig_applications')
          .select('gig_id')
          .eq('user_id', profile.id);
        setAppliedGigIds(new Set((myApps || []).map((a: { gig_id: string }) => a.gig_id)));
      }
    } catch (err) {
      console.error('Error loading gigs:', err);
    } finally {
      setLoading(false);
    }
  }, [profile, isAdmin]);

  /* ── Load unread notification count ────────────────── */
  const loadUnread = useCallback(async () => {
    if (!profile) return;
    try {
      const { count } = await supabase
        .from('gig_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('read', false);
      setUnread(count || 0);
    } catch {}
  }, [profile]);

  /* ── Mark all unread as read when user opens the page ── */
  const markAllRead = useCallback(async () => {
    if (!profile || unread === 0) return;
    await supabase
      .from('gig_notifications')
      .update({ read: true })
      .eq('user_id', profile.id)
      .eq('read', false);
    setUnread(0);
  }, [profile, unread]);

  useEffect(() => {
    loadGigs();
    loadUnread();
  }, [loadGigs, loadUnread]);

  /* ── Mark as read once loaded ───────────────────────── */
  useEffect(() => {
    if (!loading) markAllRead();
  }, [loading, markAllRead]);

  /* ── Realtime: new gig inserted → toast + reload ─────── */
  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel('gigs-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gigs' },
        (payload) => {
          const newGig = payload.new as Gig;
          // Don't notify the admin who just posted it
          if (newGig.posted_by !== profile.id) {
            toast({
              title: '🎯 New Gig Posted!',
              description: `"${newGig.title}" — check it out on the Gigs board.`,
            });
          }
          loadGigs();
          loadUnread();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile, toast, loadGigs, loadUnread]);

  /* ── Filter ─────────────────────────────────────────── */
  useEffect(() => {
    if (!search.trim()) { setFiltered(gigs); return; }
    const q = search.toLowerCase();
    setFiltered(
      gigs.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.location?.toLowerCase().includes(q) ||
        categoryLabels[g.category]?.toLowerCase().includes(q)
      )
    );
  }, [search, gigs]);

  /* ── Budget display ──────────────────────────────────── */
  const budgetDisplay = (g: Gig) => {
    if (g.budget_type === 'negotiable') return 'Negotiable';
    if (!g.budget) return 'Contact for details';
    if (g.budget_type === 'range' && g.budget_max)
      return `${g.budget}–${g.budget_max} ZARYO`;
    return `${g.budget} ZARYO`;
  };

  /* ── Admin: toggle status ────────────────────────────── */
  const toggleStatus = async (gig: Gig) => {
    const next = gig.status === 'open' ? 'closed' : 'open';
    await supabase.from('gigs').update({ status: next }).eq('id', gig.id);
    loadGigs();
  };

  /* ── Admin: delete gig ───────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteGig) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('gigs').delete().eq('id', deleteGig.id);
      if (error) throw error;
      toast({ title: '🗑️ Gig deleted', description: `"${deleteGig.title}" has been removed.` });
      setDeleteGig(null);
      loadGigs();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  /* ─────────────────── RENDER ─────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-sm bg-[#A7D129]" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#A7D129]">
              Gigs Board
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
            Gigs
          </h1>
          <p className="text-[#6A7B92] text-sm font-medium mt-1.5">
            Opportunities posted by the Zariel team — apply or reach out directly
          </p>
        </div>

        {/* Admin: Post button */}
        {isAdmin && (
          <Button
            onClick={() => setPostOpen(true)}
            className="bg-[#A7D129] hover:bg-[#A7D129]/90 text-gray-900 font-black px-6 py-2.5 h-auto rounded-xl shadow-lg shadow-[#A7D129]/25 hover:scale-[1.02] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post a Gig
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6A7B92]/50" />
          <Input
            placeholder="Search gigs by title, category, or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-[#A7D129] focus:border-[#A7D129]"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 text-sm font-semibold text-[#6A7B92]">
        <span>{gigs.filter(g => g.status === 'open').length} open gigs</span>
        <span>·</span>
        <span>{gigs.length} total</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#A7D129] border-t-transparent mx-auto" />
            <p className="text-sm font-semibold text-[#6A7B92]">Loading gigs…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No gigs yet</h3>
          <p className="text-[#6A7B92] text-sm">
            {isAdmin ? 'Be the first to post a gig!' : 'Check back soon — the team will post opportunities here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(gig => {
            const statusCfg = statusConfig[gig.status] || statusConfig.open;
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={gig.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#A7D129]/40 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 flex flex-col"
              >
                {/* Cover image */}
                {gig.image_url && (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={gig.image_url}
                      alt={gig.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}

                <div className="p-5 space-y-4 flex flex-col flex-1">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-gray-900 leading-tight">
                        {gig.title}
                      </h3>
                      <p className="text-xs font-medium text-[#6A7B92] mt-1">
                        Posted by {gig.profiles?.full_name || 'Admin'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge className="bg-[#A7D129]/10 text-[#A7D129] border-0 text-xs font-bold">
                        {categoryLabels[gig.category] || gig.category}
                      </Badge>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {gig.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{gig.description}</p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-baseline gap-1.5">
                      <DollarSign className="h-4 w-4 text-[#A7D129] shrink-0" />
                      <span className="text-base font-black text-gray-900">
                        {budgetDisplay(gig)}
                      </span>
                    </div>
                    {gig.location && (
                      <div className="flex items-center text-sm text-gray-700">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-[#6A7B92]" />
                        {gig.location}
                      </div>
                    )}
                    {gig.deadline && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#6A7B92]" />
                        Deadline: {new Date(gig.deadline).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1.5" />
                      {new Date(gig.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Requirements */}
                  {gig.requirements && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[11px] font-black text-[#6A7B92] uppercase tracking-wider mb-1">Requirements</p>
                      <p className="text-xs text-gray-700 line-clamp-3">{gig.requirements}</p>
                    </div>
                  )}

                  {/* Card actions */}
                  <div className="mt-auto pt-2 space-y-2">
                    {isAdmin ? (
                      <>
                        {/* Admin: view applicants */}
                        <Button
                          className="w-full h-10 rounded-xl font-bold bg-[#A7D129] hover:bg-[#A7D129]/90 text-gray-900 text-sm"
                          onClick={() => setApplicationsGig(gig)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Applicants
                          {(appCounts[gig.id] || 0) > 0 && (
                            <span className="ml-2 bg-gray-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                              {appCounts[gig.id]}
                            </span>
                          )}
                        </Button>
                        {/* Admin: status toggle */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-bold"
                          onClick={() => toggleStatus(gig)}
                        >
                          {gig.status === 'open' ? 'Mark as Closed' : 'Reopen Gig'}
                        </Button>
                        {/* Admin: edit + delete row */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => setEditGig(gig)}
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setDeleteGig(gig)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </>
                    ) : (
                      /* Non-admin: Apply button */
                      gig.status === 'open' ? (
                        appliedGigIds.has(gig.id) ? (
                          <div className="w-full h-10 rounded-xl bg-[#A7D129]/10 text-[#A7D129] font-black text-sm flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4" /> Applied
                          </div>
                        ) : (
                          <Button
                            className="w-full h-10 rounded-xl font-bold bg-[#A7D129] hover:bg-[#A7D129]/90 text-gray-900 text-sm"
                            onClick={() => setApplyGig(gig)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Apply for this Gig
                          </Button>
                        )
                      ) : (
                        <div className="w-full h-10 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm flex items-center justify-center">
                          Gig Closed
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post dialog — admin only */}
      {isAdmin && (
        <GigPostDialog
          open={postOpen}
          onOpenChange={setPostOpen}
          onSuccess={loadGigs}
        />
      )}

      {/* Edit dialog — admin only */}
      {isAdmin && (
        <GigPostDialog
          open={!!editGig}
          onOpenChange={o => { if (!o) setEditGig(null); }}
          gig={editGig}
          onSuccess={() => { setEditGig(null); loadGigs(); }}
        />
      )}

      {/* Delete confirmation — admin only */}
      <AlertDialog open={!!deleteGig} onOpenChange={o => { if (!o) setDeleteGig(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gig?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">"{deleteGig?.title}"</span> will be permanently removed along
              with all its applicant data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {deleting ? 'Deleting…' : 'Yes, delete gig'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Apply dialog — non-admins */}
      {applyGig && (
        <GigApplyDialog
          open={!!applyGig}
          onOpenChange={o => { if (!o) setApplyGig(null); }}
          gig={applyGig}
          onSuccess={() => {
            setAppliedGigIds(prev => { const next = new Set(Array.from(prev)); next.add(applyGig.id); return next; });
            setApplyGig(null);
          }}
        />
      )}

      {/* Applications dialog — admin only */}
      {applicationsGig && (
        <GigApplicationsDialog
          open={!!applicationsGig}
          onOpenChange={o => { if (!o) setApplicationsGig(null); }}
          gigId={applicationsGig.id}
          gigTitle={applicationsGig.title}
        />
      )}
    </div>
  );
}
