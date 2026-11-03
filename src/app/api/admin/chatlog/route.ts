import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const runtime = 'edge';

const SELECT_FIELDS =
  'id, created_at, session_id, user_agent, messages, ai_response, total_tokens';

export async function GET(req: NextRequest) {
  const authError = verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('chatlog')
      .select(SELECT_FIELDS)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = verifyAdminRequest(req);
  if (authError) return authError;

  try {
    const body = (await req.json()) as {
      id?: number;
      ids?: number[];
      session_id?: string;
      session_ids?: string[];
    };

    const supabase = getSupabaseServerClient();

    if (body.id != null) {
      const { error } = await supabase.from('chatlog').delete().eq('id', body.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (body.ids?.length) {
      const { error } = await supabase.from('chatlog').delete().in('id', body.ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (body.session_id) {
      const { error } = await supabase.from('chatlog').delete().eq('session_id', body.session_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (body.session_ids?.length) {
      const { error } = await supabase.from('chatlog').delete().in('session_id', body.session_ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Ingen raderingsparameter angiven' }, { status: 400 });
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
    const body = (await req.json()) as {
      action?: string;
      id?: number;
      messages?: unknown;
    };

    const supabase = getSupabaseServerClient();

    if (body.action === 'cleanup_duplicates') {
      const { data: allLogs, error: fetchError } = await supabase.from('chatlog').select('*');
      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      let updated = 0;
      for (const log of allLogs || []) {
        const messages = log.messages;
        if (messages && Array.isArray(messages) && messages.length > 2) {
          const currentExchange = messages.slice(-2);
          const { error: updateError } = await supabase
            .from('chatlog')
            .update({ messages: currentExchange })
            .eq('id', log.id);
          if (!updateError) updated += 1;
        }
      }

      return NextResponse.json({ ok: true, updated });
    }

    if (body.id != null && body.messages !== undefined) {
      const { error } = await supabase
        .from('chatlog')
        .update({ messages: body.messages })
        .eq('id', body.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Okänd PATCH-action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}
