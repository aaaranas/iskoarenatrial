# IskoArena — Bug & Issue Audit (v1.0)

> **Purpose:** Pre-fix audit so the team can attack bugs in priority order after teammate PRs land.
> **Created:** 2026-04-26 (after the landing-page rebuild on `jira/doms`)
> **Scope:** Full stack — auth, DB, backend (tRPC routers), frontend dashboard, code hygiene.
> **Rule:** Nothing in this document has been fixed yet. Each item lists a possible solution. Items marked **NEEDS HUMAN INTERVENTION** require decisions, access, or domain knowledge a code change alone cannot supply.

---

## Severity Legend

- **🔴 CRITICAL** — Security hole, data loss risk, or core feature is fundamentally broken.
- **🟠 HIGH** — Visible bug to users/admins, broken feature, or wrong data.
- **🟡 MEDIUM** — Bad UX, brittle behavior, or hidden inconsistency that will bite later.
- **🟢 LOW** — Cleanup, code hygiene, dead code, naming.

---

## 🔴 CRITICAL — Auth & Security

### 1. tRPC server context is never created → admin auth is fully broken

**Where:** [app/api/trpc/[trpc]/route.ts:9](app/api/trpc/[trpc]/route.ts#L9)

```ts
createContext: () => ({}),  // empty object — the real createContext is ignored
```

But [server/trpc/context.ts](server/trpc/context.ts) defines the proper `createContext` that wires up a server-side Supabase client with cookies. It's just never called.

**Why this matters:**
- Every router imports the **browser** Supabase client from [lib/supabase/client.ts](lib/supabase/client.ts) and uses it server-side.
- The browser client has no access to request cookies → `supabase.auth.getUser()` always returns `null` on the server.
- `adminProcedure` in [server/trpc.ts:13](server/trpc.ts#L13) does `if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' })` — so **every admin mutation should fail**.
- `auth.getSession` query in [server/routers/auth.ts](server/routers/auth.ts) always returns `null` → the dashboard layout never sees the logged-in admin's profile.

**How the app appears to work anyway:** Direct Supabase calls from the browser (e.g. `(supabase as any).from("teams").insert(...)` in [components/pages/TeamsPage.tsx:179](components/pages/TeamsPage.tsx#L179)) bypass tRPC entirely. They work because the browser Supabase client *does* have the auth session in localStorage/cookies. So admin features that go through tRPC are silently broken; features that bypass tRPC silently succeed but skip the role check.

**Possible solution:**
1. Wire `createContext` properly in the route handler:
   ```ts
   const handler = (req: Request) =>
     fetchRequestHandler({
       endpoint: '/api/trpc',
       req,
       router: appRouter,
       createContext: () => createContext({ req } as any),  // pass the real context
     });
   ```
   Note: the existing `createContext` uses `CreateNextContextOptions` (Pages Router) but the route handler is App Router (`fetchRequestHandler`). The signature needs to be adapted to read cookies from `req.headers.get('cookie')` via `@supabase/ssr`'s `createServerClient`.
2. Update `server/trpc.ts` `adminProcedure` to read `user` from `ctx` instead of calling `supabase.auth.getUser()` directly.
3. Update each router to pull supabase from `ctx.supabase` instead of importing the browser client.

**NEEDS HUMAN INTERVENTION:** Verify intended auth flow with the team — currently it's unclear whether direct-Supabase-from-browser was the intentional pattern or just a workaround for the broken tRPC auth.

---

### 2. Middleware protects the wrong route (`/compendium` instead of `/dashboard`)

**Where:** [middleware.ts:61](middleware.ts#L61)

```ts
if (!user && request.nextUrl.pathname.startsWith('/compendium')) {
  return NextResponse.redirect(new URL('/', request.url))
}
```

But the actual admin area is `/dashboard` (see [app/dashboard/layout.tsx](app/dashboard/layout.tsx)). The middleware does **nothing** for `/dashboard` requests, meaning **anyone with the URL can hit the admin pages without logging in**.

The login redirect in [components/pages/LandingPage.tsx:48](components/pages/LandingPage.tsx#L48) sends users to `/dashboard` — so the project's actual route is `/dashboard`, not `/compendium`.

**Possible solution:** Update the middleware route check:

```ts
if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  return NextResponse.redirect(new URL('/', request.url))
}
```

Also update line 69 — the post-login redirect to `/compendium` should be `/dashboard` too.

**Severity rationale:** This combined with #1 means the entire admin area has zero auth enforcement at the network layer. The only thing keeping data safe is RLS (see #4).

---

### 3. `SUPABASE_SERVICE_ROLE_KEY` is exposed via a client-importable file

**Where:** [lib/supabase/server.ts](lib/supabase/server.ts)

```ts
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

The variable name is correctly **not** prefixed with `NEXT_PUBLIC_`, so Next.js will only inline it on server builds. But `lib/supabase/server.ts` has no `"server-only"` guard — if any client component imports `supabaseAdmin` (even transitively, even by accident), the build will either fail at runtime (env undefined) or — depending on Next.js version behavior — bundle the key into the client.

The service role key bypasses RLS. Leaking it = full database compromise.

**Currently no imports found** (`grep -r "supabaseAdmin"` returned nothing), but the file is a footgun for future devs.

**Possible solution:**
1. Add `import "server-only";` at the top of `lib/supabase/server.ts`. Next.js will throw a build error if any client component imports it.
2. Confirm no Vercel/hosting environment has the key prefixed with `NEXT_PUBLIC_` by accident.

**NEEDS HUMAN INTERVENTION:** Verify `.env.local` and any deployment environment do not have `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` (a common typo). If they do, **rotate the key immediately** in Supabase dashboard → Settings → API.

---

### 4. RLS policies are unverified

**Where:** Supabase database (no SQL files in repo for RLS)

The seed file [iskoarena_seed.sql](iskoarena_seed.sql) (pasted via dashboard SQL editor) creates rows but does not show any RLS policies. The public tRPC procedures (`match.getAll`, `teams.getAll`, `players.getAll`, `sport.getAll`, `stats.getLeaderboard`) all use the anon Supabase client — meaning their behavior depends entirely on:

- **If RLS is OFF on these tables:** anyone with the anon key can SELECT, INSERT, UPDATE, DELETE freely. The anon key is in `NEXT_PUBLIC_SUPABASE_ANON_KEY` and shipped to every browser. **Anyone visiting the site can run arbitrary writes against the DB.**
- **If RLS is ON but no SELECT policy exists:** queries return empty arrays silently. Public landing sections (Schedules, Colleges) would show "No matches yet" even if data exists.
- **If RLS is ON with proper policies:** secure, but needs to be verified.

**Possible solution:**
1. In Supabase dashboard → Authentication → Policies, audit each table. Confirm:
   - `matches`, `teams`, `sports`, `venues`, `players`, `media`, `stats` have **SELECT** policy `true` (anyone can read).
   - These tables have **NO** anon INSERT/UPDATE/DELETE policies.
   - Admin mutations work via `auth.uid()` checks against the `profiles.role` field.
2. `players` table needs special attention — see #11.
3. `profiles` table must restrict reads to `auth.uid() = id` so users can't enumerate other admins.

**NEEDS HUMAN INTERVENTION:** Audit must be done in Supabase dashboard. Recommend pasting the output of:
```sql
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

### 5. Dashboard layout has no auth gate at the React layer either

**Where:** [app/dashboard/layout.tsx](app/dashboard/layout.tsx)

```ts
const { data: auth, isLoading } = trpc.auth.getSession.useQuery();
// ... no `if (!auth) redirect(...)`
return <div>...{auth?.profile?.full_name || "Operator"}...</div>;
```

Even after fixing #1 and #2, the layout itself doesn't redirect unauthenticated users. It just shows "Operator" as the admin name and renders normally. So if middleware ever fails or is bypassed, the React layer offers no defense in depth.

**Possible solution:**
```ts
useEffect(() => {
  if (!isLoading && !auth?.user) router.push("/");
}, [isLoading, auth]);
```

Or use Next.js server components and check the session server-side.

---

## 🔴 CRITICAL — Database & Backend

### 6. `types/supabase.ts` has unresolved git merge conflict markers

**Where:** [types/supabase.ts:1-2, 507](types/supabase.ts)

```
<<<<<<< HEAD
=======
export type Json = ...
>>>>>>> (somewhere around line 507)
```

This causes **3 TypeScript errors on every typecheck run** (`tsc --noEmit` reports them). It's pre-existing — happened during a prior merge that was committed in a broken state.

**Possible solution:** Resolve manually by deleting the conflict markers. Both sides should be the supabase-generated types. Re-running `supabase gen types typescript --project-id <id> > types/supabase.ts` would regenerate cleanly.

**NEEDS HUMAN INTERVENTION:** Need to know whether the HEAD version had different content from the merged-in version (likely identical generated types — just delete the markers and keep one copy).

---

### 7. `stats.getLeaderboard` queries non-existent columns on `players`

**Where:** [server/routers/stats.ts:17-18](server/routers/stats.ts#L17)

```ts
.select(`
  *,
  player:players(id, name, college, photo),  // ← players has no `college` or `photo` column
  team:teams(id, name, org, logo_url),
  sport:sports(name)
`)
```

Per the seed file [iskoarena_seed.sql](iskoarena_seed.sql), the `players` table has columns: `id, team_id, name, jersey_number, position, photo_url, is_active, created_at`. There is **no `college` column** and **no `photo` column** (it's `photo_url`).

The college affiliation lives on the team via `teams.org`, joined through `players.team_id`.

**Possible solution:** Rewrite the join:
```ts
player:players(id, name, photo_url, team:teams(college, org)),
```

And update consumers to read college via `player.team.college` or `player.team.org`.

**Symptom:** The leaderboard page either shows null/empty data for players, or Postgres throws errors that surface as TRPC errors in the console.

---

### 8. tRPC procedure name mismatches → Edit and Finalize match are completely broken

**Where:**
- [components/matches/EditMatchModal.tsx:19](components/matches/EditMatchModal.tsx#L19): `trpc.match.update.useMutation` — but the router defines `updateMatch`, not `update`.
- [components/matches/FinalizeMatchModal.tsx:10](components/matches/FinalizeMatchModal.tsx#L10): `trpc.match.finalize.useMutation` — but the router defines `updateScore`, not `finalize`.

The router only exposes: `getAll, addMatch, updateMatch, deleteMatch, updateScore` (see [server/routers/match.ts](server/routers/match.ts)).

**Symptom:** Clicking the edit pencil or finalize button on any match card crashes the app at runtime with `TypeError: Cannot read property 'useMutation' of undefined` (or similar tRPC type error).

**Possible solution:** Either rename the router procedures (`update`/`finalize`) or rename the modal calls (`updateMatch`/`updateScore`). Cleaner names belong on the router side:
```ts
// In match.ts
update: adminProcedure...  // was updateMatch
finalize: adminProcedure...  // was updateScore
```

Plus update `AddMatchModal` (currently uses `addMatch` — fine, but rename for consistency to `add` or `create`).

Also note: `EditMatchModal.handleSave` passes `homeScore`, `awayScore`, `statusType`, `venue` — but the router's `updateMatch` only accepts `home_score`, `away_score`, `status`, `match_date`. The field names don't match either. Even after fixing the procedure name, the inputs will fail Zod validation.

---

### 9. `AddMatchModal` uses hardcoded fake IDs that don't exist in the database

**Where:** [components/matches/AddMatchModal.tsx:30-42](components/matches/AddMatchModal.tsx#L30)

```ts
const TEAMS = [
  { id: "team_1", name: "CCAD Phoenix" },
  // ...
];
const VENUES = [
  { id: "venue_1", name: "UP High School Gymnasium" },
  // ...
];
const SPORTS = ["Badminton", "Basketball", ...]; // strings, not IDs
```

But the real DB uses UUIDs (e.g. `'00000000-0000-0000-0000-000000000001'` for Basketball, `'10000000-0000-0000-0000-000000000001'` for Admin Court). So submitting the form sends `sport_id: "Badminton"`, `home_team_id: "team_1"`, `venue_id: "venue_1"` — none of which exist as foreign keys.

**Symptom:** Even if tRPC auth is fixed (#1), every "Add Match" attempt will fail with a foreign key violation from Postgres.

**Possible solution:** Replace hardcoded arrays with tRPC queries:
```ts
const { data: sports } = trpc.sport.getAll.useQuery();
const { data: teams } = trpc.teams.getAll.useQuery();
// venues router doesn't exist yet — see #10
```

Map them into the Select dropdowns using real UUIDs.

---

### 10. No `venues` tRPC router exists

The DB has a `venues` table (12 venues seeded), but there is no `venuesRouter` and no entry for it in [server/routers/_app.ts](server/routers/_app.ts). Without this, the AddMatchModal cannot populate the venue dropdown from the real DB.

**Possible solution:** Add `server/routers/venue.ts` mirroring `sport.ts`:
```ts
export const venueRouter = router({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase.from("venues").select("id, name, location").order("name");
    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    return data || [];
  }),
});
```

Add `venue: venueRouter` to `_app.ts`.

---

### 11. `players.getAll` exposes potentially sensitive student data publicly

**Where:** [server/routers/players.ts:5](server/routers/players.ts#L5)

```ts
getAll: publicProcedure.query(async () => {
  const { data, error } = await supabase.from("players").select("*");  // returns everything
  ...
}),
```

The `Player` type in [types/index.ts](types/index.ts) lists `studentId`, `verificationStatus`, `verifiedAt` — these are sensitive student records. Exposing them via a `publicProcedure` means anyone (logged in or not) can read every student's verification status and ID.

**Possible solution:** Either:
- Make `players.getAll` an `adminProcedure` (intended for verification UI), and add a separate `players.getPublicList` returning only `name, jersey, team_id` for public display.
- Use Supabase's column-level RLS to restrict `student_id` and `verification_status` to admins only.

**NEEDS HUMAN INTERVENTION:** Confirm with the team what player fields should be public-facing on the landing page.

---

## 🟠 HIGH — Mock/Hardcoded Data Masquerading as Real Features

### 12. Dashboard home page renders fake mock matches

**Where:** [components/pages/DashboardPage.tsx:13-17, 19](components/pages/DashboardPage.tsx#L13)

```ts
const defaultMatches: MatchUI[] = [
  { id: "#M-7721", sport: "BASKETBALL", matchup: "COS SCIONS VS CSS STALLIONS", ... },
  // ...3 hardcoded entries
];
const DashboardPage = ({ matches = defaultMatches }: DashboardPageProps) => { ... }
```

Plus the stats grid hardcodes `"14"` live matches, `"32"` upcoming, `"128"` played, `"2,450"` registered players — none of these are real.

`app/dashboard/page.tsx` likely renders DashboardPage without passing real `matches` (need to confirm — file may need updating).

**Possible solution:** Wire `trpc.match.getAll.useQuery()` into the dashboard page and pass the result. Replace the hardcoded stat values with computed counts from the same query plus `trpc.players.getAll`.

---

### 13. Player verification page is 100% mock data — no real persistence

**Where:** [app/dashboard/players/page.tsx:18-24, 134](app/dashboard/players/page.tsx#L18)

```ts
const MOCK_PLAYERS: Player[] = [...5 hardcoded entries];
const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
```

Verification button just updates local state — no Supabase call. Refresh the page and all "verified" markings disappear.

**Possible solution:**
1. Add `players.verify` admin mutation to the player router.
2. Add a `verification_status` column to `players` table (the seed table doesn't have it).
3. Replace `setPlayers(...)` with the mutation call.

**NEEDS HUMAN INTERVENTION:** This is a missing feature, not just a bug. Need design decision on what verification means and what data backs it.

---

### 14. LeaderboardPodium shows hardcoded scores

**Where:** [components/dashboard/LeaderboardPodium.tsx](components/dashboard/LeaderboardPodium.tsx)

The whole component is static JSX. "COS SCIONS 3,120 points" / "ARTSCOMM PHOENIX 2,840" / "CSS STALLIONS 2,410" — never changes regardless of actual match results.

**Possible solution:** Connect to `trpc.stats.getLeaderboard.useQuery({ type: "teams" })` (after fixing #7). Need to also confirm the DB has a way to compute team standings — likely needs a new SQL view or aggregate query.

**NEEDS HUMAN INTERVENTION:** Define the scoring formula. "Total points" — is that wins × 3 + draws × 1, or sum of match scores, or something else? Not documented anywhere.

---

### 15. CollegeProfilePage uses hardcoded `PLAYER_DATA` dictionary

**Where:** [components/teams/CollegeProfilePage.tsx:14-40](components/teams/CollegeProfilePage.tsx#L14)

```ts
const PLAYER_DATA: Record<string, Player[]> = {
  "College of Engineering": [...],  // not even one of the 4 real UP Cebu colleges
  "Arts & Sciences": [...],
  "Business School": [...],
  "College of Medicine": [...],
};
```

The keys are completely unrelated to UP Cebu's actual colleges (COS / CCAD / CSS / SOM). When an admin clicks a real college, the page renders zero players.

**Possible solution:** Replace with `trpc.players.getAll` filtered by `team.org === college.code`.

---

### 16. TeamsPage misuses the `teams` table as a `colleges` table

**Where:** [components/pages/TeamsPage.tsx:149-216](components/pages/TeamsPage.tsx#L149)

```ts
const { data, error } = await (supabase as any).from("teams").select("*");
// ... maps team rows as if they were colleges
setColleges(data.map((t: any) => ({
  name: t.college,           // college name from a TEAM row
  established: t.established ?? "N/A",  // teams has no `established` column
  activeTeams: t.active_teams ?? 0,     // teams has no `active_teams` column
  sports: t.sports ?? [],               // teams has no `sports` array column
  status: t.status ?? "Active",         // teams has no `status` column
})));
```

Multiple issues:
1. **Treats teams as colleges** — but teams are basketball/volleyball/etc. team entries (96 rows for 4 colleges × 24 sports). The page will show 96 "colleges" with massive duplicates.
2. **Reads non-existent columns** (`established`, `active_teams`, `sports[]`, `status`) — the values will all be defaults from `??`.
3. **`AddCollegeModal.handleSubmit` inserts into the `teams` table** with `org: ""` — creates an orphan team row not tied to a real college.
4. **`handleDeleteCollege` deletes by `college` text match** — would delete every team for that college (could be ~24 rows for one click).
5. Uses `(supabase as any)` — disables type safety, hides the bugs from TypeScript.

**Possible solution:** This page needs significant rework, dependent on whether you ever add a real `colleges` table (currently flagged "not yet"). Until then:
- Group teams by `org` client-side and show one card per unique org (4 entries: COS, CCAD, CSS, SOM).
- Disable the Add and Delete buttons (or remove the modals) until a colleges table exists.

**NEEDS HUMAN INTERVENTION:** Same decision as the colleges-table question — defer until admin needs to manage college metadata.

---

### 17. ForgotPasswordPage doesn't actually do anything

**Where:** [components/forgot-password.tsx:11](components/forgot-password.tsx#L11)

```ts
<form action="" ... >
  ...
  <Button className="w-full">Send Reset Link</Button>
</form>
```

`action=""` and no submit handler. The button does nothing. The "Log in" link points to `/preview/login/two` — a route that doesn't exist.

The component is also written for **light theme** (`bg-zinc-50`, `bg-card`, etc.) — irrelevant now that we forced dark mode, but means the styles will look wrong if/when activated.

**Possible solution:** Either remove the file entirely (no route imports it currently), or wire it to `supabase.auth.resetPasswordForEmail(email)` and add a real route.

---

## 🟡 MEDIUM — Frontend & Behavior

### 18. `forcedTheme="dark"` may cause SSR hydration warnings

**Where:** [app/layout.tsx:24-25](app/layout.tsx#L24)

The `<html>` tag does not have `class="dark"` server-side. `next-themes` adds it client-side after hydration. With `forcedTheme="dark"`, this works for users (always dark), but on the very first server-rendered HTML, dark-mode classes are unset → React may log hydration mismatches.

`<html ... suppressHydrationWarning>` is already set on line 20, which papers over this — but suppressing warnings hides genuine future hydration bugs.

**Possible solution:** Add `className="dark"` directly to the `<html>` tag so the server renders dark from the start:
```tsx
<html lang="en" className={`${dmSans.variable} ${spaceMono.variable} dark`} suppressHydrationWarning>
```

Then `next-themes` becomes redundant for dark mode and can be simplified or removed.

---

### 19. `components/pages/` duplicates `app/dashboard/<route>/page.tsx`

**Where:** Two parallel page hierarchies:
- `components/pages/DashboardPage.tsx`, `MatchesPage.tsx`, `MediaPage.tsx`, `ResultsPage.tsx`, `StatsPage.tsx`, `TeamsPage.tsx`, `LandingPage.tsx`
- `app/dashboard/page.tsx`, `app/dashboard/matches/page.tsx`, `app/dashboard/media/page.tsx`, `app/dashboard/leaderboards/page.tsx`, `app/dashboard/players/page.tsx`

Some `app/dashboard/*` routes just re-export from `components/pages/`:
```ts
// app/dashboard/leaderboards/page.tsx
import LeaderboardPage from "@/components/pages/StatsPage";
export default function LeaderboardsRoute() { return <LeaderboardPage />; }
```

But others define their own logic inline (e.g. `app/dashboard/matches/page.tsx` has its own `MatchesPage` function unrelated to `components/pages/MatchesPage.tsx`).

This is confusing — easy to edit the wrong file and not see your changes.

**Possible solution:** Pick one location. The Next.js convention is to put page-shaped components in `app/`. Move logic from `components/pages/*` into the route files and delete `components/pages/`. (Tag: scheduled for the file-structure refactor.)

---

### 20. `signup` role mismatch — `moderator` admins are useless

**Where:** [components/sign-up.tsx:29, 119, 136](components/sign-up.tsx#L29) vs [server/trpc.ts:24](server/trpc.ts#L24)

The signup form offers two roles: `moderator` and `college_admin`. But `adminProcedure` only accepts `super_admin` and `college_admin`:
```ts
if (profile?.role !== 'super_admin' && profile?.role !== 'college_admin') {
  throw new TRPCError({ code: 'FORBIDDEN', ... });
}
```

So creating a `moderator` user means: they can log in, see the dashboard (no enforcement), but every admin mutation they try will fail with FORBIDDEN.

**Possible solution:** Either add `moderator` to the allowed roles in `adminProcedure`, or remove the moderator option from the signup form. Note: signup itself is removed from the public landing now, so this primarily affects whatever internal admin-creation flow eventually exists.

**NEEDS HUMAN INTERVENTION:** What's the actual role hierarchy supposed to be?

---

### 21. Console.log statements left in production code

**Where:**
- [components/pages/TeamsPage.tsx:159, 177, 192, 195, 199, 211](components/pages/TeamsPage.tsx#L159) — multiple `console.log` and `console.error` in user-facing flows
- [components/teams/CollegeRow.tsx:32](components/teams/CollegeRow.tsx#L32) — `console.log('College name clicked:', data.name)` on every click
- [server/routers/teams.ts:15, 24](server/routers/teams.ts#L15) — server-side logging is fine but the `console.error` on every error means stderr noise

**Possible solution:** Strip them. Use a real logger (e.g. `pino`) on the server if logging is genuinely useful. On the client, drop entirely or gate behind `process.env.NODE_ENV === 'development'`.

---

### 22. Verify `bg.png` exists

**Where:** [components/hero-section.tsx:51](components/hero-section.tsx#L51) uses `/bg.png`. Verify the file exists at `public/bg.png`.

Not critical but easy to forget — when adding the college JPGs we already burned a round on extension mismatch.

**Possible solution:** Quick `ls public/*.png` check.

---

### 23. `PublicSchedules` doesn't surface broken team joins

**Where:** [components/landing/PublicSchedules.tsx:84](components/landing/PublicSchedules.tsx#L84)

The query has `error` state handled, but if the `match.getAll` query succeeds but returns matches with null `home_team` or `away_team` (because the Supabase join fails), the cards render `"TBD"` — which is fine but masks the error.

**Possible solution:** Acceptable as-is. Just be aware that "TBD" can mean either "match scheduled but team not assigned" or "join failed".

---

## 🟡 MEDIUM — Database Schema Concerns

### 24. `teams.college` and `teams.org` are duplicated free text

**Where:** All 96 rows in seed have **both** columns populated with related-but-different strings:
```sql
('20000000-...', 'COS Basketball', 'College of Science', '0...001', 'COS', now()),
                                  ↑ teams.college            ↑ teams.org
```

`teams.college` is the descriptive name; `teams.org` is the canonical 4-letter code. We've confirmed `teams.org` is the source of truth (saved to memory). But:
- `teams.college` spellings vary: `'College of Social Science'` (singular!) vs the official `'College of Social Sciences'` (plural).
- `'Communication Arts and Design'` (no "College of") vs official `'College of Communication, Art and Design'`.
- Both columns are free text — nothing prevents an admin from typing `'cos'` or `'College of Science (COS)'` and creating data drift.

**Possible solution:** Long-term, drop `teams.college` (display name should be derived from `teams.org` via a colleges lookup). Short-term, add a `CHECK` constraint on `teams.org`:
```sql
alter table teams add constraint teams_org_check
  check (org in ('COS', 'CCAD', 'CSS', 'SOM'));
```

**NEEDS HUMAN INTERVENTION:** Coordinate with backend before dropping the column — verify nothing reads it for display.

---

### 25. No FK constraints between `teams` and a colleges entity

This is the same conversation as the deferred colleges-table decision. Currently there's no FK integrity between `teams.org` and any colleges entity. If someone fat-fingers `teams.org = 'CCD'` (missing an 'A'), the row goes in.

**Possible solution:** See #24 (CHECK constraint) for short-term. Long-term, add the colleges table with `code` as PK and FK from `teams.org` to it. Already discussed; deferred until needed.

---

### 26. `media` table column set is unusual

**Where:** [iskoarena_seed.sql media inserts](iskoarena_seed.sql)

The seed inserts use columns: `id, title, type, url, file_name, sport_id, match_id, tag, size, media_type, description, created_at`. That's 12 columns and unusual — `type` AND `media_type` is duplicate, and `tag` is singular text not a tag array.

Need to verify the actual table schema matches. If the table is missing any of these columns, the seed inserts will partially fail.

**Possible solution:** Confirm media table schema in Supabase dashboard.

**NEEDS HUMAN INTERVENTION:** Need DB owner to share `\d media` output or paste the create-table statement.

---

## 🟢 LOW — Code Hygiene & Cleanup

### 27. Dead code: `components/example.tsx`

Pure template artifact. Unused. Safe to delete.

### 28. Dead code: `components/ui/ThemeToggleButton.tsx`

Already flagged in memory. No imports anywhere since the dark-mode lock. Safe to delete.

### 29. Dead code: `components/sign-up.tsx`, `components/forgot-password.tsx`

Signup is removed from the landing per the project's decision. Forgot-password is broken (#17). Both are unimported. Either delete or wire them to real flows.

### 30. Numbered template filenames

`components/content-1.tsx`, `content-2.tsx`, `features-12.tsx`, `faqs-3.tsx` — these are tailus.io template names. The numbers don't represent anything meaningful in this codebase. Rename during the file-structure refactor.

### 31. `(supabase as any)` casts hide real type errors

**Where:** [components/pages/TeamsPage.tsx:151, 179, 205](components/pages/TeamsPage.tsx#L151)

```ts
const { data, error } = await (supabase as any).from("teams")...
```

The `as any` is being used to bypass TypeScript complaints — exactly because the columns being queried (`active_teams`, `sports`, `status`, `established`) don't exist on the `teams` row type. The cast mutes the warning but doesn't fix the bug (#16).

### 32. `forgot-password.tsx` is missing `"use client"` directive

The other auth components (login, sign-up) are `"use client"`. forgot-password is not — but uses `Link` from next, which is fine as a server component. Just inconsistent.

### 33. `_c` and `_c8` component names visible in error stack traces

**Where:** Visible in the hydration error stack trace (`<_c>`, `<_c8>`).

These are minified component display names from `motion/react` or another library. Not a bug per se — but if you ever profile React DevTools, the components will show up as unreadable. Consider adding `displayName` to wrappers if you want better DX.

### 34. `app/dashboard/leaderboards/page.tsx` imports `StatsPage` and renames it `LeaderboardPage`

**Where:** [app/dashboard/leaderboards/page.tsx:2](app/dashboard/leaderboards/page.tsx#L2)

```ts
import LeaderboardPage from "@/components/pages/StatsPage";
```

`StatsPage` and `LeaderboardPage` are likely the same concept under different names. Pick one. Probably best to rename `components/pages/StatsPage.tsx` → `LeaderboardPage.tsx` (matching the route), or merge them.

---

## Summary by Priority

### Fix first (anything in this group will burn you in production):
- **#1** Server tRPC context broken → admin auth never validated server-side
- **#2** Middleware protects wrong route → `/dashboard` is publicly accessible
- **#3** Service-role-key footgun → add `import "server-only"`
- **#4** RLS audit → verify policies match intent
- **#6** `types/supabase.ts` merge conflict → blocks typecheck
- **#8** Edit & Finalize match procedures don't exist → admin features crash on click
- **#9** AddMatchModal hardcoded fake IDs → adding a match always fails

### Fix second (visible bugs but app still mostly works):
- **#5** Dashboard layout has no auth gate
- **#7** Stats router queries non-existent columns
- **#10** Missing venues router
- **#11** Players router exposes student data publicly
- **#12, #14, #15** Mock data instead of real DB queries
- **#13** Player verification has no persistence
- **#16** TeamsPage misuses teams as colleges
- **#17** Forgot password is dead code
- **#20** `moderator` role useless

### Fix third (cleanup, defer to file-restructure pass):
- **#18** Dark theme SSR hydration nicety
- **#19** `components/pages/` vs `app/dashboard/` duplication
- **#21** Strip console.logs
- **#24, #25** Schema cleanup (col constraints, FKs)
- **#27–34** Dead code, naming, type casts

### Items needing human decisions before code can fix them:
- **#1** — confirm intended auth pattern
- **#3** — verify env vars, possibly rotate key
- **#4** — full RLS audit in Supabase dashboard
- **#6** — resolve the merge conflict (which version was canonical?)
- **#11** — what player fields should be public?
- **#13** — what does "verified" mean as a feature?
- **#14** — leaderboard scoring formula
- **#20** — actual role hierarchy
- **#24** — coordinate with backend on dropping `teams.college`
- **#26** — share `media` table schema

---

*Document generated 2026-04-26. Update this file as items get fixed (strike them through) or as new bugs surface during teammate PR reviews. Bump the filename version when a major batch lands (v1.1, v2.0, etc).*
