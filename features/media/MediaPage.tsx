"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Grid3X3, Film, Plus, Play, Image as ImageIcon, LayoutList,
  Heart, Share2, Bookmark, Camera, X, Upload,
  ChevronLeft, ChevronRight, Loader2, Pencil, Trash2, Check,
  BookMarked, Search, Zap, MessageCircle, Send, Eye,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/providers/RoleProvider";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaImage = { url: string; fileName: string };

type MediaItem = {
  id: string;
  title: string;
  type: "image" | "video";
  url: string;
  fileName: string;
  images: MediaImage[];
  caption: string | null;
  tag: string | null;
  size: string | null;
  sport: string | null;
  sportId: string | null;
  matchId: string | null;
  createdAt: string;
  likeCount: number;
  userHasLiked: boolean;
};

type HighlightSlide = {
  id: string;
  emoji: string | null;
  text: string | null;
  imageUrl: string | null;
  mediaId: string | null;
  order: number;
};

type Highlight = {
  id: string;
  label: string;
  color: string;
  college: string | null;
  coverUrl: string | null;
  createdAt: string;
  slides: HighlightSlide[];
};

type CommentRow = { id: string; user_id: string; user_name: string; content: string; created_at: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const MEDIA_BUCKET = "media";

const COLOR_OPTIONS = [
  { label: "Brand",  value: "from-[#A91D3A] to-[#741029]"  },
  { label: "Red",    value: "from-red-700 to-rose-500"      },
  { label: "Purple", value: "from-purple-800 to-violet-600" },
  { label: "Gold",   value: "from-yellow-700 to-amber-500"  },
  { label: "Teal",   value: "from-teal-700 to-emerald-500"  },
  { label: "Orange", value: "from-red-600 to-orange-500"    },
  { label: "Blue",   value: "from-blue-800 to-cyan-600"     },
];

const TAGS_POST = ["FINALS", "SEMI-FINALS", "QUARTERFINALS", "RECORD BROKEN", "OPENING", "CLOSING", "DAY 1", "DAY 2", "DAY 3"];
const TAGS_REEL = ["HIGHLIGHTS", "COMPILATION", "BEST MOMENTS", "BEHIND THE SCENES", "CEREMONY"];
const COLLEGES  = ["COS", "CSS", "SOM", "CCAD"] as const;

const SPORT_CONFIG: Record<string, { gradient: string; accent: string; glow: string }> = {
  Basketball: { gradient: "from-orange-950 via-red-900 to-orange-950", accent: "#F97316", glow: "rgba(249,115,22,0.3)" },
  Volleyball: { gradient: "from-purple-950 via-violet-900 to-purple-950", accent: "#A855F7", glow: "rgba(168,85,247,0.3)" },
  Swimming:   { gradient: "from-blue-950 via-cyan-900 to-blue-950", accent: "#06B6D4", glow: "rgba(6,182,212,0.3)" },
  Badminton:  { gradient: "from-green-950 via-emerald-900 to-green-950", accent: "#10B981", glow: "rgba(16,185,129,0.3)" },
  default:    { gradient: "from-zinc-950 via-zinc-900 to-zinc-950", accent: "#A91D3A", glow: "rgba(169,29,58,0.3)" },
};

function sportConfig(sport: string | null) {
  if (!sport) return SPORT_CONFIG.default;
  return SPORT_CONFIG[sport] ?? SPORT_CONFIG.default;
}

// ─── Like Button (optimistic, count from server) ─────────────────────────────

function LikeButton({ mediaId, initialCount = 0, initialLiked = false, size = 18, className = "" }: {
  mediaId: string; initialCount?: number; initialLiked?: boolean; size?: number; className?: string;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [userId, setUserId] = useState<string | null>(null);

  // onSuccess/onError for revert live in mutate() call — see toggle()
  const toggleMutation = trpc.media.toggleLike.useMutation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // H2: gate sync on isPending so an in-flight optimistic update is never overwritten
  useEffect(() => { if (!toggleMutation.isPending) setLiked(initialLiked); }, [initialLiked, toggleMutation.isPending]);
  useEffect(() => { if (!toggleMutation.isPending) setCount(initialCount); }, [initialCount, toggleMutation.isPending]);

  // H3: subscribe for every visitor (anon included) — userId only used inside to dedupe self
  useEffect(() => {
    const channel = supabase
      .channel(`media_likes:${mediaId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "media_likes", filter: `media_id=eq.${mediaId}` }, (payload) => {
        if (payload.eventType === "INSERT") {
          const uid = (payload.new as any).user_id;
          if (uid !== userId) setCount(c => c + 1);
        }
        if (payload.eventType === "DELETE") {
          const uid = (payload.old as any).user_id;
          if (uid !== userId) setCount(c => Math.max(0, c - 1));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mediaId, userId]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || toggleMutation.isPending) return;
    // Snapshot pre-click state so the revert in onError is correct
    const prevLiked = liked;
    const prevCount = count;
    // Optimistic update
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));
    toggleMutation.mutate({ mediaId }, {
      // Server-authoritative values replace the optimistic ones
      onSuccess: (result) => { setLiked(result.liked); setCount(result.count); },
      // Revert to the snapshot captured at click time — not the closure
      onError: (err) => { setLiked(prevLiked); setCount(prevCount); toast.error(err.message); },
    });
  };

  return (
    <button onClick={toggle} disabled={toggleMutation.isPending || !userId}
      className={`flex items-center gap-1.5 transition-all duration-200 disabled:opacity-40 ${liked ? "text-red-400" : "text-zinc-600 hover:text-zinc-300"} ${className}`}>
      <Heart size={size} fill={liked ? "currentColor" : "none"} className={liked ? "scale-110" : ""} />
      {count > 0 && <span className="text-xs tabular-nums">{count}</span>}
    </button>
  );
}

// ─── Comments Section (DB-backed + Realtime) ──────────────────────────────────

function CommentsSection({ mediaId, isAdmin }: { mediaId: string; isAdmin: boolean }) {
  const [comments,   setComments]   = useState<CommentRow[]>([]);
  const [text,       setText]       = useState("");
  const [userId,     setUserId]     = useState<string | null>(null);
  const [userName,   setUserName]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser()
      .then(async ({ data }) => {
        const uid = data.user?.id ?? null;
        setUserId(uid);
        if (uid) {
          const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle();
          setUserName((profile as any)?.full_name || data.user?.email?.split("@")[0] || "User");
        }
      })
      .catch((e) => console.error("[CommentsSection] auth fetch failed", e));

    // async IIFE so .catch() lands on a real Promise — Supabase query builder returns PromiseLike, not Promise
    (async () => {
      const { data, error } = await supabase.from("media_comments")
        .select("id, user_id, user_name, content, created_at")
        .eq("media_id", mediaId).order("created_at", { ascending: true });
      if (error) { console.error("[CommentsSection] comments fetch error", error); return; }
      if (Array.isArray(data)) setComments(data as CommentRow[]);
    })().catch((e) => console.error("[CommentsSection] comments fetch failed", e));

    const channel = supabase.channel(`media_comments:${mediaId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "media_comments", filter: `media_id=eq.${mediaId}` },
        payload => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as CommentRow;
            setComments(c => c.some(r => r.id === row.id) ? c : [...c, row]);
          }
          if (payload.eventType === "DELETE") {
            setComments(c => c.filter(r => r.id !== (payload.old as any).id));
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [mediaId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  const submit = async () => {
    if (!text.trim() || !userId || submitting) return;
    setSubmitting(true);
    const content = text.trim();
    const { error } = await supabase.from("media_comments").insert({
      media_id: mediaId, user_id: userId, user_name: userName, content,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setText("");
      // realtime INSERT handler adds the new comment automatically
    }
    setSubmitting(false);
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("media_comments").delete().eq("id", id);
    if (!error) setComments(c => c.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 min-h-0">
        {comments.length === 0 && (
          <p className="text-zinc-700 text-xs text-center py-6 italic">No comments yet. Be the first!</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="group flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-400 select-none">
              {c.user_name[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-white text-xs font-semibold">{c.user_name}</span>
                <span className="text-zinc-600 text-[10px]">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed mt-0.5 break-words">{c.content}</p>
            </div>
            {(isAdmin || c.user_id === userId) && (
              <button onClick={() => deleteComment(c.id)}
                className="opacity-0 group-hover:opacity-100 shrink-0 w-5 h-5 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-all">
                <X size={10} />
              </button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 px-3 py-2.5 border-t border-zinc-800/60">
        {userId ? (
          <div className="flex items-center gap-2">
            <input
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all"
              placeholder="Add a comment…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            />
            <button onClick={submit} disabled={!text.trim() || submitting}
              className="w-7 h-7 rounded-full bg-[#A91D3A] hover:bg-[#c4223f] disabled:opacity-40 flex items-center justify-center text-white transition-all shrink-0">
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            </button>
          </div>
        ) : (
          <p className="text-zinc-600 text-xs text-center">Sign in to comment</p>
        )}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const selectCls = "w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all appearance-none cursor-pointer";
const inputCls  = "w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all";
const labelCls  = "block text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.12em] mb-1.5";

// ─── Sport Dropdown ───────────────────────────────────────────────────────────

function SportDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data: sports, isLoading } = trpc.sport.getAll.useQuery();
  return (
    <div>
      <label className={labelCls}>Sport</label>
      {isLoading
        ? <div className={`${inputCls} text-zinc-600 flex items-center gap-2`}><Loader2 size={12} className="animate-spin" /> Loading…</div>
        : <select className={selectCls} value={value} onChange={e => onChange(e.target.value)}>
            <option value="">All sports</option>
            {(sports ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
      }
    </div>
  );
}

// ─── Highlight Viewer ─────────────────────────────────────────────────────────

function HighlightViewer({ highlights, startIndex, onClose, onDelete, isAdmin }: {
  highlights: Highlight[]; startIndex: number; onClose: () => void; onDelete: (id: string) => void; isAdmin: boolean;
}) {
  const [hlIdx,    setHlIdx]    = useState(startIndex);
  const [slideIdx, setSlideIdx] = useState(0);
  const [paused,   setPaused]   = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hl          = highlights[hlIdx];
  const slide       = hl?.slides[slideIdx];
  const totalSlides = hl?.slides.length ?? 0;

  const goNext = useCallback(() => {
    setProgress(0);
    if (slideIdx < totalSlides - 1) setSlideIdx(s => s + 1);
    else if (hlIdx < highlights.length - 1) { setHlIdx(h => h + 1); setSlideIdx(0); }
    else onClose();
  }, [slideIdx, hlIdx, totalSlides, highlights.length, onClose]);

  const goPrev = useCallback(() => {
    setProgress(0);
    if (slideIdx > 0) setSlideIdx(s => s - 1);
    else if (hlIdx > 0) { setHlIdx(h => h - 1); setSlideIdx(highlights[hlIdx - 1].slides.length - 1); }
  }, [slideIdx, hlIdx, highlights]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setProgress(p => { if (p >= 100) { goNext(); return 0; } return p + 2.86; });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slideIdx, hlIdx, paused, goNext]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "Escape")     onClose();
      if (e.key === " ")          setPaused(p => !p);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev, onClose]);

  if (!hl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.97)", backdropFilter: "blur(24px)" }}
      onClick={onClose}>
      <div className="relative w-full max-w-[360px] rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
        style={{ aspectRatio: "9/16" }}
        onClick={e => e.stopPropagation()}
        onMouseDown={() => setPaused(true)} onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>

        {/* Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${hl.color}`} />
        {slide?.imageUrl && <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/70" />

        {/* Progress — dims when paused */}
        <div className={`absolute top-5 left-4 right-4 z-20 flex gap-1.5 transition-opacity duration-200 ${paused ? "opacity-40" : "opacity-100"}`}>
          {hl.slides.map((_, i) => (
            <div key={i} className="flex-1 h-[2px] rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-none"
                style={{ width: i < slideIdx ? "100%" : i === slideIdx ? `${progress}%` : "0%" }} />
            </div>
          ))}
        </div>

        {/* Pause indicator */}
        {paused && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-xl select-none">⏸</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="absolute top-10 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${hl.color} ring-2 ring-white/30 overflow-hidden`}>
              {hl.coverUrl && <img src={hl.coverUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <div>
              <p className="text-white text-xs font-bold">{hl.label}</p>
              <p className="text-white/40 text-[10px]">{slideIdx + 1} / {totalSlides}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {isAdmin && (
              <button onClick={e => { e.stopPropagation(); onDelete(hl.id); onClose(); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/60 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-all">
                <Trash2 size={12} />
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-all">
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 px-8">
          {slide?.emoji && <span className="text-8xl drop-shadow-2xl select-none" style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))" }}>{slide.emoji}</span>}
          {slide?.text  && <p className="text-white font-bold text-xl text-center leading-snug drop-shadow-xl">{slide.text}</p>}
        </div>

        {/* Tap zones */}
        <button className="absolute left-0 top-0 w-1/3 h-full z-10" onClick={e => { e.stopPropagation(); goPrev(); }} />
        <button className="absolute right-0 top-0 w-1/3 h-full z-10" onClick={e => { e.stopPropagation(); goNext(); }} />

        {/* Nav arrows */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 pointer-events-none opacity-40">
          {(hlIdx > 0 || slideIdx > 0) && <ChevronLeft size={22} className="text-white" />}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 pointer-events-none opacity-40">
          <ChevronRight size={22} className="text-white" />
        </div>

        {/* Dots */}
        {highlights.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-1.5">
            {highlights.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setHlIdx(i); setSlideIdx(0); setProgress(0); }}
                className={`h-1 rounded-full transition-all duration-300 ${i === hlIdx ? "bg-white w-6" : "bg-white/30 w-1.5"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/20 text-[10px]">
        <span>← → navigate</span>
        <span>·</span>
        <span>space pause</span>
        <span>·</span>
        <span>esc close</span>
      </div>
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-[0_32px_64px_rgba(0,0,0,0.7)] overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, sub, onClose }: { title: string; sub?: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {sub && <p className="text-zinc-500 text-xs mt-0.5">{sub}</p>}
      </div>
      <button onClick={onClose} className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all">
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Facebook-Style Photo Grid Preview ───────────────────────────────────────

function FacebookGrid({ previews, onRemove, onClick }: { previews: string[]; onRemove?: (i: number) => void; onClick?: () => void }) {
  const n = previews.length;
  if (n === 0) return null;

  const shown = previews.slice(0, 5);
  const extra = n > 5 ? n - 5 : 0;

  function Cell({ idx, flex }: { idx: number; flex?: string }) {
    return (
      <div className="relative overflow-hidden bg-zinc-900" style={{ flex: flex ?? "1", minHeight: 0 }}
        onClick={onClick}>
        <img src={shown[idx]} alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50 pointer-events-none" />
        <img src={shown[idx]} alt="" className="absolute inset-0 w-full h-full object-contain" />
        {onRemove && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove(idx); }}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-600 flex items-center justify-center text-white transition-colors z-10">
            <X size={9} />
          </button>
        )}
        {idx === 4 && extra > 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
            <span className="text-white font-bold text-xl">+{extra}</span>
          </div>
        )}
      </div>
    );
  }

  const H = "320px";

  if (n === 1) return (
    <div className="rounded-xl overflow-hidden" style={{ height: H }}>
      <Cell idx={0} />
    </div>
  );

  if (n === 2) return (
    <div className="flex gap-0.5 rounded-xl overflow-hidden" style={{ height: H }}>
      <Cell idx={0} /><Cell idx={1} />
    </div>
  );

  if (n === 3) return (
    <div className="flex gap-0.5 rounded-xl overflow-hidden" style={{ height: H }}>
      <Cell idx={0} flex="1.5" />
      <div className="flex flex-col gap-0.5" style={{ flex: "1" }}>
        <Cell idx={1} /><Cell idx={2} />
      </div>
    </div>
  );

  if (n === 4) return (
    <div className="flex flex-col gap-0.5 rounded-xl overflow-hidden" style={{ height: H }}>
      <div className="flex gap-0.5" style={{ flex: "1" }}><Cell idx={0} /><Cell idx={1} /></div>
      <div className="flex gap-0.5" style={{ flex: "1" }}><Cell idx={2} /><Cell idx={3} /></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-0.5 rounded-xl overflow-hidden" style={{ height: H }}>
      <div className="flex gap-0.5" style={{ flex: "1" }}><Cell idx={0} /><Cell idx={1} /></div>
      <div className="flex gap-0.5" style={{ flex: "1" }}><Cell idx={2} /><Cell idx={3} /><Cell idx={4} /></div>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step,      setStep]      = useState<"choose" | "post" | "reel">("choose");
  const [title,     setTitle]     = useState("");
  const [caption,   setCaption]   = useState("");
  const [sportId,   setSportId]   = useState("");
  const [tag,       setTag]       = useState("");
  const [files,     setFiles]     = useState<File[]>([]);
  const [previews,  setPreviews]  = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error,     setError]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const TAGS    = step === "post" ? TAGS_POST : TAGS_REEL;

  const addFiles = (incoming: File[]) => {
    const readers = incoming.map(f => new Promise<string>(resolve => {
      const r = new FileReader();
      r.onload = e => resolve(e.target?.result as string);
      r.readAsDataURL(f);
    }));
    Promise.all(readers).then(newPreviews => {
      setFiles(prev => [...prev, ...incoming]);
      setPreviews(prev => [...prev, ...newPreviews]);
    });
  };

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!files.length) return setError(step === "post" ? "Add at least one photo." : "Choose a video.");
    if (!title) return setError("Title is required.");
    setError(null); setUploading(true); setUploadPct(5);
    try {
      if (step === "post") {
        // Upload all images, then save as ONE media record
        const uploaded: { url: string; fileName: string }[] = [];
        for (let idx = 0; idx < files.length; idx++) {
          const f = files[idx];
          const ext      = f.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, f, { upsert: false });
          if (upErr) throw new Error(upErr.message);
          const { data: urlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
          uploaded.push({ url: urlData.publicUrl, fileName });
          setUploadPct(Math.round(((idx + 1) / files.length) * 80));
        }
        const totalKB = files.reduce((s, f) => s + f.size, 0) / 1024;
        const { error: dbErr } = await supabase.from("media").insert({
          title,
          type:      "image",
          url:       uploaded[0].url,
          file_name: uploaded[0].fileName,
          images:    uploaded,
          caption:   caption.trim() || null,
          sport_id:  sportId || null,
          match_id:  null,
          tag:       tag || null,
          size:      `${totalKB.toFixed(0)} KB`,
        });
        if (dbErr) throw new Error(dbErr.message);
      } else {
        // Reel: single video record
        const f = files[0];
        const ext      = f.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(fileName, f, { upsert: false });
        if (upErr) throw new Error(upErr.message);
        setUploadPct(70);
        const { data: urlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fileName);
        const { error: dbErr } = await supabase.from("media").insert({
          title,
          type:      "video",
          url:       urlData.publicUrl,
          file_name: fileName,
          images:    [],
          sport_id:  sportId || null,
          match_id:  null,
          tag:       tag || null,
          size:      `${(f.size / 1024).toFixed(0)} KB`,
        });
        if (dbErr) throw new Error(dbErr.message);
      }
      setUploadPct(100);
      toast.success(files.length > 1 ? `Post with ${files.length} photos uploaded.` : "Media uploaded successfully.");
      setTimeout(() => { onSuccess(); onClose(); }, 400);
    } catch (e: any) {
      setError(e.message ?? "Upload failed.");
      toast.error(e.message ?? "Upload failed.");
      setUploading(false); setUploadPct(0);
    }
  };

  const back = () => { setStep("choose"); setFiles([]); setPreviews([]); setError(null); };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader
        title={step === "choose" ? "Upload Media" : step === "post" ? "New Post" : "New Reel"}
        sub={step === "choose" ? "Choose what to share" : step === "post" ? "Photo from a match or event" : "Video highlight or compilation"}
        onClose={onClose}
      />
      <div className="p-5">
        {step === "choose" && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: "post" as const, icon: ImageIcon, label: "Photo Post", color: "#A91D3A", desc: "Image" },
              { type: "reel" as const, icon: Film,      label: "Video Reel",  color: "#7B2FBE", desc: "Video" },
            ].map(({ type, icon: Icon, label, color, desc }) => (
              <button key={type} onClick={() => setStep(type)}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800/80 transition-all duration-200 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                  style={{ backgroundColor: `${color}20`, boxShadow: `0 0 0 0 ${color}40` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {(step === "post" || step === "reel") && (
          <div className="space-y-4">
            <button onClick={back} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors">
              <ChevronLeft size={13} /> Back
            </button>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept={step === "post" ? "image/*" : "video/*"}
              multiple={step === "post"}
              className="hidden"
              onChange={e => {
                if (e.target.files?.length) addFiles(Array.from(e.target.files));
                e.target.value = "";
              }}
            />

            {/* Post: Facebook grid or empty drop zone */}
            {step === "post" ? (
              files.length > 0 ? (
                <div
                  onDrop={e => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); }}
                  onDragOver={e => e.preventDefault()}
                  className="space-y-2">
                  <FacebookGrid previews={previews} onRemove={removeFile} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-2 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl text-zinc-500 hover:text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all">
                    <Plus size={12} /> Add more photos
                  </button>
                </div>
              ) : (
                <div
                  onDrop={e => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); }}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-zinc-700 hover:border-zinc-500 cursor-pointer transition-all">
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Upload size={17} className="text-zinc-500" />
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">Drop photos or click to browse</p>
                    <p className="text-zinc-600 text-xs">PNG, JPG, WEBP · select multiple</p>
                  </div>
                </div>
              )
            ) : (
              /* Reel: single video */
              <div
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) addFiles([f]); }}
                onDragOver={e => e.preventDefault()}
                onClick={() => !files.length && fileRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed overflow-hidden transition-all ${files.length ? "border-zinc-700 cursor-default" : "border-zinc-700 hover:border-zinc-500 cursor-pointer"}`}>
                {files.length > 0 ? (
                  <div className="relative">
                    <div className="h-32 bg-zinc-900 flex items-center justify-center gap-3">
                      <Film size={20} className="text-zinc-500" />
                      <span className="text-zinc-400 text-sm font-medium truncate max-w-[200px]">{files[0].name}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setFiles([]); setPreviews([]); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black flex items-center justify-center text-white transition-all backdrop-blur-sm">
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-0.5">
                      <p className="text-white/70 text-[10px]">{(files[0].size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Upload size={17} className="text-zinc-500" />
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">Drop here or click to browse</p>
                    <p className="text-zinc-600 text-xs">MP4, MOV, WEBM</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className={labelCls}>Title *</label>
              <input className={inputCls} placeholder={step === "post" ? "e.g. Basketball Finals Game 7" : "e.g. Best Dunks Compilation"}
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            {step === "post" && (
              <div>
                <label className={labelCls}>Caption</label>
                <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Write a caption…"
                  value={caption} onChange={e => setCaption(e.target.value)} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <SportDropdown value={sportId} onChange={setSportId} />
              <div>
                <label className={labelCls}>Tag</label>
                <select className={selectCls} value={tag} onChange={e => setTag(e.target.value)}>
                  <option value="">None</option>
                  {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-950/50 border border-red-900/50 rounded-xl px-3 py-2.5">
                <X size={12} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {uploading && (
              <div>
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1.5">
                  <span>Uploading{files.length > 1 ? ` (${files.length} photos)` : ""}…</span>
                  <span>{uploadPct}%</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#A91D3A] rounded-full transition-all duration-500" style={{ width: `${uploadPct}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} disabled={uploading}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-all disabled:opacity-40">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={uploading}
                className="flex-1 py-2.5 bg-[#A91D3A] hover:bg-[#c4223f] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {uploading
                  ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                  : step === "post"
                    ? `Share ${files.length > 1 ? `${files.length} Photos` : "Post"}`
                    : "Upload Reel"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ─── Add Highlight Modal ──────────────────────────────────────────────────────

function AddHighlightModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [label,   setLabel]   = useState("");
  const [college, setCollege] = useState("");
  const [color,   setColor]   = useState(COLOR_OPTIONS[0].value);
  const [emoji,   setEmoji]   = useState("🌟");
  const [text,    setText]    = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);
  const createHL = trpc.highlight.create.useMutation();

  const handleCreate = async () => {
    if (!label.trim()) return setError("Name is required.");
    if (!college)      return setError("College is required.");
    setError(null); setSaving(true);
    try {
      let coverUrl: string | null = null;
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const fn  = `highlights/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(fn, coverFile, { upsert: false });
        if (upErr) throw new Error(upErr.message);
        const { data: urlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(fn);
        coverUrl = urlData.publicUrl;
      }
      await createHL.mutateAsync({ label: label.trim(), color, college, coverUrl, slides: [{ emoji: emoji || null, text: text || null, order: 0 }] });
      toast.success("Story highlight created.");
      onSuccess(); onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed.");
      toast.error(e.message ?? "Failed to create story highlight.");
    }
    finally { setSaving(false); }
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="New Story Highlight" sub="Add a highlight for a college" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Name *</label>
            <input className={inputCls} placeholder="e.g. Basketball Finals" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>College *</label>
            <select className={selectCls} value={college} onChange={e => setCollege(e.target.value)}>
              <option value="">Select college</option>
              {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setColor(opt.value)}
                className={`w-7 h-7 rounded-full bg-gradient-to-br ${opt.value} transition-all ${color === opt.value ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110" : "opacity-50 hover:opacity-80"}`} />
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Cover Photo (optional)</label>
          <div onClick={() => fileRef.current?.click()}
            className="border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-3 text-center cursor-pointer transition-all">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} />
            {coverFile
              ? <p className="text-emerald-400 text-xs font-medium">✓ {coverFile.name}</p>
              : <p className="text-zinc-600 text-xs">Click to upload</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Emoji</label><input className={inputCls} placeholder="🏀" value={emoji} onChange={e => setEmoji(e.target.value)} /></div>
          <div><label className={labelCls}>Slide Text</label><input className={inputCls} placeholder="Caption…" value={text} onChange={e => setText(e.target.value)} /></div>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-all">Cancel</button>
          <button onClick={handleCreate} disabled={saving}
            className="flex-1 py-2.5 bg-[#A91D3A] hover:bg-[#c4223f] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={13} className="animate-spin" /> Creating…</> : "Create Story Highlight"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Share to Story Modal ─────────────────────────────────────────────────────

function ShareToStoryModal({ item, onClose, onSuccess }: { item: MediaItem; onClose: () => void; onSuccess: () => void }) {
  const [label,   setLabel]   = useState(item.title.toUpperCase().slice(0, 20));
  const [college, setCollege] = useState("");
  const [color,   setColor]   = useState(COLOR_OPTIONS[0].value);
  const [emoji,   setEmoji]   = useState("📸");
  const [text,    setText]    = useState(item.title);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const createFromMedia = trpc.highlight.createFromMedia.useMutation();

  const handleShare = async () => {
    if (!label.trim()) return setError("Label is required.");
    if (!college)      return setError("College is required.");
    setError(null); setSaving(true);
    try {
      await createFromMedia.mutateAsync({ mediaId: item.id, label: label.trim(), color, college, emoji: emoji || null, text: text || null });
      toast.success("Added to story highlights.");
      onSuccess(); onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed.");
      toast.error(e.message ?? "Failed to add to story highlights.");
    }
    finally { setSaving(false); }
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="Add to Story Highlight" sub="Create a story highlight from this post" onClose={onClose} />
      <div className={`relative h-28 bg-gradient-to-br ${color} overflow-hidden`}>
        <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          <span className="text-4xl">{emoji}</span>
          <p className="text-white font-bold text-sm max-w-[160px] leading-snug">{text}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Label *</label><input className={inputCls} placeholder="GAME DAY" value={label} onChange={e => setLabel(e.target.value)} /></div>
          <div>
            <label className={labelCls}>College *</label>
            <select className={selectCls} value={college} onChange={e => setCollege(e.target.value)}>
              <option value="">Select college</option>
              {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setColor(opt.value)}
                className={`w-7 h-7 rounded-full bg-gradient-to-br ${opt.value} transition-all ${color === opt.value ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110" : "opacity-50 hover:opacity-80"}`} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Emoji</label><input className={inputCls} placeholder="📸" value={emoji} onChange={e => setEmoji(e.target.value)} /></div>
          <div><label className={labelCls}>Overlay Text</label><input className={inputCls} placeholder="Caption…" value={text} onChange={e => setText(e.target.value)} /></div>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-all">Cancel</button>
          <button onClick={handleShare} disabled={saving}
            className="flex-1 py-2.5 bg-[#A91D3A] hover:bg-[#c4223f] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><BookMarked size={13} /> Add to Story Highlight</>}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ item, onClose, onSuccess }: { item: MediaItem; onClose: () => void; onSuccess: () => void }) {
  const [title,   setTitle]   = useState(item.title);
  const [caption, setCaption] = useState(item.caption ?? "");
  const [sportId, setSportId] = useState(item.sportId ?? "");
  const [tag,     setTag]     = useState(item.tag ?? "");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const TAGS = item.type === "video" ? TAGS_REEL : TAGS_POST;

  const handleSave = async () => {
    if (!title.trim()) return setError("Title required.");
    setError(null); setSaving(true);
    try {
      const { error: dbErr } = await supabase.from("media").update({
        title:    title.trim(),
        caption:  caption.trim() || null,
        sport_id: sportId || null,
        tag:      tag     || null,
      }).eq("id", item.id);
      if (dbErr) throw new Error(dbErr.message);
      toast.success("Changes saved.");
      onSuccess(); onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed.");
      toast.error(e.message ?? "Failed to save changes.");
    }
    finally { setSaving(false); }
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="Edit Post" sub="Update title, caption, sport, or tag" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div><label className={labelCls}>Title *</label><input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} /></div>
        {item.type === "image" && (
          <div>
            <label className={labelCls}>Caption</label>
            <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Write a caption…"
              value={caption} onChange={e => setCaption(e.target.value)} />
          </div>
        )}
        <SportDropdown value={sportId} onChange={setSportId} />
        <div>
          <label className={labelCls}>Tag</label>
          <select className={selectCls} value={tag} onChange={e => setTag(e.target.value)}>
            <option value="">None</option>
            {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Check size={13} /> Save</>}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteConfirmModal({ item, onClose, onSuccess }: { item: MediaItem; onClose: () => void; onSuccess: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const fileNames = item.images.length > 0
        ? item.images.map(img => img.fileName)
        : [item.fileName];
      await supabase.storage.from(MEDIA_BUCKET).remove(fileNames);
      const { error } = await supabase.from("media").delete().eq("id", item.id);
      if (error) throw new Error(error.message);
      toast.success("Media deleted.");
      onSuccess(); onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete media.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-900/50 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={20} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1.5">Delete this media?</h3>
          <p className="text-zinc-500 text-xs leading-relaxed mb-5">
            <span className="text-zinc-300">"{item.title}"</span> will be permanently removed.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={deleting} className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-all">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {deleting ? <><Loader2 size={13} className="animate-spin" /> Deleting…</> : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Detail Modal ────────────────────────────────────────────────────────

function PostDetailModal({ item, onClose, onEdit, onDelete, onShare, isAdmin }: {
  item: MediaItem; onClose: () => void; onEdit: () => void; onDelete: () => void; onShare: () => void; isAdmin: boolean;
}) {
  const [saved,  setSaved]  = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const cfg    = sportConfig(item.sport);
  // images may be null/non-array from older rows — fall back to the top-level url only if it exists
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : item.url ? [{ url: item.url, fileName: item.fileName ?? "" }] : [];
  const currentUrl = images[imgIdx]?.url ?? item.url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(24px)", backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Image */}
        <div className="relative shrink-0 bg-zinc-900" style={{ aspectRatio: "1/1", maxHeight: "50vh" }}>
          <img src={currentUrl} alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50 pointer-events-none" />
          <img src={currentUrl} alt={item.title}
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-200" />

          {images.length > 1 && (
            <>
              {imgIdx > 0 && (
                <button onClick={e => { e.stopPropagation(); setImgIdx(i => i - 1); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all">
                  <ChevronLeft size={16} />
                </button>
              )}
              {imgIdx < images.length - 1 && (
                <button onClick={e => { e.stopPropagation(); setImgIdx(i => i + 1); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all">
                  <ChevronRight size={16} />
                </button>
              )}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                {images.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setImgIdx(i); }}
                    className={`h-1.5 rounded-full transition-all duration-200 ${i === imgIdx ? "bg-white w-5" : "bg-white/40 w-1.5 hover:bg-white/70"}`} />
                ))}
              </div>
              <div className="absolute top-3 left-3 z-20 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="text-white text-[10px] font-semibold">{imgIdx + 1} / {images.length}</span>
              </div>
            </>
          )}

          {item.tag && images.length <= 1 && (
            <div className="absolute top-3 left-3 z-20">
              <span className="text-[9px] font-bold tracking-widest text-white/80 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                {item.tag}
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-1.5 z-20">
            {[
              { icon: Pencil, action: onEdit,   hover: "hover:bg-zinc-600",    adminOnly: true  },
              { icon: Trash2, action: onDelete,  hover: "hover:bg-red-600/70", adminOnly: true  },
              { icon: X,      action: onClose,   hover: "hover:bg-zinc-600",   adminOnly: false },
            ].filter(b => !b.adminOnly || isAdmin).map(({ icon: Icon, action, hover }, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); action(); }}
                className={`w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm ${hover} flex items-center justify-center text-white/60 hover:text-white transition-all`}>
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        {/* Info + Comments — flex-1 so comments section fills remaining height */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Post info */}
          <div className="px-4 pt-3 pb-2 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {item.sport && <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.accent }}>{item.sport}</span>}
                  {item.sport && <span className="text-zinc-700">·</span>}
                  {item.tag && <span className="text-[9px] font-bold tracking-widest text-white/50 bg-white/10 px-2 py-0.5 rounded-full">{item.tag}</span>}
                  {item.tag && <span className="text-zinc-700">·</span>}
                  <span className="text-zinc-600 text-[10px]"
                    title={new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <LikeButton mediaId={item.id} initialCount={item.likeCount} initialLiked={item.userHasLiked} size={18} />
                {isAdmin && <button onClick={onShare} className="text-zinc-600 hover:text-[#A91D3A] transition-colors"><BookMarked size={18} /></button>}
                <button onClick={() => setSaved(v => !v)} className={`transition-all duration-200 ${saved ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}>
                  <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            {item.caption && (
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap border-t border-zinc-800/60 pt-2 mt-2">{item.caption}</p>
            )}
          </div>

          {/* Comments */}
          <div className="flex-1 flex flex-col min-h-0 border-t border-zinc-800/60">
            <div className="px-4 py-2 shrink-0 flex items-center gap-2">
              <MessageCircle size={12} className="text-zinc-600" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">Comments</span>
            </div>
            <CommentsSection mediaId={item.id} isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reel Detail Modal ────────────────────────────────────────────────────────

function ReelDetailModal({ item, onClose, onEdit, onDelete, onShare, isAdmin }: {
  item: MediaItem; onClose: () => void; onEdit: () => void; onDelete: () => void; onShare: () => void; isAdmin: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cfg      = sportConfig(item.sport);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else         { videoRef.current.play();  setPlaying(true);  }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(24px)", backgroundColor: "rgba(0,0,0,0.9)" }}
      onClick={onClose}>
      <div className="flex items-stretch gap-3" onClick={e => e.stopPropagation()}>

        {/* Video card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex-none"
          style={{ width: "300px", aspectRatio: "9/16" }}>
          {item.url
            ? <video ref={videoRef} src={item.url} className="absolute inset-0 w-full h-full object-cover" loop />
            : <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient}`} />
          }
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
            {[
              { icon: Pencil, action: onEdit,   hover: "hover:bg-zinc-600",    adminOnly: true  },
              { icon: Trash2, action: onDelete,  hover: "hover:bg-red-600/70", adminOnly: true  },
              { icon: X,      action: onClose,   hover: "hover:bg-zinc-600",   adminOnly: false },
            ].filter(b => !b.adminOnly || isAdmin).map(({ icon: Icon, action, hover }, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); action(); }}
                className={`w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm ${hover} flex items-center justify-center text-white/60 hover:text-white transition-all`}>
                <Icon size={13} />
              </button>
            ))}
          </div>

          {/* Play toggle */}
          <button className="absolute inset-0 flex items-center justify-center z-10" onClick={e => { e.stopPropagation(); togglePlay(); }}>
            {!playing && (
              <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center hover:bg-white/25 transition-all">
                <Play size={26} className="text-white ml-1" fill="white" />
              </div>
            )}
          </button>

          {/* Bottom label */}
          <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
            <p className="text-white/60 text-[11px] font-medium truncate">{item.title}</p>
          </div>
        </div>

        {/* Info + Comments panel */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-64 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800/60 shrink-0">
            <p className="text-white font-semibold text-sm leading-snug">{item.title}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {item.sport && <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.accent }}>{item.sport}</span>}
              {item.sport && <span className="text-zinc-700">·</span>}
              <span className="text-zinc-600 text-[10px]"
                title={new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}>
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <LikeButton mediaId={item.id} initialCount={item.likeCount} initialLiked={item.userHasLiked} size={16} />
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); onShare(); }} className="text-zinc-600 hover:text-[#A91D3A] transition-colors">
                  <BookMarked size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 shrink-0 flex items-center gap-2 border-b border-zinc-800/40">
              <MessageCircle size={11} className="text-zinc-600" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">Comments</span>
            </div>
            <CommentsSection mediaId={item.id} isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card (Instagram tile) ───────────────────────────────────────────────

function PostCard({ item, onClick, onEdit, onDelete, onShare, featured, isAdmin }: {
  item: MediaItem; onClick: () => void; onEdit: () => void; onDelete: () => void; onShare: () => void; featured?: boolean; isAdmin: boolean;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const cfg    = sportConfig(item.sport);
  // images may be null/non-array from older rows — fall back to the top-level url only if it exists
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : item.url ? [{ url: item.url, fileName: item.fileName ?? "" }] : [];

  return (
    <article
      className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/60 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl cursor-pointer"
      style={featured ? { gridColumn: "span 2", gridRow: "span 2" } : {}}>
      <div className="relative overflow-hidden bg-zinc-900" style={{ aspectRatio: "1/1" }}>
        {/* Blurred background fill */}
        <img src={images[imgIdx]?.url ?? item.url} alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50 pointer-events-none" />
        {/* Actual image */}
        <img src={images[imgIdx]?.url ?? item.url} alt={item.title}
          className="absolute inset-0 w-full h-full object-contain"
          onClick={onClick} />

        {/* Multi-image indicator */}
        {images.length > 1 && (
          <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-1">
            <Grid3X3 size={9} className="text-white/80" />
            <span className="text-white/80 text-[9px] font-semibold">{images.length}</span>
          </div>
        )}

        {item.tag && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="text-[9px] font-bold tracking-widest text-white/80 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {item.tag}
            </span>
          </div>
        )}

        {/* Carousel arrows — visible on hover when multi-image */}
        {images.length > 1 && (
          <>
            {imgIdx > 0 && (
              <button onClick={e => { e.stopPropagation(); setImgIdx(i => i - 1); }}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black">
                <ChevronLeft size={13} />
              </button>
            )}
            {imgIdx < images.length - 1 && (
              <button onClick={e => { e.stopPropagation(); setImgIdx(i => i + 1); }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black">
                <ChevronRight size={13} />
              </button>
            )}
            {/* Dot indicators */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
              {images.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-200 ${i === imgIdx ? "bg-white w-3" : "bg-white/50 w-1"}`} />
              ))}
            </div>
          </>
        )}

        {/* Admin actions on hover */}
        {isAdmin && (
          <div className="absolute bottom-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-20">
            <button onClick={e => { e.stopPropagation(); onShare(); }}
              className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm hover:bg-[#A91D3A]/80 flex items-center justify-center text-white/70 hover:text-white transition-all">
              <BookMarked size={11} />
            </button>
            <button onClick={e => { e.stopPropagation(); onEdit(); }}
              className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm hover:bg-zinc-600 flex items-center justify-center text-white/70 hover:text-white transition-all">
              <Pencil size={11} />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(); }}
              className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm hover:bg-red-600/80 flex items-center justify-center text-white/70 hover:text-white transition-all">
              <Trash2 size={11} />
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-zinc-300 text-[11px] font-medium truncate">{item.title}</p>
          {item.sport && <p className="text-[9px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: cfg.accent }}>{item.sport}</p>}
        </div>
        <LikeButton mediaId={item.id} initialCount={item.likeCount} initialLiked={item.userHasLiked} size={14} className="shrink-0 ml-2" />
      </div>
    </article>
  );
}

// ─── Feed Photo Grid (1:1 square, max 4 preview, blurred fill) ────────────────

function FeedPhotoGrid({ urls, total, onClick }: {
  urls: string[]; total: number; onClick: () => void;
}) {
  const show  = urls.slice(0, 4);
  const extra = total > 4 ? total - 4 : 0;
  const n     = show.length;

  function Cell({ url, last, gridStyle }: { url: string; last?: boolean; gridStyle?: React.CSSProperties }) {
    return (
      <div className="relative overflow-hidden bg-zinc-900 cursor-pointer" style={gridStyle} onClick={onClick}>
        <img src={url} alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60 pointer-events-none" />
        <img src={url} alt="" className="absolute inset-0 w-full h-full object-contain" />
        {last && extra > 0 && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
            <span className="text-white font-bold text-2xl drop-shadow-lg">+{extra}</span>
          </div>
        )}
      </div>
    );
  }

  if (n === 2) return (
    <div style={{ width: "100%", aspectRatio: "1/1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
      <Cell url={show[0]} />
      <Cell url={show[1]} last />
    </div>
  );

  if (n === 3) return (
    <div style={{ width: "100%", aspectRatio: "1/1", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "2px" }}>
      <Cell url={show[0]} gridStyle={{ gridRow: "span 2" }} />
      <Cell url={show[1]} />
      <Cell url={show[2]} last />
    </div>
  );

  // 4+
  return (
    <div style={{ width: "100%", aspectRatio: "1/1", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "2px" }}>
      <Cell url={show[0]} />
      <Cell url={show[1]} />
      <Cell url={show[2]} />
      <Cell url={show[3]} last />
    </div>
  );
}

// ─── Facebook Feed Card ───────────────────────────────────────────────────────

function FacebookFeedCard({ item, onClick, onEdit, onDelete, onShare, isAdmin }: {
  item: MediaItem; onClick: () => void; onEdit: () => void; onDelete: () => void; onShare: () => void; isAdmin: boolean;
}) {
  const cfg    = sportConfig(item.sport);
  // images may be null/non-array from older rows — fall back to the top-level url only if it exists
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : item.url ? [{ url: item.url, fileName: item.fileName ?? "" }] : [];

  return (
    <article className="bg-zinc-900 rounded-2xl border border-zinc-800/60 overflow-hidden hover:border-zinc-700 transition-all duration-300">
      {/* Post header */}
      <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm leading-snug">{item.title}</h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            {item.sport && <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.accent }}>{item.sport}</span>}
            {item.sport && <span className="text-zinc-700 text-[10px]">·</span>}
            <span className="text-zinc-600 text-[10px]"
              title={new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}>
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
            {item.tag && (
              <>
                <span className="text-zinc-700 text-[10px]">·</span>
                <span className="text-[9px] font-bold tracking-widest text-white/60 bg-white/10 px-2 py-0.5 rounded-full">{item.tag}</span>
              </>
            )}
            {images.length > 1 && (
              <>
                <span className="text-zinc-700 text-[10px]">·</span>
                <span className="text-[9px] text-zinc-500">{images.length} photos</span>
              </>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={e => { e.stopPropagation(); onShare(); }} className="text-zinc-600 hover:text-[#A91D3A] transition-colors"><BookMarked size={15} /></button>
            <button onClick={e => { e.stopPropagation(); onEdit(); }}  className="text-zinc-600 hover:text-zinc-300 transition-colors"><Pencil size={15} /></button>
            <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
          </div>
        )}
      </div>

      {/* Caption */}
      {item.caption && (
        <p className="px-4 pb-2 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{item.caption}</p>
      )}

      {/* Images */}
      {images.length === 1 ? (
        <div className="relative w-full bg-zinc-900 overflow-hidden cursor-pointer" style={{ aspectRatio: "1/1" }} onClick={onClick}>
          <img src={images[0].url} alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50 pointer-events-none" />
          <img src={images[0].url} alt={item.title}
            className="absolute inset-0 w-full h-full object-contain" />
        </div>
      ) : (
        <FeedPhotoGrid
          urls={images.map(img => img.url)}
          total={images.length}
          onClick={onClick}
        />
      )}

      {/* Action row */}
      <div className="px-4 py-2.5 border-t border-zinc-800/40 flex items-center gap-4">
        <LikeButton mediaId={item.id} initialCount={item.likeCount} initialLiked={item.userHasLiked} size={16} />
        <button onClick={e => { e.stopPropagation(); onClick(); }}
          className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 transition-colors">
          <MessageCircle size={16} />
          <span className="text-xs">Comment</span>
        </button>
      </div>
    </article>
  );
}

// ─── Reel Card ────────────────────────────────────────────────────────────────

function ReelCard({ item, onClick, onEdit, onDelete, isAdmin }: { item: MediaItem; onClick: () => void; onEdit: () => void; onDelete: () => void; isAdmin: boolean }) {
  const [hovered, setHovered] = useState(false);
  const cfg = sportConfig(item.sport);

  return (
    <article
      className="group relative rounded-2xl overflow-hidden border border-zinc-800/60 hover:border-zinc-700 transition-all duration-300 cursor-pointer bg-zinc-900"
      style={{ aspectRatio: "9/16" }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {item.url && <video src={item.url} className="absolute inset-0 w-full h-full object-cover" muted preload="metadata" />}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, ${cfg.gradient.includes("zinc") ? "#09090b" : "rgba(0,0,0,0.9)"} 100%)` }} />

      {/* Sport glow accent at top */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-60" style={{ backgroundColor: cfg.accent }} />

      {/* Play */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
        <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <Play size={16} className="text-white ml-0.5" fill="white" />
        </div>
      </div>

      {/* Hover actions — admin only */}
      {isAdmin && (
        <div className={`absolute top-2 right-2 flex gap-1 transition-all duration-200 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
          <button onClick={e => { e.stopPropagation(); onEdit(); }}
            className="w-6 h-6 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <Pencil size={10} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            className="w-6 h-6 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-red-400 transition-colors">
            <Trash2 size={10} />
          </button>
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-white text-[10px] font-semibold leading-tight line-clamp-2">{item.title}</p>
        {item.sport && <p className="text-[9px] font-bold mt-0.5 uppercase tracking-wide" style={{ color: cfg.accent }}>{item.sport}</p>}
      </div>
    </article>
  );
}

// ─── Add Card ─────────────────────────────────────────────────────────────────

function AddCard({ onClick, aspectRatio = "1/1" }: { onClick: () => void; aspectRatio?: string }) {
  return (
    <button onClick={onClick} className="group rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-zinc-900/50"
      style={{ aspectRatio }}>
      <div className="w-8 h-8 rounded-xl bg-zinc-800/60 group-hover:bg-zinc-700 flex items-center justify-center transition-all">
        <Plus size={15} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" />
      </div>
      <p className="text-[10px] font-medium text-zinc-700 group-hover:text-zinc-500 uppercase tracking-widest transition-colors">Add</p>
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ type, onUpload }: { type: "posts" | "reels"; onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-5">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          {type === "posts" ? <Camera size={28} className="text-zinc-700" /> : <Film size={28} className="text-zinc-700" />}
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-[#A91D3A] flex items-center justify-center">
          <Plus size={14} className="text-white" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-zinc-300 text-sm font-semibold">No {type} yet</p>
        <p className="text-zinc-600 text-xs mt-1.5 max-w-[200px] leading-relaxed">
          Upload your first {type === "posts" ? "photo" : "video"} and it will appear here
        </p>
      </div>
      <button onClick={onUpload}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white text-sm font-medium transition-all">
        <Upload size={14} /> Upload {type === "posts" ? "Post" : "Reel"}
      </button>
    </div>
  );
}

// ─── Media Skeleton Grid ──────────────────────────────────────────────────────

function MediaSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="rounded-2xl" style={{ aspectRatio: "1/1" }} />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");
  const [postView,  setPostView]  = useState<"instagram" | "facebook">("instagram");
  const [hlViewer,  setHlViewer]  = useState<{ highlights: Highlight[]; startIndex: number } | null>(null);
  const [showUpload,      setShowUpload]      = useState(false);
  const [showAddHL,       setShowAddHL]       = useState(false);
  const [selectedItem,    setSelectedItem]    = useState<MediaItem | null>(null);
  const [editItem,        setEditItem]        = useState<MediaItem | null>(null);
  const [deleteItem,      setDeleteItem]      = useState<MediaItem | null>(null);
  const [shareItem,       setShareItem]       = useState<MediaItem | null>(null);
  const [search,          setSearch]          = useState("");
  const [sportFilter,     setSportFilter]     = useState("all");

  const { data: allMedia   = [], isLoading: mediaLoading, refetch: refetchMedia }     = trpc.media.getAll.useQuery();
  const { data: highlights = [], isLoading: hlLoading,   refetch: refetchHighlights } = trpc.highlight.getAll.useQuery();
  const { data: sports     = [] }                                                      = trpc.sport.getAll.useQuery();
  const deleteHL = trpc.highlight.delete.useMutation({ onSuccess: () => refetchHighlights() });
  const { isAdmin } = useRole();

  // Group highlights by college (uppercase key)
  const hlByCollege = highlights.reduce((acc, h) => {
    const key = (h.college ?? "").toUpperCase();
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(h);
    return acc;
  }, {} as Record<string, Highlight[]>);

  // Colleges that actually have highlights
  const activeColleges = COLLEGES.filter(c => (hlByCollege[c]?.length ?? 0) > 0);

  // All sports that appear in media
  const activeSports = [...new Set(allMedia.map(m => m.sport).filter(Boolean))] as string[];

  const filtered = allMedia.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search || m.title.toLowerCase().includes(q) || m.sport?.toLowerCase().includes(q);
    const matchSport  = sportFilter === "all" || m.sport === sportFilter;
    return matchSearch && matchSport;
  });

  const posts = filtered.filter(m => m.type === "image");
  const reels = filtered.filter(m => m.type === "video");

  const statItems = [
    { label: "Posts",   value: allMedia.filter(m => m.type === "image").length, icon: ImageIcon },
    { label: "Reels",   value: allMedia.filter(m => m.type === "video").length, icon: Film      },
    { label: "Highlights", value: highlights.length,                              icon: Zap       },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ── Modals ── */}
      {hlViewer !== null && hlViewer.highlights.length > 0 && (
        <HighlightViewer highlights={hlViewer.highlights} startIndex={hlViewer.startIndex}
          onClose={() => setHlViewer(null)}
          onDelete={async id => { await deleteHL.mutateAsync({ id }); }}
          isAdmin={isAdmin} />
      )}
      {showUpload  && isAdmin && <UploadModal onClose={() => setShowUpload(false)} onSuccess={refetchMedia} />}
      {showAddHL   && isAdmin && <AddHighlightModal onClose={() => setShowAddHL(false)} onSuccess={refetchHighlights} />}
      {shareItem   && <ShareToStoryModal item={shareItem} onClose={() => setShareItem(null)} onSuccess={refetchHighlights} />}
      {selectedItem && (
        selectedItem.type === "video"
          ? <ReelDetailModal item={selectedItem} onClose={() => setSelectedItem(null)}
              onEdit={() => { setEditItem(selectedItem); setSelectedItem(null); }}
              onDelete={() => { setDeleteItem(selectedItem); setSelectedItem(null); }}
              onShare={() => { setShareItem(selectedItem); setSelectedItem(null); }}
              isAdmin={isAdmin} />
          : <PostDetailModal item={selectedItem} onClose={() => setSelectedItem(null)}
              onEdit={() => { setEditItem(selectedItem); setSelectedItem(null); }}
              onDelete={() => { setDeleteItem(selectedItem); setSelectedItem(null); }}
              onShare={() => { setShareItem(selectedItem); setSelectedItem(null); }}
              isAdmin={isAdmin} />
      )}
      {editItem   && isAdmin && <EditModal item={editItem} onClose={() => setEditItem(null)} onSuccess={refetchMedia} />}
      {deleteItem && isAdmin && <DeleteConfirmModal item={deleteItem} onClose={() => setDeleteItem(null)} onSuccess={refetchMedia} />}

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="px-6 py-3.5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-[#A91D3A]" />
            <h1 className="text-base font-bold tracking-tight">Media Hub</h1>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center divide-x divide-zinc-800">
            {statItems.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 px-5 first:pl-0 last:pr-0">
                <Icon size={13} className="text-zinc-600" />
                <span className="text-white font-bold text-sm">{value}</span>
                <span className="text-zinc-600 text-xs">{label}</span>
              </div>
            ))}
          </div>

          {isAdmin && (
            <button onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-[#A91D3A] hover:bg-[#c4223f] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-[#A91D3A]/20">
              <Plus size={14} /> Upload
            </button>
          )}
        </div>
      </header>

      {/* ── Story Highlights Strip ── */}
      <div className="border-b border-zinc-800/60 bg-zinc-950">
        <div className="px-6 py-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Zap size={11} className="text-[#A91D3A]" />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500">Story Highlights</span>
            {hlLoading && <Loader2 size={10} className="animate-spin text-zinc-700" />}
          </div>

          {/* One bubble per college + add-new circle */}
          <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {activeColleges.map(college => {
              const group = hlByCollege[college]!;
              const latest = group[0];
              return (
                <button key={college}
                  onClick={() => setHlViewer({ highlights: group, startIndex: 0 })}
                  className="flex flex-col items-center gap-1.5 shrink-0 group">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${latest.color} overflow-hidden ring-2 ring-transparent group-hover:ring-[#A91D3A] ring-offset-2 ring-offset-zinc-950 transition-all duration-200 group-hover:scale-105`}>
                    {latest.coverUrl
                      ? <img src={latest.coverUrl} alt={college} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-xs font-black tracking-tight">{college.slice(0, 3)}</span>
                        </div>}
                  </div>
                  <span className="text-[9px] font-bold tracking-wider text-zinc-500 group-hover:text-zinc-300 uppercase transition-colors">{college}</span>
                </button>
              );
            })}

            {/* Add-new circle button */}
            {isAdmin && (
              <button onClick={() => setShowAddHL(true)}
                className="flex flex-col items-center gap-1.5 shrink-0 group">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 group-hover:border-[#A91D3A] group-hover:bg-zinc-800 flex items-center justify-center transition-all duration-200 group-hover:scale-105">
                  <Plus size={20} className="text-zinc-600 group-hover:text-[#A91D3A] transition-colors" />
                </div>
                <span className="text-[9px] font-bold tracking-wider text-zinc-600 group-hover:text-zinc-400 uppercase transition-colors">New</span>
              </button>
            )}

            {!hlLoading && highlights.length === 0 && (
              <p className="text-zinc-700 text-xs italic self-center">No story highlights yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Toolbar: Tabs + View Toggle + Search + Sport Pills ── */}
      <div className="px-6 py-3 border-b border-zinc-800/60 flex flex-wrap items-center gap-3">
        {/* Tab toggle */}
        <div className="flex gap-0.5 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
          {(["posts", "reels"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              {tab === "posts" ? <Grid3X3 size={11} /> : <Film size={11} />}
              {tab === "posts" ? "Posts" : "Reels"}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-white/10 text-white/70" : "bg-zinc-800 text-zinc-600"}`}>
                {tab === "posts" ? allMedia.filter(m => m.type === "image").length : allMedia.filter(m => m.type === "video").length}
              </span>
            </button>
          ))}
        </div>

        {/* Feed view toggle — only for Posts */}
        {activeTab === "posts" && (
          <div className="flex gap-0.5 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            {([
              { mode: "instagram" as const, icon: Grid3X3,    label: "Grid" },
              { mode: "facebook"  as const, icon: LayoutList, label: "Feed" },
            ]).map(({ mode, icon: Icon, label }) => (
              <button key={mode} onClick={() => setPostView(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  postView === mode ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}>
                <Icon size={11} /> {label}
              </button>
            ))}
          </div>
        )}

        {/* Sport pills */}
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button onClick={() => setSportFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${sportFilter === "all" ? "bg-[#A91D3A] text-white" : "bg-zinc-900 border border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500"}`}>
            All
          </button>
          {activeSports.map(sport => {
            const cfg = sportConfig(sport);
            const active = sportFilter === sport;
            return (
              <button key={sport} onClick={() => setSportFilter(active ? "all" : sport)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border"
                style={active
                  ? { backgroundColor: cfg.accent, borderColor: cfg.accent, color: "white" }
                  : { backgroundColor: "transparent", borderColor: "#3f3f46", color: "#71717a" }}>
                {sport}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
          <input
            className="w-52 pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 focus:border-zinc-500 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none transition-all"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-6 space-y-6">

        {/* Skeleton while loading */}
        {mediaLoading && <MediaSkeletonGrid />}

        {/* ── Posts view ── */}
        {!mediaLoading && activeTab === "posts" && (
          posts.length === 0 && !search && sportFilter === "all"
            ? <EmptyState type="posts" onUpload={isAdmin ? () => setShowUpload(true) : () => {}} />
            : postView === "instagram"
              ? (
                /* Instagram grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {posts.map(item => (
                    <PostCard key={item.id} item={item}
                      onClick={() => setSelectedItem(item)}
                      onEdit={() => setEditItem(item)}
                      onDelete={() => setDeleteItem(item)}
                      onShare={() => setShareItem(item)}
                      isAdmin={isAdmin}
                    />
                  ))}
                  {isAdmin && <AddCard onClick={() => setShowUpload(true)} />}
                </div>
              )
              : (
                /* Facebook feed */
                <div className="space-y-4 max-w-2xl mx-auto">
                  {posts.map(item => (
                    <FacebookFeedCard key={item.id} item={item}
                      onClick={() => setSelectedItem(item)}
                      onEdit={() => setEditItem(item)}
                      onDelete={() => setDeleteItem(item)}
                      onShare={() => setShareItem(item)}
                      isAdmin={isAdmin}
                    />
                  ))}
                  {isAdmin && (
                    <button onClick={() => setShowUpload(true)}
                      className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-600 text-zinc-600 hover:text-zinc-400 text-sm font-medium flex items-center justify-center gap-2 transition-all">
                      <Plus size={15} /> Add Post
                    </button>
                  )}
                </div>
              )
        )}

        {/* ── Reels view ── */}
        {!mediaLoading && activeTab === "reels" && (
          reels.length === 0 && !search && sportFilter === "all"
            ? <EmptyState type="reels" onUpload={isAdmin ? () => setShowUpload(true) : () => {}} />
            : <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {reels.map(item => (
                  <ReelCard key={item.id} item={item}
                    onClick={() => setSelectedItem(item)}
                    onEdit={() => setEditItem(item)}
                    onDelete={() => setDeleteItem(item)}
                    isAdmin={isAdmin}
                  />
                ))}
                {isAdmin && <AddCard onClick={() => setShowUpload(true)} aspectRatio="9/16" />}
              </div>
        )}

        {/* No results */}
        {!mediaLoading && (search || sportFilter !== "all") && (activeTab === "posts" ? posts : reels).length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Eye size={32} className="text-zinc-800" />
            <p className="text-zinc-500 text-sm">No results found</p>
            <div className="flex gap-2">
              {search && <button onClick={() => setSearch("")} className="text-xs text-zinc-500 hover:text-white underline transition-colors">Clear search</button>}
              {sportFilter !== "all" && <button onClick={() => setSportFilter("all")} className="text-xs text-zinc-500 hover:text-white underline transition-colors">Clear filter</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}