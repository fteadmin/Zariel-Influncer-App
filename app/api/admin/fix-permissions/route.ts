import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  // Initialise inside the handler so env vars are resolved at request time, not build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get all profiles with @futuretrendsent.info email
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, is_admin, role')
      .ilike('email', '%@futuretrendsent.info');

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        message: 'No profiles found with @futuretrendsent.info email',
        updated: 0,
      });
    }

    // Update all profiles that don't have is_admin set
    const needsUpdate = profiles.filter(p => !p.is_admin || p.role !== 'admin');
    
    if (needsUpdate.length === 0) {
      return NextResponse.json({
        message: 'All @futuretrendsent.info users already have admin access',
        totalFound: profiles.length,
        updated: 0,
      });
    }

    // Batch update
    const updatePromises = needsUpdate.map(profile =>
      supabase
        .from('profiles')
        .update({ is_admin: true, role: 'admin' })
        .eq('id', profile.id)
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: 'Successfully updated admin flags',
      totalFound: profiles.length,
      updated: needsUpdate.length,
      updatedEmails: needsUpdate.map(p => p.email),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update admin flags', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check current status
export async function GET(request: NextRequest) {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, is_admin, role')
      .ilike('email', '%@futuretrendsent.info');

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalUsers: profiles?.length || 0,
      profiles: profiles?.map(p => ({
        email: p.email,
        is_admin: p.is_admin,
        role: p.role,
      })) || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to check admin status', details: error.message },
      { status: 500 }
    );
  }
}
