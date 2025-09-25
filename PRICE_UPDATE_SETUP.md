# Automatisk prisuppdatering för Elchef

## Översikt
Denna lösning hämtar automatiskt elpriser från Cheap Energy's JSON-fil och uppdaterar dem varje natt för att hålla priserna aktuella på hemsidan.

## Hur det fungerar

### 1. API Routes
- `/api/prices` - Hämtar priser från Cheap Energy (cachad i 1 timme)
- `/api/update-prices` - Manuell uppdatering av priser (kräver autentisering)

### 2. Prisstruktur
Priserna hämtas från: `https://www.cheapenergy.se/Site_Priser_CheapEnergy_de.json`

**Inkluderar:**
- Rörliga priser (spot) för alla elområden (SE1, SE2, SE3, SE4)
- Fastprisavtal för olika bindningstider (3, 6, 12, 24, 36, 48, 60, 120 månader)
- Fasta avgifter

### 3. Automatisk uppdatering

#### Alternativ A: Cron Job (Rekommenderat)
Skapa en cron job som kör varje natt kl 00:00:

```bash
# Lägg till i crontab
0 0 * * * curl -X POST https://din-domain.se/api/update-prices \
  -H "Authorization: Bearer DIN_SECRET_KEY" \
  -H "Content-Type: application/json"
```

#### Alternativ B: Vercel Cron Jobs
Om du använder Vercel, lägg till i `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/update-prices",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### Alternativ C: Extern tjänst
Använd tjänster som:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [UptimeRobot](https://uptimerobot.com)

## Miljövariabler

Lägg till i din `.env.local` fil:

```env
UPDATE_SECRET_KEY=din_hemliga_nyckel_här
```

## Testa uppdateringen

### Manuell test:
```bash
curl -X POST https://din-domain.se/api/update-prices \
  -H "Authorization: Bearer DIN_SECRET_KEY" \
  -H "Content-Type: application/json"
```

### Förväntat svar:
```json
{
  "success": true,
  "message": "Prices updated successfully",
  "timestamp": "2025-01-27T00:00:00.000Z",
  "prices": {
    "spot": {
      "se1": 14.08,
      "se2": 15.08,
      "se3": 42.94,
      "se4": 60.01
    },
    "fixed_6m": {
      "se1": 45.59,
      "se2": 45.59,
      "se3": 81.59,
      "se4": 95.99
    },
    "fixed_12m": {
      "se1": 44.79,
      "se2": 44.79,
      "se3": 78.39,
      "se4": 95.19
    }
  }
}
```

## Loggning

Alla prisuppdateringar loggas i konsolen med:
- ✅ Framgångsrik uppdatering
- ❌ Fel vid uppdatering
- 📊 Aktuella priser för alla områden

## Felsökning

### Vanliga problem:

1. **401 Unauthorized**
   - Kontrollera att `UPDATE_SECRET_KEY` är korrekt satt
   - Verifiera Authorization header

2. **500 Internal Server Error**
   - Kontrollera att Cheap Energy's JSON-fil är tillgänglig
   - Verifiera nätverksanslutning

3. **Priser visas inte**
   - Kontrollera att `/api/prices` returnerar data
   - Verifiera att cache är uppdaterad

## Säkerhet

- Använd en stark `UPDATE_SECRET_KEY`
- Begränsa åtkomst till `/api/update-prices` endast till auktoriserade källor
- Överväg att lägga till rate limiting för API:et

## Framtida förbättringar

- Databaslagring av prishistorik
- E-postnotifieringar vid fel
- Dashboard för att övervaka prisuppdateringar
- Backup-priskällor 