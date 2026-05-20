// server/routers/teams.ts
import { router, publicProcedure } from "../trpc";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";

export const teamsRouter = router({
  // Errors are surfaced as TRPCError rather than swallowed into an empty array.
  // The previous behavior (catch → return []) hid real DB issues by making the
  // UI render as if no teams existed; callers (AddMatchModal et al) already
  // handle the React Query error state with a toast, so propagating is safer.
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabaseAdmin
      .from("teams")
      .select("*");

    if (error) {
      console.error("teams.getAll supabase error:", error.message);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return data ?? [];
  }),
});
