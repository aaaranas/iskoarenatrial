"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import type { Admin } from "@/types";

// UI Components
import HeroSection from "@/components/hero-section";
import Features from "@/components/features-12";
import ContentSection from "@/components/content-2";
import TeamSection from "@/components/team";
import FAQsThree from "@/components/faqs-3";
import CallToAction from "@/components/call-to-action";
import FooterSection from "@/components/footer";
import LoginPage from "@/components/login";
import NewsCarousel from "@/components/news-carousel";
import FadeInSection from "@/components/fade-in-section";

// Embedded read-only sections (public view of admin-managed data).
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
    <div className="relative min-h-screen bg-neutral-950">
      {/* HeroSection wraps the header + hero copy + sponsors block (id="sponsors" is inside) */}
      <HeroSection onLoginClick={() => setIsLoginOpen(true)} />

      {/* id wrappers below give each section a stable anchor target for the topbar nav.
          scroll-mt-24 reserves space for the fixed header so anchored sections aren't clipped. */}

      {/* News & Updates — also the target of the hero "Iskolaro Season Has Begun" pill */}
      <div id="news" className="scroll-mt-24">
        <FadeInSection><NewsCarousel /></FadeInSection>
      </div>

      {/* Embedded read-only Schedules — main public view of admin-managed match data */}
      <FadeInSection><PublicSchedules /></FadeInSection>

      {/* Embedded read-only Colleges — public mirror of admin's TeamsPage (4 colleges only) */}
      <FadeInSection><PublicColleges /></FadeInSection>

      {/* Marketing sections — kept in place; no nav anchor */}
      <FadeInSection><Features /></FadeInSection>
      <FadeInSection><ContentSection /></FadeInSection>

      {/* FAQ */}
      <div id="faq" className="scroll-mt-24">
        <FadeInSection><FAQsThree /></FadeInSection>
      </div>

      {/* About Us — the developer team behind IskoArena (renamed from "Team") */}
      <div id="about" className="scroll-mt-24">
        <FadeInSection><TeamSection /></FadeInSection>
      </div>

      {/* CTA — Login button (UP maroon) + View Schedules anchor */}
      <FadeInSection>
        <CallToAction onLoginClick={() => setIsLoginOpen(true)} />
      </FadeInSection>

      <FadeInSection><FooterSection /></FadeInSection>

      {/* Decorative Bottom Blur */}
      <div
        className="fixed bottom-0 left-0 right-0 h-28 pointer-events-none z-[50] backdrop-blur-sm [mask-image:linear-gradient(to_top,black_20%,transparent)]"
        aria-hidden="true"
      />

      {/* Login modal — the only auth modal on the public landing (no signup). */}
      <LoginPage
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSubmit={handleLoginSubmit}
      />
    </div>
  );
}
