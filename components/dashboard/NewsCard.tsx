// Dashboard V2 — Headlines card backed by real media uploads.
// Same visual: 110px photo header + sport tag chip + title + date footer.
// Clicking the card calls onClick so the parent can open MediaPreviewModal.
"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import type { PreviewMediaItem } from "./MediaPreviewModal";

export function NewsCard({
  item,
  onClick,
}: {
  item: PreviewMediaItem;
  onClick: () => void;
}) {
  // Use the first image in the images array, then fall back to the bare URL.
  // Videos and image-only uploads both end up with something to show.
  const imgSrc = item.images[0]?.url ?? (item.type === "image" ? item.url : null);

  const dateLabel = item.createdAt
    ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-lg"
    >
      {/* Photo header — 110px, gradient fade-to-dark + tag chip */}
      <div className="relative h-[110px] overflow-hidden bg-zinc-900">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover"
          />
        ) : (
          // Gradient fallback for video-only posts without a thumbnail
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(169,29,58,0.33), rgba(212,175,55,0.13), #000)",
            }}
          />
        )}
        {/* Bottom fade — keeps tag chip legible on light photos */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)" }}
        />
        {/* Sport tag chip — maroon block, top-left */}
        <div className="absolute top-2 left-2 bg-ia-accent px-1.5 py-[3px] font-bebas text-[10px] tracking-[0.15em] text-white">
          {(item.sport ?? "MEDIA").toUpperCase()}
        </div>
      </div>

      {/* Body — min-height on title keeps 3-up grid aligned */}
      <div className="p-3">
        <div className="font-semibold text-[13px] leading-[1.35] text-white min-h-[54px] line-clamp-3">
          {item.title}
        </div>
        {dateLabel && (
          <div className="mt-2 text-[10px] text-white/35 font-mono tracking-[0.05em]">
            {dateLabel}
          </div>
        )}
      </div>
    </button>
  );
}
