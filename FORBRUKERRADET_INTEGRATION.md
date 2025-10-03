# Forbrukerrådet Integration

## Översikt
Denna integration hämtar automatiskt priser från Forbrukerrådets strømprisportal och lagrar dem i vår databas för användning i prisjämförelser och analyser.

## Komponenter

### 1. API Endpoints
- **`/api/prices-forbruk`** - Test endpoint (read-only, ingen DB-lagring)
- **`/api/prices-forbruk-update`** - Produktions endpoint (med DB-lagring)

### 2. Databas
- **Tabell**: `forbrukerradet_prices`
- **Schema**: Se `supabase-forbrukerradet-prices.sql`
- **Indexer**: För snabb sökning på år, vecka, förbruk och pristyp

### 3. Scheduler
- **Befintlig**: Uppdaterad `functions/[[scheduled]].ts` inkluderar Forbrukerrådet
- **Midnatt**: Ny `functions/[[scheduled-midnight]].ts` för uppdatering efter 00:05

### 4. Admin Interface
- **Sida**: `/admin/forbrukerradet-prices`
- **Funktioner**: Filtrera, visa, analysera priser
- **Navigation**: Tillagd i admin dashboard

## Konfiguration

### Environment Variables
```bash
# Forbrukerrådet API
FORBRUK_BASE_URL=https://strom-api.forbrukerradet.no
FORBRUK_CLIENT_ID=6e1934f7-dc2f-41b4-8578-d8d81f5605e9
FORBRUK_CLIENT_SECRET=<SECRET>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<URL>
SUPABASE_SERVICE_ROLE_KEY=<KEY>
SUPABASE_ANON_KEY=<KEY>

# Scheduler
UPDATE_SECRET_KEY=<SECRET>
CRON_TARGET_BASE_URL=https://www.stromsjef.no
```

### Database Setup
```sql
-- Kör detta i Supabase SQL Editor
\i supabase-forbrukerradet-prices.sql
```

## Användning

### Manuell Uppdatering
```bash
# Test endpoint (ingen DB-lagring)
curl "https://www.stromsjef.no/api/prices-forbruk?path=/feed/week&debug=1"

# Produktions endpoint (med DB-lagring)
curl -X POST "https://www.stromsjef.no/api/prices-forbruk-update" \
  -H "Authorization: Bearer $UPDATE_SECRET_KEY"
```

### Programmatisk Användning
```typescript
import { getForbrukerrådetPrices, getLatestForbrukerrådetPrices } from '@/lib/forbrukerradetService';

// Hämta senaste priser
const prices = await getLatestForbrukerrådetPrices(10);

// Filtrera priser
const spotPrices = await getForbrukerrådetPrices({
  name: 'spot',
  year: 2025,
  week: 39,
  limit: 50
});
```

## Data Struktur

### Forbrukerrådet Feed Data
```typescript
interface ForbrukerrådetPriceData {
  year: number;           // År
  week: number;          // Vecka
  consumption: number;   // Förbrukning (kWh)
  name: string;          // Pristyp (spot, fixed, etc.)
  no1: number;           // NO1 zon (øre/kWh)
  no2: number;           // NO2 zon (øre/kWh)
  no3: number;           // NO3 zon (øre/kWh)
  no4: number;           // NO4 zon (øre/kWh)
  no5: number;           // NO5 zon (øre/kWh)
  national: number;      // Nasjonalt genomsnitt (øre/kWh)
  createdAt: string;     // Skapad (ISO string)
  updatedAt: string;     // Uppdaterad (ISO string)
}
```

### Pristyper
- **spot**: Spotpris
- **hourly_spot**: Timspotpris
- **fixed 1/2 year**: Fastpris 6 månader
- **fixed 1 year**: Fastpris 1 år
- **fixed 2 years**: Fastpris 2 år
- **fixed 3 years**: Fastpris 3 år
- **fixed 5 years**: Fastpris 5 år
- **variable**: Variabel pris
- **purchase**: Innkjøpspris
- **plus**: Plus-pris
- **other**: Annet

## Automatisk Uppdatering

### Scheduler Konfiguration
- **Vanlig**: Körs enligt befintlig cron (t.ex. varje timme)
- **Midnatt**: Körs kl 00:05 varje dag för att hämta senaste priser

### Feeds som Hämtas
1. `/feed/week` - Veckopriser
2. `/feed/agreements` - Avtalspriser
3. `/feed/prices` - Allmänna priser

## Felsökning

### Vanliga Problem
1. **401 Unauthorized**: Kontrollera `FORBRUK_CLIENT_ID` och `FORBRUK_CLIENT_SECRET`
2. **404 Not Found**: Kontrollera `FORBRUK_BASE_URL`
3. **Database Error**: Kontrollera Supabase konfiguration
4. **Token Expired**: Tokens uppdateras automatiskt

### Loggar
- Scheduler loggar: Cloudflare Workers logs
- API loggar: Vercel function logs
- Database loggar: Supabase logs

## Säkerhet

### API Keys
- **Client Secret**: Hålls hemligt, rotera regelbundet
- **UPDATE_SECRET_KEY**: Används för auktorisering av uppdateringar
- **Supabase Keys**: Service role key för DB-operationer

### RLS (Row Level Security)
- **Public Read**: Alla kan läsa priser
- **Service Role**: Kan skriva/uppdatera priser
- **Admin**: Full åtkomst via admin interface

## Monitoring

### Health Checks
```bash
# Kontrollera API status
curl "https://www.stromsjef.no/api/prices-forbruk?path=/feed/week"

# Kontrollera senaste uppdatering
curl "https://www.stromsjef.no/api/prices-forbruk-update" \
  -X POST -H "Authorization: Bearer $UPDATE_SECRET_KEY"
```

### Admin Dashboard
- Gå till `/admin/forbrukerradet-prices`
- Filtrera och analysera priser
- Kontrollera data kvalitet

## Utveckling

### Lokal Testning
```bash
# Starta dev server
npm run dev

# Testa endpoint
curl "http://localhost:3000/api/prices-forbruk?path=/feed/week&debug=1"
```

### Deployment
1. Uppdatera environment variables
2. Kör database migration
3. Deploy till Vercel
4. Konfigurera Cloudflare Workers cron

## Support

För frågor eller problem:
1. Kontrollera loggar först
2. Testa endpoints manuellt
3. Kontrollera environment variables
4. Kontakta utvecklare om problem kvarstår
