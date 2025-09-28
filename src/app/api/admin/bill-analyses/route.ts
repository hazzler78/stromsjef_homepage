import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    
    // Hämta alla analyser med sortering efter senaste först
    const { data: analyses, error: analysesError } = await supabase
      .from('bill_analysis')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Begränsa till 100 senaste för prestanda

    if (analysesError) {
      console.error('Error fetching bill analyses:', analysesError);
      return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 });
    }

    // Beräkna statistik
    const totalAnalyses = analyses?.length || 0;
    const totalSavings = analyses?.reduce((sum, analysis) => sum + (analysis.potential_savings || 0), 0) || 0;
    const averageSavings = totalAnalyses > 0 ? totalSavings / totalAnalyses : 0;
    const confirmedAnalyses = analyses?.filter(a => a.analysis_confirmed === true).length || 0;
    const correctionRate = totalAnalyses > 0 ? (analyses?.filter(a => a.is_correct === false).length || 0) / totalAnalyses : 0;

    const stats = {
      total_analyses: totalAnalyses,
      total_savings: Math.round(totalSavings),
      average_savings: Math.round(averageSavings),
      confirmed_analyses: confirmedAnalyses,
      correction_rate: Math.round(correctionRate * 100) / 100,
    };

    return NextResponse.json({
      analyses: analyses || [],
      stats,
    });
  } catch (error) {
    console.error('Error in bill-analyses API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
