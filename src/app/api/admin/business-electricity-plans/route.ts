import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const authError = verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from('business_electricity_plans').select('*');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ items: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const row = await req.json();
    if (!row?.id || typeof row.id !== 'string' || !String(row.id).trim()) {
      return NextResponse.json({ error: 'ID krävs' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const id = String(row.id).trim();
    const { data: existing } = await supabase
      .from('business_electricity_plans')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('business_electricity_plans').update(row).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await supabase.from('business_electricity_plans').insert([{ ...row, id }]);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const id = body?.id as string | undefined;
    if (!id) {
      return NextResponse.json({ error: 'ID krävs' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const patch: Record<string, unknown> = {};
    if (typeof body.recommended === 'boolean') patch.recommended = body.recommended;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Inget att uppdatera' }, { status: 400 });
    }

    const { error } = await supabase.from('business_electricity_plans').update(patch).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID krävs' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('business_electricity_plans').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}
