import { NextResponse } from 'next/server';
// removed unused createClient
import { getSupabaseServerClient } from '@/lib/supabaseServer';

// Create Supabase client per-request

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    // Hämta alla contract clicks med besparingsbelopp
    const { data: clicksData, error } = await supabase
      .from('contract_clicks')
      .select('savings_amount')
      .not('savings_amount', 'is', null);

    if (error) {
      console.error('Error fetching total savings:', error);
      return NextResponse.json({ error: 'Failed to fetch savings data' }, { status: 500 });
    }

    // Beräkna total besparing
    const totalSavings = (clicksData || [])
      .map(c => typeof c.savings_amount === 'number' ? c.savings_amount : 0)
      .filter(v => v > 0)
      .reduce((sum, amount) => sum + amount, 0);

    // Formatera som svensk valuta
    const formattedSavings = new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0
    }).format(totalSavings);

    return NextResponse.json({
      totalSavings,
      formattedSavings,
      count: clicksData?.length || 0
    });

  } catch (error) {
    console.error('Error in total-savings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
