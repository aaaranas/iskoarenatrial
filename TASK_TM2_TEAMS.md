# TM2 Task Brief — Admin Dashboard + Team Management CRUD

**Branch:** `feature/admin-teams`
**Owner:** TM2
**Status before sprint:** Teams CRUD is functional against Supabase, but two button handlers are referenced and never defined (runtime crashes), and the admin dashboard itself is fully hardcoded mock data.

---

## Working agreement

- Read [ISKOARENA_CLAUDE.md](ISKOARENA_CLAUDE.md) Sections 4–6 before any change.
- Do not touch the Media Page logic (TM5's domain).
- Do not modify [server/routers/auth.ts](server/routers/auth.ts) or [server/trpc.ts](server/trpc.ts) without flagging TM1.
- Coordinate with TM1 on the role enum fix — your `useIsAdmin()` hook has the same bug and will be removed when TM1 lands their change.
- Use the `DEBUG_REPORT` template in Section 6 at end of session. Save to `/reports/`.

---

## Scope

**In scope:** [app/dashboard/page.tsx](app/dashboard/page.tsx), [app/dashboard/teams/page.tsx](app/dashboard/teams/page.tsx), the teams-related tRPC router (or the direct Supabase calls in the page), CSV import / college merge handlers.

**Out of scope:** Match/result/standing logic (TM3), user-side TeamsPage rendering (TM4 owns the read-only view polish), media (TM5).

---

## Confirmed working (do not regress)

- Teams list reads from Supabase ([app/dashboard/teams/page.tsx:476](app/dashboard/teams/page.tsx) — `useEffect` loads from `teams` table).
- `handleAddCollege` ([app/dashboard/teams/page.tsx:503](app/dashboard/teams/page.tsx)) inserts via Supabase.
- `handleDeleteCollege` ([app/dashboard/teams/page.tsx:529](app/dashboard/teams/page.tsx)) deletes via Supabase.
- Add/Edit/Delete UI gated by admin check ([app/dashboard/teams/page.tsx:678,727](app/dashboard/teams/page.tsx)).
- CSV import modal UI is fully built ([app/dashboard/teams/page.tsx:298-463](app/dashboard/teams/page.tsx)) — only the handler is missing.

---

## Bugs to fix (priority order)

### 1. Two undefined handlers crash on click — CRITICAL

**File:** [app/dashboard/teams/page.tsx:613,621](app/dashboard/teams/page.tsx)
**Symptom:** Clicking the CSV Import button or the Merge College button throws `ReferenceError: handleImportCSV is not defined` (and `handleMergeCollege`). The whole page becomes unusable after the click.
**Root cause:** Both handlers are referenced in `onClick` props but never defined in the component. The CSV modal at lines 298–463 has all the UI it needs but no submit logic.
**Fix:**
- Implement `handleImportCSV(file: File)`:
  - Parse CSV (you can use a tiny inline parser since rows are simple — `name`, `org`, `shortName`, `primarySport`).
  - Validate each row with a Zod schema (mirror the shape used by `handleAddCollege`).
  - Bulk insert via `supabase.from("teams").insert([...])`.
  - On success, refresh the teams list and toast `"Imported N colleges"`. On error, toast the error message.
- Implement `handleMergeCollege(sourceOrg: string, targetOrg: string)`:
  - Update all `teams` rows where `org === sourceOrg` to `org = targetOrg`.
  - Delete the now-empty source college row (if your schema has a separate colleges table — confirm before touching).
  - Toast result.
**Acceptance:**
- CSV import: drop a 3-row CSV → 3 new colleges appear without page reload.
- Merge: select two colleges → all teams from source now grouped under target → source no longer in the list.
- No console errors.

### 2. Admin Dashboard is fully hardcoded — HIGH

**File:** [app/dashboard/page.tsx:13-17](app/dashboard/page.tsx)
**Symptom:** The dashboard shows three static dummy match cards. Counts, summaries, and recent activity are not real.
**Root cause:** The page hardcodes `defaultMatches` and never calls tRPC.
**Fix:**
- Replace the static array with `trpc.match.getAll.useQuery()` for "today's matches" + "upcoming".
- Add summary cards using `trpc.stats.getLeaderboard` and a count from the `teams` table (either via a new `team.getAll` procedure if it doesn't exist, or `supabase.from("teams").select("*", { count: "exact", head: true })`).
- Reuse [components/dashboard/StatCard.tsx](components/dashboard/StatCard.tsx) for the count cards and [components/dashboard/RecentMatchesTable.tsx](components/dashboard/RecentMatchesTable.tsx) for recent matches if it fits.
- Coordinate with TM4 — the user-side dashboard layout will branch on `isAdmin`, so keep the admin dashboard logic exportable as a sub-component.
**Acceptance:**
- Open `/dashboard` as admin → counts reflect actual DB rows; matches list is live.
- Refresh changes nothing (data is server-truth).

### 3. `useIsAdmin` enum mismatch (coordinate with TM1) — MEDIUM

**File:** [components/pages/TeamsPage.tsx:11-24](components/pages/TeamsPage.tsx)
**Symptom:** Real admins see no admin buttons in TeamsPage (same root cause TM1 is fixing in role-provider).
**Root cause:** Local `useIsAdmin()` hook compares `profile?.role === "admin"`, but DB stores `"college_admin"`.
**Fix (after TM1 lands their PR):** Delete the local hook entirely. Replace `useIsAdmin()` calls with `useRole().isAdmin` from [components/providers/role-provider.tsx](components/providers/role-provider.tsx).
**Acceptance:** Admin user sees Add/Edit/Delete on TeamsPage.

---

## Open questions for the team lead

1. Should the admin dashboard summary include media counts (TM5's domain)?
2. What does "merge college" mean exactly — combine two `org` codes into one, or move all teams under a single college display name? Confirm before implementing #1's merge handler.
3. Is there a separate `colleges` table or does `teams.org` carry the college identity?

---

## Verification checklist before merge

- [ ] CSV import + college merge both work end-to-end without console errors
- [ ] `/dashboard` shows live data for an admin user
- [ ] No regression on Media Page
- [ ] No regression on Matches page (TM3's domain) — open it, list still loads
- [ ] Supabase RLS verified — admin can insert/delete teams; non-admin cannot
- [ ] `DEBUG_REPORT_TEAMS_<DATE>.md` filed in `/reports`
