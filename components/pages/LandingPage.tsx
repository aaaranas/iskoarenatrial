"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client"; // Your Supabase client
import { trpc } from "@/utils/trpc"; // Your tRPC hooks
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
import SignupPage from "@/components/sign-up";
import NewsCarousel from "@/components/news-carousel";
import FadeInSection from "@/components/fade-in-section"; 

interface LandingPageProps {
  onLogin?: (admin: Admin) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const router = useRouter();
  const utils = trpc.useUtils(); // Used to refresh auth state in tRPC cache
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // --- SUPABASE LOGIN HANDLER ---
  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 1. Refresh tRPC auth session cache
      await utils.auth.getSession.invalidate();

      // 2. Redirect to Compendium
      setIsLoginOpen(false);
      router.push("/dashboard"); 
      
      return { success: true, message: "Initialization successful." };
    } catch (error: any) {
      return { success: false, message: error.message || "Invalid credentials." };
    }
  };

  // --- SUPABASE SIGNUP HANDLER ---
  const handleSignupSubmit = async (fullName: string, email: string, password: string, role: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role, // This triggers your SQL profile creation function
          },
        },
      });

      if (error) throw error;

      // Logic: If user is created, show success and flip to login modal
      setTimeout(() => {
        setIsSignupOpen(false);
        setIsLoginOpen(true);
      }, 2000);

      return { 
        success: true, 
        message: "Account initialized. Please check your email to verify." 
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950">
      <HeroSection
        onLoginClick={() => setIsLoginOpen(true)}
        onSignupClick={() => setIsSignupOpen(true)}
      />
	
      <FadeInSection><NewsCarousel /></FadeInSection>
      <FadeInSection><Features /></FadeInSection>
      <FadeInSection><ContentSection /></FadeInSection>
      <FadeInSection><FAQsThree /></FadeInSection>
      <FadeInSection><TeamSection /></FadeInSection>
      <FadeInSection><CallToAction /></FadeInSection>
      <FadeInSection><FooterSection /></FadeInSection>

      {/* Decorative Bottom Blur */}
      <div
        className="fixed bottom-0 left-0 right-0 h-28 pointer-events-none z-[50] backdrop-blur-sm [mask-image:linear-gradient(to_top,black_20%,transparent)]"
        aria-hidden="true"
      />

      {/* Auth Modals */}
      <LoginPage
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSubmit={handleLoginSubmit} // Now Async/Supabase
        onToggleSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <SignupPage
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSubmit={handleSignupSubmit} // Now Async/Supabase + Role
        onToggleLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
}
