import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { TRPCError } from "@trpc/server";

export const matchRouter = router({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        status,
        home_score,
        away_score,
        created_at,
        home_team:home_team_id (id, name, college),
        away_team:away_team_id (id, name, college),
        sport:sport_id (id, name),
        venue:venue_id (id, name, location)
      `)
      .order("match_date", { ascending: false });

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

    return (data || []).map((match: any) => ({
      id: match.id,
      homeTeam: match.home_team?.name || "TBD",
      awayTeam: match.away_team?.name || "TBD",
      homeScore: match.home_score,
      awayScore: match.away_score,
      league: match.sport?.name || "Unknown Sport",
      venue: match.venue?.name || "TBD",
      // rawDate: raw ISO string for locale-safe date filtering on the client.
      // Clients must use this for isToday() comparisons — toLocaleDateString()
      // is server-locale-dependent and silently breaks for users in other locales.
      rawDate: match.match_date ?? null,
      // date/time remain locale-formatted strings for display purposes only.
      date: match.match_date ? new Date(match.match_date).toLocaleDateString() : "TBD",
      time: match.match_date ? new Date(match.match_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD",
      status: match.status || "upcoming",
      statusType: (match.status || "upcoming").toLowerCase(),
      category: "Intramurals",
      isOwner: false,
    }));
  }),

  addMatch: adminProcedure
    .input(z.object({
      sport_id: z.string(),
      home_team_id: z.string(),
      away_team_id: z.string(),
      match_date: z.string(),
      venue_id: z.string(),
      status: z.string().default("upcoming"),
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("matches")
        .insert({
          sport_id: input.sport_id,
          home_team_id: input.home_team_id,
          away_team_id: input.away_team_id,
          match_date: input.match_date,
          venue_id: input.venue_id,
          status: input.status,
        })
        .select()
        .single();

      if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      return data;
    }),

  updateMatch: adminProcedure
    .input(z.object({
      id: z.string(),
      home_score: z.number().optional(),
      away_score: z.number().optional(),
      status: z.string().optional(),
      match_date: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateFields } = input;

      const { data, error } = await supabase
        .from("matches")
        .update(updateFields)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      return data;
    }),

  deleteMatch: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("matches")
        .delete()
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      return data;
    }),

  // ── Added: update scores ──────────────────────────────────────────────────
  updateScore: adminProcedure
    .input(z.object({
      id: z.string(),
      homeScore: z.number(),
      awayScore: z.number(),
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("matches")
        .update({
          home_score: input.homeScore,
          away_score: input.awayScore,
          status: "completed",
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      return data;
    }),

});