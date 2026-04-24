"use client";

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronRight } from 'lucide-react'
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

interface HeroSectionProps {
    onLoginClick: () => void;
    onSignupClick: () => void;
}

export default function HeroSection({ onLoginClick, onSignupClick }: HeroSectionProps) {
    return (
        <>
            {/* Pass the props to the Navigation Header */}
            <HeroHeader onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
            
            <main className="overflow-hidden relative">
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
                                    <div className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950 cursor-pointer">
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
                                    </div>
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
                                        <Button
                                            onClick={onSignupClick}
                                            size="lg"
                                            className="rounded-xl px-5 text-base">
                                            <span className="text-nowrap">Join The Action</span>
                                        </Button>
                                    </div>

                                    <Button
                                        key={2}
                                        onClick={onLoginClick}
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <span className="text-nowrap">View Schedules</span>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        {/* App Screenshot Section */}
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
                            }}>
			    {/* Container: Moved the mask here for the 'Transition' effect */}
			    <div className="relative mt-8 px-4 sm:mt-12 md:mt-20 z-20">
    <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background/20 relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 p-2 shadow-2xl ring-1">
        <Image
            className="aspect-15/8 relative rounded-xl [mask-image:linear-gradient(to_bottom,black_20%,transparent_90%))]"
            src="/app_screenshot.png"
            alt="IskoArena Dashboard"
            width="2700"
            height="1440"
        />
    </div>
</div>
                        </AnimatedGroup>
                    </div>
                </section>

                {/* Customer Logo Section */}
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <Link href="/" className="block text-sm duration-150 hover:opacity-75">
                                <span> Meet Our Partners</span>
                                <ChevronRight className="ml-1 inline-block size-3" />
                            </Link>
                        </div>
                        {/* TODO: Replace these placeholder logos with actual IskoArena
                             partners/sponsors stored in /public/logos/             */}
                        <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
                            <div className="flex">
                                <Image className="mx-auto dark:invert" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia Logo" width={80} height={20} unoptimized />
                            </div>
                            <div className="flex">
                                <Image className="mx-auto dark:invert" src="https://html.tailus.io/blocks/customers/column.svg" alt="Column Logo" width={80} height={16} unoptimized />
                            </div>
                            <div className="flex">
                                <Image className="mx-auto dark:invert" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub Logo" width={80} height={16} unoptimized />
                            </div>
                            <div className="flex">
                                <Image className="mx-auto dark:invert" src="https://html.tailus.io/blocks/customers/nike.svg" alt="Nike Logo" width={80} height={20} unoptimized />
                            </div>
                            <div className="flex">
                                <Image className="mx-auto dark:invert" src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg" alt="Lemon Squeezy Logo" width={80} height={20} unoptimized />
                            </div>
                            <div className="flex">
                                <Image className="mx-auto dark:invert" src="https://html.tailus.io/blocks/customers/laravel.svg" alt="Laravel Logo" width={80} height={16} unoptimized />
                            </div>
                            <div className="flex">
                                <Image className="mx-auto dark:invert" src="https://html.tailus.io/blocks/customers/lilly.svg" alt="Lilly Logo" width={80} height={28} unoptimized />
                            </div>
                            <div className="flex">
                                <Image className="mx-auto dark:invert" src="https://html.tailus.io/blocks/customers/openai.svg" alt="OpenAI Logo" width={80} height={24} unoptimized />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
