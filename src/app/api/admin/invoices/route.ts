import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const runtime = 'edge';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('invoice_ocr')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}


