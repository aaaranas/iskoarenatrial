"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import type { Admin } from "@/types";

// Existing landing components — being replaced phase by phase. Anything
// still imported here is awaiting its replacement section.
import HeroSection from "@/components/hero-section";
import Features from "@/components/features-12";
import ContentSection from "@/components/content-2";
import TeamSection from "@/components/team";
import FAQsThree from "@/components/faqs-3";
import NewsCarousel from "@/components/news-carousel";
import FadeInSection from "@/components/fade-in-section";

// New design components from Phase 2 (Chrome) — Nav + Footer + LoginModal.
// These replace the old header.tsx, footer.tsx, call-to-action.tsx, login.tsx.
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import LoginModal from "@/components/landing/LoginModal";

// Embedded read-only sections (public view of admin-managed data) — kept until
// Phases 3/4 replace them with the design's CompetingColleges / Matches Today.
import PublicSchedules from "@/components/landing/PublicSchedules";
import PublicColleges from "@/components/landing/PublicColleges";

interface LandingPageProps {
  onLogin?: (admin: Admin) => void;
}

// Public landing page — admin-only login (no signup); embeds read-only matches & colleges.
export default function LandingPage({ onLogin }: LandingPageProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Only the login modal remains — signup removed (admins receive credentials directly).
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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

  return (
    <div className="relative min-h-screen bg-ia-bg">
      {/* Phase 2 chrome — fixed Nav at the top, opens LoginModal on Login click */}
      <Nav onLoginClick={() => setIsLoginOpen(true)} />

      {/* HeroSection still rendering its existing copy (without its old internal header).
          Phase 3 replaces this with the design's full-viewport Hero + CompetingColleges. */}
      <HeroSection onLoginClick={() => setIsLoginOpen(true)} />

      {/* News & Updates — anchor target for the hero "Iskolaro Season Has Begun" pill */}
      <div id="news" className="scroll-mt-24">
        <FadeInSection><NewsCarousel /></FadeInSection>
      </div>

      {/* Embedded read-only Schedules — Phase 4 replaces with Matches Today carousel */}
      <FadeInSection><PublicSchedules /></FadeInSection>

      {/* Embedded read-only Colleges — Phase 3 replaces with CompetingColleges */}
      <FadeInSection><PublicColleges /></FadeInSection>

      {/* Marketing sections kept temporarily — likely archived in Phase 7 */}
      <FadeInSection><Features /></FadeInSection>
      <FadeInSection><ContentSection /></FadeInSection>

      {/* FAQ — slated for archive in Phase 7 (not in the new design) */}
      <div id="faq" className="scroll-mt-24">
        <FadeInSection><FAQsThree /></FadeInSection>
      </div>

      {/* About Us — Phase 6 replaces with the new editorial Team grid */}
      <div id="about" className="scroll-mt-24">
        <FadeInSection><TeamSection /></FadeInSection>
      </div>

      {/* Phase 2 chrome — new elaborate Footer (CTA card + footer card + watermark).
          Replaces the old FooterSection + CallToAction; Login button lives inside it. */}
      <FadeInSection>
        <Footer onLoginClick={() => setIsLoginOpen(true)} />
      </FadeInSection>

      {/* Decorative bottom blur — kept from the previous design; can be removed later */}
      <div
        className="fixed bottom-0 left-0 right-0 h-28 pointer-events-none z-[50] backdrop-blur-sm [mask-image:linear-gradient(to_top,black_20%,transparent)]"
        aria-hidden="true"
      />

      {/* New design's LoginModal — only auth modal on the public landing (no signup) */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSubmit={handleLoginSubmit}
      />
    </div>
  );
}
