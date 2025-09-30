import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const runtime = 'edge';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    
    // Hämta från bill_analysis (ny struktur)
    const { data, error } = await supabase
      .from('bill_analysis')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mappa bill_analysis kolumner till invoice_ocr format för bakåtkompatibilitet
    const mapped = (data || []).map((item) => ({
      id: item.id,
      created_at: item.created_at,
      session_id: item.session_id,
      user_agent: item.user_agent,
      file_mime: item.file_mime_type,
      file_size: item.file_size,
      image_sha256: item.image_sha256,
      model: item.model_used,
      system_prompt_version: item.system_prompt_version,
      gpt_answer: item.analysis_summary,
      is_correct: item.is_correct,
      correction_notes: item.correction_notes,
      corrected_total_extra: item.corrected_total_extra,
      corrected_savings: item.corrected_savings,
      consent: item.consent_to_store,
    }));

    return NextResponse.json({ items: mapped });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
}


