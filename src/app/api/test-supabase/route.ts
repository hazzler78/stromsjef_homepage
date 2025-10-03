import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('Supabase Key:', supabaseKey ? 'Set' : 'Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing Supabase configuration',
        url: supabaseUrl ? 'Set' : 'Missing',
        key: supabaseKey ? 'Set' : 'Missing'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection by trying to fetch from the table
    const { data, error } = await supabase
      .from('forbrukerradet_prices')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        error: 'Supabase query failed',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase',
      tableExists: true,
      recordCount: data?.length || 0,
      sampleData: data?.[0] || null
    });
    
  } catch (error) {
    console.error('Error testing Supabase:', error);
    return NextResponse.json({
      error: 'Failed to test Supabase connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
