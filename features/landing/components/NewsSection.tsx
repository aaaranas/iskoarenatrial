"use client";

// News — masonry-style media grid. Surfaces the latest image uploads from
// the media page as news-like cards. Videos are excluded (images only).
//
// Layout (same as the mock design):
//   Top row:    1 featured (1.4fr) + 2 stacked (1fr) — first 3 items
//   Bottom row: up to 2 cards side-by-side — items 4-5
// Section is hidden when there are no image uploads yet.

import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { NEWS_TAG_COLORS } from "./data";
import { formatMatchDate } from "@/lib/format-match-date";
import SectionLabel from "./SectionLabel";

// Local card shape derived from media items.
interface MediaCard {
  id: string;
  tag: string;    // item.tag || item.sport || "Media"
  title: string;
  date: string;   // formatted from createdAt
  img: string;    // url — images only, so this is always present
}

// Single news card — kept visually identical to the V1 mock card.
// `featured` makes it taller (16:9) with bigger headline.
function NewsCard({ card, featured = false }: { card: MediaCard; featured?: boolean }) {
  const tagColor = NEWS_TAG_COLORS[card.tag] ?? "#A91D3A";

  return (
    <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[14px] border border-white/[0.06] bg-ia-card transition-all duration-[250ms] hover:-translate-y-1 hover:border-white/15">
      {/* Image header */}
      <div className={`relative overflow-hidden bg-[#111] ${featured ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
        <Image
          src={card.img}
          alt={card.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
          className="object-cover [filter:grayscale(0.15)_brightness(0.85)] transition-transform duration-[600ms] group-hover:scale-105"
        />
        {/* Tag pill */}
        <div className="absolute left-3.5 top-3.5">
          <span
            className="inline-block rounded px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[2px] text-white"
            style={{ background: tagColor }}
          >
            {card.tag.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Body — headline + meta */}
      <div className={`flex flex-1 flex-col justify-between ${featured ? "px-7 py-6" : "px-5 py-5"}`}>
        <h3 className={`mb-3 font-bebas leading-[1.1] tracking-[0.5px] text-[#f0f0f0] ${featured ? "text-[28px]" : "text-xl"}`}>
          {card.title}
        </h3>
        <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.05] pt-3">
          <span className="text-[11px] text-white/40">IskoArena</span>
          <span className="text-[11px] text-white/30">{card.date}</span>
        </div>
      </div>
    </div>
  );
}

export default function NewsSection() {
  const { data: mediaData, isLoading } = trpc.media.getAll.useQuery();

  // Filter to images only, take the latest 5.
  const cards: MediaCard[] = React.useMemo(() => {
    if (!mediaData) return [];
    return (mediaData as Array<any>)
      .filter((m) => m.type === "image")
      .slice(0, 5)
      .map((m) => ({
        id:    m.id,
        tag:   m.tag || m.sport || "Media",
        title: m.title,
        date:  formatMatchDate(m.createdAt),
        img:   m.url,
      }));
  }, [mediaData]);

  // Hide the section while loading and when there are no image uploads yet.
  // No placeholder or empty state is shown on the public landing page.
  if (isLoading || cards.length === 0) return null;

  return (
    <section id="news" className="border-t border-white/[0.05] bg-ia-bg-alt px-6 py-28">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <SectionLabel>Latest Media</SectionLabel>
            <h2 className="font-bebas text-[clamp(44px,6vw,80px)] leading-none tracking-[1px] text-[#f0f0f0]">
              From the Arena
            </h2>
          </div>
          {/* "View All" links to the media page — available once logged in */}
          <a
            href="/dashboard/media"
            className="rounded-lg border border-white/15 bg-transparent px-5 py-2.5 text-[13px] font-medium text-white/65 transition-colors hover:border-white/30 hover:text-[#f0f0f0]"
          >
            View All Media →
          </a>
        </div>

        {/* Top row — featured + 2 stacked (only when we have ≥ 3 items) */}
        {cards.length >= 3 ? (
          <>
            <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-[1.4fr_1fr]">
              <NewsCard card={cards[0]} featured />
              <div className="flex flex-col gap-5">
                <NewsCard card={cards[1]} />
                <NewsCard card={cards[2]} />
              </div>
            </div>
            {/* Bottom row — remaining items (4th and 5th) */}
            {cards.length >= 4 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {cards.slice(3).map((c) => (
                  <NewsCard key={c.id} card={c} />
                ))}
              </div>
            )}
          </>
        ) : (
          // Fewer than 3 images — simple grid (1 or 2 cards)
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {cards.map((c) => (
              <NewsCard key={c.id} card={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
