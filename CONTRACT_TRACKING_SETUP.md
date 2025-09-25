# Kontraktsklick-tracking Setup

## Översikt
Detta system spårar klick på "Rörligt avtal" och "Fastpris" knapparna från användare som har fått AI-analys på `/jamfor-elpriser` sidan. Detta ger insikt i hur många som går vidare från AI-analys till att faktiskt välja ett avtal.

## Komponenter

### 1. API Endpoint
**Fil:** `src/app/api/events/contract-click/route.ts`

Spårar kontraktsklick och lagrar följande data:
- `contract_type`: 'rorligt' eller 'fastpris'
- `log_id`: Referens till AI-analysen (kan vara null)
- `savings_amount`: Besparingsbelopp från AI-analysen
- `session_id`: Användarens sessions-ID
- `source`: Varifrån klicket kom (default: 'jamfor-elpriser')
- UTM-parametrar för kampanjspårning
- User agent och referer

### 2. Databas Schema
**Fil:** `supabase-contract-clicks.sql`

Skapar tabellen `contract_clicks` med:
- Foreign key till `invoice_ocr` för att koppla till AI-analyser
- Index för bättre prestanda
- RLS (Row Level Security) policies
- Cleanup-funktion för gamla poster

### 3. Tracking på /jamfor-elpriser
**Fil:** `src/app/jamfor-elpriser/page.tsx`

Uppdaterade knappar som:
- Anropar `trackContractClick()` innan navigering
- Extraherar besparingsbelopp från AI-analysen
- Skickar all relevant kontextdata

### 4. Admin Dashboard
**Fil:** `src/app/admin/contract-clicks/page.tsx`

Visar statistik över:
- Totalt antal klick på kontraktsknappar
- Fördelning mellan rörligt/fastpris
- Antal klick från användare med AI-analys
- Genomsnittlig besparing
- Konverteringsgrad (AI-analys → kontraktsklick)
- Kvalitet på klick (andelen med AI-analys)
- Detaljerad lista över senaste klick

## Installation

### 1. Kör SQL-schemat
```sql
-- Kör i Supabase SQL Editor
\i supabase-contract-clicks.sql
```

### 2. Verifiera miljövariabler
Kontrollera att följande finns i `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Testa tracking
1. Gå till `/jamfor-elpriser`
2. Ladda upp en faktura och få AI-analys
3. Klicka på "Rörligt avtal" eller "Fastpris"
4. Kontrollera i admin-panelen `/admin/contract-clicks`

## Användning

### Admin Dashboard
Gå till `/admin/contract-clicks` för att se:
- **Totalt klick**: Alla kontraktsklick
- **Rörligt avtal**: Antal klick på rörligt avtal
- **Fastpris**: Antal klick på fastpris
- **Med AI-analys**: Klick från användare som fått AI-analys
- **Genomsnittlig besparing**: Medelvärdet av besparingsbelopp
- **Konverteringsgrad**: Procent som går från AI-analys till kontraktsklick

### Filtrering
Använd datumfilter för att se data för olika perioder:
- Senaste 7 dagarna
- Senaste 30 dagarna  
- Senaste 90 dagarna
- Alla tider

## Dataanalys

### Viktiga KPI:er
1. **Konverteringsgrad**: Hur många % av AI-användare klickar på kontraktsknappar
2. **Fördelning**: Vilken typ av avtal som är populärast
3. **Besparingskorrelation**: Om högre besparingar leder till fler klick
4. **Tidsmönster**: När användare klickar (tid på dagen/veckan)

### Exempel på insikter
- "Av 100 AI-analyser klickar 25% på kontraktsknappar"
- "Rörligt avtal är 60% populärare än fastpris"
- "Användare med >1000 kr besparing klickar 40% oftare"

## Tekniska Detaljer

### Tracking-metod
- Använder `navigator.sendBeacon()` för bättre tillförlitlighet
- Fallback till `fetch()` om sendBeacon inte stöds
- Asynkron tracking som inte blockerar navigering

### Datasäkerhet
- RLS policies tillåter alla att läsa/skriva för tracking
- Känslig data (session_id) lagras men visas bara delvis i admin
- Automatisk cleanup av gamla poster (1 år)

### Prestanda
- Index på viktiga kolumner för snabba queries
- Begränsning till 100 senaste poster i admin-listan
- Effektiva databas-queries med filtrering

## Felsökning

### Vanliga problem
1. **Inga klick spåras**: Kontrollera att API-endpointen fungerar
2. **Fel i admin**: Verifiera Supabase-anslutning och RLS policies
3. **Saknade AI-kopplingar**: Kontrollera att `log_id` sparas korrekt

### Debugging
```javascript
// Kontrollera i browser console
console.log('Session ID:', localStorage.getItem('invoiceSessionId'));
console.log('Log ID:', logId);
```

## Framtida Förbättringar

### Möjliga tillägg
1. **A/B-testning**: Olika knapptexter och färger
2. **Heatmaps**: Var användare klickar på sidan
3. **Funnel-analys**: Steg-för-steg konvertering
4. **E-postuppföljning**: Kontakta användare som inte klickade
5. **Realtids-dashboard**: Live statistik med WebSocket

### Integrationer
- Google Analytics för djupare analys
- Email-marketing för uppföljning
- CRM-system för lead-hantering
