import { router, publicProcedure } from "../trpc";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = router({
  // Existing — used by dashboard layout to fetch the logged-in admin's profile.
  // (Note: auditing flagged this as broken on the server because it uses the
  // browser supabase client; tracked as bug #1 in IskoArenaBugs1.0.md.)
  getSession: publicProcedure.query(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    return { user, profile };
  }),

  // Public signup — creates the auth user + profile row atomically using the
  // service-role client. Uses publicProcedure (no auth required) and reaches
  // supabaseAdmin directly, so it sidesteps the broken server context (bug #1).
  //
  // SECURITY CAVEAT — v1 self-grant: whatever role_choice the form sends gets
  // stored. Anyone visiting the site can pick "college_admin" and instantly
  // have admin powers. Listed in IskoArenaBugs1.0.md; harden before production.
  signup: publicProcedure
    .input(
      z.object({
        full_name: z.string().trim().min(2).max(80),
        email: z.string().email().toLowerCase(),
        password: z.string().min(6).max(72), // 72 = bcrypt max
        role_choice: z.enum(["user", "admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      const dbRole = input.role_choice === "admin" ? "admin" : "user";

      // 1. Create the auth user. email_confirm:true skips Supabase's verification
      //    email (out of scope for v1; flip to false later when we wire templates).
      const { data: created, error: authErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: input.email,
          password: input.password,
          email_confirm: true,
          user_metadata: { full_name: input.full_name },
        });

      if (authErr || !created.user) {
        // Surface "already exists" cleanly so the form can show a useful error
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

      // 2. Insert profile row. If this fails we delete the orphan auth user
      //    so the email isn't permanently blocked from re-signing-up.
      const userId = created.user.id;
      const { error: profileErr } = await supabaseAdmin.from("profiles").insert({
        id: userId,
        email: input.email,
        full_name: input.full_name,
        role: dbRole,
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
});
