import { router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const sportRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("sports")
      .select("id, name")
      .order("name", { ascending: true });

    if (error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });

    return (data || []) as { id: string; name: string }[];
  }),
});
