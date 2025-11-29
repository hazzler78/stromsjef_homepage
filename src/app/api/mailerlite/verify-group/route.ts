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
    // Debug info för att se vad som faktiskt laddas
    const debugInfo = {
      rawGroupId: RAW_MAILERLITE_GROUP_ID,
      sanitizedGroupId: MAILERLITE_GROUP_ID,
      groupIdLength: MAILERLITE_GROUP_ID?.length,
      groupIdNumber: MAILERLITE_GROUP_ID ? Number(MAILERLITE_GROUP_ID) : null,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('MAILERLITE')),
    };

    if (!MAILERLITE_API_KEY) {
      return NextResponse.json(
        { 
          error: 'MAILERLITE_API_KEY saknas i miljövariabler',
          debug: debugInfo
        },
        { status: 500 }
      );
    }

    if (!MAILERLITE_GROUP_ID) {
      return NextResponse.json(
        { 
          configured: false,
          message: 'Ingen MAILERLITE_GROUP_ID konfigurerad. Prenumeranter kommer läggas till i "All subscribers".',
          debug: debugInfo
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
        message: `Grupp-ID ${groupIdNumber} är giltigt och motsvarar gruppen "${foundGroup.name}"`,
        debug: debugInfo
      });
    } else {
      return NextResponse.json({
        valid: false,
        configuredGroupId: groupIdNumber,
        availableGroups: groups.map((g: { id: number; name: string }) => ({ id: g.id, name: g.name })),
        message: `Grupp-ID ${groupIdNumber} finns inte i MailerLite. Tillgängliga grupper listas ovan.`,
        debug: debugInfo,
        troubleshooting: {
          note: 'Om du har uppdaterat MAILERLITE_GROUP_ID i CloudFlare men ser fortfarande fel värde här:',
          steps: [
            '1. Kontrollera att du uppdaterat rätt miljö (Production vs Preview)',
            '2. Starta om deployment efter ändring av miljövariabler',
            '3. Vänta några minuter för att cache ska rensas',
            '4. Kontrollera att värdet inte har citattecken eller mellanslag'
          ]
        }
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

