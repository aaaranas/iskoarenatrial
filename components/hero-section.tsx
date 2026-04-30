"use client";

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from './header'
import type { Variants } from "motion/react";

const transitionVariants: {
  item: Variants;
} = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

// Login-only public landing — signup removed (admins issue credentials).
interface HeroSectionProps {
    onLoginClick: () => void;
}

// Number of placeholder boxes shown until marketing supplies real sponsor logos.
const SPONSOR_SLOT_COUNT = 8;

// Smooth-scrolls to a section by id (used by hero pill + "View Schedules").
const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function HeroSection({ onLoginClick }: HeroSectionProps) {
    return (
        <>
            <HeroHeader onLoginClick={onLoginClick} />

            {/* id="top" — header logo click smooth-scrolls back here */}
            <main id="top" className="overflow-hidden relative">
                {/* Background Image Layer */}
                <div className="pointer-events-none absolute inset-0 ">
                    <Image
                        src="/bg.png"
                        alt="background"
                        fill
                        className="object-cover object-top blur-sm"
                        priority
                    />
                </div>

                <section>
                    <div className="relative pt-24 md:pt-36">
                        {/* Radial overlay to ensure text contrast */}
                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    {/* "Iskolaro Season Has Begun" — now scrolls to the News section */}
                                    <button
                                        type="button"
                                        onClick={() => scrollToId('news')}
                                        aria-label="Jump to latest news"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950 cursor-pointer">
                                        <span className="text-foreground text-sm">Iskolaro Season Has Begun</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>
                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                </AnimatedGroup>

                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h1"
                                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                    Elevating the UP Cebu Iskolaro Experience
                                </TextEffect>

                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.5}
                                    as="p"
                                    className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                    Follow live scores, standings, and highlights from the UP Cebu Intramurals — anytime, anywhere.
                                </TextEffect>

                                {/* Hero CTAs: Login (admins only) + View Schedules (anchor) */}
                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">

                                    <div key={1} className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                                        {/* UP maroon (#7B1113) primary — landing page only */}
                                        <Button
                                            onClick={onLoginClick}
                                            size="lg"
                                            className="rounded-xl px-5 text-base bg-[#7B1113] text-white hover:bg-[#5C0D0F]">
                                            <span className="text-nowrap">Login</span>
                                        </Button>
                                    </div>

                                    <Button
                                        key={2}
                                        onClick={() => scrollToId('schedules')}
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <span className="text-nowrap">View Schedules</span>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        {/* NOTE: Dashboard screenshot block removed (Task #4) — the embedded Schedules
                            section in LandingPage shows real match data, so a fake preview is redundant. */}
                    </div>
                </section>

                {/* Sponsors section — placeholder slots until marketing supplies real logos (Task #5) */}
                <section id="sponsors" className="bg-background pb-16 pt-16 md:pb-32 scroll-mt-24">
                    <div className="m-auto max-w-5xl px-6">
                        <div className="text-center mb-10">
                            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7B1113] mb-3">
                                <span className="w-6 h-0.5 bg-[#7B1113] inline-block" />
                                Our Partners
                            </span>
                            <h2 className="text-3xl md:text-4xl font-semibold">Powered By Our Sponsors</h2>
                            <p className="text-muted-foreground mt-3 text-sm">Sponsorship slots are open. Logos coming soon.</p>
                        </div>
                        {/* Dashed placeholder boxes — swap each for a real <img> when logos arrive */}
                        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
                            {Array.from({ length: SPONSOR_SLOT_COUNT }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex h-20 items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.02] text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                                >
                                    Sponsor Slot
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
