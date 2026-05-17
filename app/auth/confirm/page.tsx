"use client";

// ─── Email Confirmation Handler ───────────────────────────────────────────────
// Route: /auth/confirm
//
// Supabase email-change links arrive as:
//   /auth/confirm?token_hash=<hash>&type=email_change
//
// Flow:
//   1. Read token_hash + type from URL
//   2. Exchange via supabase.auth.verifyOtp() — commits the email change
//   3. Mirror new email into profiles table (verifyOtp only updates auth.users)
//   4. Redirect to /dashboard/profile?emailChanged=1 (success toast)
//
// Wrapped in <Suspense> because useSearchParams requires it in Next.js App Router.

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

// ── Inner component — reads URL params and processes the token ────────────────

function ConfirmHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Ref prevents the effect from firing twice under React Strict Mode
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    async function confirm() {
      // No token — nothing to process, send to landing
      if (!tokenHash || !type) {
        router.replace("/");
        return;
      }

      // Exchange the one-time token — this commits the email change in auth.users
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "email_change" | "signup",
      });

      if (error || !data.user) {
        console.error("Email confirmation failed:", error?.message);
        router.replace("/dashboard/profile?emailError=1");
        return;
      }

      // Mirror the new email into the profiles row (auth.verifyOtp only
      // touches auth.users — profiles.email would be stale without this)
      if (data.user.email) {
        const { error: mirrorErr } = await supabase
          .from("profiles")
          .update({ email: data.user.email, updated_at: new Date().toISOString() })
          .eq("id", data.user.id);

        // Non-fatal — auth email is already changed; log and continue
        if (mirrorErr) console.error("Profile email mirror failed:", mirrorErr.message);
      }

      router.replace("/dashboard/profile?emailChanged=1");
    }

    confirm();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#050505]">
      <Loader2 className="size-8 animate-spin text-[#A91D3A]" />
      <p className="text-sm font-medium text-zinc-500">Confirming your email address&hellip;</p>
    </div>
  );
}

// ── Page export — Suspense boundary satisfies Next.js useSearchParams rule ───

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
          <Loader2 className="size-8 animate-spin text-[#A91D3A]" />
        </div>
      }
    >
      <ConfirmHandler />
    </Suspense>
  );
}
