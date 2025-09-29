import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  generateKnowledgeSummary 
} from '@/lib/knowledgeBase';

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// DB row types to avoid any
interface DbKnowledgeRow {
  id?: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  last_updated?: string;
  lastUpdated?: string;
  active: boolean;
}

interface DbCampaignRow {
  id?: number;
  title: string;
  description: string;
  valid_from?: string;
  valid_to?: string;
  validFrom?: string;
  validTo?: string;
  active: boolean;
}

interface DbProviderRow {
  id?: number;
  name: string;
  type: 'rorligt' | 'fastpris' | 'foretag' | string;
  features: string[];
  url: string;
  active: boolean;
}

// Funktion för att hämta dynamisk kunskap från Supabase
async function getDynamicKnowledge(userQuestion: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Hämta kunskap (sort/filter i kod för att stödja både last_updated och lastUpdated)
    const { data: knowledgeData } = await supabase
      .from('ai_knowledge')
      .select('*');

    // Hämta kampanjer (filter i kod för att stödja valid_from/validFrom och valid_to/validTo)
    const { data: campaignData } = await supabase
      .from('ai_campaigns')
      .select('*');

    // Hämta leverantörer
    const { data: providerData } = await supabase
      .from('ai_providers')
      .select('*');

    // Filtrera/sortera kunskap och kampanjer i kod
    const nowIsoDate = new Date().toISOString().split('T')[0];

    const activeKnowledge = ((knowledgeData || []) as DbKnowledgeRow[])
      .filter((k) => k.active === true)
      .sort((a, b) => {
        const ad = new Date(a.lastUpdated || a.last_updated || 0).getTime();
        const bd = new Date(b.lastUpdated || b.last_updated || 0).getTime();
        return bd - ad;
      });

    const relevantKnowledge = activeKnowledge.filter((item) =>
      Array.isArray(item.keywords) && item.keywords.some((keyword: string) =>
        typeof keyword === 'string' && userQuestion.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    const filteredCampaigns = ((campaignData || []) as DbCampaignRow[])
      .filter((c) => c.active === true)
      .filter((c) => {
        const to = c.validTo || c.valid_to;
        return typeof to === 'string' ? to >= nowIsoDate : true;
      })
      .sort((a, b) => {
        const av = a.validTo || a.valid_to || '';
        const bv = b.validTo || b.valid_to || '';
        return av.localeCompare(bv);
      });

    return {
      knowledge: relevantKnowledge,
      campaigns: filteredCampaigns,
      providers: ((providerData || []) as DbProviderRow[])
        .filter((p) => p.active === true)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)))
    };
  } catch (error) {
    console.error('Error fetching dynamic knowledge:', error);
    return null;
  }
}

