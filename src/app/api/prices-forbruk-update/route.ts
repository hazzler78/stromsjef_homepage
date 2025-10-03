import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Production endpoint for Forbrukerrådet integration with DB storage
// Automatically fetches and stores price data from Forbrukerrådet feeds

interface ForbrukerrådetPriceData {
  year: number;
  week: number;
  consumption: number;
  name: string;
  no1: number;
  no2: number;
  no3: number;
  no4: number;
  no5: number;
  national: number;
  createdAt: string;
  updatedAt: string;
}

interface ForbrukerrådetTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshTokenExpiresIn: number;
}

export async function POST(request: Request) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.UPDATE_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting Forbrukerrådet price update...');
    
    const baseUrl = process.env.FORBRUK_BASE_URL || 'https://strom-api.forbrukerradet.no';
    const authUrl = process.env.FORBRUK_AUTH_URL || `${baseUrl}/api/auth/token`;
    const clientId = process.env.FORBRUK_CLIENT_ID;
    const clientSecret = process.env.FORBRUK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Missing Forbrukerrådet credentials' },
        { status: 500 }
      );
    }

    // 1) Get access token
    const tokenResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'stromsjef-prices/1.0',
      },
      body: new URLSearchParams({
        clientId,
        clientSecret,
      }),
      cache: 'no-store',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text().catch(() => '');
      console.error('❌ Token request failed:', tokenResponse.status, errorText);
      return NextResponse.json(
        { error: 'Failed to obtain access token', status: tokenResponse.status, body: errorText },
        { status: 502 }
      );
    }

    const tokenData: ForbrukerrådetTokenResponse = await tokenResponse.json();
    const accessToken = tokenData.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token in response', tokenKeys: Object.keys(tokenData) },
        { status: 502 }
      );
    }

    console.log('✅ Access token obtained');

    // 2) Fetch price data from all available feeds
    const feeds = ['/feed/week', '/feed/agreements', '/feed/prices'];
    const allPriceData: ForbrukerrådetPriceData[] = [];

    for (const feed of feeds) {
      try {
        const feedUrl = `${baseUrl}${feed}`;
        console.log(`📊 Fetching data from ${feedUrl}...`);
        
        const feedResponse = await fetch(feedUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'User-Agent': 'stromsjef-prices/1.0',
          },
          cache: 'no-store',
        });

        if (feedResponse.ok) {
          const feedData: ForbrukerrådetPriceData[] = await feedResponse.json();
          allPriceData.push(...feedData);
          console.log(`✅ Fetched ${feedData.length} records from ${feed}`);
        } else {
          console.warn(`⚠️ Feed ${feed} returned ${feedResponse.status}`);
        }
      } catch (error) {
        console.warn(`⚠️ Error fetching ${feed}:`, error);
      }
    }

    if (allPriceData.length === 0) {
      return NextResponse.json(
        { error: 'No price data retrieved from any feed' },
        { status: 502 }
      );
    }

    console.log(`📊 Total records fetched: ${allPriceData.length}`);

    // 3) Store in database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Transform data for storage
    const transformedData = allPriceData.map(record => ({
      year: record.year,
      week: record.week,
      consumption: record.consumption,
      name: record.name,
      no1: record.no1,
      no2: record.no2,
      no3: record.no3,
      no4: record.no4,
      no5: record.no5,
      national: record.national,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
      source: 'forbrukerradet',
    }));

    // Insert/update data
    const { error: insertError } = await supabase
      .from('forbrukerradet_prices')
      .upsert(transformedData, { 
        onConflict: 'year,week,consumption,name',
        ignoreDuplicates: false 
      });

    if (insertError) {
      console.error('❌ Database insert failed:', insertError);
      return NextResponse.json(
        { error: 'Failed to store price data', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ Price data stored successfully');

    return NextResponse.json({
      success: true,
      message: 'Forbrukerrådet prices updated successfully',
      timestamp: new Date().toISOString(),
      recordsProcessed: allPriceData.length,
      feeds: feeds,
    });

  } catch (error) {
    console.error('❌ Error updating Forbrukerrådet prices:', error);
    return NextResponse.json(
      {
        error: 'Failed to update Forbrukerrådet prices',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
