import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const invoiceIdParam = searchParams.get('invoiceId');
    const invoiceId = invoiceIdParam ? parseInt(invoiceIdParam, 10) : NaN;
    if (!invoiceIdParam || Number.isNaN(invoiceId)) {
      return NextResponse.json({ error: 'Missing or invalid invoiceId' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: fileRow, error } = await supabase
      .from('invoice_ocr_files')
      .select('storage_key')
      .eq('invoice_ocr_id', invoiceId)
      .single();

    if (error || !fileRow) {
      return NextResponse.json({ error: 'No image found for this invoice' }, { status: 404 });
    }

    const { data: signed, error: signErr } = await supabase
      .storage
      .from('invoice-ocr')
      .createSignedUrl(fileRow.storage_key, 60 * 10); // 10 minutes

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: 'Could not create signed URL' }, { status: 500 });
    }

    return NextResponse.json({ url: signed.signedUrl });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}


