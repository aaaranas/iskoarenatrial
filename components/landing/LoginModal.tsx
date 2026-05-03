"use client";

// Public landing's login modal — replaces components/login.tsx with the new
// minimalist design from the handoff bundle (ia-* prototype's LoginModal).
// Behavior preserved: same onSubmit contract calling supabase.auth from LandingPage.
// Visual: dark card with maroon border accent, gold "ADMIN LOGIN" eyebrow,
// and a public-vs-admin disclaimer baked into the copy.

import React, { useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Same signature as the old LoginPage so LandingPage's handler is unchanged.
  onSubmit: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

export default function LoginModal({ isOpen, onClose, onSubmit }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't render anything when closed — keeps the DOM lean.
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await onSubmit(email, password);
      if (!result.success) setError(result.message || "Invalid credentials");
    } catch {
      setError("An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Backdrop — clicking outside the card closes the modal.
    // z-[200] sits above nav (z-100) and any other landing chrome.
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md animate-[fadeInUp_0.2s_ease]"
      onClick={onClose}
    >
      {/* Modal card — stop click propagation so clicking inside doesn't close.
          Maroon-tinted border (#800000 at 40% alpha) keeps the brand cue subtle. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[420px] max-w-[92vw] rounded-[18px] border border-ia-maroon/40 bg-ia-card px-9 py-10"
      >
        {/* Close button — top-right corner */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login"
          className="absolute right-3.5 top-3.5 text-white/50 transition-colors hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header: logo + IskoArena wordmark + ADMIN LOGIN eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="IskoArena"
            width={42}
            height={42}
            // Silences Next's width/height-modified warning (see Hero for details)
            style={{ width: "auto", height: "auto" }}
            className="object-contain"
          />
          <div>
            <div className="font-bebas text-2xl tracking-[2px] leading-none text-[#f0f0f0]">
              IskoArena
            </div>
            <div className="mt-0.5 text-[11px] font-semibold tracking-[2px] text-ia-gold">
              ADMIN LOGIN
            </div>
          </div>
        </div>

        {/* Disclaimer: makes the public-vs-admin split explicit in the copy */}
        <p className="mb-6 text-[13px] leading-relaxed text-white/50">
          Admin-only access. Public users can view schedules and standings without logging in.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Inline error banner — only renders when auth fails */}
          {error && (
            <div className="mb-5 rounded-md border border-red-400/20 bg-red-400/5 p-3 text-[11px] font-bold uppercase tracking-widest text-red-400">
              {error}
            </div>
          )}

          {/* Email field */}
          <label className="mb-1.5 block text-[11px] font-bold tracking-[1.5px] text-white/60">
            EMAIL
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@upcebu.edu.ph"
            className="mb-4 w-full rounded-lg border border-white/10 bg-ia-bg px-3.5 py-3 text-sm text-[#f0f0f0] outline-none placeholder:text-white/25 focus:border-ia-maroon/60"
          />

          {/* Password field */}
          <label className="mb-1.5 block text-[11px] font-bold tracking-[1.5px] text-white/60">
            PASSWORD
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mb-6 w-full rounded-lg border border-white/10 bg-ia-bg px-3.5 py-3 text-sm text-[#f0f0f0] outline-none focus:border-ia-maroon/60"
          />

          {/* Submit — UP maroon with hover darken and a subtle drop-shadow glow */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ia-maroon py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_8px_24px_rgba(128,0,0,0.35)] transition-colors hover:bg-[#5C0D0F] disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Login →</>}
          </button>
        </form>

        {/* Public-vs-admin disclaimer footer */}
        <p className="mt-5 text-center text-[11px] text-white/35">
          No account? Admins receive credentials directly.
        </p>
      </div>
    </div>
  );
}
