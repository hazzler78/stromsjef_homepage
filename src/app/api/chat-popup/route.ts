import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

// GET - Hämta popup-inställningar
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('chat_popup_settings')
      .select('*')
      .eq('id', 1)
      .eq('active', true)
      .single();

    if (error) {
      // Om ingen aktiv inställning finns, returnera null
      if (error.code === 'PGRST116') {
        return NextResponse.json({ settings: null });
      }
      return NextResponse.json(
        { error: 'Kunde inte hämta inställningar', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ett fel uppstod', details: (error as Error).message },
      { status: 500 }
    );
  }
}

