"use client";

// ─── Email Confirmation Handler ───────────────────────────────────────────────
// Route: /auth/confirm
//
// Supabase sends email-change confirmation links in the form:
//   https://yourapp.com/auth/confirm?token_hash=<hash>&type=email_change
//
// When the user clicks that link they land here. This page:
//   1. Reads token_hash + type from the URL search params
//   2. Calls supabase.auth.verifyOtp() to exchange the token for a live session
//      — this is what actually commits the email change in Supabase Auth
//   3. Reads the newly confirmed email from the refreshed session
//   4. Mirrors the new email into the profiles table so the profile row stays
//      in sync (supabase.auth.updateUser only touches the auth.users table)
//   5. Redirects to /dashboard/profile?emailChanged=1 so the profile page can
//      show a success toast on arrival
//
// Error cases (bad token, expired link, already used) redirect to
// /dashboard/profile?emailError=1 so the user sees a clear failure message.
//
// Why this page exists:
//   Supabase's email confirmation flow redirects to the app's configured Site URL
//   with token params. Without a handler that calls verifyOtp(), the token is
//   never exchanged and the email change never takes effect — the user just
//   lands on the landing page with nothing happening.

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthConfirmPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  // useRef prevents the effect from running twice in React Strict Mode
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const tokenHash = searchParams.get("token_hash");
    const type      = searchParams.get("type") as "email_change" | "signup" | string | null;

    async function confirm() {
      // ── No token — nothing to process ────────────────────────────────────
      if (!tokenHash || !type) {
        router.replace("/");
        return;
      }

      // ── Exchange the token ────────────────────────────────────────────────
      // verifyOtp() validates the one-time token and commits the change in
      // Supabase Auth. On email_change type it updates auth.users.email.
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type:       type as any,
      });

      if (verifyError || !verifyData.user) {
        console.error("Email confirmation failed:", verifyError?.message);
        router.replace("/dashboard/profile?emailError=1");
        return;
      }

      const newEmail = verifyData.user.email;

      // ── Mirror the new email into the profiles row ────────────────────────
      // supabase.auth.verifyOtp() only updates the auth schema. The public
      // profiles table still holds the old email and must be updated separately.
      if (newEmail) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            email:      newEmail,
            updated_at: new Date().toISOString(),
          })
          .eq("id", verifyData.user.id);

        if (profileError) {
          // Profile update failure is non-fatal — auth email is already changed.
          // Log it but still send the user to the success destination.
          console.error("profiles update after confirm failed:", profileError.message);
        }
      }

      // ── Redirect to profile page with success flag ────────────────────────
      router.replace("/dashboard/profile?emailChanged=1");
    }

    confirm();
  }, [searchParams, router]);

  // Show a neutral loading state while the token is being processed.
  // This is usually only visible for ~300ms before the redirect fires.
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: "var(--surface-page)" }}
    >
      <Loader2
        className="size-8 animate-spin"
        style={{ color: "var(--accent-maroon)" }}
      />
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        Confirming your email address…
      </p>
    </div>
  );
}