const SYSTEM_PROMPT = `Du er "Elge", en AI-assistent som hjelper norske forbrukere med strømavtaler og strømmarkedet – spesielt via stromsjef.no.

## FORMÅL OG EKSPERTISE
Du er en ekspert på norske strømavtaler og strømmarkedet med dyp kunnskap om:
- Strømavtaler (spotpris, fast, tillsvidare)
- Strømmarkedets struktur og funktion
- Kostnader, skatter, avgifter og påslag
- Miljøpåvirkning og grønn strøm
- Hvordan man bytter strømleverandør
- Strømområder (NO1, NO2, NO3, NO4, NO5)
- Aktuelle kampanjer og tilbud

## NETTSIDENS INNHOLD OG KUNNSKAP

### Om Stromsjef.no
• stromsjef.no tilbys av VKNG LTD i henhold til våre [vilkår](/vilkar) og [personvernpolicy](/personvernpolicy)
• Vi er INTE et strømbolag - du får aldri en strømregning fra oss
• Vi jobber uavhengig og samarbeider med flere strømleverandører
• Vi viser bare avtaler som er verdt å vurdere - med tydelige vilkår
• Vi har 30+ års erfaring fra bransjen

### Aktuelle Tilbud (2025)
• **Spotpris avtale**: 0 kr i avgifter første året – uten bindingsperiode
• **Fastprisavtale**: Prisgaranti med valgfri bindingsperiode (1-3 år)
• **Bedriftsavtaler**: Via energi2.se/strømsjef/ for bedrifter

### Leverandører
• **Spotpris avtale**: Cheap Energy (0 kr månadsavgift, 0 øre påslag)
• **Fastprisavtale**: Svealand Energi
• **Bedrift**: Energi2.se

### Bytteprosess
• Helt digitalt - ingen papir eller samtaler
• Vi fikser oppsigelsen hos din gamle strømleverandør
• Klart på 14 dager
• Gratis bytte - ingen avgifter
• Angrerett i 14 dager i henhold til distansavtaleloven

### Strømområder (NO1-NO5)
• **NO1**: Øst-Norge
• **NO2**: Sør-Norge  
• **NO3**: Midt-Norge
• **NO4**: Nord-Norge
• **NO5**: Vest-Norge
• Strømområdet påvirker strømprisen i din region

### Vanlige Spørsmål og Svar

**Hvordan finner jeg gode strømavtaler?**
Registrer din e-post i skjemaet i foten av siden for å få tidlige tilbud før de blir fullbooket.

**Hva skal jeg velge - Fastpris eller Spotpris?**
• **Fastpris**: Forutsigbart under hele avtalsperioden, bra hvis du vil unngå prissjokk
• **Spotpris**: Følger markedet, historisk billigere over tid men kan variere
• Tenk: Tror du strømprisene blir billigere eller dyrere fremover?

**Må jeg si opp min gamle avtale?**
Nei, den nye leverandøren håndterer byttet for deg inkludert oppsigelsen.

**Avgifter ved oppsigelse?**
• **Spotpris avtaler**: Oftest gratis, 1 måneds oppsigelsestid
• **Fastprisavtaler**: Kan ha bruddgebyr (løsningsavgift) avhengig av gjenværende tid

**Kan jeg angre min avtale?**
Ja, 14 dagers angrerett i henhold til distansavtaleloven. Unntak: betalt forbrukt strøm under angreperioden.

### Værets påvirkning på strømprisen
• **Regn**: Lavere pris (fyller vannmagasiner, billig vannkraft)
• **Vind**: Lavere pris (mye vindkraftproduksjon)
• **Varme**: Oftest lavere pris (mindre etterspørsel etter oppvarming)
• **Tørke/vindstille**: Høyere pris (mindre billig strøm, dyrere import)

### Sommeren - perfekt tid for bytte
• Mange vil låse inn lave sommerpriser før høsten
• Hos stromsjef.no får du spotpris uten påslag - bare markedsprisen
• Vi viser også faste strømavtaler for deg som vil unngå prissjokk

## SPRÅK OCH TON
• Alltid på enkel norsk
• Unngå kompliserte eller tekniske uttrykk
• Bruk punktlister og **fetstil** for tydelighet
• Bruk eksempler og sammenligninger (f.eks. "tenk på spotpris som bensinprisen – den varierer")
• Vær naturlig og samtalevennlig – som en hjelpsom venn
• HILSE BARE I FØRSTE SVARET. Inngå ALDRI etterfølgende svar med hilsen (f.eks. "Hei").

## FORMATERING OCH LÄSBARHET
• Bruk **fetstil** for nøkkelord, *kursiv* for betoning
• Bruk punktlister (-) og nummererte lister (1. 2. 3.)
• Bruk > sitat for viktige tips
• Bruk [lenker](url) når relevant
• Strukturer lengre svar med overskrifter (###)

## SIKKERHETSPOLICY
• Ikke gjør påstander om samarbeid med "Elbyte AB" eller "Elbyte Norden AB"
• Ikke gi ut, gjett eller fabrikk organisasjonsnummer
• Opplysninger om eier/styret skal ikke spekuleres om
• Hvis du ikke er sikker: si "Jeg vet ikke" og henvis til kilde

## SALGSFOKUS (uten overdrivelser)
• Fremhev at bytte via stromsjef.no er smidig og guidet
• Foreslå valg ut fra brukerens situasjon
• Spør gjerne om husholdningsinformasjon (boform, størrelse, oppvarming)
• Spør IKKE etter postnummer eller strømområde
• Foreslå neste steg når relevant: "Vil du at vi går videre med avtalsval?"

## KONTAKTSKJEMA
• Hvis brukeren vil ha personlig hjelp, foreslå kontaktskjemaet og inkluder [SHOW_CONTACT_FORM]
• Når det er sendt inn: takk kort og inkluder [CONTACT_FORM_SUBMITTED]
• Hvis brukeren ber om skjemaet igjen etter at det er vist: påpeke at det allerede finnes i chatten

## AVTALSVAL OG KØPSSIGNALER
• Når brukeren uttrykker tydelig interesse for bytte ("Ja", "Absolutt", "Gjerne", etc.), vis "Start her" knapp og inkluder [SHOW_START_HERE]
• Forklar at vi hjelper dem finne riktig avtale for deres situasjon
• Bekreft at de sendes til vår avtalsfinner hvor de kan oppgi sitt postnummer

## AI-KALKULATOR OG BEREGNING
• Når brukeren spør om kalkulator, beregning, kostnader, besparelse eller "hvor mye kan jeg spare", vis AI-kalkulator knapp og inkluder [SHOW_CALCULATOR]
• Forklar at vi kan hjelpe dem beregne strømkostnader og finne besparelser
• Bekreft at de sendes til vår AI-kalkulator hvor de kan laste opp sin faktura for analys

## VIKTIGE TRIGGERS – bruk alltid
• [SHOW_START_HERE] – ved tydelig kjøpssignal
• [SHOW_CALCULATOR] – ved spørsmål om kalkulator eller beregning
• [SHOW_CONTACT_FORM] – ved ønske om personlig hjelp

## SAMTALEREGLER
• Vær hjelpsom, konkret og tillitsvekkende
• Bygg tillit gjennom nytte og enkelhet
• Unngå utfylling
• Hvis brukeren allerede har delt info, referer til den naturlig
• Bruk alltid informasjon fra nettsiden - vær oppdatert på aktuelle tilbud

## SPESIFIKKE SPØRSMÅLSEKSEMPLER (følg nøyaktig)
• "Hvilket selskap står bak stromsjef.no?" → Svar: "stromsjef.no tilhandaholdes av VKNG LTD i henhold til våre vilkår og personvernpolicy."
• "Hva er organisasjonsnummeret?" → Svar: "Jeg har dessverre ikke et bekreftet organisasjonsnummer her. Verifiser via Brønnøysundregistrene, eller skriv spørsmålet ditt så kan vi komme tilbake via kontaktskjemaet."
• "Samarbeider dere med Elbyte (AB/Norden AB)?" → Svar: "stromsjef.no drives av VKNG LTD. Jeg har ingen opplysninger her om samarbeid med Elbyte."
• "Hvem er hovedmann/eier?" → Svar: "Slike opplysninger finnes i offisielle registre (f.eks. Brønnøysundregistrene). Jeg kan dessverre ikke gi det her."

## AKTUELLE KAMPANJER OG PRISER
• **Spotpris avtale**: 0 kr i avgifter første året, uten bindingsperiode
• **Fastprisavtale**: Prisgaranti med valgfri bindingsperiode
• **Bedrift**: Spesielle bedriftsavtaler via energi2.se
• Alle priser er aktuelle og kan variere - eksakte vilkår vises ved registrering`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, contractChoice } = body;
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Meddelanden saknas eller fel format' }, { status: 400 });
    }
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'XAI_API_KEY mangler i miljøvariabler' }, { status: 500 });
    }
    
    // Hämta användarens senaste meddelande för att hitta relevant kunskap
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Hämta dynamisk kunskap från Supabase
    const dynamicKnowledge = await getDynamicKnowledge(userMessage);
    
    // Debug: logga vad som hämtades
    if (dynamicKnowledge) {
      console.log('Dynamisk kunnskap hentet:', {
        knowledgeCount: dynamicKnowledge.knowledge.length,
        campaignCount: dynamicKnowledge.campaigns.length,
        providerCount: dynamicKnowledge.providers.length
      });
    }
    
    // Skapa en dynamisk systemprompt som inkluderar aktuell information
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    
    if (dynamicKnowledge) {
      // Lägg till relevant kunskap
      if (dynamicKnowledge.knowledge.length > 0) {
        enhancedSystemPrompt += '\n\n## RELEVANT KUNNSKAP BASERT PÅ DITT SPØRSMÅL\n';
        dynamicKnowledge.knowledge.forEach(item => {
          enhancedSystemPrompt += `**${item.question}**\n${item.answer}\n\n`;
        });
      }
      
      // Lägg till aktuella kampanjer
      if (dynamicKnowledge.campaigns.length > 0) {
        enhancedSystemPrompt += '\n## AKTUELLA KAMPANJER\n';
        dynamicKnowledge.campaigns.forEach(campaign => {
          enhancedSystemPrompt += `• **${campaign.title}**: ${campaign.description}\n`;
        });
        enhancedSystemPrompt += '\n';
      }
      
      // Lägg till aktuella leverantörer
      if (dynamicKnowledge.providers.length > 0) {
        enhancedSystemPrompt += '\n## AKTUELLE LEVERANDØRER\n';
        dynamicKnowledge.providers.forEach(provider => {
          enhancedSystemPrompt += `• **${provider.name}** (${provider.type}): ${provider.features.join(', ')}\n`;
        });
        enhancedSystemPrompt += '\n';
      }
    }
    
    // Om ingen dynamisk kunskap finns, använd statisk fallback
    if (!dynamicKnowledge) {
      enhancedSystemPrompt += '\n\n## AKTUELL INFORMATION (från statisk kunskapsbas)\n';
      enhancedSystemPrompt += generateKnowledgeSummary();
    }
    
    // Lägg till system-prompt först (nu med dynamisk kunskap från Supabase)
    const fullMessages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messages,
    ];
    
    // Om användaren har valt Start her eller kalkylator, lägg till kontext
    if (contractChoice) {
      const contextMessage = contractChoice === 'calculator' 
        ? 'VIKTIGT: Brukeren vil bruke AI-kalkulatoren for å beregne strømkostnader. Bekreft valget og forklar at de sendes til vår AI-kalkulator hvor de kan laste opp sin faktura for analys. Vær positiv og tillitvekkende.'
        : 'VIKTIGT: Brukeren vil starte her og finne riktig avtale. Bekreft valget og forklar at de sendes til vår avtalsfinner hvor de kan oppgi sitt postnummer. Vær positiv og tillitvekkende.';
      
      fullMessages.push({ role: 'system', content: contextMessage });
    }
    
    const xaiRes = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: fullMessages,
        model: 'grok-3-latest',
        stream: false,
        temperature: 0.3,
      }),
    });
    if (!xaiRes.ok) {
      const err = await xaiRes.text();
      return NextResponse.json({ error: 'Fel från X.ai', details: err }, { status: 500 });
    }
    const data = await xaiRes.json();

    // Sikkerhetsfilter: forhindre feilaktige firmasopplysninger og fabrikerte org.nr
    function sanitizeAiResponse(text: string): string {
      if (!text) return text;
      const mentionsElbyte = /\bElbyte( Norden)?( AB)?\b/i.test(text);
      const mentionsOrgNum = /\b559264[- ]?8047\b/i.test(text);
      if (!mentionsElbyte && !mentionsOrgNum) return text;

      const correction = [
        '**Korrigering:**',
        '- stromsjef.se tilhandaholdes av VKNG LTD i henhold til våre [vilkår](/vilkar) og [personvernpolicy](/personvernpolicy).',
        '- Vi deler ikke ut eller gjetter organisasjonsnummer i chatten. Verifiser via offentlige registre eller kontakt oss på post@stromsjef.no.'
      ].join('\n');

      // Behold opprinnelig tekst men legg til tydelig korrigering øverst
      return correction + '\n\n' + text;
    }

    try {
      const aiContent = data?.choices?.[0]?.message?.content || '';
      const safeContent = sanitizeAiResponse(aiContent);
      if (safeContent !== aiContent) {
        // Skriv tillbaka det sanerade svaret i samma struktur
        if (data?.choices?.[0]?.message) {
          data.choices[0].message.content = safeContent;
        }
      }
    } catch {}

    // Spara chatlogg till Supabase om konfigurerat
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Använd sessionId från frontend eller generera en om den saknas
        const finalSessionId = sessionId || Date.now().toString(36) + Math.random().toString(36).substr(2);
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Hitta det senaste användarmeddelandet (det som just skickades)
        const lastUserMessage = messages[messages.length - 1];
        
        // Skapa en array med bara det aktuella meddelandeutbytet
        const currentExchange = [
          lastUserMessage, // Användarens senaste meddelande
          { role: 'assistant', content: data.choices?.[0]?.message?.content || '' } // AI-svaret
        ];
        
        await supabase.from('chatlog').insert([
          {
            session_id: finalSessionId,
            user_agent: userAgent,
            messages: currentExchange, // Spara bara det aktuella utbytet, inte hela konversationen
            ai_response: data.choices?.[0]?.message?.content,
            total_tokens: data.usage?.total_tokens || 0,
          }
        ]);
      } catch {}
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 });
  }
} 

export const runtime = 'edge'; 
