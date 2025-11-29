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
        { error: 'Ogiltig e-postadress' },
        { status: 400 }
      );
    }

    // Kontrollera att API-nyckeln finns
    if (!MAILERLITE_API_KEY) {
      console.error('MAILERLITE_API_KEY saknas i miljövariabler');
      return NextResponse.json(
        { error: 'Konfigurationsfel' },
        { status: 500 }
      );
    }

    // Bygg body för Mailerlite
    const body: Record<string, unknown> = {
      email: email,
      status: 'active',
    };
    
    const groupIdNumber = MAILERLITE_GROUP_ID ? Number(MAILERLITE_GROUP_ID) : null;
    if (MAILERLITE_GROUP_ID && !isNaN(groupIdNumber!) && groupIdNumber! > 0) {
      body.groups = [groupIdNumber];
      console.log(`[MailerLite] Attempting to add subscriber to group ID: ${groupIdNumber} (raw: "${MAILERLITE_GROUP_ID}")`);
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
        attemptedGroupId: groupIdNumber,
        rawGroupId: MAILERLITE_GROUP_ID
      });
      
      // Hantera specifika fel
      if (response.status === 409) {
        return NextResponse.json(
          { error: 'Denna e-postadress är redan registrerad' },
          { status: 409 }
        );
      }
      
      // Plan-limit hos MailerLite (t.ex. "The subscriber might exceed the current subscriber limit.")
      const message: string | undefined = (errorData && (errorData.message || errorData.error || errorData?.errors?.[0])) as string | undefined;
      if (message && message.toLowerCase().includes('subscriber') && message.toLowerCase().includes('limit')) {
        return NextResponse.json(
          { error: 'Vi har nått gränsen för prenumeranter i vårt nyhetsbrev just nu. Försök gärna igen senare.' },
          { status: 429 }
        );
      }
      
      // Kontrollera om det är ett grupp-ID-fel
      const groupsError = errorData?.errors?.['groups.0'] || errorData?.errors?.groups?.[0];
      if (groupsError && (groupsError.includes('invalid') || groupsError.includes('not found'))) {
        console.error(`[MailerLite] Group ID validation failed. Attempted ID: ${groupIdNumber}, Error: ${JSON.stringify(groupsError)}`);
        return NextResponse.json(
          { 
            error: `Felaktigt grupp-ID för Mailerlite. Försökte använda grupp-ID: ${groupIdNumber}. Kontrollera att MAILERLITE_GROUP_ID=${MAILERLITE_GROUP_ID} är korrekt i MailerLite eller ta bort den från miljövariablerna för att lägga till prenumeranter i "All subscribers".`,
            debug: process.env.NODE_ENV === 'development' ? { attemptedGroupId: groupIdNumber, error: groupsError } : undefined
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Kunde inte registrera e-postadressen',
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
        message: 'Prenumeration registrerad',
        subscriber_id: data.data.id 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid registrering' },
      { status: 500 }
    );
  }
} 

export const runtime = 'edge'; 