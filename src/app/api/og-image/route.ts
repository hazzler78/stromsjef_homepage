import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Hämta HTML från URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OpenGraphBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Extrahera Open Graph-bild
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    
    // Prioritera Open Graph-bild, fallback till Twitter-bild
    const imageUrl = ogImageMatch?.[1] || twitterImageMatch?.[1];
    
    if (imageUrl) {
      // Om bilden är relativ URL, gör den absolut
      const absoluteImageUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : new URL(imageUrl, url).toString();
      
      return NextResponse.json({ imageUrl: absoluteImageUrl });
    }

    return NextResponse.json({ imageUrl: null });
  } catch (error) {
    console.error('Error fetching Open Graph image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
