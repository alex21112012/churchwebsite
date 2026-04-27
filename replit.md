# St. Archangel Michael Serbian Orthodox Church Website

## Overview

Full-stack pnpm workspace monorepo. Church website with bilingual (English/Serbian Cyrillic) content, admin panel, and Supabase-backed storage. Deploys free to Vercel (frontend + serverless API) + Supabase (database + image storage).

## Stack

- **Monorepo tool**: pnpm workspaces (Node.js 24)
- **Frontend**: React + Vite + Tailwind CSS (`artifacts/church-website`)
- **API (dev)**: Express 5 in `artifacts/api-server` — uses Supabase if env vars are set, falls back to JSON files
- **API (prod)**: Vercel serverless functions in `api/church/` — TypeScript, uses Supabase directly
- **Database**: Supabase (PostgreSQL) — tables: `church_events`, `church_organizations`, `church_news`, `church_schedule`, `church_history`
- **File storage**: Supabase Storage — public bucket `church-uploads`
- **Admin auth**: `x-admin-key` header matched against `ADMIN_PASSWORD` env var (default: `StMichael2024!`)
- **Fonts**: Cinzel (headings), Cormorant Garamond (body)
- **Palette**: Dark burgundy `#1a0a0a`, Gold `#c9a84c`

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `SUPABASE_URL` | Replit + Vercel | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Replit + Vercel | Supabase service role key (server-side only) |
| `ADMIN_PASSWORD` | Replit + Vercel | Admin panel password |
| `PORT` | Replit only | Dev server port (set automatically) |
| `BASE_PATH` | Replit only | URL base path (set automatically) |

## Key Files

- `SUPABASE_SETUP.sql` — Run this in Supabase SQL Editor to create all tables + seed data
- `vercel.json` — Vercel deployment config (build command, output directory, SPA routing)
- `api/church/` — Vercel serverless API functions (TypeScript)
- `api/church/_lib.ts` — Shared Supabase helpers, multipart parsing, type mappers
- `artifacts/api-server/src/routes/church.ts` — Express routes (dual-mode: Supabase when env vars set, JSON fallback)
- `artifacts/church-website/src/App.tsx` — Main frontend
- `artifacts/church-website/src/AdminPanel.tsx` — Admin panel (5 tabs)
- `artifacts/church-website/src/NewsSection.tsx` — Two-column news layout

## Database Schema (Supabase / PostgreSQL)

- `church_events` — id, title, title_sr, date, description, description_sr, image, created_at
- `church_organizations` — id, name, name_sr, description, description_sr, image, contact, created_at  
- `church_news` — id, title, title_sr, body, body_sr, date, image, pinned, created_at
- `church_schedule` — singleton (id=1), month_en, month_sr, services (jsonb)
- `church_history` — singleton (id=1), intro_en, intro_sr, images (jsonb), timeline (jsonb)

## Deployment: Vercel + Supabase (Zero Cost)

1. **Create Supabase project** at supabase.com (free tier)
2. **Run `SUPABASE_SETUP.sql`** in Supabase SQL Editor
3. **Create storage bucket** named `church-uploads` (public) in Supabase Storage
4. **Set Replit secrets**: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD
5. **Push to GitHub** — create repo, push all code
6. **Import to Vercel** — connect GitHub repo, set same env vars, deploy
7. **Add custom domain** — in Vercel dashboard, add `serbianorthodoxchurchslc.org`, update DNS at registrar

## Development

- `pnpm --filter @workspace/api-server run dev` — API server (Express, port 8080)
- `pnpm --filter @workspace/church-website run dev` — Frontend dev server (Vite)
- API falls back to local JSON files in `artifacts/api-server/data/` when Supabase env vars are absent

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `NODE_ENV=production BASE_PATH=/ pnpm --filter @workspace/church-website run build` — production build test
