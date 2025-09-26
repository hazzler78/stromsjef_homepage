import { NextRequest, NextResponse } from 'next/server';
// removed unused createClient
import { getSupabaseServerClient } from '@/lib/supabaseServer';

// Supabase client is created per-request via helper

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const url = request.nextUrl;
    const limitParam = url.searchParams.get('limit');
    const offsetParam = url.searchParams.get('offset');
    const hostParam = url.searchParams.get('host');
    const qParam = url.searchParams.get('q');
    // const includeArchived = url.searchParams.get('includeArchived') === 'true';

    const limit = Math.min(parseInt(limitParam || '20', 10), 100);
    const offset = Math.max(parseInt(offsetParam || '0', 10), 0);

    let query = supabase
      .from('shared_cards')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // TODO: Uncomment when archived column is added to Supabase
    // if (!includeArchived) {
    //   query = query.eq('archived', false);
    // }
    if (hostParam) {
      query = query.eq('source_host', hostParam);
    }
    if (qParam && qParam.trim().length > 0) {
      // Match in title or summary, case-insensitive
      const like = `%${qParam.trim()}%`;
      query = query.or(`title.ilike.${like},summary.ilike.${like}`);
    }

    // Pagination using range (offset/limit)
    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = data || [];
    const total = typeof count === 'number' ? count : null;
    const hasMore = total !== null ? offset + items.length < total : items.length === limit;

    return NextResponse.json({ items, total, limit, offset, hasMore });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Strip basic markdown to plain text (bold, italics, links, lists)
function stripMarkdown(md: string): string {
  if (!md) return '';
  let text = md;
  text = text.replace(/\*\*(.+?)\*\*/g, '$1'); // bold
  text = text.replace(/\*(.+?)\*/g, '$1'); // italics
  text = text.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '$1 ($2)'); // links
  text = text.replace(/^\s*-\s+/gm, '• '); // lists to bullets
  return text.trim();
}

// POST: normalize a card's summary to plain text
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { url, id } = body || {};
    if (!url && !id) {
      return NextResponse.json({ error: 'Provide url or id' }, { status: 400 });
    }

    const query = supabase.from('shared_cards').select('*').limit(1);
    const { data, error } = id ? await query.eq('id', id) : await query.eq('url', url);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const card = data[0] as { id: number; summary: string };
    const cleaned = stripMarkdown(card.summary || '');
    const { error: upErr } = await supabase
      .from('shared_cards')
      .update({ summary: cleaned })
      .eq('id', card.id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    return NextResponse.json({ success: true, id: card.id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: update title/summary/url
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { id, title, summary, url } = body || {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const payload: { title?: string; summary?: string; url?: string } = {};
    if (title !== undefined) payload.title = title;
    if (summary !== undefined) payload.summary = summary;
    if (url !== undefined) payload.url = url;
    // TODO: Add archived support when column exists
    // if (archived !== undefined) payload.archived = !!archived;
    const { error } = await supabase.from('shared_cards').update(payload).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: remove by id
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const id = parseInt(request.nextUrl.searchParams.get('id') || '', 10);
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const { error } = await supabase.from('shared_cards').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';


