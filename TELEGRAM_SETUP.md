# Telegram Bot Setup för Kontaktformulär

## Steg 1: Skapa en Telegram Bot

1. **Öppna Telegram** och sök efter `@BotFather`
2. **Starta en chatt** med BotFather
3. **Skicka kommandot** `/newbot`
4. **Följ instruktionerna**:
   - Ange ett namn för din bot (t.ex. "Elchef Contact Bot")
   - Ange ett användarnamn som slutar med "bot" (t.ex. "elchef_contact_bot")
5. **Spara bot token** som BotFather ger dig

## Steg 2: Hitta ditt Chat ID

### Alternativ 1: Skicka meddelande till bot
1. **Sök efter din bot** med användarnamnet du skapade
2. **Starta en chatt** med boten
3. **Skicka ett meddelande** (vad som helst)
4. **Gå till** `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. **Hitta chat_id** i svaret

### Alternativ 2: Använd @userinfobot
1. **Sök efter** `@userinfobot`
2. **Starta en chatt** och skicka `/start`
3. **Kopiera ditt ID** från svaret

## Steg 3: Konfigurera Miljövariabler

Lägg till följande i din `.env.local` fil:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_IDS=123456789,987654321,555666777

# Mailerlite Configuration (redan konfigurerat)
MAILERLITE_API_KEY=your_mailerlite_api_key
MAILERLITE_GROUP_ID=your_group_id
```

### Flera Chat IDs
För att skicka notifieringar till flera personer, separera chat IDs med kommatecken:
- `TELEGRAM_CHAT_IDS=123456789,987654321,555666777`
- Varje person måste ha startat en chatt med boten
- Du kan lägga till eller ta bort chat IDs när som helst

## Steg 4: Testa Konfigurationen

1. **Starta utvecklingsservern**: `npm run dev`
2. **Fyll i kontaktformuläret** på din webbplats
3. **Kontrollera Telegram** för notifiering

## Exempel på Telegram-meddelande

```
🔔 Ny kontaktförfrågan

📧 E-post: anna@example.com
📞 Telefon: 070-123 45 67
📰 Nyhetsbrev: Ja

⏰ Tidpunkt: 2024-01-15 14:30:25
🌐 Källa: Elchef.se kontaktformulär
```

## Felsökning

### Bot svarar inte
- Kontrollera att bot token är korrekt
- Se till att du har startat en chatt med boten

### Inga notifieringar
- Verifiera att TELEGRAM_CHAT_ID är korrekt
- Kontrollera att boten har behörighet att skicka meddelanden

### Mailerlite-integration fungerar inte
- Verifiera MAILERLITE_API_KEY och MAILERLITE_GROUP_ID
- Kontrollera att API-nyckeln har rätt behörigheter

## Säkerhet

- **Dela aldrig** din bot token offentligt
- **Använd miljövariabler** för alla känsliga data
- **Begränsa bot-åtkomst** till endast nödvändiga funktioner 