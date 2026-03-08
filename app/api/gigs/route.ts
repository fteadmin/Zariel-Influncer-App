import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    // Verify the caller is an authenticated admin via their JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);

    // Validate the JWT and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Confirm user is an admin in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single();

    if (profileError || (!profile?.is_admin && profile?.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden — admins only' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, description, category, budget_type, budget, budget_max, location, deadline, requirements, image_url } = body;

    if (!title?.trim() || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // Insert using service role — bypasses RLS
    const { data: insertedGig, error: insertError } = await supabaseAdmin.from('gigs').insert({
      id,
      title:        title.trim(),
      description:  description || null,
      category,
      budget_type:  budget_type || 'fixed',
      budget:       budget ?? null,
      budget_max:   budget_max ?? null,
      location:     location || null,
      deadline:     deadline || null,
      requirements: requirements || null,
      image_url:    image_url || null,
      posted_by:    user.id,
      status:       'open',
    }).select().single();

    if (insertError) throw insertError;

    // Trigger email notifications via Edge Function (non-blocking)
    const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-gig-posted`;
    console.log('=== ATTEMPTING TO SEND EMAIL NOTIFICATIONS ===');
    console.log('Function URL:', functionUrl);
    console.log('Gig ID:', insertedGig?.id);
    
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ record: insertedGig }),
      });
      
      const responseText = await response.text();
      console.log('Edge function response status:', response.status);
      console.log('Edge function response:', responseText);
      
      if (!response.ok) {
        console.error('❌ Edge function returned error:', response.status, responseText);
      } else {
        console.log('✅ Gig notification emails sent successfully!', responseText);
      }
    } catch (emailErr: any) {
      // Log but don't fail the request if email sending fails
      console.error('❌ Failed to call Edge Function:', emailErr.message);
      console.error('Error details:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('POST /api/gigs error:', err);
    return NextResponse.json({ error: err.message || 'Failed to post gig' }, { status: 500 });
  }
}
