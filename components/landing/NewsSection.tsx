"use client";

// News — masonry-style news grid. Top row: 1 featured (1.4fr) + 2 secondary
// stacked (1fr). Bottom row: 2 cards side-by-side. Replaces components/news-carousel.tsx.
//
// V1 STATUS: NEWS data is mock (5 articles) in components/landing/_data.ts.
// TODO: ingest from a CMS or `news` Supabase table. Tag accent colors live in
// NEWS_TAG_COLORS — extend the map when new tags are added.

import React from "react";
import Image from "next/image";
import { NEWS, NEWS_TAG_COLORS, type NewsArticle } from "./_data";
import SectionLabel from "./SectionLabel";

// Single news card. `featured` makes it taller (16:9) with bigger headline (28px).
// Otherwise compact (16:10, 20px headline).
function NewsCard({ article, featured = false }: { article: NewsArticle; featured?: boolean }) {
  const tagColor = NEWS_TAG_COLORS[article.tag] ?? "#A91D3A";

  return (
    <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[14px] border border-white/[0.06] bg-ia-card transition-all duration-[250ms] hover:-translate-y-1 hover:border-white/15">
      {/* Image header — uses the article photo, or a typographic fallback when img is null */}
      <div
        className={`relative overflow-hidden bg-[#111] ${
          featured ? "aspect-[16/9]" : "aspect-[16/10]"
        }`}
      >
        {article.img ? (
          <Image
            src={article.img}
            alt={article.title}
            fill
            className="object-cover [filter:grayscale(0.15)_brightness(0.85)] transition-transform duration-[600ms] group-hover:scale-105"
          />
        ) : (
          // Fallback panel — diagonal tag-tinted gradient + repeating hairline pattern + giant tag word
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${tagColor}22, #0a0a0a),
                           repeating-linear-gradient(45deg, transparent 0 20px, rgba(255,255,255,0.02) 20px 21px)`,
            }}
          >
            <span
              className="font-bebas text-[42px] tracking-[2px] opacity-50"
              style={{ color: tagColor }}
            >
              {article.tag.toUpperCase()}
            </span>
          </div>
        )}

        {/* Tag pill — top-left, in the tag's accent color */}
        <div className="absolute left-3.5 top-3.5">
          <span
            className="inline-block rounded px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[2px] text-white"
            style={{ background: tagColor }}
          >
            {article.tag.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Body — headline + meta row (author / date / read time) */}
      <div
        className={`flex flex-1 flex-col justify-between ${
          featured ? "px-7 py-6" : "px-5 py-5"
        }`}
      >
        <h3
          className={`mb-3 font-bebas leading-[1.1] tracking-[0.5px] text-[#f0f0f0] ${
            featured ? "text-[28px]" : "text-xl"
          }`}
        >
          {article.title}
        </h3>

        <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.05] pt-3">
          <span className="text-[11px] text-white/40">{article.author}</span>
          <div className="flex gap-3">
            <span className="text-[11px] text-white/30">{article.date}</span>
            <span className="text-[11px] text-ia-gold">{article.read}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsSection() {
  return (
    <section
      id="news"
      className="border-t border-white/[0.05] bg-ia-bg-alt px-6 py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Header row — eyebrow + headline on the left, "View All" pill on the right */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <SectionLabel>Latest News</SectionLabel>
            <h2 className="font-bebas text-[clamp(44px,6vw,80px)] leading-none tracking-[1px] text-[#f0f0f0]">
              From the Arena
            </h2>
          </div>
          <button
            type="button"
            className="rounded-lg border border-white/15 bg-transparent px-5 py-2.5 text-[13px] font-medium text-white/65 transition-colors hover:border-white/30 hover:text-[#f0f0f0]"
          >
            View All Articles →
          </button>
        </div>

        {/* Top row — featured (1.4fr) + 2 stacked (1fr). Collapses to single col on mobile. */}
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-[1.4fr_1fr]">
          <NewsCard article={NEWS[0]} featured />
          <div className="flex flex-col gap-5">
            <NewsCard article={NEWS[1]} />
            <NewsCard article={NEWS[2]} />
          </div>
        </div>

        {/* Bottom row — 2 cards side-by-side. Single col on mobile. */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <NewsCard article={NEWS[3]} />
          <NewsCard article={NEWS[4]} />
        </div>
      </div>
    </section>
  );
}
