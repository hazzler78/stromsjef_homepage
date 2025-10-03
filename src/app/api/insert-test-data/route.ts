import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing Supabase configuration'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Insert test data
    const testData = {
      year: 2025,
      week: 1,
      consumption: 2000,
      name: 'spot',
      no1: 45.50,
      no2: 46.20,
      no3: 47.80,
      no4: 48.90,
      no5: 49.10,
      national: 47.30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: 'test'
    };
    
    const { data, error } = await supabase
      .from('forbrukerradet_prices')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({
        error: 'Failed to insert test data',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test data inserted successfully',
      data: data
    });
    
  } catch (error) {
    console.error('Error inserting test data:', error);
    return NextResponse.json({
      error: 'Failed to insert test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const runtime = 'edge';
