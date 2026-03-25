import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { TRPCError } from "@trpc/server";

export const matchRouter = router({
  getAll: publicProcedure.query(async () => {
    // Check your table name and columns in Supabase
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    return data || [];
  }),

  addMatch: adminProcedure
    .input(z.object({
      sport_id: z.string(),     // Use your actual DB column names here
      home_team_id: z.string(),
      away_team_id: z.string(),
      match_date: z.string(),   // Maps to your DB 'match_date'
      status: z.string().default("upcoming"),
    }))
    .mutation(async ({ input, ctx }) => {
      // The error happened here because keys like 'college_a' 
      // probably don't exist in your 'matches' table
      const { data, error } = await supabase
        .from("matches")
        .insert({
          sport_id: input.sport_id,
          home_team_id: input.home_team_id,
          away_team_id: input.away_team_id,
          match_date: input.match_date,
          status: input.status,
          // created_by: ctx.user.id // Add this if you have this column
        })
        .select()
        .single();

      if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      return data;
    }),
});
