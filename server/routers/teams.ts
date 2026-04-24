import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const teamsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.from("teams").select("*");

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return data || [];
  }),
});
