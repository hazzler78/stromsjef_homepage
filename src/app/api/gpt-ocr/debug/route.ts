import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)) as unknown as number[]);
  }
  return btoa(binary);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Läs filen och konvertera till base64 utan Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const base64Image = `data:${mimeType};base64,${arrayBufferToBase64(arrayBuffer)}`;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }

    // Step 1: Extract structured data
    const extractionPrompt = `Du er en ekspert på norske strømregninger. Din oppgave er å ekstraktere ALLE kostnader fra regningen og strukturere dem i JSON-format.

**VIKTIGT - SPRÅK:**
- Du MÅ alltid svare på norsk, uansett hvilket språk regningen er på
- Bruk kun norske ord og termer

**EKSTRAKSJONSREGEL:**
Ekstraktere ALLE kostnader fra regningen og returnere dem som en JSON-array. Hver kostnad skal ha:
- "name": eksakt tekst fra regningen (f.eks. "Fast månadsavgift", "Strømavtale årsavgift")
- "amount": beløp i kr (f.eks. 31.20, 44.84)
- "section": hvilken seksjon den tilhører ("Strømnett" eller "Strømhandel")
- "description": kort beskrivelse av hva kostnaden er

**EKSEMPEL JSON:**
[
  {
    "name": "Fast månadsavgift",
    "amount": 31.20,
    "section": "Strømhandel",
    "description": "Månedlig fast avgift fra strømleverandøren"
  },
  {
    "name": "Strømavtale årsavgift",
    "amount": 44.84,
    "section": "Strømhandel", 
    "description": "Årsavgift for strømavtalen"
  },
  {
    "name": "Strømoverføring",
    "amount": 217.13,
    "section": "Strømnett",
    "description": "Nettavgift for strømoverføring"
  }
]

**VIKTIGT:**
- Inkluder ALLE kostnader, også de som ikke er "unødvendige"
- Les eksakt beløp fra "Totalt" eller tilsvarende kolonne
- **KRITISK**: Let særlig etter "Strømavtale årsavgift" - denne kostnaden blir ofte oversett men er viktig
- Vær særlig oppmerksom på "Fast månadsavgift", "Profilpris", "Rørlige kostnader", "Fast påslag"
- Hvis en kostnad har både års- og månedsbeløp, inkluder månedsbeløpet
- **EXTRA VIKTIGT**: "Strømavtale årsavgift" kan stå som en egen rad eller som del av en lengre tekst - let etter den overalt

Svar KUN med JSON-arrayen, ingenting annet.`;

    const extractionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: extractionPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extrahera alla kostnader från denna elräkning som JSON-array. SVARA ENDAST MED JSON.' },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.0,
      }),
    });

    const debugInfo: {
      step1_success: boolean;
      extractedJson: string;
      parsedData: unknown;
      parseError: string | null;
      elavtalFound: boolean;
      elavtalAmount: number | null;
      regexMatch: RegExpMatchArray | null;
    } = {
      step1_success: false,
      extractedJson: '',
      parsedData: null,
      parseError: null,
      elavtalFound: false,
      elavtalAmount: null,
      regexMatch: null
    };

    if (extractionRes.ok) {
      const extractionData = await extractionRes.json();
      const extractedJson = extractionData.choices?.[0]?.message?.content || '';
      debugInfo.step1_success = true;
      debugInfo.extractedJson = extractedJson;
      
      // Try to parse the JSON
      try {
        const parsedData = JSON.parse(extractedJson);
        debugInfo.parsedData = parsedData;
        
        // Check if Elavtal årsavgift is in the data
        const elavtalItem = parsedData.find((item: { name?: string }) => 
          item.name && item.name.toLowerCase().includes('elavtal årsavgift')
        );
        
        if (elavtalItem) {
          debugInfo.elavtalFound = true;
          debugInfo.elavtalAmount = elavtalItem.amount;
        }
        
        // Test regex pattern
        const elavtalMatch = extractedJson.match(/["']?Elavtal årsavgift["']?\s*[,\]]\s*["']?(\d+(?:[,.]\d+)?)["']?\s*kr/);
        debugInfo.regexMatch = elavtalMatch;
        
      } catch (parseError) {
        debugInfo.parseError = String(parseError);
      }
    }

    return NextResponse.json({
      debug: debugInfo,
      message: 'Debug information for invoice analysis'
    });

  } catch (err) {
    console.error('Debug error:', err);
    return NextResponse.json({ error: 'Debug failed', details: String(err) }, { status: 500 });
  }
}
