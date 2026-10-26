import { NextRequest, NextResponse } from 'next/server';
import { ContactFormData } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import {
  formatNorwegianPhoneDisplay,
  isValidNorwegianPostalCode,
  isValidNorwegianPoststed,
  isValidNorwegianStreetAddress,
  normalizeNorwegianPhone,
} from '@/lib/norwegian-lead-validation';
import { sendOtovoInterest } from '@/lib/otovo-interest';

// Raw values first; sanitize below to avoid common dashboard quoting issues
const RAW_MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const RAW_MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;
const RAW_TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RAW_TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS;
const rawSUPABASE_URL = process.env.SUPABASE_URL;
const rawSUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  // Strip surrounding quotes if present (common misconfiguration in dashboards)
  return trimmed.replace(/^"|"$/g, '');
}

const OTOVO_API_BASE_URL = sanitizeEnv(process.env.OTOVO_API_BASE_URL) ?? 'https://api.otovo.com';
const OTOVO_API_TOKEN = sanitizeEnv(process.env.OTOVO_API_TOKEN);
const OTOVO_UTM_SOURCE = sanitizeEnv(process.env.OTOVO_UTM_SOURCE);
const OTOVO_UTM_CAMPAIGN = sanitizeEnv(process.env.OTOVO_UTM_CAMPAIGN) ?? 'Strømsjef_no_PV';

// Sanitized MailerLite config
const MAILERLITE_API_KEY = sanitizeEnv(RAW_MAILERLITE_API_KEY);
const MAILERLITE_GROUP_ID = sanitizeEnv(RAW_MAILERLITE_GROUP_ID);

// Sanitized Telegram config
const TELEGRAM_BOT_TOKEN = sanitizeEnv(RAW_TELEGRAM_BOT_TOKEN);
const TELEGRAM_CHAT_IDS: string[] = (sanitizeEnv(RAW_TELEGRAM_CHAT_IDS) || '')
  .split(',')
  .map(id => sanitizeEnv(id)?.trim())
  .filter((v): v is string => !!v);

function getSupabaseClient() {
  const url = sanitizeEnv(rawSUPABASE_URL);
  const key = sanitizeEnv(rawSUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }
  return createClient(url, key);
}

function validateSolarLead(
  data: ContactFormData & { formType?: string }
): string | null {
  if (!data.otovoConsent) {
    return 'Samtykke til deling med Otovo er påkrevd.';
  }
  if (!data.name?.trim()) return 'Navn er påkrevd.';
  if (!data.phone?.trim()) return 'Telefon er påkrevd.';
  const phoneNational = normalizeNorwegianPhone(data.phone);
  if (!phoneNational) return 'Ugyldig norsk mobilnummer.';
  if (!data.postalCode || !isValidNorwegianPostalCode(data.postalCode)) {
    return 'Ugyldig postnummer.';
  }
  if (!data.city?.trim() || !isValidNorwegianPoststed(data.city)) {
    return 'Ugyldig poststed.';
  }
  if (!data.address?.trim() || !isValidNorwegianStreetAddress(data.address)) {
    return 'Ugyldig gateadresse.';
  }
  data.phone = formatNorwegianPhoneDisplay(phoneNational);
  return null;
}

