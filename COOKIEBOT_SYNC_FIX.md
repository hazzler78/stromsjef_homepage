# Cookiebot Synkroniseringsguide

## Problem
404-fel när Cookiebot försöker ladda konfigurationsfilen:
```
GET https://consentcdn.cookiebot.com/consentconfig/[ID]/[DOMAIN]/configuration.js net::ERR_ABORTED 404
```

## Orsaker
Detta händer vanligtvis när:
1. Domänen inte är korrekt registrerad i Cookiebot
2. Cookiebot ID:t inte matchar domänen
3. Konfigurationen inte är synkroniserad till CDN:et ännu
4. Flera domäner behöver läggas till (med/utan www)

## Nuvarande konfiguration
- **Cookiebot ID:** `fc97bed6-e600-4863-ae67-f6f9d8bd5f4e`
- **Domän i kod:** `stromsjef.no`
- **Kanoniell URL:** `https://stromsjef.no`
- **Redirect från:** `elchef.se` → `www.stromsjef.no`

## Steg för att fixa synkroniseringen

### Steg 1: Logga in på Cookiebot
1. Gå till https://www.cookiebot.com/
2. Logga in med ditt konto

### Steg 2: Verifiera domäninställningar
1. Gå till **Settings** → **Domains**
2. Kontrollera att följande domäner är registrerade:
   - ✅ `stromsjef.no`
   - ✅ `www.stromsjef.no`
   - ✅ `stromsjef.se` (om den används)
   - ✅ `www.stromsjef.se` (om den används)

### Steg 3: Verifiera Cookiebot ID
1. Gå till **Settings** → **Your scripts**
2. Kontrollera att Cookiebot ID:t matchar: `fc97bed6-e600-4863-ae67-f6f9d8bd5f4e`
3. Om ID:t är annorlunda, uppdatera det i koden eller använd det korrekta ID:t

### Steg 4: Kontrollera domänverifiering
1. I Cookiebot-dashboarden, gå till **Settings** → **Domains**
2. För varje domän, kontrollera att den är **verifierad**
3. Om domänen inte är verifierad:
   - Klicka på "Verify domain"
   - Följ instruktionerna för att lägga till en TXT-post i DNS
   - Vänta på verifiering (kan ta några minuter)

### Steg 5: Tvinga synkronisering
1. I Cookiebot-dashboarden, gå till **Settings** → **Your scripts**
2. Klicka på **"Sync configuration"** eller **"Publish changes"**
3. Vänta 5-10 minuter för CDN-synkronisering

### Steg 6: Testa konfigurationsfilen
Öppna följande URL i webbläsaren (ersätt med ditt faktiska Cookiebot ID om det skiljer sig):
```
https://consentcdn.cookiebot.com/consentconfig/fc97bed6-e600-4863-ae67-f6f9d8bd5f4e/stromsjef.no/configuration.js
```

Om filen laddas korrekt (visar JSON), är synkroniseringen klar.

### Steg 7: Testa med www-prefix
Testa också:
```
https://consentcdn.cookiebot.com/consentconfig/fc97bed6-e600-4863-ae67-f6f9d8bd5f4e/www.stromsjef.no/configuration.js
```

## Vanliga problem och lösningar

### Problem: Domänen finns inte i Cookiebot
**Lösning:** Lägg till domänen i Cookiebot-dashboarden under Settings → Domains

### Problem: Cookiebot ID matchar inte
**Lösning:** 
- Om du har flera Cookiebot-konton, kontrollera att du använder rätt ID
- Om ID:t har ändrats, uppdatera det i `src/app/layout.tsx` och `src/app/cookies/page.tsx`

### Problem: Domänen är inte verifierad
**Lösning:** Verifiera domänen genom att lägga till TXT-post i DNS enligt Cookiebot-instruktioner

### Problem: Synkronisering tar lång tid
**Lösning:** 
- Vänta 2-4 timmar efter ändringar
- Tvinga synkronisering genom att göra en liten ändring i Cookiebot-konfigurationen och spara
- Rensa cache i webbläsaren

## Verifiering efter fix

1. Öppna sidan i inkognito-läge
2. Öppna Developer Tools (F12)
3. Gå till Network-fliken
4. Ladda om sidan
5. Kontrollera att det INTE finns några 404-fel för `consentcdn.cookiebot.com`
6. Kontrollera att Cookiebot-bannern visas korrekt

## Ytterligare hjälp

Om problemet kvarstår efter dessa steg:
1. Kontakta Cookiebot support: https://support.cookiebot.com/
2. Kontrollera Cookiebot-status: https://status.cookiebot.com/
3. Verifiera DNS-inställningar för domänen

