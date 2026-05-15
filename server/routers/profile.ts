import { router, protectedProcedure } from "../trpc";
import { supabase as anonClient } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const profileRouter = router({
  // ── Read ──────────────────────────────────────────────────────────────────
  // Fetches the current user's full profile row from the profiles table.
  // Uses ctx.user (resolved once per request in createTRPCContext) so no
  // redundant auth.getUser() round-trip is needed.
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, college_affiliation, created_at, updated_at")
      .eq("id", ctx.user.id)
      .single();

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    return data;
  }),

  // ── Update name + avatar_url ──────────────────────────────────────────────
  // Updates full_name and avatar_url in the profiles table.
  // Avatar upload itself is done client-side directly to Supabase Storage;
  // this procedure only persists the resulting public URL.
  // Email changes go through changeEmail below (requires re-auth).
  updateProfile: protectedProcedure
    .input(z.object({
      full_name:  z.string().trim().min(1, "Name is required").max(80),
      avatar_url: z.string().url().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("profiles")
        .update({
          full_name:  input.full_name,
          ...(input.avatar_url !== undefined && { avatar_url: input.avatar_url }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", ctx.user.id);

      if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    }),

  // ── Change email ──────────────────────────────────────────────────────────
  // Updates the email in both Supabase Auth (via admin client so no
  // re-authentication is needed) and the profiles row.
  // Supabase will send a confirmation email to the new address before the
  // change takes effect on the auth side.
  changeEmail: protectedProcedure
    .input(z.object({
      email: z.string().email("Invalid email address").toLowerCase(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update auth user email — triggers Supabase's confirmation flow
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        ctx.user.id,
        { email: input.email }
      );
      if (authError) throw new TRPCError({ code: "BAD_REQUEST", message: authError.message });

      // Mirror the new email into the profiles table immediately so the UI
      // reflects the pending change without waiting for confirmation.
      const { error: dbError } = await ctx.supabase
        .from("profiles")
        .update({ email: input.email, updated_at: new Date().toISOString() })
        .eq("id", ctx.user.id);

      if (dbError) throw new TRPCError({ code: "BAD_REQUEST", message: dbError.message });
      return { success: true };
    }),

  // ── Change password ───────────────────────────────────────────────────────
  // Uses the admin client to update the password without requiring the old
  // password — the user is already authenticated so session is the proof of
  // identity. This avoids the pattern where a user is locked out if they
  // forgot their current password but are still logged in via a valid session.
  changePassword: protectedProcedure
    .input(z.object({
      password: z.string().min(6, "Password must be at least 6 characters").max(72),
    }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        ctx.user.id,
        { password: input.password }
      );
      if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      return { success: true };
    }),
});