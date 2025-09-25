import { NextRequest, NextResponse } from 'next/server';
// removed unused createClient
import { getSupabaseServerClient } from '@/lib/supabaseServer';

// Supabase client is created per-request via helper

// PATCH: Mark reminder as sent
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reminderId = parseInt(id);
    
    if (isNaN(reminderId)) {
      return NextResponse.json(
        { error: 'Invalid reminder ID' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('customer_reminders')
      .update({ 
        is_sent: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', reminderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating reminder:', error);
      return NextResponse.json(
        { error: 'Failed to update reminder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reminder: data
    });

  } catch (error) {
    console.error('Error in PATCH /api/reminders/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';