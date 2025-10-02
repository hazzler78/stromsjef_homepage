import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// INTE edge runtime - för att undvika Supabase-konflikter
// export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const storageKey = searchParams.get('key');
    
    if (!storageKey) {
      return NextResponse.json({ error: 'Missing storage key' }, { status: 400 });
    }

    console.log('Proxy: Fetching image with key:', storageKey);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Hämta filen från storage
    const { data, error } = await supabase.storage
      .from('invoice-ocr')
      .download(storageKey);

    if (error) {
      console.error('Proxy: Storage download error:', error);
      return NextResponse.json({ error: 'Failed to download image', details: error.message }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Konvertera till ArrayBuffer
    const arrayBuffer = await data.arrayBuffer();
    
    // Bestäm content type baserat på filnamn
    let contentType = 'image/jpeg';
    if (storageKey.toLowerCase().includes('.png')) {
      contentType = 'image/png';
    }

    // Returnera bilden som stream
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache i 1 timme
        'Content-Disposition': `inline; filename="${storageKey.split('/').pop()}"`,
      },
    });

  } catch (err) {
    console.error('Proxy: Unexpected error:', err);
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 });
  }
}
