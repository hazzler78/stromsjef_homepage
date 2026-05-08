# Stromsjef.no

Stromsjef.no er en norsk tjeneste for å sammenligne og bytte strømavtale – enkelt, trygt og kostnadsfritt. Finn strømavtaler som passer deg, og bytt direkte på nett.

## Funksjoner

- Sammenlign strømpriser med utgangspunkt i blant annet postnummer og forbruk
- Bytt strømavtale via tjenesten
- Veiledning, vanlige spørsmål og AI-assistent (Elge) om strømmarkedet
- Personvern- og cookie-støtte (blant annet Cookiebot)
- Responsiv layout med tydelig navigasjon
- Informasjonssider (om oss, bedrift, kontakt, vilkår, personvern m.m.)

## Installasjon og utvikling

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## Bygg og deploy

### Cloudflare Pages (Next.js on Pages)

For produksjon på Cloudflare Pages med `@cloudflare/next-on-pages`:

1) Installer avhengigheter

```bash
npm install
```

2) Bygg for Cloudflare

```bash
npm run cf:build
```

3) Lokal forhåndsvisning

```bash
npm run cf:preview
```

4) Deploy til Pages

```bash
npm run cf:deploy
```

Konfigurasjonen styres via `wrangler.toml` (angi `account_id`, prosjektnavn under `[pages]` og miljøvariabler under `[vars]`).

### Miljøvariabler

Sett følgende variabler i Cloudflare Pages-prosjektet (Production og Preview):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_IDS`
- `MAILERLITE_API_KEY`
- `MAILERLITE_GROUP_ID`
- `OPENAI_API_KEY`
- `XAI_API_KEY`
- `TIKTOK_ACCESS_TOKEN` – TikTok Events API access token (for server-side sporing)
- `TIKTOK_TEST_EVENT_CODE` – valgfri testkode for TikTok-events

### Cron-jobs

Tidligere Vercel-crons (`vercel.json`) er erstattet av Cloudflare Workers (se `functions/`) som planlegges via `triggers.crons` i `wrangler.toml`. De kan blant annet kalle:

- `/api/reminders/send`
- `/api/update-prices`

Sett `CRON_TARGET_BASE_URL` i Pages-miljøvariabler til den offentlige URL-en, for eksempel `https://www.stromsjef.no`.

## Preview-deploy

Denne registreringen finnes historisk for å trigge preview-deploy på en egen gren (se `preview-form` i repo-historikk).

## Tekniske valg

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [styled-components](https://styled-components.com/)
- TypeScript
- Hosting: Cloudflare Pages

## Kontakt

- E-post: [post@stromsjef.no](mailto:post@stromsjef.no)
- Nettside: [stromsjef.no](https://stromsjef.no)

---

_Denne README kan utvides med mer om API-er, Grok/XAI-chat, bidrag og lisens ved behov._
