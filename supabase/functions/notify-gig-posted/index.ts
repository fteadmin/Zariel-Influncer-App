import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') ?? 'notifications@zarielandco.com';
const APP_URL        = Deno.env.get('APP_URL')    ?? 'https://zarielandco.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    // Supabase DB webhook sends { type, table, record, old_record, schema }
    const gig = body.record ?? body;

    if (!gig?.id || !gig?.title) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Fetch all non-admin users who should receive email ─────────────────
    const { data: recipients, error: recErr } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('role', ['creator', 'innovator', 'visionary'])
      .eq('is_admin', false)
      .not('email', 'is', null);

    if (recErr) throw recErr;
    if (!recipients || recipients.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Build email content ─────────────────────────────────────────────────
    const budgetText = (() => {
      if (gig.budget_type === 'negotiable') return 'Negotiable';
      if (!gig.budget) return 'Contact for details';
      if (gig.budget_type === 'range' && gig.budget_max)
        return `${gig.budget}–${gig.budget_max} ZARYO`;
      return `${gig.budget} ZARYO`;
    })();

    const categoryMap: Record<string, string> = {
      general: 'General', photography: 'Photography', videography: 'Videography',
      music: 'Music / Audio', design: 'Design & Branding', writing: 'Writing & Copywriting',
      social_media: 'Social Media', acting: 'Acting / Talent', production: 'Production',
      marketing: 'Marketing', other: 'Other',
    };
    const categoryLabel = categoryMap[gig.category] ?? gig.category;
    const deadline = gig.deadline
      ? new Date(gig.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : null;
    const gigsUrl = `${APP_URL}/gigs`;

    // ── Build one email object per recipient, then send as a single batch ──
    const buildHtml = (firstName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Gig Posted on Zariel</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:#A7D129;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:900;color:#1a1a1a;letter-spacing:-0.5px;">🎯 New Gig Posted!</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#2d2d2d;font-weight:600;">A new opportunity just landed on the Zariel board</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 24px;font-size:15px;color:#374151;">Hi <strong>${firstName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                A new gig has been posted by the Zariel team. Here's a quick summary:
              </p>

              <!-- Gig card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <h2 style="margin:0 0 6px;font-size:19px;font-weight:900;color:#111827;">${gig.title}</h2>
                    <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#A7D129;text-transform:uppercase;letter-spacing:0.08em;">${categoryLabel}</p>
                    ${gig.description ? `<p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">${gig.description}</p>` : ''}
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 12px 4px 0;font-size:13px;color:#374151;font-weight:600;">💰 Budget</td>
                        <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:800;">${budgetText}</td>
                      </tr>
                      ${gig.location ? `<tr>
                        <td style="padding:4px 12px 4px 0;font-size:13px;color:#374151;font-weight:600;">📍 Location</td>
                        <td style="padding:4px 0;font-size:13px;color:#111827;">${gig.location}</td>
                      </tr>` : ''}
                      ${deadline ? `<tr>
                        <td style="padding:4px 12px 4px 0;font-size:13px;color:#374151;font-weight:600;">📅 Deadline</td>
                        <td style="padding:4px 0;font-size:13px;color:#111827;">${deadline}</td>
                      </tr>` : ''}
                    </table>
                    ${gig.requirements ? `
                    <div style="margin-top:16px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">Requirements</p>
                      <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;">${gig.requirements}</p>
                    </div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${gigsUrl}" style="display:inline-block;background:#A7D129;color:#1a1a1a;font-size:14px;font-weight:900;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.02em;">
                      View &amp; Apply on Zariel →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                You're receiving this because you're a member of <strong>Zariel &amp; Co</strong>.<br/>
                <a href="${APP_URL}" style="color:#A7D129;text-decoration:none;">zarielandco.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Build batch payload — one object per recipient (max 100 per Resend batch call)
    const batch = recipients.map((user: { id: string; full_name: string | null; email: string }) => ({
      from:    `Zariel & Co <${FROM_EMAIL}>`,
      to:      [user.email],
      subject: `🎯 New Gig: ${gig.title}`,
      html:    buildHtml(user.full_name?.split(' ')[0] ?? 'there'),
    }));

    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });

    const resBody = await res.json() as { data?: { id: string }[]; error?: string };
    if (!res.ok) throw new Error(`Resend batch error: ${JSON.stringify(resBody)}`);

    const succeeded = resBody.data?.length ?? 0;
    console.log(`Gig email notifications: ${succeeded} sent via batch`);

    return new Response(
      JSON.stringify({ sent: succeeded, failed: 0 }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('notify-gig-posted error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
