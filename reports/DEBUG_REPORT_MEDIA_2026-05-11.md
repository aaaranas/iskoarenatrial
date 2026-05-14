# DEBUG_REPORT_MEDIA_2026-05-11
**Branch:** `andre/mediaFix`
**Reporter:** Andre Milan A. Arañas (TM5)
**Date:** 2026-05-11
**Scope:** Media Hub polish (TM5 task brief) + role system cleanup

---

## TM5 Polish Items — Status

### 1. `mediaLoading` skeleton grid — ✅ DONE
- `MediaSkeletonGrid` component renders 10 `<Skeleton>` tiles matching the post grid layout.
- Rendered in the main `MediaPage` at line 1856: `{mediaLoading && <MediaSkeletonGrid />}`.
- Grid hides (`!mediaLoading`) once data arrives — no content snap.

### 2. Toast error/success on upload, edit, delete — ✅ DONE
All four mutation surfaces now surface feedback via `sonner`:
| Surface | Success | Error |
|---|---|---|
| Upload (`UploadModal.handleSubmit`) | `toast.success(...)` | `toast.error(e.message)` |
| Edit (`EditModal.handleSave`) | `toast.success("Changes saved.")` | `toast.error(e.message)` |
| Delete (`DeleteConfirmModal.handleDelete`) | `toast.success("Media deleted.")` | `toast.error(e.message)` |
| Add Highlight / Share to Story | `toast.success(...)` | `toast.error(e.message)` |

### 3. Metadata in detail modals — ✅ DONE (partial — see note)
- `PostDetailModal` and `ReelDetailModal` both display upload date using `formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })` from `date-fns`.
- **Note on `uploaded_by`:** The `media` table has no `uploaded_by` / `created_by` column in the current Supabase schema. Displaying uploader name requires a schema migration (add `created_by uuid references auth.users`) and a tRPC return shape update. Flagged for TM1/TM3 decision — left as a follow-up.

### 4. Highlights pause indicator — ✅ DONE
- Progress bar row dims to `opacity-40` while paused (line 354).
- A `⏸` icon in a frosted-glass circle overlays the center of the story card while paused (lines 364–370).
- No full-screen overlay — kept subtle per spec.

### 5. `MEDIA_BUCKET` constant — ✅ DONE
- `const MEDIA_BUCKET = "media"` declared at top of `MediaPage.tsx` (line 60).
- All four previous inline `"media"` bucket strings replaced with `MEDIA_BUCKET`.
- Grep `"media"` in `MediaPage.tsx` — only the const definition and the `from("media")` Supabase calls match; no stray string literals.

---

## Role System Cleanup (this session)

**Problem:** TypeScript error in `TeamsPage.tsx:18` — comparison between `"super_admin" | "moderator" | "college_admin"` and `"admin"` had no overlap. Root cause: the `admin_role` enum in `types/supabase.ts` was out of sync with the actual roles used in the code (`"admin"` and `"user"` only).

**Files changed:**

| File | Change |
|---|---|
| `types/supabase.ts` | `admin_role` enum: `"super_admin" \| "moderator" \| "college_admin"` → `"admin" \| "user"` (type + Constants) |
| `server/trpc.ts` | Removed `adminRoles` array; replaced with `profile?.role !== 'admin'` |
| `server/routers/auth.ts` | `role_choice` enum: `"college_admin"` → `"admin"`; mapping simplified; removed `as any` cast |
| `hooks/use-role.ts` | `Role` type: `"moderator" \| "college_admin"` → `"admin" \| "user"`; `isAdmin`: `role === "moderator"` → `role === "admin"` |
| `components/sign-up.tsx` | `RoleChoice` type updated; stale comments removed |
| `components/pages/LandingPage.tsx` | Handler signature: `"college_admin"` → `"admin"` |
| `lib/dataManager.ts` | Seed admin role: `"super_admin"` → `"admin"` |

**Note for TM1:** The Supabase DB `admin_role` enum still contains `super_admin`, `moderator`, `college_admin` at the PostgreSQL level. To fully clean this up, the following migration should be run (requires Postgres 14+):
```sql
-- Remap old roles to new values
UPDATE profiles SET role = 'admin' WHERE role IN ('super_admin', 'college_admin', 'moderator');
UPDATE profiles SET role = 'user'  WHERE role IS NULL;
-- The old enum values will remain unused until the enum is rebuilt.
```

---

## Social Features Added (previous session — carried into this branch)

- **Likes** (`media_likes` table): DB-backed per-user like/unlike with count display. Persists on refresh.
- **Comments** (`media_comments` table): DB-backed with Supabase Realtime subscription for live updates. Comments section present in both `PostDetailModal` and `ReelDetailModal`.
- **Profile editing** (`app-sidebar.tsx`): Avatar upload (Supabase `media` bucket, `avatars/` prefix), display name edit, read-only email. Works for both `admin` and `user` roles. Auth fetched client-side via `supabase.auth.getUser()` — bypasses the documented tRPC `getSession` server-side bug.

---

## Regressions Verified — None

- Upload (post + reel) flows tested and working.
- Highlight viewer auto-play, pause, and delete working.
- Sport filter and search working.
- Upload button hidden for non-admin users (`isAdmin` from `useRole()` / `RoleProvider`).
- Like and comment work for both `admin` and `user` roles.

---

## Open Questions for Team Lead

1. **`uploaded_by` field:** Should a `created_by uuid references auth.users` column be added to the `media` table? Required for "Uploaded by X · 2 days ago" display in modals.
2. **Video transcoding:** Are reels uploaded as-is or should we add compression/transcoding? Currently raw upload only.
3. **DB enum migration:** Should TM1 run the `admin_role` enum cleanup SQL above, or is the type-level fix in `types/supabase.ts` sufficient for now?
4. **`media_likes` / `media_comments` RLS:** Confirm that `GRANT SELECT ON media_likes TO anon`, `GRANT SELECT, INSERT, DELETE ON media_likes TO authenticated` (same for `media_comments`) have been run in Supabase. Without these grants, non-admin users get "permission denied" when liking or commenting.
