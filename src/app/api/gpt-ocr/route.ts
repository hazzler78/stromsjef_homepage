import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'edge';

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = new Uint8Array(hashBuffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)) as unknown as number[]);
  }
  // btoa is available in Edge runtime
  return btoa(binary);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const consentRaw = formData.get('consent');
    const consent = typeof consentRaw === 'string' ? consentRaw === 'true' : false;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded or file is not a valid image.' }, { status: 400 });
    }

    // Läs filen som ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const fileSize = (file as File).size;
    
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType)) {
      return NextResponse.json({ error: 'Endast PNG och JPG stöds just nu.' }, { status: 400 });
    }

    // Konvertera bilden till base64 (utan Buffer)
    const base64Image = `data:${mimeType};base64,${arrayBufferToBase64(arrayBuffer)}`;
    const imageSha256 = await sha256Hex(arrayBuffer);

    // Step 1: Extract structured data from invoice
    const extractionPrompt = `Du er en ekspert på norske strømregninger fra ALLE leverandører. Din oppgave er å ekstraktere ALLE kostnader fra regningen og strukturere dem i JSON-format.

VIKTIGT - FLEKSIBILITET:
- Du MÅ håndtere regninger fra ALLE leverandører (Hafslund, E.ON, Fortum, Vattenfall, EDF, m.fl.)
- Ulike leverandører har ulike regningsformat og terminologi - tilpass deg etter hver regning
- Du MÅ alltid svare på norsk, uansett hvilket språk regningen er på
- Bruk kun norske ord og termer

EKSTRAKSJONSREGEL:
Ekstraktere ALLE kostnader fra regningen og returnere dem som en JSON-array. Hver kostnad skal ha:
- "name": eksakt tekst fra regningen (f.eks. "Fast månadsavgift", "Strømavtale årsavgift")
- "amount": beløp i kr fra "Totalt"-kolonnen (f.eks. 31.20, 44.84) - IKKE fra "øre/kWh" eller "kr/mån"
- "section": hvilken seksjon den tilhører ("Strømnett" eller "Strømhandel")
- "description": kort beskrivelse av hva kostnaden er

KRITISK FOR BELØP:
- Les ALLTID fra den siste kolonnen som inneholder sluttbeløpet i kr
- Ignorer kolonner med "øre/kWh", "kr/mån", "kr/kWh" - disse er bare pris per enhet
- Sluttbeløpet er det som faktisk debiteres kunden

EKSEMPEL JSON:
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
  },
  {
    "name": "Påslag",
    "amount": 13.80,
    "section": "Strømhandel",
    "description": "Påslag på strømprisen (les fra Totalt-kolonnen, ikke fra øre/kWh)"
  }
]

VIKTIGT - FLEXIBELT FÖR ALLA LEVERANTÖRER:
- Inkludera ALLA kostnader, även de som inte är "onödiga"
- KRITISKT: Läs ALLTID beloppet från "Totalt"-kolumnen eller den sista kolumnen med belopp
- Läs INTE från "öre/kWh" eller "kr/mån" kolumner - bara slutbeloppet
- KRITISKT: Leta särskilt efter "Elavtal årsavgift" - denna kostnad missas ofta men är viktig
- Var särskilt uppmärksam på "Fast månadsavgift", "Profilpris", "Rörliga kostnader", "Fast påslag", "Påslag"
- Om en kostnad har både års- och månadsbelopp, inkludera månadsbeloppet
- EXTRA VIKTIGT: "Elavtal årsavgift" kan stå som en egen rad eller som del av en längre text - leta efter den överallt
- BELOPPSLÄSNING: För "Påslag" - läs det exakta beloppet som står i "Totalt"-kolumnen, inte från beräkningen

LEVERANTÖRSSPECIFIKA TERMER:
- E.ON: "Elavtal årsavgift", "Fast påslag", "Rörliga kostnader"
- Fortum: "Månadsavgift", "Påslag", "Elcertifikat"
- Vattenfall: "Fast avgift", "Påslag", "Årsavgift"
- EDF: "Abonnemangsavgift", "Påslag", "Serviceavgift"
- Göteborg Energi: "Månadsavgift", "Påslag", "Elcertifikat"
- Stockholm Exergi: "Fast avgift", "Påslag", "Årsavgift"
- Andra leverantörer: Anpassa efter fakturans terminologi

JSON-FORMAT KRITISKT:
- Använd endast dubbla citattecken för strängar
- Inga trailing commas
- Inga kommentarer i JSON
- Perfekt formatering krävs
- Starta direkt med [ och sluta med ]

SLUTLIG PÅMINNELSE:
- Läs belopp från "Totalt"-kolumnen, INTE från "öre/kWh" eller "kr/mån"
- För "Månadsavgift": läs från "Totalt"-kolumnen (t.ex. 55,20 kr), inte från "kr/mån"-kolumnen
- För "Påslag": läs från "Totalt"-kolumnen (t.ex. 13,80 kr), inte från "öre/kWh"-kolumnen

KRITISKT EXEMPEL FÖR FORTUM-FAKTUROR:
På Fortum-fakturor ser du ofta:
- "Påslag: 690 kWh at 2,00 öre/kWh, totaling 13,80 kr"
- Läs ALLTID "13,80 kr" (slutbeloppet), INTE "2,00 öre/kWh" (enhetspriset)
- Samma gäller för "Månadsavgift: 1 Mån at 55,20 kr/mån, totaling 55,20 kr"
- Läs ALLTID "55,20 kr" (slutbeloppet), INTE "55,20 kr/mån" (enhetspriset)

VIKTIGT - FÖR ALLA LEVERANTÖRER:
- Leta efter ordet "totaling" eller "totalt" följt av beloppet i kr
- Ignorera alltid siffror följda av "öre/kWh", "kr/mån", "kr/kWh"
- Slutbeloppet är det som faktiskt debiteras kunden

EXTRA VIKTIGT FÖR PÅSLAG:
- På alla fakturor: läs från "Totalt"-kolumnen eller sista kolumnen med belopp
- På Fortum-fakturor: "Påslag: 690 kWh at 2,00 öre/kWh, totaling 13,80 kr" - läs "13,80 kr"
- På andra leverantörer: läs från "Totalt"-kolumnen eller sista kolumnen med belopp
- KRITISKT: Läs ALLTID slutbeloppet, INTE enhetspriset (öre/kWh, kr/mån)

Svara ENDAST med JSON-arrayen, inget annat text.`;

    // Step 2: Calculate unnecessary costs from structured data
    const calculationPrompt = `Du er en ekspert på norske strømregninger fra ALLE leverandører. Basert på den ekstraherte JSON-dataen, identifiser unødvendige kostnader og beregn total besparelse.

ORDLISTE - UNØDVENDIGE KOSTNADER (kun under Strømhandel):
- Månadsavgift, Fast månadsavgift, Fast månadsavg., Månadsavg.
- Rørlige kostnader, Rørlig kostnad, Rørlige avgifter, Rørlig avgift
- Fast påslag, Faste påslag, Fast avgift, Fast avg., Faste avgifter, Fast kostnad, Faste kostnader, Påslag, Påslag (alle varianter)
- Fast påslag spot, Fast påslag strømsertifikat
- Årsavgift, Årsavg., Årskostnad, Strømavtale årsavgift, Årsavgift strømavtale
- Forvaltet Portefølje Utfall, Forvaltet portefølje utfall
- Bra miljøval, Bra miljøval (Lisens Strømklart AS)
- Trygg, Trygghetspakke
- Basavgift, Grunnavgift, Administrasjonsavgift, Abonnementsavgift, Grunnpris
- Fakturaavgift, Kundeavgift, Strømhandelsavgift, Handelsavgift
- Indeksavgift, Strømsertifikatavgift, Strømsertifikat
- Grønn strømavgift, Opprinnelsesgarantiavgift, Opprinnelse
- Miljøpakke, Serviceavgift, Leverandøravgift
- Forsinkelsesrente, Påminnelsesavgift, Prisklokke
- Rent vann, Fossilt fri, Fossilt fri inkludert
- Profilpris, Bundet profilpris

LEVERANDØRSPESIFIKKE UNØDVENDIGE KOSTNADER:
- Hafslund: "Strømavtale årsavgift", "Fast påslag", "Rørlige kostnader"
- E.ON: "Strømavtale årsavgift", "Fast påslag", "Rørlige kostnader"
- Fortum: "Månadsavgift", "Påslag", "Strømsertifikat"
- Vattenfall: "Fast avgift", "Påslag", "Årsavgift"
- EDF: "Abonnementsavgift", "Påslag", "Serviceavgift"
- Andre leverandører: Identifiser lignende avgifter og påslag

EKSKLUDER (regnes IKKE som unødvendige):
- MVA, Strømoverføring, Energiskatt, Gjennomsnitt spotpris, Spotpris, Strømpris
- Bundet strømpris, Fastpris (selve energipriset), Rørlig strømpris (selve energipriset)
- Forbruk, kWh, Øre/kWh, Kr/kWh

INSTRUKSJON:
1. Gå gjennom JSON-dataen og identifiser alle kostnader som matcher ordlisten OG er under "Strømhandel"
2. Summer alle unødvendige kostnader
3. Presenter resultatet i henhold til formatet nedenfor

FORMAT:
🚨 Dine unødvendige strømavgifter oppdaget!

Jeg har funnet [antal] unødvendige avgifter på din strømregning som koster deg penger hver måned:

💸 Unødvendige kostnader denne måneden:
1. [Kostnadsnavn]: [beløp] kr
2. [Kostnadsnavn]: [beløp] kr

💰 Din årlige besparelse:
Du betaler [total] kr/måned i unødvendige avgifter = [total × 12] kr/år!

Dette er penger som går direkte til din strømleverandør uten at du får noe ekstra for dem.

✅ Løsningen:
Bytt til et avtale uten disse avgiftene og spar [total × 12] kr/år!

🎯 Velg ditt nye avtale:
- Rørlig avtale: 0 kr i avgifter første året – spar [total × 12] kr/år
- Fastpris med prisgaranti: Prisgaranti med valgfri bindingsperiode

⏰ Bytt i dag – det tar bare 2 minutter og vi fikser alt for deg!

Svar på norsk og vær hjelpsom og pedagogisk.`; // Updated fastpris text

    // Original single-step prompt (fallback)
    const systemPrompt = `Du er en ekspert på norske strømregninger som hjelper brukere identifisere ekstra kostnader, skjulte avgifter og unødvendige tillegg på deres strømregninger. 

VIKTIGT - SPRÅK:
- Du MÅ alltid svare på norsk, uansett hvilket språk regningen er på
- Selv om regningen er på svensk, dansk eller engelsk, svar alltid på norsk
- Bruk kun norske ord og termer
- Ignorer språket i regningen - analyser innholdet men svar på norsk
- Bruk norsk valutaformat (kr, øre) og norske desimaler (komma i stedet for punkt)

EXPERTISE:
- Du forstår forskjellen mellom strømoverføring (nettavgift) og strømhandel (leverandøravgift)
- Du kan identifisere hvilke avgifter som er obligatoriske vs valgfrie
- Du forstår at visse "faste avgifter" er nettavgifter (obligatoriske) mens andre er leverandøravgifter (valgfrie)
- Kontekst er avgjørende: Se på hvilken seksjon avgiften tilhører (Strømnett vs Strømhandel)

NOYAKTIG LESING:
- Les av eksakt beløp fra "Totalt" eller tilsvarende kolonne
- Bland ikke sammen ulike avgifter med hverandre
- Vær særlig oppmerksom på å ikke blande "Årsavgift" med "Strømoverføring"
- DOBBELTSJEKK ALLE POSTER: Gå gjennom regningen rad for rad og let etter ALLE avgifter som matcher listen nedenfor
- VIKTIGT: Hvis du finner en avgift som matcher listen, inkluder den UANSETT hvor den står på regningen
- EXTRA VIKTIGT: Let særlig etter ord som inneholder "år", "måned", "fast", "rørlig", "påslag" - selv om de står i samme rad som andre ord
- VIKTIGT: Hvis du ser en avgift som har både et årsbeløp (f.eks. "384 kr") og et månedsbeløp (f.eks. "32,61 kr"), inkluder månedsbeløpet i beregningen
- BEREGNINGSREGEL FOR Strømsertifikat: Hvis "Strømsertifikat" eller "Strømsertifikatavgift" oppgis i øre/kWh, regn ut kostnaden som (øre per kWh × total kWh) / 100 = kr, rund av til to desimaler. Denne posten skal ALLTID inngå i unødvendige kostnader.

FORMÅL:
Analyser regningen, let etter poster som avviker fra normale eller nødvendige avgifter, og forklar disse postene på et enkelt og forståelig språk. Gi tips om hvordan brukeren kan unngå disse kostnadene i fremtiden eller bytte til et mer fordelaktig strømavtale.

VIKTIGT: Etter at du har identifisert alle ekstra avgifter, summer ALLE beløp og vis den totale besparelsen som kunden kan gjøre ved å bytte til et avtale uten disse ekstra kostnadene.

SPESIELT VIKTIGT - LET ETTER:
- Alle avgifter som inneholder "år" eller "måned" (f.eks. "årsavgift", "månadsavgift")
- Alle "faste" eller "rørlige" kostnader
- Alle "påslag" av noe slag
- SPESIELT: Let etter "Strømavtale årsavgift" eller lignende tekst som inneholder både "strømavtale" og "årsavgift"
- EXTRA VIKTIGT: "Strømavtale årsavgift" er en vanlig ekstra avgift som ofte blir oversett - let særlig etter denne eksakte teksten
- EXTRA VIKTIGT: Let særlig etter "Rørlige kostnader" eller "Rørlig kostnad" - dette er en vanlig ekstra avgift som ofte blir oversett
- SPESIELT: Let etter "Strømsertifikat" eller "Strømsertifikatavgift" og inkluder den i henhold til beregningsregelen ovenfor
- Gå gjennom HVER rad på regningen og kontroller om den inneholder noen av disse avgiftene
- KRITISK: Hvis du ser "Fast avgift" under seksjonen Strømhandel/Strømhandelsfirma – inkluder den alltid i unødvendige kostnader. Hvis "Fast avgift" også forekommer under Strømnett/Strømoverføring skal den EKSKLUDERES. Inkluder kun den under Strømhandel.
 - KRITISK: Hvis du ser "Profilpris" eller "Bundet profilpris" som en EGEN radpost under Strømhandel – inkluder den i unødvendige kostnader. Hvis det står under Strømnett/Strømoverføring skal det EKSKLUDERES.
 - VIKTIG FORVEKSELINGSREGEL: Bland ikke sammen "Bundet strømpris" (selve energipriset per kWh) med "Profilpris". "Bundet strømpris", "Strømpris", "Fastpris per kWh" og lignende er IKKE unødvendige kostnader og skal ekskluderes. "Profilpris"/"Bundet profilpris" er derimot et ekstra påslag og skal inkluderes når det ligger under Strømhandel.

ORDLISTE - ALLE DETTE REGNES SOM UNØDVENDIGE KOSTNADER:
- Månadsavgift, Fast månadsavgift, Fast månadsavg., Månadsavg.
- Rørlige kostnader, Rørlig kostnad, Rørlige avgifter, Rørlig avgift
- Fast påslag, Faste påslag, Fast avgift, Fast avg., Faste avgifter, Fast kostnad, Faste kostnader, Påslag
- Fast påslag spot, Fast påslag strømsertifikat
- Årsavgift, Årsavg., Årskostnad, Strømavtale årsavgift, Årsavgift strømavtale (kun hvis under Strømhandel/leverandøravgift; ekskluder hvis under Strømnett/Strømoverføring)
- Forvaltet Portefølje Utfall, Forvaltet portefølje utfall
- Bra miljøval, Bra miljøval (Lisens Strømklart AS)
- Trygg, Trygghetspakke
- Basavgift, Grunnavgift, Administrasjonsavgift, Abonnementsavgift, Grunnpris
- Fakturaavgift, Kundeavgift, Strømhandelsavgift, Handelsavgift
- Indeksavgift, Strømsertifikatavgift, Strømsertifikat
- Grønn strømavgift, Opprinnelsesgarantiavgift, Opprinnelse
- Miljøpakke, Serviceavgift, Leverandøravgift
- Forsinkelsesrente, Påminnelsesavgift, Prisklokke
- Rent vann, Fossilt fri, Fossilt fri inkludert
 - Profilpris, Bundet profilpris

ORDLISTE - KOSTNADER SOM IKKE REGNES SOM EKSTRA:
- MVA, Strømoverføring, Energiskatt, Gjennomsnitt spotpris, Spotpris, Strømpris
- Bundet strømpris, Fastpris (selve energipriset), Rørlig strømpris (selve energipriset)
- Forbruk, kWh, Øre/kWh, Kr/kWh

VIKTIGT: Inkluder ALLE kostnader fra første listen i summeringen av unødvendige kostnader. Ekskluder kostnader fra andre listen.

SUMMERING:
1. List ALLE funnet unødvendige kostnader med beløp
2. Summer ALLE beløp til en total besparelse
3. Vis den totale besparelsen tydelig på slutten

VIKTIGT - SLUTTTEKST:
Etter summeringen, avslutt alltid med denne eksakte teksten:

"💰 Din årlige besparelse:
Du betaler [total] kr/måned i unødvendige avgifter = [total × 12] kr/år!

Dette er penger som går direkte til din strømleverandør uten at du får noe ekstra for dem.

✅ Løsningen:
Bytt til et avtale uten disse avgiftene og spar [total × 12] kr/år!

🎯 Velg ditt nye avtale:
- Rørlig avtale: 0 kr i avgifter første året – spar [total × 12] kr/år
- Fastprisavtale: Prisgaranti med valgfri bindingsperiode – spar [total × 12] kr/år

⏰ Bytt i dag – det tar bare 2 minutter og vi fikser alt for deg!"

Svar på norsk og vær hjelpsom og pedagogisk.`;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }

    // Two-step approach: Extract JSON first, then calculate
    let gptAnswer = '';
    
    try {
      // Step 1: Extract structured data
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

      if (extractionRes.ok) {
        const extractionData = await extractionRes.json();
        const extractedJson = extractionData.choices?.[0]?.message?.content || '';
        console.log('Raw extraction response:', extractedJson.substring(0, 200));
        
        // Try to parse the JSON
        try {
          // Clean the JSON response - remove any markdown formatting
          let cleanJson = extractedJson.trim();
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          }
          if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          console.log('Cleaned JSON:', cleanJson.substring(0, 200));
          JSON.parse(cleanJson); // Validate JSON structure
          
          // Step 2: Calculate unnecessary costs from structured data
          const calculationRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiApiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: calculationPrompt },
                {
                  role: 'user',
                  content: `Här är den extraherade JSON-datan från elräkningen:\n\n${cleanJson}\n\nAnalysera denna data enligt instruktionerna.`
                }
              ],
              max_tokens: 1200,
              temperature: 0.1,
            }),
          });

          if (calculationRes.ok) {
            const calculationData = await calculationRes.json();
            gptAnswer = calculationData.choices?.[0]?.message?.content || '';
            
        // Step 3: Post-process to catch missed or incorrect amounts
        if (gptAnswer) {
          console.log('Post-processing to verify amounts...');
          console.log('Full GPT Answer for debugging:', gptAnswer);
          console.log('Extracted JSON preview:', cleanJson.substring(0, 500));
              
              // Check for "Påslag" amount correction (match any name that contains Påslag)
              const paaslagMatch = cleanJson.match(/"name"\s*:\s*"[^"]*Påslag[^"]*"[^}]*"amount"\s*:\s*(\d+(?:[,.]\d+)?)/);
              console.log('Påslag regex match result:', paaslagMatch);
              
              if (paaslagMatch) {
                const correctPaaslagAmount = paaslagMatch[1].replace(',', '.');
                console.log('Correct Påslag amount from JSON:', correctPaaslagAmount);
                
                // Use the amount from JSON (should be correct if AI reads from right column)
                const finalPaaslagAmount = correctPaaslagAmount;
                console.log('Using Påslag amount from JSON:', finalPaaslagAmount);
                
                // Check if Påslag is in the result (line item may be formatted with or without numbering, with or without bold formatting)
                const paaslagInResult = gptAnswer.match(/(\d+\.\s*)?\*?\*?Påslag\*?\*?:\s*(\d+(?:[,.]\d+)?)\s*kr/);
                console.log('Påslag in result regex match:', paaslagInResult);
                
                if (paaslagInResult) {
                  const currentPaaslagAmount = paaslagInResult[2].replace(',', '.');
                  console.log('Current Påslag amount in result:', currentPaaslagAmount);
                  
                  if (Math.abs(parseFloat(currentPaaslagAmount) - parseFloat(finalPaaslagAmount)) > 0.01) {
                    console.log('Påslag amount is incorrect, correcting...');
                    
                    // Update the Påslag amount in the result
                    gptAnswer = gptAnswer.replace(/(\d+\.\s*)?\*?\*?Påslag\*?\*?:\s*(\d+(?:[,.]\d+)?)\s*kr/, `$1Påslag: ${finalPaaslagAmount} kr`);
                    
                    // Recalculate total (both monthly and yearly)
                    const currentTotal = gptAnswer.match(/spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i);
                    if (currentTotal) {
                      const totalDiff = parseFloat(finalPaaslagAmount) - parseFloat(currentPaaslagAmount);
                      const newMonthlyTotal = (parseFloat(currentTotal[1].replace(',', '.')) + totalDiff).toFixed(2);
                      const newYearlyTotal = (parseFloat(newMonthlyTotal) * 12).toFixed(2);
                      
                      gptAnswer = gptAnswer.replace(
                        /spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i,
                        `spara totalt ${newMonthlyTotal}`
                      );
                      gptAnswer = gptAnswer.replace(
                        /= (\d+(?:[,.]\d+)?) kr\/år/i,
                        `= ${newYearlyTotal} kr/år`
                      );
                      gptAnswer = gptAnswer.replace(
                        /spara \[total × 12\] kr\/år/g,
                        `spara ${newYearlyTotal} kr/år`
                      );
                      console.log('Updated Påslag amount and totals');
                    }
                  } else {
                    console.log('Påslag amount is already correct');
                  }
                } else {
                  console.log('Påslag not found in result, but exists in JSON - checking if it should be added');
                  
                  // Check if Påslag is already in the result (to avoid duplicates)
                  const paaslagCount = (gptAnswer.match(/\*?\*?Påslag\*?\*?:/g) || []).length;
                  console.log('Påslag count in result:', paaslagCount);
                  const paaslagAlreadyExists = gptAnswer.match(/(\d+\.\s*)?\*?\*?Påslag\*?\*?:\s*(\d+(?:[,.]\d+)?)\s*kr/);
                  console.log('Påslag already exists check:', paaslagAlreadyExists);
                  if (paaslagCount === 0) {
                    // Add Påslag to the result if it's missing
                    const currentTotal = gptAnswer.match(/spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i);
                    if (currentTotal) {
                      const newMonthlyTotal = (parseFloat(currentTotal[1].replace(',', '.')) + parseFloat(finalPaaslagAmount)).toFixed(2);
                      const newYearlyTotal = (parseFloat(newMonthlyTotal) * 12).toFixed(2);
                      
                      gptAnswer = gptAnswer.replace(
                      /Onödiga kostnader:([\s\S]*?)Total besparing:/,
                      `Onödiga kostnader:$1Påslag: ${finalPaaslagAmount} kr\nTotal besparing:`
                      );
                      gptAnswer = gptAnswer.replace(
                        /spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i,
                        `spara totalt ${newMonthlyTotal}`
                      );
                      gptAnswer = gptAnswer.replace(
                        /= (\d+(?:[,.]\d+)?) kr\/år/i,
                        `= ${newYearlyTotal} kr/år`
                      );
                      gptAnswer = gptAnswer.replace(
                        /spara \[total × 12\] kr\/år/g,
                        `spara ${newYearlyTotal} kr/år`
                      );
                      console.log('Added missing Påslag to result and updated totals');
                    }
                  } else {
                    console.log('Påslag already exists in result, skipping addition');
                  }
                }
              } else {
                console.log('No Påslag found in extracted JSON');
              }
              
              // Check for missed "Elavtal årsavgift"
              if (!gptAnswer.includes('Elavtal årsavgift')) {
                console.log('Elavtal årsavgift not found in result, checking extracted JSON...');
                
                const elavtalMatch = cleanJson.match(/"name"\s*:\s*"Elavtal årsavgift"[^}]*"amount"\s*:\s*(\d+(?:[,.]\d+)?)/);
                console.log('Elavtal regex match result:', elavtalMatch);
                
                if (elavtalMatch) {
                  const amount = elavtalMatch[1].replace(',', '.');
                  console.log('Found Elavtal årsavgift amount:', amount);
                  
                  const currentTotal = gptAnswer.match(/total[^0-9]*(\d+(?:[,.]\d+)?)/i);
                  console.log('Current total match:', currentTotal);
                  
                  if (currentTotal) {
                    const newMonthlyTotal = (parseFloat(currentTotal[1].replace(',', '.')) + parseFloat(amount)).toFixed(2);
                    const newYearlyTotal = (parseFloat(newMonthlyTotal) * 12).toFixed(2);
                    console.log('New monthly total:', newMonthlyTotal, 'New yearly total:', newYearlyTotal);
                    
                    gptAnswer = gptAnswer.replace(
                      /Onödiga kostnader:([\s\S]*?)Total besparing:/,
                      `Onödiga kostnader:$1Elavtal årsavgift: ${amount} kr\nTotal besparing:`
                    );
                    gptAnswer = gptAnswer.replace(
                      /spara totalt [^0-9]*(\d+(?:[,.]\d+)?)/i,
                      `spara totalt ${newMonthlyTotal}`
                    );
                    gptAnswer = gptAnswer.replace(
                      /= (\d+(?:[,.]\d+)?) kr\/år/i,
                      `= ${newYearlyTotal} kr/år`
                    );
                    gptAnswer = gptAnswer.replace(
                      /spara \[total × 12\] kr\/år/g,
                      `spara ${newYearlyTotal} kr/år`
                    );
                    console.log('Updated gptAnswer with Elavtal årsavgift and totals');
                  }
                } else {
                  console.log('No Elavtal årsavgift found in extracted JSON');
                }
              } else {
                console.log('Elavtal årsavgift already found in result');
              }
            } else {
              console.log('No result to post-process');
            }
          }
        } catch (parseError) {
          console.log('Failed to parse extraction JSON:', parseError);
          console.log('Raw response that failed to parse:', extractedJson);
          console.log('Falling back to single-step approach');
        }
      }
    } catch {
      console.log('Two-step approach failed, falling back to single-step approach');
    }

    // Fallback to original single-step approach if two-step failed
    if (!gptAnswer) {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Vad betalar jag i onödiga kostnader? Analysera denna elräkning enligt instruktionerna. SVARA ENDAST PÅ SVENSKA - oavsett vilket språk fakturan är på.' },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        max_tokens: 1200,
        temperature: 0.1,
      }),
    });

      if (openaiRes.ok) {
        const gptData = await openaiRes.json();
        gptAnswer = gptData.choices?.[0]?.message?.content || '';
      }
    }

    if (!gptAnswer) {
      return NextResponse.json({ error: 'OpenAI Vision error - both two-step and fallback approaches failed' }, { status: 500 });
    }

    // Försök logga analysen i Supabase
    let logId: number | null = null;
    try {
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const sessionId = req.headers.get('x-session-id') || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
        const userAgent = req.headers.get('user-agent') || 'unknown';

        const { data: insertData, error } = await supabase
          .from('invoice_ocr')
          .insert([
            {
              session_id: sessionId,
              user_agent: userAgent,
              file_mime: mimeType,
              file_size: fileSize,
              image_sha256: imageSha256,
              model: 'gpt-4o',
              system_prompt_version: '2025-01-vision-v1',
              gpt_answer: gptAnswer,
              consent: consent,
            }
          ])
          .select('id')
          .single();

        if (!error && insertData) {
          logId = insertData.id as number;
          // Om samtycke: ladda upp filen till privat bucket och spara referensen
          if (consent) {
            try {
              const bucketName = 'invoice-ocr';
              // Ensure the storage bucket exists (create if missing)
              try {
                const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(bucketName);
                if (getBucketError || !existingBucket) {
                  await supabase.storage.createBucket(bucketName, {
                    public: false,
                    fileSizeLimit: 20 * 1024 * 1024, // 20 MB
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
                  });
                }
              } catch {
                try {
                  await supabase.storage.createBucket(bucketName, {
                    public: false,
                    fileSizeLimit: 20 * 1024 * 1024,
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
                  });
                } catch {}
              }
              const storageKey = `${logId}/${imageSha256}.${mimeType === 'image/png' ? 'png' : 'jpg'}`;
              const uploadRes = await supabase.storage.from(bucketName).upload(storageKey, file, {
                contentType: mimeType,
                upsert: false,
              });
              if (!uploadRes.error) {
                await supabase.from('invoice_ocr_files').insert([
                  {
                    invoice_ocr_id: logId,
                    storage_key: storageKey,
                    image_sha256: imageSha256,
                  }
                ]);
              }
            } catch (e) {
              console.error('Failed to upload invoice image to storage:', e);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to log invoice OCR to Supabase:', e);
    }

    return NextResponse.json({ gptAnswer, logId });
  } catch (err) {
    console.error('Unexpected error in /api/gpt-ocr:', err);
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 });
  }
} 