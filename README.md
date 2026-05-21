# IskoArena — Live Intramural Sports Platform

<div align="center">

**A broadcast-quality, real-time intramural sports tracking platform built for UP Cebu's IskoLaro 2026.**

[![Next.js](https://img.shields.io/badge/Next.js_16-App_Router-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_Realtime-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![tRPC](https://img.shields.io/badge/tRPC_11-type--safe_API-398CCB)](https://trpc.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3-dark?logo=tailwindcss)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://vercel.com)

[**Live Demo →**](https://iskoarena-upc.vercel.app) · [GitHub](https://github.com/irregulars2027/iskoarena)

</div>

---

## Overview

IskoArena is a full-stack sports management and spectator platform built for the **UP Cebu IskoLaro 2026** intramural tournament — a 5-day competition across 24 sports involving 4 colleges and 230+ registered student-athletes.

The platform serves two audiences in parallel:

| Role | What they see |
|---|---|
| **Public visitors** | Landing page with live scores, standings, college rivalry, player spotlight, and media gallery |
| **Admins** | Broadcast-quality dashboard — live match management, score updates, player rosters, media uploads, featured-player curation, leaderboard |

The design language is intentionally **broadcast-studio dark** — Bebas Neue headlines, JetBrains Mono data labels, cinematic sport photos, and a deep `#050505` background — to give a sports-television aesthetic that stands apart from typical admin dashboards.

---

## Live Demo

**URL:** [iskoarena-upc.vercel.app](https://iskoarena-upc.vercel.app)

**Test credentials (read-only):**
> Sign up with any email to get a standard viewer account. Admin features (score entry, roster management, etc.) require a role promotion from an existing admin.

---

## Feature Highlights

### 🏟️ Broadcast Dashboard
- **Cinematic hero** — featured live match with full-bleed sport photography, animated score bug, and realtime status indicator
- **BottomLine ticker** — today's and tomorrow's matches as a scrolling broadcast-style feed
- **Standings widget** — tabbed W/L table (Basketball Men/Women, Volleyball Men/Women) computed live from completed match results
- **Top Performer card** — admin-curated weekly athlete spotlight (name, photo, free-form stats)

### ⚽ Match Management
- Create, edit, and finalize matches with scores
- **Match category system** — 7-value enum (`Men`, `Women`, `Men Singles`, `Men Doubles`, `Women Singles`, `Women Doubles`, `Mixed Doubles`) auto-filtered per sport type
- Sport-specific photography — each match card shows a deterministic real photo from its sport folder (basketball matches → basketball photos, volleyball → volleyball, etc.)
- Admin-only match notes per game
- Real-time notifications via Supabase Realtime

### 🏆 Leaderboards (V1 "Competitive Arena")
- Cinematic podium layout with 1st/2nd/3rd tier blocks and medal badges
- **Points model:** 20 / 15 / 10 / 5 per placement, aggregated across every sport+category event
- Game-by-game standings derived from completed match results — no manual data entry
- Horizontal draggable match-card carousel (Embla) — all sports, not just Basketball/Volleyball
- Four insight cards (Top Margin, Most Golds, Sweep Watch, Biggest Upset) computed from live data

### 👥 Teams & Players
- College directory with editorial card design per college
- Per-sport player rosters with photo upload to Supabase Storage
- Player profile page — editable name/position/jersey/photo, team-level match history
- Player directory (`/dashboard/players`) with real-time search + filter by college/sport

### 📸 Media Gallery
- Photo and video upload (Supabase Storage)
- Like/comment system with Realtime sync
- Album collections and highlight reels
- Media items surface as "news" cards on the public landing page

### 🌐 Public Landing Page
- **Matches Today** — real-time carousel of today's live + upcoming games
- **Standings section** — live W/L table wired to the same `match.getStandings` backend
- **College Rivalry** — animated progress bars showing cumulative season points per college (same model as leaderboard)
- **Spotlight** — the admin-curated Top Performer surfaced publicly
- **Sports grid** — 24-sport catalog with LIVE/TODAY badges derived from today's match data
- **News** — latest image uploads from the media page

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server components, streaming, image optimization, Turbopack dev server |
| **Language** | TypeScript 5 | End-to-end type safety from DB schema → API → UI |
| **Styling** | Tailwind CSS 3 + shadcn/ui + Radix UI | Design tokens for a consistent broadcast aesthetic; accessible primitives |
| **API layer** | tRPC 11 + React Query 5 | Type-safe RPC without a REST contract; automatic cache invalidation and optimistic updates |
| **Auth + DB** | Supabase (Postgres + Auth + Realtime + Storage) | Row-Level Security, real-time subscriptions, managed auth, S3-compatible storage — all in one platform |
| **Deployment** | Vercel | Auto-deploy from `main`, preview URLs per PR, CDN-served static assets |
| **CI** | GitHub Actions | Build + lint check on every push and PR |
| **Fonts** | Bebas Neue, JetBrains Mono, DM Sans | Broadcast-inspired typography hierarchy |
| **Animations** | Framer Motion + Embla Carousel | Entrance animations, draggable match-card carousels |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Vercel Edge (CDN)                   │
│         Static assets · Image optimization           │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│                Next.js 16 (App Router)               │
│                                                      │
│  app/                                                │
│  ├── page.tsx               ← Public landing page    │
│  └── dashboard/             ← Authenticated shell    │
│      ├── page.tsx           ← Broadcast dashboard    │
│      ├── matches/           ← Match management       │
│      ├── leaderboards/      ← Competitive standings  │
│      ├── media/             ← Photo/video gallery    │
│      ├── teams/             ← College rosters        │
│      └── players/           ← Player directory       │
│                                                      │
│  server/routers/            ← tRPC procedures        │
│  ├── match.ts               ← CRUD + standings       │
│  ├── players.ts             ← Roster management      │
│  ├── featuredPlayer.ts      ← Top Performer          │
│  ├── media.ts               ← Upload / gallery       │
│  └── auth.ts / profile.ts   ← Auth + user data       │
└───────────────────┬─────────────────────────────────┘
                    │ supabaseAdmin (service role)
┌───────────────────▼─────────────────────────────────┐
│                     Supabase                         │
│                                                      │
│  Postgres DB   ← matches, players, teams, sports,   │
│                   venues, media, featured_players    │
│  Auth          ← JWT sessions, admin_role enum       │
│  Realtime      ← Live match score subscriptions      │
│  Storage       ← avatars/ bucket, media/ bucket      │
└─────────────────────────────────────────────────────┘
```

### Key design decisions

**tRPC over REST** — Every API call is fully typed end-to-end. Changing a field on a DB schema propagates as a TypeScript error immediately to every UI component that reads it, not discovered at runtime.

**Client-side date formatting** — Date strings are never formatted server-side. The server ships only raw ISO strings (`rawDate`); the browser's locale drives display. This prevents timezone leaks where a Vercel edge function's locale produces `5/20/2026` for one user and `20/05/2026` for another.

**Deterministic sport photos** — `pickSportPhoto(sport, matchId)` hashes the match UUID to select a stable photo from the sport's folder. The same match always renders the same photo across refreshes and devices without any DB column.

**RLS + two-role model** — Supabase Row-Level Security enforces a strict `admin | user` model at the database layer. No client-side permission checks are trusted alone; the DB rejects unauthorized mutations even if UI guards are bypassed.

---

## Database Schema (key tables)

```sql
-- Core match record
matches (
  id UUID PK,
  sport_id UUID → sports(id),
  home_team_id UUID → teams(id),
  away_team_id UUID → teams(id),
  venue_id UUID → venues(id),
  match_date TIMESTAMPTZ,
  status TEXT,          -- upcoming | live | completed
  home_score INT,
  away_score INT,
  category match_category,  -- Men | Women | Men Singles | ... | Mixed Doubles
  notes TEXT
)

-- Player roster
players (
  id UUID PK,
  college_id UUID → teams(id),   -- teams ≡ colleges 1:1
  sport_id UUID → sports(id),
  name TEXT,
  jersey_number INT,
  position TEXT,
  photo_url TEXT
)

-- Admin-curated Top Performer (append-only; latest row wins)
featured_players (
  id UUID PK,
  player_id UUID → players(id),
  label TEXT,
  stat_1_label TEXT, stat_1_value NUMERIC,
  stat_2_label TEXT, stat_2_value NUMERIC,
  stat_3_label TEXT, stat_3_value NUMERIC,
  stat_4_label TEXT, stat_4_value NUMERIC,
  created_at TIMESTAMPTZ,
  created_by UUID → auth.users(id)
)
```

---

## Notable Technical Challenges

### 1. Real-time standings without a dedicated stats table
The `match.getStandings` procedure aggregates W/L records directly from completed matches in the `matches` table — grouping by `teams.org` (college code) across a given sport+category. No separate stats table or materialized view is needed. Ranks are sorted by win-percentage descending with a wins tiebreaker, and GB is computed via the standard `((W_leader - W_team) + (L_team - L_leader)) / 2` formula — all in a single Supabase query that stays fast due to indexed columns.

### 2. Match category dimension
Intramurals have both gendered divisions (Basketball Men vs Women) and format variants (Badminton Men Singles vs Mixed Doubles). A single `match_category` Postgres enum (7 values) + a `CATEGORIES_BY_SPORT` map in `lib/constants.ts` gives the admin form dynamic, sport-aware dropdowns without any extra DB queries. Sports that are inherently mixed (Frisbee, Chess, Esports) leave `category = NULL` and the form hides the dropdown entirely.

### 3. Players linked to colleges, not sub-teams
`players.team_id` is vestigial in the schema (always NULL). All 230 players use `college_id` which holds the same UUID as `teams.id` — because at UP Cebu intramurals, teams **are** colleges (4 colleges, 1 team each). The MVP/Lineup filter in match details uses `p.college_id === match.homeTeamId` for correct roster lookups.

### 4. Sport photo system
102 real action photos across 15 sport folders in `public/sport/`. A central `lib/sport-photos.ts` helper maps every DB sport name to its photo array and provides `pickSportPhoto(sport, matchId)` — a djb2 hash of the match UUID mod array length. Same match = same photo across every browser and deployment, with variety across matches in the same sport. No DB column required; Vercel CDN serves everything.

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project ([create one free](https://supabase.com))

### 1. Clone and install

```bash
git clone https://github.com/irregulars2027/iskoarena.git
cd iskoarena
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **Getting these values:** Supabase dashboard → Project Settings → API

### 3. Set up the database

Run these SQL blocks in the Supabase SQL Editor in order:

```sql
-- 1. Enable Realtime on matches
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER TABLE matches REPLICA IDENTITY FULL;

-- 2. Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

-- 3. Match category enum
CREATE TYPE match_category AS ENUM (
  'Men', 'Women',
  'Men Singles', 'Men Doubles',
  'Women Singles', 'Women Doubles',
  'Mixed Doubles'
);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS category match_category;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Featured players table
CREATE TABLE featured_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'TOP PERFORMER',
  stat_1_label TEXT, stat_1_value NUMERIC,
  stat_2_label TEXT, stat_2_value NUMERIC,
  stat_3_label TEXT, stat_3_value NUMERIC,
  stat_4_label TEXT, stat_4_value NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 5. Player photo storage policy
CREATE POLICY "Authenticated users can upload player photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND name LIKE 'players/%');

CREATE POLICY "Authenticated users can update player photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND name LIKE 'players/%')
WITH CHECK (bucket_id = 'avatars' AND name LIKE 'players/%');
```

> The core tables (matches, teams, sports, venues, players, profiles, media) are assumed to already exist. Reach out to the team for the full seed migration.

### 4. Run the development server

```bash
npm run dev
# → http://localhost:3000
```

### 5. Promote yourself to admin

After signing up, run this in the Supabase SQL Editor:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key — **server-side only**, never expose client-side |

---

## CI/CD Pipeline

```
Push to main / Open PR
        │
        ▼
  GitHub Actions
  ├── npm ci (install)
  ├── npm run lint (ESLint)
  └── npm run build (Next.js compile check)
        │
        ▼ (on push to main only)
  Vercel Auto-Deploy
  └── Production → iskoarena-upc.vercel.app
```

Every PR gets a Vercel **preview URL** for isolated review before merging to `main`.

---

## Project Structure

```
iskoarena/
├── app/                      # Next.js App Router pages
│   ├── dashboard/            # All authenticated pages
│   └── page.tsx              # Public landing page
├── components/
│   ├── dashboard/            # Dashboard-specific atoms & widgets
│   ├── layout/               # Sidebar, TopBar
│   └── ui/                   # shadcn/ui primitives
├── features/
│   ├── auth/                 # Login & signup modals
│   ├── landing/              # All landing page sections
│   ├── leaderboards/         # V1 Competitive Arena page
│   ├── matches/              # Match cards, modals, details
│   ├── media/                # Media gallery page
│   ├── profile/              # User profile page
│   └── teams/                # College cards, rosters, player profiles
├── lib/
│   ├── constants.ts          # CATEGORIES_BY_SPORT, COLLEGE_ORGS
│   ├── format-match-date.ts  # Client-side locale-aware date helpers
│   ├── sport-photos.ts       # Deterministic sport photo selector
│   └── supabase/             # Client, server, and admin Supabase instances
├── providers/                # RoleProvider, TRPCProvider, NotificationProvider
├── public/
│   ├── colleges/             # College logo images
│   └── sport/                # 102 action photos across 15 sport folders
├── server/routers/           # tRPC router definitions
└── types/                    # Shared TypeScript interfaces
```

---

## Team

Built by a 5-person student team from UP Cebu for IskoLaro 2026.

| Name | Role |
|---|---|
| **Dominique Himaya** | Team Lead |
| **Francis Betonio** | Full Stack Developer |
| **Andre Milan** | Full Stack Developer |
| **Jonel Dinopol** | Full Stack Developer |
| **Rex Escarro** | Full Stack Developer |

---

## License

This project was built for **UP Cebu IskoLaro 2026** and is not licensed for redistribution. All sport photography is original content from the tournament.

---

<div align="center">
  <sub>Built with ❤️ for UP Cebu's student-athletes · IskoLaro 2026</sub>
</div>
