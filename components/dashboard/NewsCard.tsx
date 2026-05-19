// Dashboard V2 — Headlines card. 110px photo header + tag chip + title + meta footer.
// When no photo is provided, falls back to a diagonal maroon/gold gradient panel.
"use client";

import Image from "next/image";
import type { NewsItem } from "./dashboard-data";

export function NewsCard({ news }: { news: NewsItem }) {
  return (
    <div
      className="bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-lg"
    >
      {/* Photo header — 110px tall, with gradient fade + tag chip overlay */}
      <div className="relative h-[110px] overflow-hidden bg-zinc-900">
        {news.img ? (
          <Image
            src={news.img}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover"
          />
        ) : (
          // Gradient fallback for news items without a photo
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(169,29,58,0.33), rgba(212,175,55,0.13), #000)",
            }}
          />
        )}
        {/* Bottom-fade so the tag chip stays legible if the photo is light at the top */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)" }}
        />
        {/* Top-left tag chip — maroon block, broadcast caps */}
        <div className="absolute top-2 left-2 bg-ia-accent px-1.5 py-[3px] font-bebas text-[10px] tracking-[0.15em] text-white">
          {news.tag.toUpperCase()}
        </div>
      </div>

      {/* Body — fixed min-height on title so 3-up grid stays aligned */}
      <div className="p-3">
        <div className="font-semibold text-[13px] leading-[1.35] text-white min-h-[54px]">
          {news.title}
        </div>
        <div className="mt-2 text-[10px] text-white/35 font-mono tracking-[0.05em] flex gap-2">
          <span>{news.date.toUpperCase()}</span>
          <span>·</span>
          <span>{news.read.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
