import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getAdminClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin environment variables are missing');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        admin:profiles!products_admin_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    return NextResponse.json({ products: products || [] });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
