# TM3 Task Brief — Match Management + Results + Standings

**Branch:** `feature/matches-standings`
**Owner:** TM3
**Status before sprint:** Match CRUD works against Supabase via tRPC, but the "Finalize Match" mutation doesn't exist on the server (admin can't end a match), `EditMatchModal` has a TS error and a wrong tRPC name, and standings are completely faked with hardcoded numbers.

---

## Working agreement

- Read [ISKOARENA_CLAUDE.md](ISKOARENA_CLAUDE.md) Sections 4–6 before any change.
- Do not touch the Media Page logic (TM5's domain).
- Do not modify [server/routers/auth.ts](server/routers/auth.ts), [server/trpc.ts](server/trpc.ts), or [components/providers/role-provider.tsx](components/providers/role-provider.tsx) without flagging TM1.
- Coordinate with TM4 on `ResultsPage` — they own the decision to delete it or wire it as your admin result-entry route.
- Use the `DEBUG_REPORT` template in Section 6 at end of session. Save to `/reports/`.

---

## Scope

**In scope:** [server/routers/match.ts](server/routers/match.ts), [server/routers/stats.ts](server/routers/stats.ts), [components/matches/](components/matches/) (`Box.tsx`, `AddMatchModal.tsx`, `EditMatchModal.tsx`, `FinalizeMatchModal.tsx`, `DeleteMatchModal.tsx`, `MatchCard.tsx`, `MatchDetailsModal.tsx`, `MatchDetailsView.tsx`, `LiveCarousel.tsx`), [components/leaderboards/](components/leaderboards/) (`LeaderboardTable.tsx`, `LeaderboardTableContainer.tsx`, `Podium.tsx`, `LeaderboardSideUserCard.tsx`, `LeaderboardToggle.tsx`), [components/pages/StatsPage.tsx](components/pages/StatsPage.tsx).

**Out of scope:** Auth flow (TM1), Teams CRUD (TM2), public landing standings section (TM4 wires that to your standings procedure later).

---

## Confirmed working (do not regress)

- Match list ([components/matches/Box.tsx:40](components/matches/Box.tsx)) — `trpc.match.getAll.useQuery()`.
- Add match ([components/matches/AddMatchModal.tsx:57](components/matches/AddMatchModal.tsx)) — `trpc.match.addMatch.useMutation()`.
- Delete match ([components/matches/DeleteMatchModal.tsx:30](components/matches/DeleteMatchModal.tsx)) — `trpc.match.deleteMatch.useMutation()`.
- Existing match router procedures: `getAll`, `addMatch`, `updateMatch`, `deleteMatch`, `updateScore` ([server/routers/match.ts](server/routers/match.ts)).
- Stats router fetches from real Supabase ([server/routers/stats.ts](server/routers/stats.ts)).

---

## Bugs to fix (priority order)

### 1. `match.finalize` mutation doesn't exist — CRITICAL

**File:** [components/matches/FinalizeMatchModal.tsx:25](components/matches/FinalizeMatchModal.tsx) calls `trpc.match.finalize.useMutation()` — but no such procedure is defined in [server/routers/match.ts](server/routers/match.ts).
**Symptom:** Admin clicks "Finalize" → tRPC throws `Procedure not found: match.finalize` → match cannot be ended.
**Root cause:** The frontend modal was scaffolded against a planned procedure that was never implemented.
**Fix:**
- Add a `finalize` procedure to [server/routers/match.ts](server/routers/match.ts):
  - Input: `{ matchId, finalScoreA, finalScoreB }` (Zod-validated; reuse [lib/validations/match.ts](lib/validations/match.ts) if a schema fits).
  - Action: update the `matches` row's final scores AND set `status = "completed"` (or whatever value your enum uses) atomically in one Supabase update.
  - Wrap with `adminProcedure` from [server/trpc.ts](server/trpc.ts).
- Confirm the schema's status field name and enum values before naming.
**Acceptance:**
- Admin opens an in-progress match → clicks Finalize → modal closes, match shows as Completed in the list, scores persisted on refresh.
- Non-admin call to `match.finalize` returns tRPC `UNAUTHORIZED`.

### 2. EditMatchModal has TS error and wrong tRPC name — CRITICAL

**File:** [components/matches/EditMatchModal.tsx:12,19](components/matches/EditMatchModal.tsx)
**Symptom:** Project does not compile cleanly (TS error on undefined `EditMatchModalProps`); even if you patch around it, clicking save calls `trpc.match.update` which does not exist (router has `updateMatch`).
**Root cause:** Type was renamed/deleted; tRPC procedure name was abbreviated.
**Fix:**
- Define `EditMatchModalProps` at the top of the file (mirror the shape of `AddMatchModalProps` from [components/matches/AddMatchModal.tsx](components/matches/AddMatchModal.tsx)).
- Replace `trpc.match.update.useMutation()` with `trpc.match.updateMatch.useMutation()`.
**Acceptance:**
- `npm run build` passes with no TS errors in this file.
- Editing a match's date/teams/sport in the UI persists on refresh.

### 3. Standings are fake — HIGH

**File:** [components/leaderboards/Podium.tsx:40](components/leaderboards/Podium.tsx) and [components/pages/StatsPage.tsx:56-70](components/pages/StatsPage.tsx)
**Symptom:** Podium always shows the first 3 teams in the array regardless of wins; LeaderboardTable shows "2,400" for every player and "12,400" for every team.
**Root cause:** No standings computation exists. The UI is wired to data that's just static placeholders.
**Fix:**
- Add a `stats.getStandings` procedure to [server/routers/stats.ts](server/routers/stats.ts):
  - Query `matches` where `status = "completed"`.
  - Aggregate per `team.org`: wins, losses, points (decide point system with team lead — see open question).
  - Return sorted descending by wins (or points).
- Update [components/leaderboards/Podium.tsx](components/leaderboards/Podium.tsx) and [components/pages/StatsPage.tsx](components/pages/StatsPage.tsx) to consume `trpc.stats.getStandings.useQuery()`.
- Keep the existing `trpc.stats.getLeaderboard` for player-level stats; only standings (team-level) are new.
**Acceptance:**
- Finalize a few matches via the UI → standings reorder correctly on refresh.
- Two teams with identical records sort by point differential (or by name as tiebreaker — confirm).

### 4. Result recording UX — MEDIUM

**File:** [components/matches/FinalizeMatchModal.tsx](components/matches/FinalizeMatchModal.tsx)
**Symptom:** Modal captures only scores, but result recording per the MVP spec might also need MVP player, highlight link, etc.
**Root cause:** Spec is unclear; modal was scoped narrowly.
**Fix:** After bug #1 lands, decide with team lead whether to extend the schema/modal. If yes, coordinate with TM5 for the highlight-link picker (Media Page already manages highlights).
**Acceptance:** Whatever the agreed result fields are, they persist on finalize and surface in `MatchDetailsView`.

---

## Open questions for the team lead

1. Does the schema have a `match.status` enum, and what values does it use? (`"scheduled" | "live" | "completed"`?) Required before writing `finalize`.
2. Standings point system: is it 2-points-per-win (like CESAFI), 3/1/0 with draws, or just W/L count?
3. Should "Result recording" capture MVP/highlight, or is finalize-with-scores sufficient for MVP?

---

## Verification checklist before merge

- [ ] All 4 bugs above resolved
- [ ] No regression on Media Page
- [ ] `npm run build` passes (no TS errors in `components/matches/` or routers)
- [ ] Supabase RLS verified — admin can finalize/edit/delete matches; non-admin gets blocked
- [ ] Standings reflect actual completed matches (manually verify after finalizing 2-3 matches)
- [ ] `DEBUG_REPORT_MATCHES_<DATE>.md` filed in `/reports`
