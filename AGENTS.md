# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Stromsjef.no is a Norwegian electricity comparison web app built with **Next.js 15 (App Router)**, **React 19**, **styled-components**, and **TypeScript**. It deploys to Cloudflare Pages. The database is hosted Supabase (PostgreSQL) — there is no local database setup.

### Key commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` |
| Build | `npm run build` |
| CF build | `npm run cf:build` |

### Important notes

- **No test framework** is configured — there are zero test files and no test runner. Lint (`npm run lint`) is the only automated check.
- **Supabase credentials are required** for API routes and data fetching. Without `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`, the app UI still renders but API calls return errors or empty data.
- **No `.env` file is committed** — create `.env.local` with Supabase and other API keys (see `README.md` for the full list of environment variables).
- **No git hooks or pre-commit checks** are configured.
- The `canvas` npm package (native addon) is a dependency; `npm install` may emit build warnings on some systems but the dev server starts fine without it fully building.
- Many API routes use `export const runtime = 'edge'` for Cloudflare Workers compatibility.
- Styled-components requires the Next.js server-side rendering registry configured in `src/app/layout.tsx`.
