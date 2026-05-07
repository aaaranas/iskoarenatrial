# TypeScript Errors — Post-Bug-Fix-Session (2026-05-05)

Run: `npx tsc --noEmit`
Total errors: **38**

Legend:
- 🆕 **Introduced this session** — fix me first
- 🕰 **Pre-existing** — existed before this session

---

## 🆕 Introduced This Session

### 1. `org` now required on `College` — two files not updated

When `org` was added as a required field to the `College` interface (`components/teams/CollegeRow.tsx`), two files that construct `College` objects inline weren't updated.

**`app/dashboard/teams/page.tsx:148`**
```
Argument of type '{ name: string; established: string; activeTeams: number; sports: string[]; status: ... }' is not assignable to parameter of type 'College'.
  Property 'org' is missing
```
Fix: `AddCollegeModal.handleSubmit` builds a College object without `org`. Either add `org: ""` (since we don't have a real colleges table yet) or make `org` optional in the interface.

**`components/pages/TeamsPage.tsx:151` and `428`**
```
Property 'org' is missing in type '...' but required in type 'College'.
```
Same cause — TeamsPage.tsx also constructs College objects without `org`. Needs `org: ""` added or the field made optional.

---

### 2. LandingPage role type narrowed too far

**`components/pages/LandingPage.tsx:155`**
```
Type '(fullName: string, email: string, password: string, role: "user" | "college_admin") => Promise<...>'
is not assignable to type '(... role: string) => Promise<...>'
```
When `sign-up.tsx`'s `RoleChoice` was changed to `"college_admin" | "super_admin"`, `LandingPage.tsx` still passes a handler typed for `"user" | "college_admin"`. The `onSubmit` prop type in `SignupPageProps` needs to be updated to match — either widen it back to `string` or narrow it to the new `RoleChoice` type.

---

## 🕰 Pre-existing (not from this session)

### 3. Sidebar exports missing in `components/ui/sidebar.tsx`

Affects: `nav-main.tsx`, `nav-projects.tsx`, `nav-user.tsx`, `team-switcher.tsx`

```
Module '"@/components/ui/sidebar"' has no exported member 'SidebarGroup'
Module '"@/components/ui/sidebar"' has no exported member 'SidebarMenu'
... (8 missing exports total)
'"@/components/ui/sidebar"' has no exported member named 'useSidebar'. Did you mean 'Sidebar'?
```
The sidebar UI component doesn't export the shadcn sidebar sub-components these nav files expect. Either the sidebar.tsx is a custom version that never had these exports, or they were removed/renamed during the design rebuild.

---

### 4. `MatchCardProps` interface mismatch

**`components/matches/Box.tsx:190, 222`**
**`components/matches/LiveCarousel.tsx:37`**

```
Property 'onFinalize' is missing in type '{ key: string; match: Match; onOpenDetails: () => void; }'
Type '(() => void) | undefined' is not assignable to type '() => boolean'
Type '{ match: Match; }' is missing: onOpenDetails, onFinalize
```
`MatchCard`'s props type (`MatchCardProps`) requires `onFinalize` and `onOpenDetails`, but callers in `Box.tsx` and `LiveCarousel.tsx` don't pass them.

---

### 5. `MatchCard` receives `Match` but `EditMatchModalProps` expects different shape

**`components/matches/MatchCard.tsx:115`**
```
Type 'Match' is not assignable to type '{ id: string; homeTeam: string; ... homeScore?: number | undefined; ... }'
  Types of property 'homeScore' are incompatible.
    Type 'number | null' is not assignable to type 'number | undefined'
```
`EditMatchModal` props use `number | undefined` but the `Match` type (from the tRPC router) returns `number | null`. Either update `EditMatchModalProps.homeScore` to `number | null | undefined`, or normalize null → undefined at the call site.

---

### 6. `MatchDetailsModal` Tabs prop mismatch

**`components/matches/MatchDetailsModal.tsx:39, 55, 58`**
```
Type '{ children: Element[]; className: string; }' is missing 'value', 'onValueChange' from TabsListProps
Type '{ value: string; }' is missing 'activeValue', 'children' from TabsContentProps
```
Custom `TabsList`/`TabsContent` components have different prop signatures than the standard shadcn ones. The modal is using the wrong component or the component was changed.

---

### 7. `MatchesPage` prop mismatch

**`components/pages/MatchesPage.tsx:20`**
```
Type '{ matches: ... }' is not assignable to type 'IntrinsicAttributes & { onSelectMatch: (m: Match) => void; }'
  Property 'matches' does not exist on type '...'
```
The `MatchesPage` component only accepts `onSelectMatch` as a prop, but is being called with a `matches` prop. Either the component signature needs updating or the caller does.

---

### 8. `MediaPage` mutation type mismatch

**`components/pages/MediaPage.tsx:1029`**
```
Type '(options?: RefetchOptions) => Promise<QueryObserverResult<...>>' is not assignable to type
'(data: { color: string; ... }, variables: ...) => unknown'
```
A `refetch` function is being passed where a mutation `onSuccess` callback is expected. Wrong function passed to the wrong prop.

---

### 9. `media.ts` router strict update type

**`server/routers/media.ts:83`**
```
Argument of type 'Record<string, unknown>' is not assignable to parameter of type 'RejectExcessProperties<...>'
  Type 'Record<string, unknown>' is not assignable to type '{ [x: string]: never; }'
```
The Supabase client's strict update type (generated after type regen) now rejects a `Record<string, unknown>` spread. The media router needs to pass a typed object instead of a generic record.

---

## Fix Priority for Next Session

1. **Fix first (introduced this session):**
   - Make `org` optional in `College` interface (or add `org: ""` to the two places that build College objects) — 3 errors
   - Fix `LandingPage.tsx` role type — 1 error

2. **Fix second (pre-existing, straightforward):**
   - `MatchCard.tsx` homeScore null vs undefined — 1 error
   - `media.ts` strict update type — 1 error

3. **Fix third (pre-existing, need more investigation):**
   - Sidebar missing exports — 9 errors
   - `MatchCardProps` onFinalize/onOpenDetails — 3 errors
   - `MatchDetailsModal` Tabs props — 3 errors
   - `MatchesPage` matches prop — 1 error
   - `MediaPage` refetch vs onSuccess — 1 error
