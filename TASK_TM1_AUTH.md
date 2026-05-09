# TM1 Task Brief — Auth + Protected Routes + Role Separation

**Branch:** `feature/auth`
**Owner:** TM1
**Status before sprint:** Login/signup/logout functional end-to-end, but auth has a critical security hole, the role system is broken on every page that uses it, and the dashboard is unprotected.

---

## Working agreement

- Read [ISKOARENA_CLAUDE.md](ISKOARENA_CLAUDE.md) Sections 4–6 before any change.
- **Do not touch the Media Page logic** (TM5's domain) — only Media's role gate (`isAdmin`) may behave differently after your fix; coordinate with TM5 on testing.
- You own [lib/supabase/server.ts](lib/supabase/server.ts) and [server/routers/auth.ts](server/routers/auth.ts). Other TMs must flag changes to either file with you.
- Use the `DEBUG_REPORT` template in Section 6 of ISKOARENA_CLAUDE.md at end of session. Save to `/reports/`.

---

## Scope

**In scope:** [components/landing/LoginModal.tsx](components/landing/LoginModal.tsx), [components/sign-up.tsx](components/sign-up.tsx), [components/pages/LandingPage.tsx](components/pages/LandingPage.tsx), [server/routers/auth.ts](server/routers/auth.ts), [server/trpc.ts](server/trpc.ts), [middleware.ts](middleware.ts), [components/providers/role-provider.tsx](components/providers/role-provider.tsx), [app/dashboard/layout.tsx](app/dashboard/layout.tsx).

**Out of scope:** Feature CRUD pages (those belong to TM2/TM3/TM4/TM5). Don't refactor admin-gated UI buttons in their pages — just provide a fixed `useRole()` and notify them.

---

## Confirmed working (do not regress)

- Login flow end-to-end ([components/pages/LandingPage.tsx:59-79](components/pages/LandingPage.tsx)) — `supabase.auth.signInWithPassword` → tRPC cache invalidation → redirect to `/dashboard`.
- Signup flow with atomic auth-user + profile row creation ([server/routers/auth.ts:29-90](server/routers/auth.ts)).
- Logout ([app/dashboard/layout.tsx:18-23](app/dashboard/layout.tsx)).
- `useRole()` already wired in [components/pages/TeamsPage.tsx](components/pages/TeamsPage.tsx), [components/pages/MediaPage.tsx](components/pages/MediaPage.tsx), [components/matches/Box.tsx](components/matches/Box.tsx).
- `adminProcedure` correctly checks `["super_admin", "college_admin"]` ([server/trpc.ts:13-29](server/trpc.ts)).

---

## Bugs to fix (priority order)

### 1. Self-grant admin vulnerability — CRITICAL (security)

**File:** [server/routers/auth.ts:26-28](server/routers/auth.ts) (signup procedure body around 29-90)
**Symptom:** Any visitor can register and pick `"college_admin"` from the signup form, immediately gaining admin powers.
**Root cause:** The `signup` procedure trusts the `role` value sent by the client and writes it as-is into `profiles.role`. There is no allow-list and no admin approval gate.
**Fix:**
- Force `role` to `null` (or your "user" sentinel) on every public signup, regardless of what the client sent.
- Add a separate `adminProcedure`-protected mutation `auth.promoteToAdmin({ userId, role })` that only existing super-admins can call.
- Update the signup UI ([components/sign-up.tsx](components/sign-up.tsx)) to remove any role picker.
**Acceptance:**
- Sign up via the public form → DB row has `role = null`.
- Existing super_admin calls `promoteToAdmin` → role updates.
- Non-admin calls `promoteToAdmin` → tRPC `UNAUTHORIZED`.

### 2. Role enum mismatch — CRITICAL (functional)

**File:** [components/providers/role-provider.tsx:35,42](components/providers/role-provider.tsx) and [components/pages/TeamsPage.tsx:11-24](components/pages/TeamsPage.tsx)
**Symptom:** Real admins (DB `role = "college_admin"`) see `isAdmin = false` everywhere — no admin buttons render, all admin actions appear locked.
**Root cause:** Role provider compares `role === "admin"`, but [types/supabase.ts:250-288](types/supabase.ts) shows the DB enum is `"super_admin" | "moderator" | "college_admin"`. TeamsPage has its own duplicate `useIsAdmin()` hook with the same bug.
**Fix:**
- In [components/providers/role-provider.tsx](components/providers/role-provider.tsx), change `isAdmin` to `["super_admin", "moderator", "college_admin"].includes(role ?? "")`.
- Update the `Role` type alias to match the DB enum (or import from `types/supabase.ts`).
- Delete the local `useIsAdmin()` hook in [components/pages/TeamsPage.tsx:11-24](components/pages/TeamsPage.tsx) — replace its usages with `useRole().isAdmin`.
- Notify TM2 (TeamsPage), TM5 (MediaPage), TM3 (matches/Box.tsx) that `isAdmin` semantics now match the DB.
**Acceptance:**
- A user with `role = "college_admin"` lands on `/dashboard/teams` and sees Add/Edit/Delete buttons.
- A user with `role = null` does not see those buttons.
- Same verification on `/dashboard/media` and `/dashboard/matches`.

### 3. `/dashboard` is not protected — HIGH

**File:** [app/dashboard/layout.tsx:33-47](app/dashboard/layout.tsx) and [middleware.ts](middleware.ts)
**Symptom:** Unauthenticated visitors who type `/dashboard` directly see the sidebar chrome with "Operator" fallback name; none of the protected pages bounce them out.
**Root cause:** The layout returns the sidebar even if `auth === null` after loading. `middleware.ts` only matches `/compendium`.
**Fix:**
- In `DashboardLayout`, add `useEffect(() => { if (!isLoading && !auth) router.push("/"); }, [auth, isLoading])`.
- Extend `middleware.ts` matcher to include `/dashboard/:path*`. Use the existing `supabase.auth.getUser()` pattern from `middleware.ts:60-62`.
**Acceptance:**
- Open `/dashboard` in a private window → redirected to `/`.
- Sign in → land on `/dashboard` and stay there on refresh.

### 4. `getSession` uses browser supabase client on the server — MEDIUM

**File:** [server/routers/auth.ts:11-20](server/routers/auth.ts) (comment at line 8 already flags this)
**Symptom:** Session can fail silently on cold loads; sidebar shows "Operator" instead of the real `full_name`.
**Root cause:** The server-side procedure imports the browser client (`@/lib/supabase/client`) which has no access to httpOnly cookies during SSR.
**Fix:**
- Create a server-side helper using `@supabase/ssr` `createServerClient` + `cookies()` from `next/headers` (the package is already in `package.json`).
- Rewrite `getSession` to use that helper.
**Acceptance:**
- Hard-refresh `/dashboard` → sidebar shows the user's full name immediately, not "Operator".
- Network tab shows the tRPC `auth.getSession` response includes `user` and `profile`.

### 5. Dead `AuthManager` mock — LOW (cleanup)

**File:** [lib/dataManager.ts:6-35](lib/dataManager.ts)
**Symptom:** None at runtime — confirmed unused in `app/` and `components/`. But `verifyLogin` accepts any password, which is a footgun if anyone ever reaches for it.
**Fix:** Delete the `AuthManager` export only. Leave the `DataManager` and constants alone for now (TM2/TM4 may still consume `MOCK_*`/`SPORTS`/`COLLEGES` constants).
**Acceptance:** `npm run build` succeeds; nothing imports `AuthManager`.

---

## Open questions for the team lead

1. Is `"moderator"` an actual role we use, or only `super_admin` and `college_admin`?
2. Should we add a true `/admin` route segment, or keep route-level role gating in the dashboard layout?
3. After fix #1, what's the bootstrap path for the *first* super_admin in production — manual SQL insert, or env-driven seed?

---

## Verification checklist before merge

- [ ] All 5 bugs above resolved
- [ ] No regression on Media Page (manually open `/dashboard/media`, upload as admin, view as user)
- [ ] Supabase RLS verified — query `profiles` as anon (deny), authenticated-user (own row only), admin (all rows)
- [ ] Auth session verified — sign in, hard refresh, name persists in sidebar
- [ ] `npm run build` passes (no TS errors in [server/routers/auth.ts](server/routers/auth.ts) or role-provider)
- [ ] `DEBUG_REPORT_AUTH_<DATE>.md` filed in `/reports`