async function sendTelegramNotification(
  data: ContactFormData & { formType?: string },
  contactId: number | null,
  otovoNote?: string
) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  if (TELEGRAM_CHAT_IDS.length === 0) {
    console.warn('TELEGRAM_CHAT_IDS not configured - notifications will not be sent');
    return;
  }

  // Try to store pending reminder in database (optional)
  let pendingId = null;
  try {
    const pendingReminderData = {
      customer_name: data.name || 'Ukjent',
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    const { data: pending, error: pendingError } = await supabase
      .from('pending_reminders')
      .insert([pendingReminderData])
      .select()
      .single();

    if (!pendingError && pending) {
      pendingId = pending.id;
    } else {
      console.warn('Could not create pending reminder, but continuing with notification:', pendingError);
    }
  } catch (error) {
    console.warn('Database error for pending reminder, but continuing with notification:', error);
  }

  const formType = data.formType || 'contact';
  const formLabel =
    formType === 'sol_laddbox' ? '☀️ *Solceller (Otovo-lead)*' : '🔔 *Ny kontaktförfrågan*';

  const message = `
${formLabel}

${data.name ? `🙍‍♂️ *Navn:* ${data.name}\n` : ''}📧 *E-post:* ${data.email}
${data.phone ? `📞 *Telefon:* ${data.phone}\n` : ''}${data.postalCode ? `📮 *Postnummer:* ${data.postalCode}\n` : ''}${data.city ? `🏙️ *Poststed:* ${data.city}\n` : ''}${data.address ? `📍 *Adresse:* ${data.address}\n` : ''}${formType !== 'sol_laddbox' ? `📰 *Nyhetsbrev:* ${data.subscribeNewsletter ? 'Ja' : 'Nei'}\n` : ''}${data.message ? `\n📝 *Melding:* ${data.message}` : ''}${otovoNote ? `\n\n⚠️ *Otovo:* ${otovoNote}` : ''}

⏰ *Tidspunkt:* ${new Date().toLocaleString('nb-NO')}
🌐 *Kilde:* Stromsjef.no kontaktskjema
${contactId ? `\n🆔 *Kontakt-ID (contacts):* ${contactId}` : ''}
${pendingId ? `\n\n💡 *Svara på detta meddelande* eller skriv t.ex. "12m #${pendingId}" for å koble riktig kunde.\n*Eksempel:* "12m" eller "12m cheap" eller "12m fastavtal" (vi ringer kunden om 11 måneder)\n_Du kan også angi startdato:_ "12m 2025-02-15 cheap" eller "12m 2025-02-15 #${pendingId} fastavtal"` : ''}
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

  const results = await Promise.all(sendPromises);
  const successCount = results.filter(Boolean).length;
  console.log(`Telegram notifications sent: ${successCount}/${TELEGRAM_CHAT_IDS.length} successful`);
}

async function addToMailerlite(email: string) {
  if (!MAILERLITE_API_KEY) {
    console.error('[MailerLite] MAILERLITE_API_KEY saknas i miljövariabler');
    return false;
  }

  const body: Record<string, unknown> = {
    email: email,
    status: 'active',
  };

  if (MAILERLITE_GROUP_ID && MAILERLITE_GROUP_ID.trim().length > 0) {
    body.groups = [MAILERLITE_GROUP_ID];
    console.log(`[MailerLite] Attempting to add subscriber to group ID: ${MAILERLITE_GROUP_ID} (as string to avoid precision loss)`);
  } else {
    console.log('[MailerLite] No valid MAILERLITE_GROUP_ID found, subscriber will be added to "All subscribers"');
    if (MAILERLITE_GROUP_ID) {
      console.warn(`[MailerLite] Invalid group ID format: "${MAILERLITE_GROUP_ID}"`);
    }
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
      console.error('[MailerLite] API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData: JSON.stringify(errorData, null, 2),
        attemptedGroupId: MAILERLITE_GROUP_ID,
        rawGroupId: MAILERLITE_GROUP_ID,
      });

      const groupsError = errorData?.errors?.['groups.0'] || errorData?.errors?.groups?.[0];
      if (groupsError && (groupsError.includes('invalid') || groupsError.includes('not found'))) {
        console.error(`[MailerLite] Group ID validation failed. Attempted ID: ${MAILERLITE_GROUP_ID}, Error: ${JSON.stringify(groupsError)}`);
      }

      return false;
    }

    return true;
  } catch (error) {
    console.error('[MailerLite] Error adding subscriber:', error);
    return false;
  }
}

async function flagOtovoSyncFailure(contactId: number, data: ContactFormData, reason: string) {
  try {
    const supabase = getSupabaseClient();
    const flagLine = `[Otovo-synk feilet ${new Date().toISOString()}] ${reason}`;
    const updatedMessage = [data.message?.trim(), flagLine].filter(Boolean).join('\n\n');
    await supabase.from('contacts').update({ message: updatedMessage }).eq('id', contactId);
  } catch (error) {
    console.error('Could not flag Otovo sync failure on contact row:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData & { ref?: string; campaignCode?: string; formType?: string } =
      await request.json();

    console.log('Telegram configuration check:');
    console.log('- TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? 'Set' : 'Not set');
    console.log('- TELEGRAM_CHAT_IDS:', TELEGRAM_CHAT_IDS.length > 0 ? `Set (${TELEGRAM_CHAT_IDS.length} IDs)` : 'Not set');

    if (!data.email || !data.email.includes('@')) {
      return NextResponse.json({ error: 'Ugyldig e-postadresse' }, { status: 400 });
    }

    let formType = data.formType || 'contact';
    if (data.ref?.includes('chat')) formType = 'chat';
    if (data.ref?.includes('newsletter')) formType = 'newsletter';
    if (data.ref?.includes('affiliate')) formType = 'affiliate';
    if (data.ref?.includes('partner')) formType = 'partner';
    if (data.formType === 'sol_laddbox') formType = 'sol_laddbox';

    if (formType === 'sol_laddbox') {
      const solarError = validateSolarLead(data);
      if (solarError) {
        return NextResponse.json({ error: solarError }, { status: 400 });
      }
    }

    let contactId: number | null = null;
    try {
      const supabase = getSupabaseClient();
      const { data: contactRow, error } = await supabase
        .from('contacts')
        .insert([
          {
            name: data.name || null,
            email: data.email,
            phone: data.phone || null,
            message: data.message || null,
            ref: data.ref || null,
            campaign_code: data.campaignCode || null,
            subscribe_newsletter: !!data.subscribeNewsletter,
            form_type: formType,
            city: data.city?.trim() || null,
            address: data.address?.trim() || null,
            created_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single();

      if (!error && contactRow) {
        contactId = contactRow.id as number;
      } else if (error) {
        console.warn('Failed to store contact with ref (optional):', error);
      }
    } catch (e) {
      console.warn('Failed to store contact with ref (optional):', e);
    }

    let otovoSync: 'success' | 'failed' | 'skipped' = 'skipped';
    let otovoNote: string | undefined;

    if (formType === 'sol_laddbox') {
      const otovoResult = await sendOtovoInterest(data, {
        apiToken: OTOVO_API_TOKEN,
        apiBaseUrl: OTOVO_API_BASE_URL,
        utmSource: OTOVO_UTM_SOURCE,
        utmCampaign: OTOVO_UTM_CAMPAIGN,
      });

      if (otovoResult.status === 'success') {
        otovoSync = 'success';
        console.log('Otovo interest created successfully for contact', contactId);
      } else if (otovoResult.status === 'skipped') {
        otovoSync = 'skipped';
        console.warn('Otovo lead skipped:', otovoResult.reason);
        otovoNote = `ikke sendt (${otovoResult.reason})`;
      } else {
        otovoSync = 'failed';
        console.error('Otovo lead failed:', otovoResult.stage, otovoResult.reason);
        otovoNote = `synk feilet (${otovoResult.stage}): ${otovoResult.reason}`;
        if (contactId) {
          await flagOtovoSyncFailure(contactId, data, otovoResult.reason);
        }
      }
    }

    await sendTelegramNotification({ ...data, formType }, contactId, otovoNote);

    let newsletterSuccess = true;
    if (data.subscribeNewsletter) {
      newsletterSuccess = await addToMailerlite(data.email);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Kontaktförfrågan skickad',
        newsletterSubscribed: data.subscribeNewsletter && newsletterSuccess,
        otovoSync,
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

// GET endpoint is safe by default and never sends Telegram unless explicitly authorized.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const runTest = searchParams.get('runTest') === '1';
    const token = searchParams.get('token');
    const expectedToken = sanitizeEnv(process.env.CONTACT_TEST_TOKEN);

    if (!runTest) {
      return NextResponse.json(
        {
          ok: true,
          testEnabled: !!expectedToken,
          message: 'Contact API reachable. Add runTest=1 and token to trigger Telegram test.',
        },
        { status: 200 }
      );
    }

    if (!expectedToken) {
      return NextResponse.json({ ok: false, error: 'CONTACT_TEST_TOKEN missing' }, { status: 403 });
    }

    if (!token || token !== expectedToken) {
      return NextResponse.json({ ok: false, error: 'Unauthorized test request' }, { status: 403 });
    }

    const botSet = !!TELEGRAM_BOT_TOKEN;
    const idsCount = TELEGRAM_CHAT_IDS.length;

    if (!botSet) {
      return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN missing' }, { status: 200 });
    }

    if (idsCount === 0) {
      return NextResponse.json({ ok: false, error: 'TELEGRAM_CHAT_IDS missing' }, { status: 200 });
    }

    const testText = `✅ Kontakt-test från API (timestamp: ${new Date().toISOString()})`;
    const results = await Promise.all(
      TELEGRAM_CHAT_IDS.map(async (chatId) => {
        try {
          const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: testText }),
          });
          return res.ok;
        } catch {
          return false;
        }
      })
    );

    return NextResponse.json({ ok: true, sent: results.filter(Boolean).length, total: idsCount }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected error' }, { status: 500 });
  }
}

export const runtime = 'edge';
