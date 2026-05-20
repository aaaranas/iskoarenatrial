import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";

const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  "Invalid UUID");

// Allowed match statuses — mirrored by the front-end status filter.
// If you add a status here, also update FILTER_OPTIONS in features/matches/components/Box.tsx.
const matchStatus = z.enum(["upcoming", "live", "completed"]);

// Allowed match categories — mirrors the Postgres `match_category` enum.
// MUST stay in sync with CATEGORIES in lib/constants.ts and the SQL enum.
const matchCategory = z.enum([
  "Men",
  "Women",
  "Men Singles",
  "Men Doubles",
  "Women Singles",
  "Women Doubles",
  "Mixed Doubles",
]);

export const matchRouter = router({
  // ─────────────────────────────────────────────────────────────
  // GET ALL MATCHES
  // ─────────────────────────────────────────────────────────────
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabaseAdmin
      .from("matches")
      .select(`
        id,
        match_date,
        status,
        home_score,
        away_score,
        notes,
        category,
        created_at,
        home_team:home_team_id (id, name, college, org),
        away_team:away_team_id (id, name, college, org),
        sport:sport_id (id, name),
        venue:venue_id (id, name, location)
      `)
      .order("match_date", { ascending: false });

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return (data || []).map((match: any) => ({
      id: match.id,
      homeTeam: match.home_team?.name || "TBD",
      homeTeamId: match.home_team?.id ?? null,
      // teams.org is the canonical college code — normalize to uppercase ('COS','CSS','CCAD','SOM')
      // so client-side lookups (COLLEGE_LOGOS, toCollegeCode) hit without re-casing.
      homeTeamOrg: (match.home_team?.org || "").toUpperCase(),
      awayTeam: match.away_team?.name || "TBD",
      awayTeamId: match.away_team?.id ?? null,
      awayTeamOrg: (match.away_team?.org || "").toUpperCase(),
      homeScore: match.home_score,
      awayScore: match.away_score,
      league: match.sport?.name || "Unknown Sport",
      venue: match.venue?.name || "TBD",
      venueId: match.venue?.id ?? null,
      // rawDate is the unformatted ISO string — used by client code for
      // locale-independent comparisons (e.g. "is this today?"). The formatted
      // date/time strings below are display-only.
      rawDate: match.match_date as string | null,
      date: match.match_date
        ? new Date(match.match_date).toLocaleDateString()
        : "TBD",
      time: match.match_date
        ? new Date(match.match_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "TBD",
      status: match.status || "upcoming",
      statusType: (match.status || "upcoming").toLowerCase(),
      // category is one of the match_category enum values or NULL for inherently-mixed sports.
      // The literal "Intramurals" string was a placeholder removed when the category column landed.
      category: (match.category as string | null) ?? null,
      isOwner: false,
      // notes is nullable — empty string and null both render as "no notes" in the UI.
      notes: (match.notes as string | null) ?? null,
    }));
  }),

  // ─────────────────────────────────────────────────────────────
  // GET STANDINGS — aggregates completed-match W/L per college (teams.org)
  // for the given sport names. Returns all 4 college codes even when one
  // hasn't played yet (rows with 0/0), so the widget always renders 4 rows.
  // Sorted by win pct desc, then by wins desc, then alphabetically.
  // Ties (home_score === away_score) are ignored — they contribute 0 W/L.
  // ─────────────────────────────────────────────────────────────
  getStandings: publicProcedure
    .input(
      z.object({
        // Array so one logical tab can aggregate multiple DB sport names
        // (kept array-shaped for future-proofing — current callers pass one name).
        sportNames: z.array(z.string().min(1)).min(1),
        // Optional category filter. When omitted, all matches for the sport(s)
        // contribute regardless of category — useful for sports without a
        // categorical division. When provided, only matches tagged with that
        // exact category are counted.
        category: matchCategory.nullable().optional(),
      })
    )
    .query(async ({ input }) => {
      // 1. Fetch all completed matches in the requested sport(s) (and category
      //    if provided). We only need org codes + scores — keep the select narrow.
      let query = supabaseAdmin
        .from("matches")
        .select(`
          home_score,
          away_score,
          category,
          home_team:home_team_id (org),
          away_team:away_team_id (org),
          sport:sport_id!inner (name)
        `)
        .eq("status", "completed")
        .in("sport.name", input.sportNames);

      // Narrow by category when the caller wants per-category standings.
      // null/undefined skip the filter entirely (aggregate across categories).
      // `as any` cast required until types/supabase.ts is regenerated to know
      // about the new matches.category column.
      if (input.category) {
        query = (query as any).eq("category", input.category);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      // 2. Seed all 4 known college codes at 0/0 so they always appear.
      //    Order here is irrelevant — we sort below.
      const CODES = ["COS", "CSS", "CCAD", "SOM"] as const;
      type Code = (typeof CODES)[number];
      const tally: Record<Code, { w: number; l: number }> = {
        COS: { w: 0, l: 0 },
        CSS: { w: 0, l: 0 },
        CCAD: { w: 0, l: 0 },
        SOM: { w: 0, l: 0 },
      };

      // 3. Tally W/L per college. The select shape gives us nested team objects.
      //    Casting is needed because the typed Supabase return shape doesn't
      //    surface !inner-joined relations correctly.
      for (const m of (data ?? []) as any[]) {
        const homeOrg = (m.home_team?.org || "").toUpperCase() as Code;
        const awayOrg = (m.away_team?.org || "").toUpperCase() as Code;
        const homeScore = m.home_score as number | null;
        const awayScore = m.away_score as number | null;

        // Skip malformed rows (missing org or score)
        if (!CODES.includes(homeOrg) || !CODES.includes(awayOrg)) continue;
        if (homeScore == null || awayScore == null) continue;
        if (homeScore === awayScore) continue; // tie — ignored

        if (homeScore > awayScore) {
          tally[homeOrg].w += 1;
          tally[awayOrg].l += 1;
        } else {
          tally[awayOrg].w += 1;
          tally[homeOrg].l += 1;
        }
      }

      // 4. Build rows + sort by win pct desc, then wins desc, then code asc.
      //    pct is formatted as a string (e.g. ".800") to match the existing UI.
      const rowsUnsorted = CODES.map((code) => {
        const { w, l } = tally[code];
        const games = w + l;
        // 0/0 teams render as ".000" (no games played yet) rather than NaN.
        const pctNum = games === 0 ? 0 : w / games;
        const pct = pctNum.toFixed(3).replace(/^0/, ""); // ".800" / "1.000"
        return { code, w, l, pctNum, pct };
      });

      rowsUnsorted.sort((a, b) => {
        if (b.pctNum !== a.pctNum) return b.pctNum - a.pctNum;
        if (b.w !== a.w) return b.w - a.w;
        return a.code.localeCompare(b.code);
      });

      // 5. Compute GB (games behind leader). Standard formula:
      //    GB = ((W_leader - W_team) + (L_team - L_leader)) / 2
      //    Leader is the 1st-place team after sort.
      const leader = rowsUnsorted[0];
      return rowsUnsorted.map((row, i) => {
        const gbValue = i === 0
          ? 0
          : ((leader.w - row.w) + (row.l - leader.l)) / 2;
        const gb = i === 0 ? "—" : gbValue.toFixed(1);
        return {
          code: row.code,
          w: row.w,
          l: row.l,
          pct: row.pct,
          gb,
        };
      });
    }),

  // ─────────────────────────────────────────────────────────────
  // ADD MATCH
  // ─────────────────────────────────────────────────────────────
  addMatch: adminProcedure
    .input(
      z.object({
        sport_id: uuid,
        home_team_id: uuid,
        away_team_id: uuid,
        venue_id: uuid,
        match_date: z.string(), // ISO string — validated below for runtime correctness
        status: matchStatus.optional().default("upcoming"),
        // Optional — required by the client form only for sports listed in
        // CATEGORIES_BY_SPORT. Inherently-mixed sports (Frisbee, Soccer, etc.)
        // omit this entirely and the column stays NULL.
        category: matchCategory.nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // ✅ Prevent same team
      if (input.home_team_id === input.away_team_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Home and away teams cannot be the same",
        });
      }

      // ✅ Validate date
      const parsedDate = new Date(input.match_date);
      if (isNaN(parsedDate.getTime())) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid match date",
        });
      }

      // Cast required until types/supabase.ts is regenerated to include the
      // matches.category column added by the SQL migration that pairs with this code.
      const { data, error } = await supabaseAdmin
        .from("matches")
        .insert({
          sport_id: input.sport_id,
          home_team_id: input.home_team_id,
          away_team_id: input.away_team_id,
          venue_id: input.venue_id,
          match_date: parsedDate.toISOString(),
          status: input.status,
          category: input.category ?? null,
        } as never)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return data;
    }),

  // ─────────────────────────────────────────────────────────────
  // UPDATE MATCH
  // ─────────────────────────────────────────────────────────────
  updateMatch: adminProcedure
    .input(
      z.object({
        id: uuid,
        home_score: z.number().int().min(0).optional(),
        away_score: z.number().int().min(0).optional(),
        status: matchStatus.optional(),
        match_date: z.string().optional(),
        venue_id: uuid.optional(),
        // Optional — pass explicit null to clear the category, omit to leave unchanged.
        category: matchCategory.nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, match_date, ...rest } = input;

      const updateFields: any = { ...rest };

      // ✅ Handle date safely
      if (match_date) {
        const parsedDate = new Date(match_date);
        if (isNaN(parsedDate.getTime())) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid match date",
          });
        }
        updateFields.match_date = parsedDate.toISOString();
      }

      const { data, error } = await supabaseAdmin
        .from("matches")
        .update(updateFields)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return data;
    }),

  // ─────────────────────────────────────────────────────────────
  // DELETE MATCH
  // ─────────────────────────────────────────────────────────────
  deleteMatch: adminProcedure
    .input(z.object({ id: uuid }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabaseAdmin
        .from("matches")
        .delete()
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return data;
    }),

  // ─────────────────────────────────────────────────────────────
  // UPDATE NOTES — admin-only, free-form text saved on the match row.
  // Trimmed; empty string is stored as NULL so the UI's "no notes" branch
  // is the single source of truth for emptiness.
  // ─────────────────────────────────────────────────────────────
  updateNotes: adminProcedure
    .input(
      z.object({
        id: uuid,
        // 2000 chars is enough for a recap paragraph but small enough to keep
        // the matches row from bloating on accidental paste-bombs.
        notes: z.string().max(2000),
      })
    )
    .mutation(async ({ input }) => {
      const trimmed = input.notes.trim();
      const value = trimmed.length === 0 ? null : trimmed;

      // Cast required until types/supabase.ts is regenerated to include the
      // matches.notes column added by the migration that pairs with this code.
      const { data, error } = await supabaseAdmin
        .from("matches")
        .update({ notes: value } as never)
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return data;
    }),

  // ─────────────────────────────────────────────────────────────
  // UPDATE SCORE
  // ─────────────────────────────────────────────────────────────
  updateScore: adminProcedure
    .input(
      z.object({
        id: uuid,
        homeScore: z.number().int().min(0),
        awayScore: z.number().int().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabaseAdmin
        .from("matches")
        .update({
          home_score: input.homeScore,
          away_score: input.awayScore,
          status: "completed",
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return data;
    }),
});
