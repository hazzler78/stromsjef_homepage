import { NextRequest, NextResponse } from 'next/server';
import { ContactFormData } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS?.split(',').map(id => id.trim()) || [];
const rawSUPABASE_URL = process.env.SUPABASE_URL;
const rawSUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  // Strip surrounding quotes if present (common misconfiguration in dashboards)
  return trimmed.replace(/^"|"$/g, '');
}

function getSupabaseClient() {
  const url = sanitizeEnv(rawSUPABASE_URL);
  const key = sanitizeEnv(rawSUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }
  return createClient(url, key);
}

async function sendTelegramNotification(data: ContactFormData) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_CHAT_IDS.length === 0) {
    console.warn('Telegram credentials not configured');
    return;
  }

  // Store pending reminder in database
  const pendingReminderData = {
    customer_name: data.name || 'Okänd',
    email: data.email,
    phone: data.phone || null,
    message: data.message || null,
    created_at: new Date().toISOString()
  };

  const supabase = getSupabaseClient();
  const { data: pending, error: pendingError } = await supabase
    .from('pending_reminders')
    .insert([pendingReminderData])
    .select()
    .single();

  if (pendingError || !pending) {
    console.error('Error creating pending reminder:', pendingError);
    return;
  }

  const message = `
🔔 *Ny kontaktförfrågan*

${data.name ? `🙍‍♂️ *Namn:* ${data.name}\n` : ''}📧 *E-post:* ${data.email}
${data.phone ? `📞 *Telefon:* ${data.phone}\n` : ''}📰 *Nyhetsbrev:* ${data.subscribeNewsletter ? 'Ja' : 'Nej'}
${data.message ? `\n📝 *Meddelande:* ${data.message}` : ''}

⏰ *Tidpunkt:* ${new Date().toLocaleString('sv-SE')}
🌐 *Källa:* Elchef.se kontaktformulär

🆔 *ID:* ${pending.id}

💡 *Svara på detta meddelande* eller skriv t.ex. "12m #${pending.id}" för att koppla rätt kund.
*Exempel:* "12m" eller "12m cheap" eller "12m fastavtal" (vi ringer kunden om 11 månader)
_Du kan även ange startdatum:_ "12m 2025-02-15 cheap" eller "12m 2025-02-15 #${pending.id} fastavtal"
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
        console.error(`Telegram notification failed for chat ID ${chatId}:`, await response.text());
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Error sending Telegram notification to ${chatId}:`, error);
      return false;
    }
  });

  // Wait for all notifications to be sent
  const results = await Promise.all(sendPromises);
  const successCount = results.filter(Boolean).length;
  console.log(`Telegram notifications sent: ${successCount}/${TELEGRAM_CHAT_IDS.length} successful`);
}

async function addToMailerlite(email: string) {
  if (!MAILERLITE_API_KEY) {
    console.error('MAILERLITE_API_KEY saknas i miljövariabler');
    return false;
  }

  const body: Record<string, unknown> = {
    email: email,
    status: 'active',
  };
  
  if (MAILERLITE_GROUP_ID && !isNaN(Number(MAILERLITE_GROUP_ID))) {
    body.groups = [Number(MAILERLITE_GROUP_ID)];
  }

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mailerlite API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding to Mailerlite:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData & { ref?: string; campaignCode?: string; formType?: string } = await request.json();

    // Validera e-postadress
    if (!data.email || !data.email.includes('@')) {
      return NextResponse.json(
        { error: 'Ogiltig e-postadress' },
        { status: 400 }
      );
    }

    // Determine form type based on data or ref
    let formType = data.formType || 'contact';
    if (data.ref?.includes('chat')) formType = 'chat';
    if (data.ref?.includes('newsletter')) formType = 'newsletter';
    if (data.ref?.includes('affiliate')) formType = 'affiliate';
    if (data.ref?.includes('partner')) formType = 'partner';

    // Skapa pending-reminder och skicka Telegram-notifiering (med ID)
    await sendTelegramNotification(data);

    // Store contact with enhanced tracking
    try {
      const supabase = getSupabaseClient();
      await supabase.from('contacts').insert([{
          name: data.name || null,
          email: data.email,
          phone: data.phone || null,
          message: data.message || null,
          ref: data.ref || null,
          campaign_code: data.campaignCode || null,
          subscribe_newsletter: !!data.subscribeNewsletter,
          form_type: formType,
          created_at: new Date().toISOString(),
        }]);
    } catch (e) {
      console.warn('Failed to store contact with ref (optional):', e);
    }

    // Lägg till i Mailerlite om användaren vill prenumerera
    let newsletterSuccess = true;
    if (data.subscribeNewsletter) {
      newsletterSuccess = await addToMailerlite(data.email);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Kontaktförfrågan skickad',
        newsletterSubscribed: data.subscribeNewsletter && newsletterSuccess
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid skickande av kontaktförfrågan' },
      { status: 500 }
    );
  }
} 

export const runtime = 'edge'; 