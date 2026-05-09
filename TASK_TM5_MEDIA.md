# TM5 Task Brief — Media Hub + Media Page Polish

**Branch:** `feature/media`
**Owner:** TM5
**Status before sprint:** Media Page is the only confirmed-working feature in the app. Admin upload to Supabase Storage works. Your job is **polish only — no rewrites**.

---

## Working agreement

- Read [ISKOARENA_CLAUDE.md](ISKOARENA_CLAUDE.md) Sections 4–6 before any change. Pay special attention to **Section 5.3 (Never Break Working Features)** — the Media Page is the canonical do-not-regress feature.
- Do not modify [server/routers/auth.ts](server/routers/auth.ts), [server/trpc.ts](server/trpc.ts), or [components/providers/role-provider.tsx](components/providers/role-provider.tsx) without flagging TM1.
- After TM1 fixes the role enum mismatch, your `isAdmin` gate in MediaPage will start working for `"college_admin"` users — manually verify nothing visually regressed for users who were previously `isAdmin = false` by accident.
- Coordinate with TM3 if they extend the result-recording flow to attach a highlight link.
- Use the `DEBUG_REPORT` template in Section 6 at end of session. Save to `/reports/`.

---

## Scope

**In scope:** [components/pages/MediaPage.tsx](components/pages/MediaPage.tsx) (polish only), [app/dashboard/media/page.tsx](app/dashboard/media/page.tsx).

**Out of scope:** Any change to upload core logic, the highlight viewer, or the Supabase Storage bucket structure. You are NOT rewriting this page. Polish = loading states, error toasts, metadata display, small UX clarifications.

---

## Confirmed working (DO NOT regress)

- Media Page fetches `trpc.media.getAll` and `trpc.highlight.getAll` ([components/pages/MediaPage.tsx:1026-1027](components/pages/MediaPage.tsx)).
- Admin upload modal works against Supabase Storage bucket `"media"` ([components/pages/MediaPage.tsx:273-455](components/pages/MediaPage.tsx)) — image (Post) and video (Reel) flows both work.
- Upload gated correctly by `isAdmin` ([components/pages/MediaPage.tsx:1063](components/pages/MediaPage.tsx)).
- Highlight Stories viewer with auto-play, progress bars, pause/resume ([components/pages/MediaPage.tsx:102-239](components/pages/MediaPage.tsx)).
- Sport-based color theming ([components/pages/MediaPage.tsx:63-74](components/pages/MediaPage.tsx)).
- Hero featured-post card ([components/pages/MediaPage.tsx:814-854](components/pages/MediaPage.tsx)).
- Search + sport filter pills ([components/pages/MediaPage.tsx:1023-1195](components/pages/MediaPage.tsx)).

---

## Polish items (priority order)

### 1. `mediaLoading` flag fetched but never rendered — MEDIUM

**File:** [components/pages/MediaPage.tsx:1026](components/pages/MediaPage.tsx)
**Symptom:** First load briefly shows an empty grid, then content snaps in. No loading indicator.
**Fix:** When `mediaLoading === true`, render a `<Skeleton />` grid (use [components/ui/skeleton.tsx](components/ui/skeleton.tsx)) in place of the posts grid. Don't replace the page chrome — only the grid area.
**Acceptance:** Throttle network in DevTools → skeleton appears before the first image.

### 2. Silent error handling on upload/edit/delete — MEDIUM

**File:** [components/pages/MediaPage.tsx:318-320,613-614,655](components/pages/MediaPage.tsx)
**Symptom:** Upload fails → user sees nothing. Edit/delete fail → silent.
**Fix:** Import `toast` from `sonner` (already configured app-wide) and call `toast.error(error.message)` in each catch. Add `toast.success` on the happy path too.
**Acceptance:** Disconnect mid-upload → red toast with the error. Successful upload → green toast.

### 3. Detail modals lack metadata — LOW

**File:** [components/pages/MediaPage.tsx:686-747](components/pages/MediaPage.tsx) (PostDetailModal) and [components/pages/MediaPage.tsx:751-810](components/pages/MediaPage.tsx) (ReelDetailModal)
**Symptom:** Modal shows the asset and caption, but no upload date or uploader name.
**Fix:** Display `created_at` (formatted via `date-fns` — already in `package.json`) and `uploaded_by` (resolve via the existing `media` table join, or add it to the tRPC return shape if missing). Confirm field names in [server/routers/media.ts](server/routers/media.ts) before assuming.
**Acceptance:** Open any media detail → see "Uploaded by X · 2 days ago" line.

### 4. Highlights pause indicator — LOW

**File:** [components/pages/MediaPage.tsx:102-239](components/pages/MediaPage.tsx) (Highlights viewer pause logic at lines 158-159)
**Symptom:** Pause-on-touch works, but there's no visual feedback that you've paused — looks like the story froze.
**Fix:** When paused, dim the progress bar (e.g., `opacity-50`) or overlay a small `⏸` icon centered. Subtle — don't add a giant overlay.
**Acceptance:** Long-press a story → see the pause cue.

### 5. Bucket name hardcoded in 4 places — LOW (cleanup)

**File:** [components/pages/MediaPage.tsx:301,304,478,480](components/pages/MediaPage.tsx)
**Symptom:** None at runtime, but renaming the Supabase Storage bucket would require touching 4 spots.
**Fix:** Extract `const MEDIA_BUCKET = "media";` at the top of the file (or in a new `lib/constants.ts` if there's appetite for shared constants). Replace the 4 inline strings.
**Acceptance:** Grep `"media"` in this file → only the const definition matches.

---

## Open questions for the team lead

1. Are video reels intended to support any compression/transcoding on upload, or upload as-is and let the browser deal with playback?
2. Should the media bucket name be configurable per environment (dev vs prod), or is `"media"` permanent?

---

## Verification checklist before merge

- [ ] All 5 polish items applied
- [ ] **Media Page core flows still work**: post upload, reel upload, highlight viewer, like/share/bookmark interactions, sport filter, search
- [ ] No regression visible to a non-admin user (upload button still hidden)
- [ ] After TM1's role fix, an admin (`role = "college_admin"`) sees the upload button
- [ ] Supabase Storage RLS verified — admin can write; public/auth can read
- [ ] `DEBUG_REPORT_MEDIA_<DATE>.md` filed in `/reports`
