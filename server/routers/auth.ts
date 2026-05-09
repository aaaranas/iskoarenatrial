import { router, publicProcedure, adminProcedure } from "../trpc";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createCookieSupabaseClient } from "@/lib/supabase/server-client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = router({
  // Uses the cookie-aware server client so the session is readable in the
  // tRPC API route context. The old browser client had no cookie handler
  // and always returned null on the server (sidebar showed "Operator").
  getSession: publicProcedure.query(async () => {
    const supabase = await createCookieSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    return { user, profile };
  }),

  // Public signup — role is always null (viewer).
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
      const { data: created, error: authErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: input.email,
          password: input.password,
          email_confirm: true,
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
      const { error: profileErr } = await supabaseAdmin.from("profiles").insert({
        id: userId,
        email: input.email,
        full_name: input.full_name,
        role: "user" as any, // new signups are always viewers
      });

      if (profileErr) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create profile. Please try again.",
        });
      }

      return { success: true };
    }),

  // Admin-only — promotes an existing user to a privileged role.
  // Protected by adminProcedure: only super_admin or college_admin can call this.
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
