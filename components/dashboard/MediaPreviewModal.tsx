// Dashboard V2 — Media preview modal.
// Shown when a Headlines card is clicked. Displays the media item (image or
// video), title, sport tag, date, like count, and a link to the full Media page.
// Read-only — no edit/delete/share. Like toggle is wired via tRPC mutation.
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, ExternalLink, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase/client";

// The subset of the trpc.media.getAll item shape we need here.
export type PreviewMediaItem = {
  id: string;
  title: string;
  type: "image" | "video";
  url: string;
  images: { url: string; fileName: string }[];
  sport: string | null;
  createdAt: string;
  likeCount: number;
  userHasLiked: boolean;
};

export function MediaPreviewModal({
  item,
  onClose,
}: {
  item: PreviewMediaItem;
  onClose: () => void;
}) {
  // ── Like state — mirrors the LikeButton pattern in MediaPage ───────────────
  const [liked, setLiked] = useState(item.userHasLiked);
  const [count, setCount] = useState(item.likeCount);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const toggleMutation = trpc.media.toggleLike.useMutation();

  const handleLike = useCallback(() => {
    if (!userId || toggleMutation.isPending) return;
    const prev = { liked, count };
    setLiked(!prev.liked);
    setCount(prev.liked ? prev.count - 1 : prev.count + 1);
    toggleMutation.mutate(
      { mediaId: item.id },
      {
        onSuccess: (r) => { setLiked(r.liked); setCount(r.count); },
        onError:   ()  => { setLiked(prev.liked); setCount(prev.count); },
      }
    );
  }, [userId, liked, count, item.id, toggleMutation]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Pick the best image/video source
  const mediaSrc = item.images[0]?.url ?? item.url;
  const isVideo  = item.type === "video";

  const dateLabel = item.createdAt
    ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
    : "";

  return (
    // Backdrop — click outside closes
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card — click inside stops propagation */}
      <div
        className="relative w-full max-w-lg bg-[#0d0d0d] border border-white/[0.1] rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-lg bg-black/60 hover:bg-black/90 text-white/60 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        {/* Media — max height 400px so tall images don't overflow small screens */}
        <div className="relative w-full bg-black" style={{ maxHeight: 400 }}>
          {isVideo ? (
            // Self-hosted video
            <video
              src={item.url}
              controls
              className="w-full max-h-[400px] object-contain"
            />
          ) : mediaSrc ? (
            <div className="relative w-full aspect-video">
              <Image
                src={mediaSrc}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, 512px"
                className="object-contain"
                priority
              />
            </div>
          ) : (
            // Fallback when no image URL
            <div
              className="w-full aspect-video flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(169,29,58,0.3), #000)" }}
            >
              <Play size={40} className="text-white/20" />
            </div>
          )}
        </div>

        {/* Meta footer */}
        <div className="px-4 py-3.5 flex flex-col gap-2">
          {/* Sport tag + date */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.sport && (
              <span className="bg-ia-accent font-bebas text-[10px] tracking-[0.15em] text-white px-1.5 py-[3px]">
                {item.sport.toUpperCase()}
              </span>
            )}
            {dateLabel && (
              <span className="text-[10px] text-white/35 font-mono">{dateLabel}</span>
            )}
          </div>

          {/* Title */}
          <p className="text-sm font-semibold leading-snug text-white">{item.title}</p>

          {/* Like button + view link */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleLike}
              disabled={!userId || toggleMutation.isPending}
              className={`flex items-center gap-1.5 text-xs transition-colors disabled:opacity-40 ${
                liked ? "text-red-400" : "text-white/40 hover:text-white/70"
              }`}
            >
              <Heart
                size={14}
                fill={liked ? "currentColor" : "none"}
                className={liked ? "scale-110 transition-transform" : ""}
              />
              <span className="font-mono tabular-nums">{count}</span>
            </button>

            <Link
              href="/dashboard/media"
              onClick={onClose}
              className="flex items-center gap-1 text-[11px] text-ia-accent hover:text-ia-accent/80 font-mono tracking-wide transition-colors"
            >
              VIEW ON MEDIA
              <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
