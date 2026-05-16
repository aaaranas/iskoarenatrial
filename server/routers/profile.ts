import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const profileRouter = router({
  getMyProfile: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, college_affiliation, role")
      .eq("id", ctx.user.id)
      .single();
    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    return data;
  }),

  updateProfile: publicProcedure
    .input(z.object({
      full_name:           z.string().min(2).max(80).optional(),
      college_affiliation: z.string().max(50).nullable().optional(),
      avatar_url:          z.string().url().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { error } = await ctx.supabase
        .from("profiles")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", ctx.user.id);
      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return { success: true };
    }),
});
