//server/routers/teams.ts
import { router, publicProcedure } from "../trpc";
import { supabase } from "@/lib/supabase/client";
import { TRPCError } from "@trpc/server";

export const teamsRouter = router({
  getAll: publicProcedure.query(async () => {
    try {
      // 1. Try a simple select. If you renamed 'college' to 'org', 
      // make sure this isn't trying to do a join that doesn't exist yet.
      const { data, error } = await supabase
        .from("teams")
        .select("*");

      if (error) {
        console.error("❌ SUPABASE TEAMS ERROR:", error.message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data || [];
    } catch (err: any) {
      console.error("❌ TEAMS ROUTER CRASH:", err);
      return []; // Return empty array instead of crashing the whole page
    }
  }),
});
