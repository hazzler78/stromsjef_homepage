import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { logId, isCorrect, correctionNotes, correctedTotalExtra, correctedSavings } = body || {};
    if (!logId || typeof logId !== 'number') {
      return NextResponse.json({ error: 'logId saknas eller ogiltigt' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase
      .from('invoice_ocr')
      .update({
        is_correct: typeof isCorrect === 'boolean' ? isCorrect : null,
        correction_notes: typeof correctionNotes === 'string' ? correctionNotes : null,
        corrected_total_extra: typeof correctedTotalExtra === 'number' ? correctedTotalExtra : null,
        corrected_savings: typeof correctedSavings === 'number' ? correctedSavings : null,
      })
      .eq('id', logId);

    if (error) {
      return NextResponse.json({ error: 'Kunde inte uppdatera feedback', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Serverfel', details: String(err) }, { status: 500 });
  }
}


