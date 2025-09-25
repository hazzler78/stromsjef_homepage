# Kundpåminnelse System - Setup Guide

## Översikt
Detta system hjälper dig att påminna kunder om att förlänga sina elavtal innan de går över till dyrare tillsvidareavtal. Systemet skickar automatiska Telegram-notifieringar 11 månader innan avtalet går ut.

**Ny workflow:**
1. Kund kontaktar er via kontaktformuläret
2. Ni får Telegram-notifiering om ny kontaktförfrågan
3. Ni svarar på Telegram-meddelandet med avtalstyp och startdatum
4. Systemet skapar automatiskt en påminnelse baserat på era svar

## Funktioner
- ✅ Automatisk påminnelse 11 månader före avtalsutgång
- ✅ Stöd för olika avtalstyper (12, 24, 36 månader)
- ✅ Telegram-notifieringar till ditt team
- ✅ Interaktiva svar via Telegram för att skapa påminnelser
- ✅ Databaslagring av alla påminnelser
- ✅ Integration med kontaktformuläret

## Databas Setup

### 1. Skapa tabeller i Supabase
Kör följande SQL i Supabase SQL Editor:

```sql
-- Skapa customer_reminders tabell
CREATE TABLE customer_reminders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('12_months', '24_months', '36_months', 'variable')),
  contract_start_date DATE NOT NULL,
  reminder_date DATE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skapa pending_reminders tabell för väntande kontaktförfrågningar
CREATE TABLE pending_reminders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skapa index för effektiv sökning
CREATE INDEX idx_reminder_date ON customer_reminders(reminder_date, is_sent);
CREATE INDEX idx_customer_email ON customer_reminders(email);
CREATE INDEX idx_pending_created_at ON pending_reminders(created_at);

-- Aktivera Row Level Security (valfritt)
ALTER TABLE customer_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_reminders ENABLE ROW LEVEL SECURITY;

-- Skapa RLS-policies för customer_reminders
CREATE POLICY "Allow all operations for customer_reminders" ON customer_reminders
  FOR ALL USING (true) WITH CHECK (true);

-- Skapa RLS-policies för pending_reminders  
CREATE POLICY "Allow all operations for pending_reminders" ON pending_reminders
  FOR ALL USING (true) WITH CHECK (true);
```

## Miljövariabler

Lägg till följande i din `.env.local` fil:

```env
# Supabase Configuration (redan konfigurerat)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Telegram Bot Configuration (redan konfigurerat)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_IDS=123456789,987654321

# Reminder System
UPDATE_SECRET_KEY=your_secret_key_for_cron_jobs
NEXT_PUBLIC_BASE_URL=https://din-domain.se
```

## Telegram Webhook Setup

### 1. Konfigurera webhook
Efter att du har deployat till Vercel, kör följande kommando för att sätta webhook:

```bash
curl -X GET "https://din-domain.se/api/telegram-webhook"
```

### 2. Testa webhook
Skicka ett testmeddelande till din bot för att verifiera att webhook fungerar.

## API Endpoints

### 1. Kontaktformulär
**POST** `/api/contact`
Skickar Telegram-notifiering och skapar pending reminder.

### 2. Telegram Webhook
**POST** `/api/telegram-webhook`
Hanterar svar från teamet och skapar påminnelser.

### 3. Skapa påminnelse manuellt
**POST** `/api/reminders`
```json
{
  "customer_name": "Anna Andersson",
  "email": "anna@example.com",
  "phone": "070-123 45 67",
  "contract_type": "12_months",
  "contract_start_date": "2025-01-15",
  "notes": "Manuellt skapad"
}
```

### 4. Hämta påminnelser för idag
**GET** `/api/reminders`
Returnerar alla påminnelser som ska skickas idag.

### 5. Skicka påminnelser
**POST** `/api/reminders/send`
Kontrollerar och skickar alla påminnelser som är förfallna idag.

## Automatisk körning

### Alternativ A: Cron Job (Rekommenderat)
Skapa en cron job som kör varje dag kl 09:00:

```bash
# Lägg till i crontab
0 9 * * * curl -X POST https://din-domain.se/api/reminders/send \
  -H "Authorization: Bearer DIN_SECRET_KEY" \
  -H "Content-Type: application/json"
```

