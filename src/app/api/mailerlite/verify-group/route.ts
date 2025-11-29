import { NextResponse } from 'next/server';

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  return trimmed.replace(/^"|"$/g, '');
}

const RAW_MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const RAW_MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;
const MAILERLITE_API_KEY = sanitizeEnv(RAW_MAILERLITE_API_KEY);
const MAILERLITE_GROUP_ID = sanitizeEnv(RAW_MAILERLITE_GROUP_ID);

/**
 * Verifierar MailerLite grupp-ID genom att försöka lista alla grupper
 * och kontrollera om det konfigurerade ID:t finns.
 */
export async function GET() {
  try {
    if (!MAILERLITE_API_KEY) {
      return NextResponse.json(
        { error: 'MAILERLITE_API_KEY saknas i miljövariabler' },
        { status: 500 }
      );
    }

    if (!MAILERLITE_GROUP_ID) {
      return NextResponse.json(
        { 
          configured: false,
          message: 'Ingen MAILERLITE_GROUP_ID konfigurerad. Prenumeranter kommer läggas till i "All subscribers".'
        },
        { status: 200 }
      );
    }

    // Försök hämta alla grupper från MailerLite
    const response = await fetch('https://connect.mailerlite.com/api/groups', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          error: 'Kunde inte hämta grupper från MailerLite',
          details: errorData,
          configuredGroupId: MAILERLITE_GROUP_ID
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const groups = data.data || [];
    const groupIdNumber = Number(MAILERLITE_GROUP_ID);
    
    const foundGroup = groups.find((group: { id: number }) => group.id === groupIdNumber);
    
    if (foundGroup) {
      return NextResponse.json({
        valid: true,
        configuredGroupId: groupIdNumber,
        groupName: foundGroup.name,
        group: foundGroup,
        message: `Grupp-ID ${groupIdNumber} är giltigt och motsvarar gruppen "${foundGroup.name}"`
      });
    } else {
      return NextResponse.json({
        valid: false,
        configuredGroupId: groupIdNumber,
        availableGroups: groups.map((g: { id: number; name: string }) => ({ id: g.id, name: g.name })),
        message: `Grupp-ID ${groupIdNumber} finns inte i MailerLite. Tillgängliga grupper listas ovan.`
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error verifying MailerLite group:', error);
    return NextResponse.json(
      { 
        error: 'Ett fel uppstod vid verifiering av grupp-ID',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';

