import { NextResponse } from 'next/server';
// removed unused createClient
import { getSupabaseServerClient } from '@/lib/supabaseServer';

// Create Supabase client per-request

export async function POST() {
  try {
    const supabase = getSupabaseServerClient();
    // Ta bort alla rader där source = 'test-admin'
    const { error, count } = await supabase
      .from('contract_clicks')
      .delete()
      .eq('source', 'test-admin');

    if (error) {
      console.error('Error clearing test data:', error);
      return NextResponse.json({ 
        error: 'Failed to clear test data',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: count,
      message: `Removed ${count} test records` 
    });
  } catch (error) {
    console.error('Clear test data error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: String(error) 
    }, { status: 500 });
  }
}

export const runtime = 'edge';
