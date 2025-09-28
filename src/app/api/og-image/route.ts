import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Validera URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json({ imageUrl: null });
    }

    // Timeout för fetch-anrop
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sek timeout

    try {
      // Hämta HTML från URL med olika User-Agent alternativ
      const response = await fetch(targetUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      
      // Extrahera Open Graph-bild med flera mönster
      const patterns = [
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i,
        /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*>/i,
        /<meta[^>]*property=["']twitter:image:src["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      ];
      
      let imageUrl: string | null = null;
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          imageUrl = match[1];
          break;
        }
      }
      
      if (imageUrl) {
        // Rensa och validera bild-URL
        imageUrl = imageUrl.trim();
        
        // Om bilden är relativ URL, gör den absolut
        if (!imageUrl.startsWith('http')) {
          try {
            imageUrl = new URL(imageUrl, targetUrl.toString()).toString();
          } catch {
            return NextResponse.json({ imageUrl: null });
          }
        }
        
        // Validera att det verkligen är en bild-URL
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const hasImageExtension = imageExtensions.some(ext => 
          imageUrl.toLowerCase().includes(ext)
        );
        
        // Acceptera även om det inte har extension (kan vara CDN-URLer)
        if (hasImageExtension || imageUrl.includes('img') || imageUrl.includes('image')) {
          return NextResponse.json({ imageUrl });
        }
      }

      return NextResponse.json({ imageUrl: null });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.log('Request timeout for:', url);
      } else {
        console.log('Fetch error for:', url, fetchError.message);
      }
      return NextResponse.json({ imageUrl: null });
    }
  } catch (error) {
    console.error('Error fetching Open Graph image:', error);
    return NextResponse.json({ imageUrl: null });
  }
}
