# Ny Supabase Setup Guide

## Översikt
Denna guide hjälper dig att sätta upp alla tabeller och funktioner i din nya Supabase-databas.

## Steg 1: Miljövariabler
Kontrollera att följande miljövariabler är satta i din `.env.local` fil:

```env
NEXT_PUBLIC_SUPABASE_URL=din_nya_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_nya_supabase_anon_key
SUPABASE_URL=din_nya_supabase_url
SUPABASE_SERVICE_ROLE_KEY=din_nya_supabase_service_role_key
```

## Steg 2: Kör SQL-script i Supabase
Gå till din Supabase Dashboard → SQL Editor och kör följande script i ordning:

### 1. Komplett setup (rekommenderat)
Kör `supabase-complete-setup.sql` först - detta innehåller alla grundläggande tabeller.

### 2. Kunskapsbas
Kör SQL från `KNOWLEDGE_BASE_SETUP.md` för AI-kunskapsbasen.

### 3. Ytterligare funktioner
Kör följande SQL-filer i ordning:
- `supabase-electricity-plans.sql` - Elavtal
- `supabase-contract-clicks.sql` - Klick-tracking
- `supabase-share-tracking.sql` - Delning-tracking
- `supabase-shared-cards.sql` - Delade kort
- `supabase-bill-analysis.sql` - Fakturaanalys
- `supabase-invoice-ocr-logs.sql` - OCR-loggar
- `supabase-chatlog.sql` - Chat-loggar

## Steg 3: RLS Policies
Efter att ha skapat tabellerna, kontrollera att RLS (Row Level Security) är aktiverat och att policies är satta korrekt.

## Steg 4: Testa anslutningen
1. Gå till `/admin/knowledge`
2. Logga in med lösenord: `grodan2025`
3. Klicka på "Testa databasanslutning"
4. Kontrollera konsolen för felmeddelanden

## Steg 5: Seed data (valfritt)
Om du vill ha exempeldata:
1. Gå till `/admin/plans/seed`
2. Klicka på "Seed Plans" för att lägga till exempeldata

## Felsökning
- **"Table doesn't exist"** → Kör motsvarande SQL-script
- **"Permission denied"** → Kontrollera RLS policies
- **"Environment variables missing"** → Kontrollera `.env.local`
- **"Connection failed"** → Kontrollera Supabase URL och nycklar

## Nästa steg
Efter setup, testa:
- `/admin/knowledge` - Kunskapsbas
- `/admin/plans` - Elavtal
- `/admin/reminders` - Påminnelser
- `/admin/chatlog` - Chat-loggar
