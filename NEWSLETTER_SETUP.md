# Nyhetsbrev Setup - Mailerlite Integration

## Översikt
Denna guide hjälper dig att konfigurera nyhetsbrev-funktionaliteten med Mailerlite för Elchef.se.

## Funktioner
- ✅ E-postregistrering med validering
- ✅ Checkbox för GDPR-samtycke
- ✅ Mailerlite API-integration
- ✅ Felhantering och användarfeedback
- ✅ Responsiv design

## Installation

### 1. Skapa Mailerlite-konto
1. Gå till [Mailerlite](https://www.mailerlite.com) och skapa ett konto
2. Skapa en grupp som heter "Alla typer av avtal" (eller använd befintlig grupp)

### 2. Hämta API-nyckel
1. Logga in på Mailerlite
2. Gå till **Integrations** > **API**
3. Skapa en ny API-nyckel
4. Kopiera nyckeln

### 3. Konfigurera miljövariabler
Skapa en `.env.local` fil i projektets rot och lägg till:

```env
# Mailerlite API Configuration
MAILERLITE_API_KEY=din_mailerlite_api_nyckel_här

# Mailerlite Group ID (valfritt)
# Hitta ditt grupp-ID i Mailerlite dashboard under Subscribers > Groups
MAILERLITE_GROUP_ID=ditt_grupp_id_här
```

### 4. Hitta Group ID (valfritt)
Om du vill använda ett specifikt grupp-ID:
1. Gå till **Subscribers** > **Groups** i Mailerlite
2. Klicka på gruppen "Alla typer av avtal"
3. Kopiera Group ID från URL:en eller gruppinställningarna

## Användning

### För användare
1. Scrolla ner till footern på sidan
2. Ange din e-postadress
3. Kryssa i rutan för att godkänna nyhetsbrev
4. Klicka "Anmäl dig"

### För utvecklare
- Komponenten finns i `src/components/Newsletter.tsx`
- API-endpoint: `src/app/api/newsletter/route.ts`
- Komponenten är integrerad i footern (`src/components/Footer.tsx`)

## GDPR-compliance
- ✅ Explicit samtycke krävs via checkbox
- ✅ Tydlig information om vad användaren prenumererar på
- ✅ Möjlighet att avprenumerera via Mailerlite
- ✅ Information om avprenumeration i samtyckestexten

## Felhantering
Systemet hanterar följande fel:
- Ogiltig e-postadress
- Redan registrerad e-postadress
- API-fel från Mailerlite
- Nätverksfel

## Testning
1. Starta utvecklingsservern: `npm run dev`
2. Gå till footern på sidan
3. Testa att registrera en e-postadress
4. Kontrollera att prenumeranten dyker upp i Mailerlite

## Felsökning

### "Konfigurationsfel"
- Kontrollera att `MAILERLITE_API_KEY` är korrekt inställd
- Verifiera att API-nyckeln har rätt behörigheter

### "Denna e-postadress är redan registrerad"
- Detta är normalt beteende - Mailerlite tillåter inte duplicerade e-postadresser
- Användaren får tydlig feedback om detta

### API-fel
- Kontrollera Mailerlite API-status
- Verifiera att grupp-ID:t är korrekt (om använt)
- Kontrollera server-loggar för detaljerad felinformation

## Säkerhet
- API-nyckeln lagras endast i miljövariabler
- E-postadresser valideras både på klient- och serversidan
- All kommunikation sker över HTTPS
- GDPR-samtycke krävs för registrering 