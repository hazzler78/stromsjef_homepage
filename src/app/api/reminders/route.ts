import { NextRequest, NextResponse } from 'next/server';
// removed unused createClient
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { CustomerReminder } from '@/lib/types';

// Supabase client is created per-request via helper

// Helper functions for precise date handling
function addMonthsKeepingEnd(date: Date, monthsToAdd: number): Date {
  const result = new Date(date);
  const originalDay = result.getDate();
  result.setMonth(result.getMonth() + monthsToAdd);
  if (result.getDate() < originalDay) {
    result.setDate(0);
  }
  return result;
}

function formatLocalYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper function to calculate reminder date (11 months before contract expiry)
function calculateReminderDate(contractStartDate: string, contractType: string): string {
  const startDate = new Date(contractStartDate);
  let totalMonths: number;

  switch (contractType) {
    case '12_months':
      totalMonths = 12;
      break;
    case '24_months':
      totalMonths = 24;
      break;
    case '36_months':
      totalMonths = 36;
      break;
    default:
      throw new Error('Invalid contract type');
  }

  const reminderDate = addMonthsKeepingEnd(startDate, totalMonths - 11);
  return formatLocalYYYYMMDD(reminderDate);
}

// POST: Create a new reminder
export async function POST(request: NextRequest) {
  try {
    const data: CustomerReminder = await request.json();
    
    // Validate required fields
    if (!data.customer_name || !data.email || !data.contract_type || !data.contract_start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate reminder date
    const reminderDate = calculateReminderDate(data.contract_start_date, data.contract_type);
    
    const reminderData = {
      customer_name: data.customer_name,
      email: data.email,
      phone: data.phone || null,
      contract_type: data.contract_type,
      contract_start_date: data.contract_start_date,
      reminder_date: reminderDate,
      is_sent: false,
      notes: data.notes || null
    };

    const supabase = getSupabaseServerClient();
    const { data: insertedReminder, error } = await supabase
      .from('customer_reminders')
      .insert([reminderData])
      .select()
      .single();

    if (error) {
      console.error('Error creating reminder:', error);
      return NextResponse.json(
        { error: 'Failed to create reminder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reminder: insertedReminder
    });

  } catch (error) {
    console.error('Error in POST /api/reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get reminders that are due today
export async function GET() {
  try {
    // Compute today's date in local time to match stored DATE values
    const now = new Date();
    const today = formatLocalYYYYMMDD(now);
    const supabase = getSupabaseServerClient();
    const { data: dueReminders, error } = await supabase
      .from('customer_reminders')
      .select('*')
      .eq('reminder_date', today)
      .eq('is_sent', false);

    if (error) {
      console.error('Error fetching due reminders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reminders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dueReminders: dueReminders || []
    });

  } catch (error) {
    console.error('Error in GET /api/reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';