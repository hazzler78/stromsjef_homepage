# Social Delning av AI-Kalkyler - Setup Guide

## 🎯 Översikt

Detta system låter användare dela sina AI-kalkyler från `/jamfor-elpriser` på sociala medier, vilket skapar viral marknadsföring och ökar trafik till er webbplats.

## 🚀 Funktioner

### 1. **Automatisk Delning efter AI-analys**
- Delningsknappar visas efter att användaren fått sin AI-analys
- Automatisk extraktion av besparingsbelopp från analysen
- Plattformsspecifika texter för Facebook, Instagram, LinkedIn och Twitter

### 2. **Unika Delningslänkar**
- Varje delning får en unik länk: `elchef.se/delad-kalkyl?id={logId}`
- Delade kalkyler visas på en dedikerad sida
- Automatisk rensning av gamla delningar (30 dagar)

### 3. **Spårning och Analytics**
- Spårar vilka plattformar som används mest
- Mäter besparingsbelopp för delade kalkyler
- Kopplar delningar till ursprungliga AI-analyser

## 📁 Filer som skapats

### Komponenter
- `src/components/ShareResults.tsx` - Huvudkomponent för social delning
- `src/app/delad-kalkyl/page.tsx` - Sida för att visa delade kalkyler

### API:er
- `src/app/api/events/share-click/route.ts` - Spårar delningar

### Databas
- `supabase-share-tracking.sql` - SQL schema för spårning

## 🛠 Installation

### 1. Kör SQL-schemat
```sql
-- Kör supabase-share-tracking.sql i din Supabase SQL editor
```

### 2. Uppdatera miljövariabler
Inga nya miljövariabler behövs - använder befintlig Supabase-konfiguration.

### 3. Testa funktionaliteten
1. Gå till `/jamfor-elpriser`
2. Ladda upp en elräkning och få AI-analys
3. Klicka på "Dela resultat" efter analysen
4. Testa delning på olika plattformar

## 📊 Förväntade Resultat

### Delningstexter per plattform:

**Facebook/LinkedIn:**
```
💡 AI-analys av min elräkning visar att jag betalar 2,400 kr/år i onödiga avgifter!

🔍 Testa själv på elchef.se/jamfor-elpriser

#Elbesparing #AI #Elchef
```

**Instagram:**
```
💡 AI-analys av min elräkning visar att jag betalar 2,400 kr/år i onödiga avgifter!

🔍 Testa själv på elchef.se/jamfor-elpriser

#Elbesparing #AI #Elchef #Energi
```

**Twitter:**
```
💡 AI-analys av min elräkning visar att jag betalar 2,400 kr/år i onödiga avgifter!

🔍 Testa själv: elchef.se/jamfor-elpriser

#Elbesparing #AI #Elchef
```

## 🎨 Anpassningsmöjligheter

### 1. **Anpassa delningstexter**
Redigera `generateShareText()` i `ShareResults.tsx` för att ändra texterna.

### 2. **Lägg till fler plattformar**
Lägg till nya plattformar i `handleShare()` funktionen.

### 3. **Förbättra delade kalkyler**
Uppdatera `delad-kalkyl/page.tsx` för att visa mer detaljerad information.

## 📈 Analytics och Spårning

### Spårade data:
- **Plattform** - Var delningen skedde
- **Besparingsbelopp** - Hur mycket användaren kan spara
- **Session ID** - Kopplar till ursprunglig analys
- **Timestamp** - När delningen skedde

### Supabase-tabeller:
- `share_clicks` - Spårar alla delningar
- `shared_calculations` - Lagrar delade kalkyler (framtida funktionalitet)

## 🔒 Säkerhet och Integritet

- **Anonyma delningar** - Inga personuppgifter sparas
- **Begränsad livslängd** - Delade kalkyler tas bort efter 30 dagar
- **RLS-policies** - Säker databasåtkomst
- **Ingen känslig data** - Endast besparingsbelopp och metadata

## 🚀 Framtida Förbättringar

### 1. **Visuella Grafiska**
- Generera automatiska grafer över kostnadsfördelning
- Skapa Instagram Stories-templates
- Visuella besparingsdiagram

### 2. **Avancerad Spårning**
- Spåra konvertering från delningar till nya användare
- A/B-testning av delningstexter
- ROI-analys för social delning

### 3. **Gamification**
- Poängsystem för delningar
- Badges för "besparingsambassadörer"
- Leaderboards för mest delade kalkyler

## 🎯 Marknadsföringsstrategi

### 1. **Viral Koefficient**
- Varje delning exponerar Elchef för nya användare
- Besparingsbelopp skapar FOMO (Fear of Missing Out)
- Social proof genom delade resultat

### 2. **Innehållsmarknadsföring**
- Delade kalkyler blir användargenererat innehåll
- Olika besparingsbelopp skapar variation
- Hashtags ökar synlighet

### 3. **Konverteringsoptimering**
- Delade kalkyler leder tillbaka till kalkylatorn
- "Testa själv"-CTA på varje delning
- Social proof ökar förtroende

## 📞 Support

För frågor eller problem med social delning, kontakta utvecklingsteamet eller skapa en issue i projektet.
