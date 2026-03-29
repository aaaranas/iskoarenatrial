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
      let query = supabase
        .from("stats")
        .select(`
          *,
          player:players(id, name, college, photo),
          team:teams(id, name, org, logo_url),
          sport:sports(name)
        `)
        .eq("timeframe", input.timeframe)
        .order("stat_value", { ascending: false });

      // Filter by type: if searching for players, player_id must not be null
      if (input.type === "players") query = query.not("player_id", "is", null);
      if (input.type === "teams") query = query.not("team_id", "is", null);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }),
});
