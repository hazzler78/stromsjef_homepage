import { NextRequest, NextResponse } from 'next/server';
// removed unused createClient
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { CustomerReminder } from '@/lib/types';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS?.split(',').map(id => id.trim()) || [];
// Supabase client is created per-request via helper

async function sendTelegramReminder(reminder: CustomerReminder) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_CHAT_IDS.length === 0) {
    console.warn('Telegram credentials not configured');
    return false;
  }

  const contractStartDate = new Date(reminder.contract_start_date);
  const expiryDate = new Date(contractStartDate);
  
  // Calculate expiry date based on contract type
  switch (reminder.contract_type) {
    case '12_months':
      expiryDate.setMonth(expiryDate.getMonth() + 12);
      break;
    case '24_months':
      expiryDate.setMonth(expiryDate.getMonth() + 24);
      break;
    case '36_months':
      expiryDate.setMonth(expiryDate.getMonth() + 36);
      break;
    default:
      expiryDate.setMonth(expiryDate.getMonth() + 12);
  }

    const message = `
🔔 *Kundpåminnelse - Avtal går ut snart*

👤 *Kund:* ${reminder.customer_name}
📧 *E-post:* ${reminder.email}
${reminder.phone ? `📞 *Telefon:* ${reminder.phone}\n` : ''}
📋 *Avtalstyp:* ${reminder.contract_type === '12_months' ? '12 månader' : 
                reminder.contract_type === '24_months' ? '24 månader' : 
                reminder.contract_type === '36_months' ? '36 månader' : 'Rörligt'}
📅 *Avtal startade:* ${contractStartDate.toLocaleDateString('sv-SE')}
⏰ *Avtal går ut:* ${expiryDate.toLocaleDateString('sv-SE')}
${reminder.notes ? `📝 *Anteckningar:* ${reminder.notes}\n` : ''}
💡 *Åtgärd krävs:* Ring kunden för att förlänga avtalet innan det går över till dyrare tillsvidareavtal.

🌐 *Källa:* Elchef.se påminnelsesystem
`;

  // Send to all configured chat IDs
  const sendPromises = TELEGRAM_CHAT_IDS.map(async (chatId) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        console.error(`Telegram reminder failed for chat ID ${chatId}:`, await response.text());
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Error sending Telegram reminder to ${chatId}:`, error);
      return false;
    }
  });

  // Wait for all notifications to be sent
  const results = await Promise.all(sendPromises);
  const successCount = results.filter(Boolean).length;
  console.log(`Telegram reminders sent: ${successCount}/${TELEGRAM_CHAT_IDS.length} successful`);
  
  return successCount > 0;
}

// POST: Check for due reminders and send notifications
export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized (optional - you can add authentication here)
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.UPDATE_SECRET_KEY;
    
    console.log('🔐 Auth check:', {
      hasAuthHeader: !!authHeader,
      hasExpectedKey: !!expectedKey,
      authHeader: authHeader?.substring(0, 20) + '...',
      expectedKey: expectedKey?.substring(0, 20) + '...'
    });
    
    if (authHeader !== `Bearer ${expectedKey}`) {
      console.log('❌ Unauthorized request to reminders/send');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Checking for due reminders...');
    
    // Compute today's date in local time to match stored DATE values
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${d}`;
    
    // Get all due reminders (including overdue ones)
    const supabase = getSupabaseServerClient();
    const { data: dueReminders, error } = await supabase
      .from('customer_reminders')
      .select('*')
      .lte('reminder_date', today) // Less than or equal to today (includes overdue)
      .eq('is_sent', false);

    if (error) {
      console.error('Error fetching due reminders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reminders' },
        { status: 500 }
      );
    }

    if (!dueReminders || dueReminders.length === 0) {
      console.log('✅ No due reminders found for today');
      return NextResponse.json({
        success: true,
        message: 'No due reminders found',
        count: 0
      });
    }

    // Separate overdue from today's reminders
    const overdueReminders = dueReminders.filter(r => r.reminder_date < today);
    const todayReminders = dueReminders.filter(r => r.reminder_date === today);

    console.log(`📧 Found ${dueReminders.length} due reminders (${todayReminders.length} today, ${overdueReminders.length} overdue)`);

    // Send notifications for each reminder
    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const reminder of dueReminders) {
      const sent = await sendTelegramReminder(reminder);
      
      if (sent) {
        // Mark reminder as sent
        await supabase
          .from('customer_reminders')
          .update({ 
            is_sent: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', reminder.id);
        
        results.push({
          id: reminder.id,
          customer: reminder.customer_name,
          status: 'sent',
          overdue: reminder.reminder_date < today
        });
        sentCount++;
      } else {
        results.push({
          id: reminder.id,
          customer: reminder.customer_name,
          status: 'failed',
          overdue: reminder.reminder_date < today
        });
        failedCount++;
      }
    }

    console.log(`✅ Sent ${sentCount}/${dueReminders.length} reminders successfully`);

    return NextResponse.json({
      success: true,
      message: `Processed ${dueReminders.length} reminders`,
      sent: sentCount,
      failed: failedCount,
      today: todayReminders.length,
      overdue: overdueReminders.length,
      results
    });

  } catch (error) {
    console.error('Error in POST /api/reminders/send:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';