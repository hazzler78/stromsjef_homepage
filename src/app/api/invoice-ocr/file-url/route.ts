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

    console.log('Debug: Looking for invoiceId:', invoiceId);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Hämta invoice_ocr_id från bill_analysis först (admin skickar bill_analysis.id)
    const { data: billAnalysis, error: billError } = await supabase
      .from('bill_analysis')
      .select('invoice_ocr_id, consent_to_store')
      .eq('id', invoiceId)
      .single();

    console.log('Debug: bill_analysis result:', { billAnalysis, billError });

    if (billError) {
      console.error('Error fetching bill_analysis:', billError);
      return NextResponse.json({ error: 'Bill analysis not found', details: billError.message }, { status: 404 });
    }

    if (!billAnalysis?.invoice_ocr_id) {
      console.log('Debug: No invoice_ocr_id found in bill_analysis');
      return NextResponse.json({ error: 'No invoice_ocr reference found (possibly old data format)' }, { status: 404 });
    }

    if (!billAnalysis.consent_to_store) {
      console.log('Debug: User did not consent to store image');
      return NextResponse.json({ error: 'User did not consent to store image' }, { status: 403 });
    }

    console.log('Debug: Looking for files with invoice_ocr_id:', billAnalysis.invoice_ocr_id);
    
    // Använd invoice_ocr_id för att hitta filen (ta senaste om det finns flera)
    const { data: fileRow, error } = await supabase
      .from('invoice_ocr_files')
      .select('storage_key')
      .eq('invoice_ocr_id', billAnalysis.invoice_ocr_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('Debug: invoice_ocr_files result:', { fileRow, error });

    if (error) {
      console.error('Error fetching invoice_ocr_files:', error);
      return NextResponse.json({ error: 'File reference not found', details: error.message }, { status: 404 });
    }

    if (!fileRow) {
      console.log('Debug: No file found in invoice_ocr_files table');
      return NextResponse.json({ error: 'No file stored (upload may have failed)' }, { status: 404 });
    }

    console.log('Debug: Found file with storage_key:', fileRow.storage_key);

    // Använd proxy-endpoint istället för signed URL för att undvika edge runtime-problem
    const proxyUrl = `/api/invoice-ocr/proxy-image?key=${encodeURIComponent(fileRow.storage_key)}`;
    console.log('Debug: Using proxy URL:', proxyUrl);

    return NextResponse.json({ url: proxyUrl });
  } catch (err) {
    console.error('Debug: Unexpected error:', err);
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}


