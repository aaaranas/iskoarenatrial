import { router, protectedProcedure } from "../trpc";
import { supabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const profileRouter = router({
  // C1: uses protectedProcedure — ctx.user is guaranteed non-null, no hand-rolled guard needed
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, college_affiliation, role")
      .eq("id", ctx.user.id)
      .single();
    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    return data;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        full_name: z.string().min(2).max(80).trim().optional(),
        // C2: free-form handle — restricted to safe characters to prevent stored-XSS
        college_affiliation: z
          .string()
          .max(30)
          .trim()
          .refine(v => /^[a-zA-Z0-9 _\-.]+$/.test(v), "Handle may only contain letters, numbers, spaces, _ - .")
          .nullable()
          .optional(),
        avatar_url: z.string().url().nullable().optional(),
      })
      // M4: reject no-op mutations (empty object would still bump updated_at)
      .refine(o => Object.values(o).some(v => v !== undefined), { message: "No changes provided" })
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("profiles")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", ctx.user.id);
      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return { success: true };
    }),

  // ── Change password ─────────────────────────────────────────────────────
  // Uses the admin client so no current-password prompt is needed — the
  // active session (validated by protectedProcedure) is proof of identity.
  changePassword: protectedProcedure
    .input(
      z.object({
        password: z.string().min(6, "Password must be at least 6 characters").max(72),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        ctx.user.id,
        { password: input.password },
      );
      if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    }),
});
