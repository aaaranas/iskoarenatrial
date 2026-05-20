"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import type { Admin } from "@/types";

// FadeInSection still used to entrance-animate the Footer.
import FadeInSection from "@/components/layout/FadeInSection";

// Phase 2 — Chrome (Nav + Footer + LoginModal).
import Nav from "@/features/landing/components/Nav";
import Footer from "@/features/landing/components/Footer";
import LoginModal from "@/features/auth/components/LoginModal";

// Public signup modal — restored from _legacy and restyled to match LoginModal.
// Lives at components/ root rather than components/landing/ to preserve the
// teammate's original file location and git history.
import SignupPage from "@/features/auth/components/SignupModal";

// Phase 3 — Hero + CompetingColleges.
import Hero from "@/features/landing/components/Hero";
import CompetingColleges from "@/features/landing/components/CompetingColleges";

// Phase 4 — Sponsors + Matches Today carousels.
import SponsorsSection from "@/features/landing/components/SponsorsSection";
import MatchesTodaySection from "@/features/landing/components/MatchesTodaySection";

// Phase 5 — Standings, Spotlight, News, Sports, Rivalry.
import StandingsSection from "@/features/landing/components/StandingsSection";
import SpotlightSection from "@/features/landing/components/SpotlightSection";
import NewsSection from "@/features/landing/components/NewsSection";
import SportsSection from "@/features/landing/components/SportsSection";
import RivalrySection from "@/features/landing/components/RivalrySection";

// Phase 6 — Editorial Team grid (replaces the old developer team.tsx).
import TeamSection from "@/features/landing/components/TeamSection";

interface LandingPageProps {
  onLogin?: (admin: Admin) => void;
}

// Public landing page — admin-only login (no signup); embeds read-only matches & colleges.
export default function LandingPage({ onLogin }: LandingPageProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Login + signup modals. Signup was reinstated per team agreement; v1 is
  // self-grant (whatever role the user picks gets stored). See sign-up.tsx
  // and server/routers/auth.ts for the security caveat.
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // tRPC mutation hook used by handleSignupSubmit below.
  const signupMutation = trpc.auth.signup.useMutation();

  // --- SUPABASE LOGIN HANDLER ---
  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Refresh tRPC auth session cache so the dashboard sees the new user.
      await utils.auth.getSession.invalidate();

      // Redirect to dashboard after successful login.
      setIsLoginOpen(false);
      router.push("/dashboard");

      return { success: true, message: "Initialization successful." };
    } catch (error: any) {
      return { success: false, message: error.message || "Invalid credentials." };
    }
  };

  // --- SUPABASE SIGNUP HANDLER ---
  // Adapter between SignupPage's onSubmit signature (positional args) and the
  // tRPC auth.signup procedure (structured input). Server always sets role:"user".
  const handleSignupSubmit = async (
    fullName: string,
    email: string,
    password: string,
  ) => {
    try {
      await signupMutation.mutateAsync({
        full_name: fullName,
        email,
        password,
      });
      // Stay on the landing page after signup — new users have no privileged
      // role yet, so we don't auto-redirect to /dashboard. They can click
      // Login when they're ready.
      return { success: true, message: "Account created. You can now sign in." };
    } catch (error: any) {
      return { success: false, message: error?.message || "Signup failed. Please try again." };
    }
  };

  return (
    <div className="relative min-h-screen bg-ia-bg">
      {/* Phase 2 chrome — fixed Nav at the top, opens LoginModal on Login click */}
      <Nav onLoginClick={() => setIsLoginOpen(true)} />

      {/* Section order matches the design's IskoArena.html App component:
          Hero → Colleges → Sponsors → Matches → Standings → Spotlight →
          News → Sports → Rivalry → (Team — Phase 6) → Footer */}

      <Hero />
      <CompetingColleges />
      <SponsorsSection />
      <MatchesTodaySection />
      <StandingsSection />
      <SpotlightSection />
      <NewsSection />
      <SportsSection />
      <RivalrySection />

      {/* Phase 6 — editorial Team grid (5 members: Ako/Andre/Jonel/Rex/Dom).
          Sits at id="team" so the Nav "Team" link finally has a target. */}
      <TeamSection />

      {/* Phase 2 chrome — new elaborate Footer (CTA card + footer card + watermark) */}
      <FadeInSection>
        <Footer onLoginClick={() => setIsLoginOpen(true)} />
      </FadeInSection>

      {/* Decorative bottom blur — kept from the previous design; can be removed later */}
      <div
        className="fixed bottom-0 left-0 right-0 h-28 pointer-events-none z-[50] backdrop-blur-sm [mask-image:linear-gradient(to_top,black_20%,transparent)]"
        aria-hidden="true"
      />

      {/* LoginModal — clicking "Sign up" in its footer closes Login and opens Signup */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSubmit={handleLoginSubmit}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />

      {/* SignupModal — clicking "Sign in" in its footer reverses the swap */}
      <SignupPage
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSubmit={handleSignupSubmit}
        onToggleLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
}
