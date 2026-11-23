import { NextRequest, NextResponse } from 'next/server';
// removed unused createClient
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { appendTrustedFormToMessage } from '@/lib/trustedFormClient';

// Sanitize Telegram envs (strip quotes/trim)
function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  return trimmed.replace(/^"|"$/g, '');
}

const RAW_TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RAW_TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS;
const TELEGRAM_BOT_TOKEN = sanitizeEnv(RAW_TELEGRAM_BOT_TOKEN);
const TELEGRAM_CHAT_IDS: string[] = (sanitizeEnv(RAW_TELEGRAM_CHAT_IDS) || '')
  .split(',')
  .map(id => sanitizeEnv(id)?.trim())
  .filter((v): v is string => !!v);

export async function POST(request: NextRequest) {
  try {
    const { name, email, channel, followers, notes, ref, campaignCode, xxTrustedFormCertUrl } =
      await request.json();

    if (!email || !email.includes('@') || !name) {
      return NextResponse.json({ error: 'Ogiltiga fält' }, { status: 400 });
    }

    // Save to Supabase
    const supabase = getSupabaseServerClient();
    await supabase.from('affiliate_applications').insert([{
        name,
        email,
        channel: channel || null,
        followers: followers || null,
        notes: notes || null,
        ref: ref || null,
        campaign_code: campaignCode || null,
        created_at: new Date().toISOString(),
      }]);

      // Also store in contacts table for analytics
      await supabase.from('contacts').insert([{
        name,
        email,
        message: appendTrustedFormToMessage(
          `Kanal: ${channel || '-'}\nFöljare: ${followers || '-'}\nAnteckningar: ${notes || '-'}`,
          xxTrustedFormCertUrl
        ),
        ref: ref || 'affiliate',
        campaign_code: campaignCode || null,
        subscribe_newsletter: false,
        form_type: 'affiliate',
        created_at: new Date().toISOString(),
      }]);

    // Notify via Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_IDS.length > 0) {
      const msg = `
📣 *Ny partner-ansökan*

🙍‍♀️ Namn: ${name}
📧 E-post: ${email}
🔗 Kanal: ${channel || '-'}
👥 Följare: ${followers || '-'}
🏷️ Ref: ${ref || '-'}
📝 Anteckningar: ${notes || '-'}
⏰ ${new Date().toLocaleString('sv-SE')}
`;
      await Promise.all(TELEGRAM_CHAT_IDS.map(chatId => fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' }),
      })));
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Affiliate apply error', e);
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
}

export const runtime = 'edge';


