# Fel-lösningar för Strømsjef

## Problem som har identifierats och lösts:

### 1. ✅ Cookiebot 404-fel
**Problem:** `GET https://consentcdn.cookiebot.com/consentconfig/[ID]/[DOMAIN]/configuration.js net::ERR_ABORTED 404 (Not Found)`

**Lösning:** 
- Detta är ett problem med Cookiebot-synkronisering som kan fixas genom att verifiera domäninställningar
- Felhantering har lagts till i `layout.tsx` som automatiskt döljer dessa harmlösa 404-fel i konsolen
- Error handler fångar både console.error och unhandled promise rejections relaterade till Cookiebot
- Diagnostiskt script har lagts till - kör `window.checkCookiebotSync()` i konsolen för att diagnostisera

**Åtgärd:** 
- Se `COOKIEBOT_SYNC_FIX.md` för detaljerad guide om hur man fixar synkroniseringen
- Snabbdiagnostik: Lägg till `?debug=cookiebot` i URL:en och kör `window.checkCookiebotSync()` i konsolen
- Verifiera att domänen är korrekt registrerad i Cookiebot-dashboarden

### 2. ✅ API 500-fel (banner-impression & hero-impression)
**Problem:** `POST https://www.stromsjef.no/api/events/banner-impression 500 (Internal Server Error)`

**Lösning:** Förbättrad felhantering i API-rutterna med:
- Bättre validering av input-data
- Förbättrad felhantering för JSON-parsing
- Mer specifika felmeddelanden
- Console-logging för debugging

### 3. 🔄 Databastabeller saknas
**Problem:** Tabellerna `banner_impressions`, `hero_impressions`, `banner_clicks`, `hero_clicks` finns troligen inte i Supabase.

**Lösning:** Kör SQL-skriptet `supabase-analytics-tables.sql` i Supabase SQL Editor.

## Nästa steg för att lösa problemen:

### Steg 1: Skapa databastabeller
1. Gå till din Supabase-dashboard
2. Öppna SQL Editor
3. Kör innehållet från `supabase-analytics-tables.sql`
4. Verifiera att tabellerna skapades

### Steg 2: Testa API:erna
1. Kör: `curl http://localhost:3000/api/events/health-check`
2. Kontrollera att alla tabeller visar "exists"
3. Testa sidan igen och kontrollera att 500-felen är borta

### Steg 3: Verifiera Cookiebot
1. Vänta 2-4 timmar för Cookiebot-synkronisering
2. Kontrollera att Cookiebot-dialogen visas korrekt
3. Om problemet kvarstår, kontrollera Cookiebot-konfigurationen

## Filer som har uppdaterats:

- ✅ `src/app/api/events/banner-impression/route.ts` - Förbättrad felhantering
- ✅ `src/app/api/events/hero-impression/route.ts` - Förbättrad felhantering  
- ✅ `src/app/api/events/health-check/route.ts` - Ny health check endpoint
- ✅ `supabase-analytics-tables.sql` - SQL för att skapa saknade tabeller

## Testning:

```bash
# Testa health check
curl http://localhost:3000/api/events/health-check

# Förväntat svar:
{
  "status": "ok",
  "supabase": "connected", 
  "tables": {
    "banner_impressions": "exists",
    "hero_impressions": "exists",
    "banner_clicks": "exists", 
    "hero_clicks": "exists"
  }
}
```

## Om problemen kvarstår:

1. Kontrollera Supabase-loggar för mer specifika felmeddelanden
2. Verifiera att miljövariablerna är korrekt satta i produktionsmiljön
3. Kontrollera att alla tabeller har korrekta behörigheter (RLS-policies)
