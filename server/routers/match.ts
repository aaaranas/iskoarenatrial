import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";

const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  "Invalid UUID");

// Allowed match statuses — mirrored by the front-end status filter.
// If you add a status here, also update FILTER_OPTIONS in features/matches/components/Box.tsx.
const matchStatus = z.enum(["upcoming", "live", "completed"]);

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
      homeTeamOrg: (match.home_team?.org || "").toLowerCase(),
      awayTeam: match.away_team?.name || "TBD",
      awayTeamId: match.away_team?.id ?? null,
      awayTeamOrg: (match.away_team?.org || "").toLowerCase(),
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
      category: "Intramurals",
      isOwner: false,
    }));
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

      const { data, error } = await supabaseAdmin
        .from("matches")
        .insert({
          sport_id: input.sport_id,
          home_team_id: input.home_team_id,
          away_team_id: input.away_team_id,
          venue_id: input.venue_id,
          match_date: parsedDate.toISOString(),
          status: input.status,
        })
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
