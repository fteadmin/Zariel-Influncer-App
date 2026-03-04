import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// One-time migration route — hit GET /api/admin/run-gigs-migration to create the gigs tables.
// Protected: only works with the service role key in env (server-side only).
export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // We run each statement separately through supabase-js .rpc() or direct fetch
  // to the PostgREST /sql endpoint (available with service key on hosted Supabase).
  const run = async (sql: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'params=single-object',
      },
      body: JSON.stringify({ query: sql }),
    });
    return { status: res.status, body: await res.text() };
  };

  // Use the supabase-js client's underlying fetch to /sql (Supabase exposes this for service role)
  const runSQL = async (label: string, sql: string) => {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/`;
    // Actually use the pg endpoint via supabase admin client
    // The cleanest way without a pg client is the Management API
    const mgmtRes = await fetch(
      `https://api.supabase.com/v1/projects/xysykftmeltbmbrbogxa/database/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      }
    );
    return { label, ok: mgmtRes.ok, status: mgmtRes.status, body: (await mgmtRes.text()).substring(0, 200) };
  };

  const statements = [
    {
      label: 'create gigs table',
      sql: `CREATE TABLE IF NOT EXISTS public.gigs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        posted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'general',
        budget INTEGER,
        budget_type TEXT NOT NULL DEFAULT 'fixed',
        budget_max INTEGER,
        location TEXT,
        deadline DATE,
        requirements TEXT,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
      )`,
    },
    {
      label: 'create gig_notifications table',
      sql: `CREATE TABLE IF NOT EXISTS public.gig_notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        UNIQUE (gig_id, user_id)
      )`,
    },
    { label: 'rls gigs', sql: 'ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY' },
    { label: 'rls gig_notifications', sql: 'ALTER TABLE public.gig_notifications ENABLE ROW LEVEL SECURITY' },
    {
      label: 'policy view gigs',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gigs' AND policyname='Anyone can view gigs') THEN CREATE POLICY "Anyone can view gigs" ON public.gigs FOR SELECT USING (auth.role() = 'authenticated'); END IF; END $$`,
    },
    {
      label: 'policy post gigs (admin)',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gigs' AND policyname='Admins can post gigs') THEN CREATE POLICY "Admins can post gigs" ON public.gigs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))); END IF; END $$`,
    },
    {
      label: 'policy update gigs (admin)',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gigs' AND policyname='Admins can update gigs') THEN CREATE POLICY "Admins can update gigs" ON public.gigs FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))); END IF; END $$`,
    },
    {
      label: 'policy delete gigs (admin)',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gigs' AND policyname='Admins can delete gigs') THEN CREATE POLICY "Admins can delete gigs" ON public.gigs FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin'))); END IF; END $$`,
    },
    {
      label: 'policy user notifs select',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gig_notifications' AND policyname='Users see own gig notifications') THEN CREATE POLICY "Users see own gig notifications" ON public.gig_notifications FOR SELECT USING (user_id = auth.uid()); END IF; END $$`,
    },
    {
      label: 'policy notifs insert',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gig_notifications' AND policyname='System can insert gig notifications') THEN CREATE POLICY "System can insert gig notifications" ON public.gig_notifications FOR INSERT WITH CHECK (true); END IF; END $$`,
    },
    {
      label: 'policy notifs update',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gig_notifications' AND policyname='Users can mark own as read') THEN CREATE POLICY "Users can mark own as read" ON public.gig_notifications FOR UPDATE USING (user_id = auth.uid()); END IF; END $$`,
    },
    {
      label: 'trigger function',
      sql: `CREATE OR REPLACE FUNCTION public.notify_all_on_new_gig() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $fn$ BEGIN INSERT INTO public.gig_notifications (gig_id, user_id) SELECT NEW.id, p.id FROM public.profiles p WHERE p.id <> NEW.posted_by AND p.role IN ('creator', 'innovator', 'visionary') ON CONFLICT (gig_id, user_id) DO NOTHING; RETURN NEW; END; $fn$`,
    },
    {
      label: 'drop old trigger',
      sql: `DROP TRIGGER IF EXISTS trg_notify_on_new_gig ON public.gigs`,
    },
    {
      label: 'create trigger',
      sql: `CREATE TRIGGER trg_notify_on_new_gig AFTER INSERT ON public.gigs FOR EACH ROW EXECUTE FUNCTION public.notify_all_on_new_gig()`,
    },
    {
      label: 'realtime gigs',
      sql: `ALTER PUBLICATION supabase_realtime ADD TABLE public.gigs`,
    },
    {
      label: 'realtime gig_notifications',
      sql: `ALTER PUBLICATION supabase_realtime ADD TABLE public.gig_notifications`,
    },
  ];

  const results = await Promise.all(statements.map(s => runSQL(s.label, s.sql)));

  return NextResponse.json({ results });
}
