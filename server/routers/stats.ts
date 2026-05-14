import { router, publicProcedure } from "../trpc";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";

export const statsRouter = router({
  // Fetch leaderboard data based on type (Player vs Team)
  getLeaderboard: publicProcedure
    .input(z.object({
      type: z.enum(["players", "teams"]),
      timeframe: z.string().default("Season")
    }))
    .query(async ({ input }) => {
      // stats table is owned by TM3 and isn't in the generated Database types
      // yet; cast to any to unblock typing. Remove this cast once types/supabase.ts
      // is regenerated with the stats schema.
      let query = (supabase as any)
        .from("stats")
        .select(`
          *,
          player:players(id, name, college, photo),
          team:teams(id, name, org, logo_url),
          sport:sports(name)
        `)
        .eq("timeframe", input.timeframe)
        .order("stat_value", { ascending: false });

      if (input.type === "players") query = query.not("player_id", "is", null);
      if (input.type === "teams") query = query.not("team_id", "is", null);

      const { data, error } = await query;
      // Return empty array instead of throwing so the leaderboards page
      // renders with an empty state rather than a 500 when the stats table
      // has no data or is not yet populated (TM3 owns the stats data layer)
      if (error) { console.error("stats.getLeaderboard:", error.message); return []; }
      return data || [];
    }),
});
