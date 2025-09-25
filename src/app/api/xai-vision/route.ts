import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  const apiKey = process.env.XAI_API_KEY;

  if (!file || !apiKey) {
    return NextResponse.json({ error: 'Missing file or API key' }, { status: 400 });
  }

  // Skicka vidare till xAI Vision API
  const xaiRes = await fetch('https://api.xai.com/v1/vision/invoice', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!xaiRes.ok) {
    const err = await xaiRes.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const data = await xaiRes.json();
  return NextResponse.json(data);
}

export const runtime = 'edge'; 