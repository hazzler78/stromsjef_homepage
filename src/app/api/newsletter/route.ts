import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Raw values first; sanitize below to avoid common dashboard quoting issues
const RAW_MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const RAW_MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  return trimmed.replace(/^"|"$/g, '');
}

// Sanitized MailerLite config
const MAILERLITE_API_KEY = sanitizeEnv(RAW_MAILERLITE_API_KEY);
const MAILERLITE_GROUP_ID = sanitizeEnv(RAW_MAILERLITE_GROUP_ID);

const RAW_TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RAW_TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS;
const TELEGRAM_BOT_TOKEN = sanitizeEnv(RAW_TELEGRAM_BOT_TOKEN);
const TELEGRAM_CHAT_IDS: string[] = (sanitizeEnv(RAW_TELEGRAM_CHAT_IDS) || '')
  .split(',')
  .map(id => sanitizeEnv(id)?.trim())
  .filter((v): v is string => !!v);

export async function POST(request: NextRequest) {
  try {
    const { email, ref, campaignCode }: { email: string; ref?: string; campaignCode?: string } = await request.json();

    // Store newsletter subscription in contacts table for analytics
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      try {
        await supabase.from('contacts').insert([{
          email: email,
          ref: ref || 'newsletter',
          campaign_code: campaignCode || null,
          subscribe_newsletter: true,
          form_type: 'newsletter',
          created_at: new Date().toISOString(),
        }]);
      } catch (e) {
        console.warn('Failed to store newsletter subscription for analytics:', e);
      }
    }

    // Validera e-postadress
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ugyldig e-postadresse' },
        { status: 400 }
      );
    }

    // Kontrollera att API-nyckeln finns
    if (!MAILERLITE_API_KEY) {
      console.error('MAILERLITE_API_KEY saknas i miljövariabler');
      return NextResponse.json(
        { error: 'Konfigurasjonsfeil. Kontakt support.' },
        { status: 500 }
      );
    }

    // Bygg body för Mailerlite
    const body: Record<string, unknown> = {
      email: email,
      status: 'active',
    };
    
    // Använd strängen direkt för att undvika JavaScript precision-problem med stora heltal
    // MailerLite API accepterar group IDs som strängar eller nummer
    if (MAILERLITE_GROUP_ID && MAILERLITE_GROUP_ID.trim().length > 0) {
      body.groups = [MAILERLITE_GROUP_ID]; // Använd strängen direkt - MailerLite accepterar detta
      console.log(`[MailerLite] Attempting to add subscriber to group ID: ${MAILERLITE_GROUP_ID} (as string to avoid precision loss)`);
    } else {
      console.log('[MailerLite] No valid MAILERLITE_GROUP_ID found, subscriber will be added to "All subscribers"');
      if (MAILERLITE_GROUP_ID) {
        console.warn(`[MailerLite] Invalid group ID format: "${MAILERLITE_GROUP_ID}"`);
      }
    }
    // Om grupp-ID saknas eller är ogiltigt, skicka inte 'groups' alls (prenumerant hamnar i "All subscribers")

    // Lägg till prenumerant i Mailerlite
    console.log('[MailerLite] Request body:', JSON.stringify(body, null, 2));
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
        rawGroupId: MAILERLITE_GROUP_ID
      });
      
      // Hantera specifika fel
      if (response.status === 409) {
        return NextResponse.json(
          { error: 'Denne e-postadressen er allerede registrert' },
          { status: 409 }
        );
      }
      
      // Plan-limit hos MailerLite (t.ex. "The subscriber might exceed the current subscriber limit.")
      const message: string | undefined = (errorData && (errorData.message || errorData.error || errorData?.errors?.[0])) as string | undefined;
      if (message && message.toLowerCase().includes('subscriber') && message.toLowerCase().includes('limit')) {
        return NextResponse.json(
          { error: 'Vi har nådd grensen for abonnenter i nyhetsbrevet vårt akkurat nå. Prøv igjen senere.' },
          { status: 429 }
        );
      }
      
      // Kontrollera om det är ett grupp-ID-fel - flera möjliga format
      const groupsError = errorData?.errors?.['groups.0'] || 
                         errorData?.errors?.groups?.[0] || 
                         errorData?.errors?.groups ||
                         (typeof errorData?.errors === 'object' && Object.keys(errorData.errors).some(k => k.includes('group')));
      
      const groupsErrorString = typeof groupsError === 'string' ? groupsError : JSON.stringify(groupsError);
      const hasGroupError = groupsErrorString && (
        groupsErrorString.toLowerCase().includes('invalid') || 
        groupsErrorString.toLowerCase().includes('not found') ||
        groupsErrorString.toLowerCase().includes('does not exist') ||
        groupsErrorString.toLowerCase().includes('selected groups')
      );
      
      if (hasGroupError || (response.status === 400 && MAILERLITE_GROUP_ID)) {
        console.error(`[MailerLite] Group ID validation failed. Attempted ID: ${MAILERLITE_GROUP_ID}, Error: ${JSON.stringify(errorData)}`);
        return NextResponse.json(
          { 
            error: `Kunne ikke registrere e-postadressen. Feil gruppe-ID i konfigurasjonen. Kontakt support hvis problemet vedvarer.`,
            debug: process.env.NODE_ENV === 'development' ? { 
              attemptedGroupId: MAILERLITE_GROUP_ID, 
              rawGroupId: MAILERLITE_GROUP_ID,
              error: errorData 
            } : undefined
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Kunne ikke registrere e-postadressen. Prøv igjen senere.',
          debug: process.env.NODE_ENV === 'development' ? { status: response.status, errorData } : undefined
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Telegram notification (optional)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_IDS.length > 0) {
      const msg = `\n📰 *Ny nyhetsbrevsanmälan*\n\n📧 E-post: ${email}\n🏷️ Ref: ${ref || '-'}\n🎟️ Kampanjkod: ${campaignCode || '-'}\n⏰ ${new Date().toLocaleString('sv-SE')}`;
      await Promise.all(TELEGRAM_CHAT_IDS.map(chatId => fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' }),
      })));
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Påmelding registrert',
        subscriber_id: data.data.id 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'En feil oppstod ved registrering. Prøv igjen senere.' },
      { status: 500 }
    );
  }
} 

export const runtime = 'edge'; 