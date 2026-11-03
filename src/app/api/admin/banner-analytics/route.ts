import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const authError = verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const supabase = getSupabaseServerClient();
    const [clicksRes, impressionsRes] = await Promise.all([
      supabase.from('banner_clicks').select('*').order('created_at', { ascending: false }),
      supabase.from('banner_impressions').select('*').order('created_at', { ascending: false }),
    ]);

    if (clicksRes.error) {
      return NextResponse.json({ error: clicksRes.error.message }, { status: 500 });
    }
    if (impressionsRes.error) {
      return NextResponse.json({ error: impressionsRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      clicks: clicksRes.data ?? [],
      impressions: impressionsRes.data ?? [],
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}
