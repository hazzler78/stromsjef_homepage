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
    
    // Hämta invoice_ocr_id från bill_analysis först (admin skickar bill_analysis.id)
    const { data: billAnalysis, error: billError } = await supabase
      .from('bill_analysis')
      .select('invoice_ocr_id, consent_to_store')
      .eq('id', invoiceId)
      .single();

    if (billError) {
      console.error('Error fetching bill_analysis:', billError);
      return NextResponse.json({ error: 'Bill analysis not found', details: billError.message }, { status: 404 });
    }

    if (!billAnalysis?.invoice_ocr_id) {
      return NextResponse.json({ error: 'No invoice_ocr reference found (possibly old data format)' }, { status: 404 });
    }

    if (!billAnalysis.consent_to_store) {
      return NextResponse.json({ error: 'User did not consent to store image' }, { status: 403 });
    }

    // Använd invoice_ocr_id för att hitta filen
    const { data: fileRow, error } = await supabase
      .from('invoice_ocr_files')
      .select('storage_key')
      .eq('invoice_ocr_id', billAnalysis.invoice_ocr_id)
      .single();

    if (error) {
      console.error('Error fetching invoice_ocr_files:', error);
      return NextResponse.json({ error: 'File reference not found', details: error.message }, { status: 404 });
    }

    if (!fileRow) {
      return NextResponse.json({ error: 'No file stored (upload may have failed)' }, { status: 404 });
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