### Alternativ B: Vercel Cron Jobs
Lägg till i `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/reminders/send",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Alternativ C: Extern tjänst
Använd tjänster som:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [UptimeRobot](https://uptimerobot.com)

## Användning

### 1. Kund kontaktar er
När kunder fyller i kontaktformuläret skickas en Telegram-notifiering till ditt team.

### 2. Ni svarar via Telegram
Svara på Telegram-meddelandet med formatet:
- `12m 2025-02-15` (12 månaders avtal som startar 15 februari 2025)
- `24m 2025-02-15` (24 månaders avtal som startar 15 februari 2025)
- `36m 2025-02-15` (36 månaders avtal som startar 15 februari 2025)

### 3. Systemet skapar påminnelse
När ni svarar skapas automatiskt en påminnelse som skickas 11 månader före avtalsutgång.

## Exempel på Telegram-meddelande

### Kontaktförfrågan:
```
🔔 Ny kontaktförfrågan

🙍‍♂️ Namn: Anna Andersson
📧 E-post: anna@example.com
📞 Telefon: 070-123 45 67
📰 Nyhetsbrev: Ja

📝 Meddelande: Vill ha hjälp med att byta elavtal

⏰ Tidpunkt: 2025-01-27 14:30:25
🌐 Källa: Elchef.se kontaktformulär

💡 Svara med avtalstyp och startdatum för att skapa påminnelse:
Format: "12m 2025-02-15" eller "24m 2025-02-15" eller "36m 2025-02-15"
```

### Bekräftelse på skapad påminnelse:
```
✅ Påminnelse skapad!

👤 Kund: Anna Andersson
📋 Avtalstyp: 12 månader
📅 Startdatum: 15/02/2025
⏰ Avtal går ut: 15/02/2026
🔔 Påminnelse skickas: 15/03/2025

Påminnelse kommer skickas 11 månader före avtalsutgång.
```

### Påminnelse när avtalet går ut:
```
🔔 Kundpåminnelse - Avtal går ut snart

👤 Kund: Anna Andersson
📧 E-post: anna@example.com
📞 Telefon: 070-123 45 67
📋 Avtalstyp: 12 månader
📅 Avtal startade: 15/02/2025
⏰ Avtal går ut: 15/02/2026

💡 Åtgärd krävs: Ring kunden för att förlänga avtalet innan det går över till dyrare tillsvidareavtal.

🌐 Källa: Elchef.se påminnelsesystem
```

## Felsökning

### Vanliga problem:

1. **Inga påminnelser skickas**
   - Kontrollera att `UPDATE_SECRET_KEY` är korrekt satt
   - Verifiera att `TELEGRAM_BOT_TOKEN` är giltig
   - Kontrollera att `TELEGRAM_CHAT_IDS` innehåller rätt chat-ID:n
   - Testa manuellt med admin-panelen

2. **Försenade påminnelser**
   - Använd "Markera försenade som skickade" i admin-panelen
   - Kontrollera att cron job körs regelbundet
   - Verifiera att API:et fungerar med manuell test

3. **Telegram-meddelanden kommer inte fram**
   - Verifiera att bot-token är korrekt
   - Kontrollera att chat-ID:n är rätt
   - Testa bot-meddelanden manuellt

### Snabbdiagnostik:

1. **Gå till admin-panelen** (`/admin/reminders`)
2. **Kontrollera systemstatus** - alla indikatorer ska vara gröna
3. **Testa påminnelsesystemet** - klicka på "Testa påminnelsesystem"
4. **Hantera försenade påminnelser** - markera som skickade om de redan hanterats

### Miljövariabler som behövs:

```env
# Telegram-konfiguration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_IDS=123456789,987654321

# Cron job autentisering
UPDATE_SECRET_KEY=your_secret_key_for_cron_jobs

# Supabase-konfiguration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Testa manuellt:

```bash
# Testa reminder API
curl -X POST https://din-domain.se/api/reminders/send \
  -H "Authorization: Bearer DIN_UPDATE_SECRET_KEY" \
  -H "Content-Type: application/json"
```

### Loggar att kontrollera:

- Vercel Function Logs (i Vercel Dashboard)
- Supabase Logs (i Supabase Dashboard)
- Telegram Bot Logs (via BotFather)

### Nästa steg om problemet kvarstår:

1. Kontrollera att alla miljövariabler är korrekt satta
2. Verifiera att cron job körs (kolla Vercel logs)
3. Testa Telegram-boten manuellt
4. Kontrollera Supabase-anslutningen
5. Använd admin-panelens diagnostikverktyg

## Säkerhet

- Använd en stark `UPDATE_SECRET_KEY`
- Begränsa åtkomst till API:er endast till auktoriserade källor
- Överväg att lägga till rate limiting
- Använd HTTPS för alla API-anrop
- Verifiera Telegram webhook-signaturer (kan läggas till senare)

## Framtida förbättringar

- E-postnotifieringar som backup
- Dashboard för att hantera påminnelser
- Möjlighet att schemalägga flera påminnelser
- Integration med CRM-system
- Statistik och rapporter
- Telegram webhook-signaturverifiering