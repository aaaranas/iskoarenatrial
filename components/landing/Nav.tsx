"use client";

// Public landing's top navigation — replaces components/header.tsx.
// Sticky, transparent over the hero, fades to a blurred translucent pill
// after scrolling past the hero (~60px). Logo + 6 anchor links + maroon Login button.
//
// Anchor targets (#matches, #standings, etc.) point at sections that may not
// exist until later phases of the rebuild — that's expected during the phased
// rollout. Links to missing sections are no-ops.

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

// Nav item list mirrors the design's spec.
// Schedules anchors to #matches because the section is "MatchesTodaySection".
const NAV_ITEMS = [
  { label: "Schedules", href: "#matches" },
  { label: "Standings", href: "#standings" },
  { label: "Spotlight", href: "#spotlight" },
  { label: "News", href: "#news" },
  { label: "Sports", href: "#sports" },
  { label: "Team", href: "#team" },
];

interface NavProps {
  // Triggered by the Login button — LandingPage opens the LoginModal.
  onLoginClick: () => void;
}

export default function Nav({ onLoginClick }: NavProps) {
  // Tracks scroll position so the nav can morph from transparent to a frosted pill.
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Threshold matches the design (60px). Passive listener for scroll perf.
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Smooth-scroll to a section by id, also closing the mobile menu if open.
  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.getElementById(href.replace("#", ""));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Logo click returns to the very top of the page.
  const scrollToTop = () => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    // Fixed wrapper — z-100 sits below the LoginModal (z-200) but above all sections.
    <header className="fixed inset-x-0 top-0 z-[100]">
      <nav
        // Inline transition on the morphing values — Tailwind handles classes
        // but the conditional border + bg + radius is cleaner read this way.
        className={`mx-auto mt-2 max-w-[1280px] px-5 transition-all duration-300 ${
          scrolled
            ? "rounded-2xl border border-white/10 bg-ia-bg/85 backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        }`}
      >
        <div className="flex h-16 items-center justify-between">
          {/* Logo button — image + Bebas wordmark, scrolls to top */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="IskoArena — back to top"
            className="flex items-center gap-2.5"
          >
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              // Silences Next's width/height-modified warning (see Hero for details)
              style={{ width: "auto", height: "auto" }}
              className="object-contain"
            />
            <span className="font-bebas text-[22px] tracking-[2px] text-[#f0f0f0]">
              IskoArena
            </span>
          </button>

          {/* Desktop nav links — hidden below md to make room for the hamburger */}
          <ul className="hidden gap-7 md:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => scrollTo(item.href)}
                  className="py-1 text-[13px] font-medium tracking-[0.3px] text-white/55 transition-colors hover:text-[#f0f0f0]"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right side: Login button (always visible) + mobile hamburger */}
          <div className="flex items-center gap-3">
            {/* UP maroon Login — only auth entry on the public landing */}
            <button
              type="button"
              onClick={onLoginClick}
              className="rounded-lg bg-ia-maroon px-5 py-2 text-sm font-semibold tracking-[0.3px] text-white transition-colors hover:bg-[#5C0000]"
            >
              Login
            </button>

            {/* Hamburger — only shows below md */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="text-[#f0f0f0] md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown — only renders when the hamburger is toggled open */}
        {mobileOpen && (
          <div className="border-t border-white/10 py-4 md:hidden">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => scrollTo(item.href)}
                className="block w-full px-1 py-3 text-left text-[15px] text-white/70 hover:text-[#f0f0f0]"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
