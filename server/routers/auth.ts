import { router, publicProcedure, adminProcedure } from "../trpc";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = router({
  // Reads ctx.user (resolved once per request in createTRPCContext) instead of
  // re-running auth.getUser() here — keeps the dashboard layout's session
  // query off the redundant-fetch hot path.
  getSession: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("*")
      .eq("id", ctx.user.id)
      .single();
    return { user: ctx.user, profile };
  }),

  // Public signup — role is always "user" (viewer tier).
  // Self-grant is closed: only an existing admin can promote via promoteToAdmin.
  signup: publicProcedure
    .input(
      z.object({
        full_name: z.string().trim().min(2).max(80),
        email: z.string().email().toLowerCase(),
        password: z.string().min(6).max(72), // 72 = bcrypt max
      }),
    )
    .mutation(async ({ input }) => {
      // email_confirm:false forces Supabase to send a verification link before
      // the user can log in. Without this, anyone could squat on a victim's
      // email and immediately access their would-be account.
      const { data: created, error: authErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: input.email,
          password: input.password,
          email_confirm: false,
          user_metadata: { full_name: input.full_name },
        });

      if (authErr || !created.user) {
        if (authErr?.message?.toLowerCase().includes("already")) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Signup failed. Please try again.",
        });
      }

      // If profile insert fails, delete the orphan auth user so the email
      // isn't permanently blocked from re-signing-up.
      const userId = created.user.id;
      // Upsert (not insert) because Supabase has an on_auth_user_created trigger
      // that auto-creates a profile row. We update it with full_name/email/role
      // rather than inserting a duplicate (which would violate profiles_pkey).
      // role:"user" is the viewer tier — the public signup default. Admins are
      // promoted separately via promoteToAdmin. RLS policies MUST check
      // role === 'admin' positively, never `!= 'admin'`, otherwise plain
      // "user" rows would slip through any admin-only gate.
      const { error: profileErr } = await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email: input.email,
        full_name: input.full_name,
        role: "user",
      }, { onConflict: "id" });

      if (profileErr) {
        console.error("Profile insert error:", profileErr.message);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create profile. Please try again.",
        });
      }

      return { success: true };
    }),

  // Admin-only — promotes an existing user to the 'admin' role.
  // Protected by adminProcedure: caller must already be an admin (two-role model:
  // 'admin' | 'user'). There is no super_admin or college_admin tier.
  promoteToAdmin: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(["admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ role: input.role })
        .eq("id", input.userId);
      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }
      return { success: true };
    }),
});
