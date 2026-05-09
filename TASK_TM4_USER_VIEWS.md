# TM4 Task Brief — User Dashboard + Schedule/Results/Teams Views

**Branch:** `feature/user-views`
**Owner:** TM4
**Status before sprint:** Non-admin users currently see the same hardcoded dashboard as admins; one component (`ResultsPage`) is built but never rendered; landing page still uses static mock data; teams view works but lacks polish.

---

## Working agreement

- Read [ISKOARENA_CLAUDE.md](ISKOARENA_CLAUDE.md) Sections 4–6 before any change.
- Do not touch the Media Page logic (TM5's domain).
- Coordinate with TM2 on `app/dashboard/page.tsx` — TM2 owns the admin half; you own the user half. Plan to refactor it into one component that branches on `isAdmin`.
- Coordinate with TM3 on `ResultsPage` — decide together whether to delete it or wire it as their admin result-entry surface.
- After TM1 fixes the role enum, replace any local admin checks with `useRole()`.
- Use the `DEBUG_REPORT` template in Section 6 at end of session. Save to `/reports/`.

---

## Scope

**In scope:** [app/dashboard/page.tsx](app/dashboard/page.tsx), [components/pages/MatchesPage.tsx](components/pages/MatchesPage.tsx), [components/pages/ResultsPage.tsx](components/pages/ResultsPage.tsx), [components/pages/TeamsPage.tsx](components/pages/TeamsPage.tsx) (read-only polish only), [components/landing/](components/landing/) (StandingsSection, MatchesTodaySection, NewsSection, SpotlightSection), [components/landing/_data.ts](components/landing/_data.ts).

**Out of scope:** Auth flow (TM1), Team CRUD on TeamsPage (TM2 owns that), match logic and standings procedure (TM3 — you'll consume their `trpc.stats.getStandings` once it lands), media (TM5). Players verification page belongs to admin tooling, not your user-view scope.

---

## Confirmed working (do not regress)

- Teams read view against Supabase ([components/pages/TeamsPage.tsx:390-401](components/pages/TeamsPage.tsx)).
- MatchesPage uses `trpc.match.getAll` ([components/pages/MatchesPage.tsx:9](components/pages/MatchesPage.tsx)).
- Role provider ([components/providers/role-provider.tsx](components/providers/role-provider.tsx)) — once TM1 fixes the enum, you can rely on `useRole().isAdmin`.

---

## Bugs to fix (priority order)

### 1. No personalized user dashboard — HIGH

**File:** [app/dashboard/page.tsx](app/dashboard/page.tsx)
**Symptom:** Admin and user see identical hardcoded match cards. No personalization.
**Root cause:** The page never reads `useRole()` and never branches on `isAdmin`.
**Fix:**
- Wrap the page in `useRole()`. Branch:
  - **Admin:** delegate to TM2's admin dashboard component.
  - **User:** show today's matches (`trpc.match.getAll` filtered by today's date), the user's college standing (`trpc.stats.getStandings` once TM3 ships it), and latest 3 highlights (`trpc.highlight.getAll`, top 3).
- Reuse [components/dashboard/StatCard.tsx](components/dashboard/StatCard.tsx) for the standing card.
- The user's college: read `profile.college` (or whichever field stores it — confirm with TM1) from `trpc.auth.getSession`.
**Acceptance:**
- Admin user lands on `/dashboard` → sees the admin summary (TM2's content).
- Non-admin user lands on `/dashboard` → sees their personalized view, no admin buttons.

### 2. `ResultsPage` is orphaned — HIGH (decision)

**File:** [components/pages/ResultsPage.tsx:11-178](components/pages/ResultsPage.tsx)
**Symptom:** Component exists but is never rendered anywhere in the app — fully dead code.
**Root cause:** The component was scaffolded but never routed.
**Fix (decide with TM3):**
- **Option A:** Delete the file. (Likely correct — TM3's `FinalizeMatchModal` already covers result entry once TM3 lands their `match.finalize` mutation.)
- **Option B:** Route it at `/dashboard/results` as a fuller admin result-entry surface, gated by `isAdmin`. Wire its `onRecordResult` to `trpc.match.finalize`.
**Acceptance:**
- Either: the file no longer exists and `npm run build` still passes; OR the component renders at `/dashboard/results` and successfully records a result for an admin user.

### 3. Landing sections use mock data — MEDIUM

**File:** [components/landing/_data.ts](components/landing/_data.ts) lines 103–220 (`LIVE_MATCHES`, `STANDINGS`, `PLAYER`, `NEWS`); [components/landing/StandingsSection.tsx:7](components/landing/StandingsSection.tsx) has a TODO for live data.
**Symptom:** Public landing page shows the same hand-written matches and standings every visit, regardless of real data.
**Root cause:** Sections were built against `_data.ts` exports for the design phase and never wired to live queries.
**Fix:**
- [components/landing/MatchesTodaySection.tsx](components/landing/MatchesTodaySection.tsx) → consume `trpc.match.getAll` filtered by today; fall back to "no matches today" copy.
- [components/landing/StandingsSection.tsx](components/landing/StandingsSection.tsx) → consume `trpc.stats.getStandings` once TM3 ships it. Until then, leave the TODO.
- Keep `NewsSection` and `SpotlightSection` on mock data — there's no backend table for those, and they're out of MVP scope per [ISKOARENA_CLAUDE.md](ISKOARENA_CLAUDE.md) Section 5.4.
**Acceptance:**
- Public landing → "Today's matches" reflects whatever admins scheduled; standings reflect completed matches.

### 4. Teams page polish — LOW

**File:** [components/pages/TeamsPage.tsx](components/pages/TeamsPage.tsx)
**Symptom:** First load shows nothing for a beat (no skeleton); no "no teams yet" empty state; no error toast on Supabase failure.
**Root cause:** Loading and empty states never implemented.
**Fix:**
- Show [components/ui/skeleton.tsx](components/ui/skeleton.tsx) cards while teams are loading.
- Show an empty-state card when `teams.length === 0` after load.
- Wrap Supabase calls in try/catch and surface failures via `sonner` `toast.error`.
- **Do not touch admin button logic** — that belongs to TM2.
**Acceptance:**
- Throttle network in DevTools → see skeletons.
- Drop the `teams` table to empty (or simulate) → see empty state.
- Disconnect → see toast.

### 5. Players page is admin-only (note, not a fix) — INFO

**File:** [app/dashboard/players/page.tsx:18-24](app/dashboard/players/page.tsx)
**Symptom:** Page uses inline `MOCK_PLAYERS` and is an admin verification tool, not a public roster.
**Action:** No action from you — flag to team lead. If a public roster is wanted, propose adding it inside [components/pages/TeamsPage.tsx](components/pages/TeamsPage.tsx) (drill into a college → see roster), not at `/dashboard/players`.

---

## Open questions for the team lead

1. Should non-admins see `/dashboard/players` at all, or redirect to `/dashboard/teams`?
2. Is the News/Spotlight content meant to ever come from Supabase, or is mock-forever acceptable for MVP?
3. Where does the user's "college" come from on `profiles` — confirm field name with TM1 before bug #1 implementation.

---

## Verification checklist before merge

- [ ] All 4 bugs (above; #5 is info-only) resolved
- [ ] No regression on Media Page
- [ ] No regression on admin Teams CRUD (TM2's domain)
- [ ] Public landing renders without errors when DB is empty
- [ ] Supabase RLS verified — non-admin can read teams/matches/standings
- [ ] `DEBUG_REPORT_USER_VIEWS_<DATE>.md` filed in `/reports`
