"use client";

import { useState, useRef } from "react";
import {
  Grid3X3, Film, Plus, Star, Play, Image as ImageIcon,
  Heart, MessageCircle, Share2, Bookmark,
  Camera, X, Upload, ChevronLeft, ChevronRight,
  Loader2, Pencil, Trash2, Check, BookMarked, Sparkles, Clock,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { supabase } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type StoryItem = {
  id: string;
  type: "custom" | "shared";
  emoji: string | null;
  text: string | null;
  imageUrl: string | null;
  mediaId: string | null;
  expiresAt: string;
  createdAt: string;
  mediaUrl: string | null;
  mediaTitle: string | null;
  mediaType: string | null;
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
  coverUrl: string | null;
  createdAt: string;
  slides: HighlightSlide[];
};

type MediaItem = {
  id: string;
  title: string;
  type: "image" | "video";
  url: string;
  fileName: string;
  tag: string | null;
  size: string | null;
  sport: string | null;
  sportId: string | null;
  matchId: string | null;
  createdAt: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { label: "Brand",  value: "from-[#A91D3A] to-[#741029]"  },
  { label: "Red",    value: "from-red-700 to-rose-500"      },
  { label: "Purple", value: "from-purple-800 to-violet-600" },
  { label: "Gold",   value: "from-yellow-700 to-amber-500"  },
  { label: "Teal",   value: "from-teal-700 to-emerald-500"  },
  { label: "Orange", value: "from-red-600 to-orange-500"    },
  { label: "Pink",   value: "from-purple-700 to-pink-600"   },
];

const TAGS_POST = ["FINALS", "SEMI-FINALS", "QUARTERFINALS", "RECORD BROKEN", "OPENING", "CLOSING", "DAY 1", "DAY 2", "DAY 3"];
const TAGS_REEL = ["HIGHLIGHTS", "COMPILATION", "BEST MOMENTS", "BEHIND THE SCENES", "CEREMONY"];

const SPORT_GRADIENT: Record<string, string> = {
  Basketball: "from-red-900 via-red-700 to-rose-600",
  Volleyball: "from-purple-900 via-purple-700 to-violet-600",
  Swimming:   "from-teal-900 via-teal-700 to-cyan-600",
  Badminton:  "from-green-900 via-green-700 to-emerald-600",
  default:    "from-zinc-900 via-zinc-700 to-zinc-600",
};

function gradientFor(sport: string | null) {
  return sport ? (SPORT_GRADIENT[sport] ?? SPORT_GRADIENT.default) : SPORT_GRADIENT.default;
}

// Time remaining until expiry
function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h left` : `${m}m left`;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

// Dark-mode-safe input: explicit dark bg + white text so browser default doesn't
// render a white select box with invisible white text in dark mode.
const inputCls = [
  "w-full px-3 py-2 rounded-lg text-sm transition-all",
  "bg-zinc-800 border border-white/10 text-white placeholder-white/30",
  "focus:outline-none focus:border-[#A91D3A]/60",
  "[&>option]:bg-zinc-800 [&>option]:text-white",   // style <option> elements
].join(" ");

const labelCls = "block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5";

// ─── Sport Dropdown ───────────────────────────────────────────────────────────

function SportDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data: sports, isLoading, isError } = trpc.sport.getAll.useQuery();
  if (isLoading) return (
    <div>
      <label className={labelCls}>Sport</label>
      <div className="flex items-center gap-2 w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-sm text-white/30">
        <Loader2 size={13} className="animate-spin shrink-0" /> Loading…
      </div>
    </div>
  );
  if (isError) return (
    <div>
      <label className={labelCls}>Sport</label>
      <input className={inputCls} placeholder="Type sport name…" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
  return (
    <div>
      <label className={labelCls}>Sport</label>
      <select className={inputCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Select a sport</option>
        {(sports ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  );
}

// ─── Story Viewer (Instagram-style full-screen) ───────────────────────────────

function StoryViewer({
  stories, startIndex, onClose, onDelete, onArchive,
}: {
  stories: StoryItem[];
  startIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  onArchive: (story: StoryItem) => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const [paused, setPaused] = useState(false);
  const story = stories[idx];

  const goNext = () => { if (idx < stories.length - 1) setIdx(i => i + 1); else onClose(); };
  const goPrev = () => { if (idx > 0) setIdx(i => i - 1); };

  const bg = story.imageUrl
    ? `url(${story.imageUrl})`
    : "linear-gradient(135deg, #A91D3A, #741029)";

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={onClose}>
      <div
        className="relative w-full max-w-sm h-[88vh] rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundImage: bg, backgroundSize: "cover", backgroundPosition: "center" }}
        onClick={e => e.stopPropagation()}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

        {/* Progress bar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full"
                style={{ width: i < idx ? "100%" : i === idx ? "100%" : "0%", transition: i === idx ? `width ${paused ? "0s" : "5s"} linear` : "none" }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 left-3 right-3 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#A91D3A] border-2 border-white/40 flex items-center justify-center text-white text-xs font-black">IA</div>
            <div>
              <p className="text-white text-xs font-bold">IskoArena</p>
              <p className="text-white/50 text-[10px] flex items-center gap-1">
                <Clock size={9} /> {timeLeft(story.expiresAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Archive to highlight */}
            <button
              onClick={e => { e.stopPropagation(); onArchive(story); }}
              className="w-7 h-7 rounded-full bg-black/40 hover:bg-[#C5A059]/60 flex items-center justify-center text-white transition-colors"
              title="Save to Highlights">
              <BookMarked size={12} />
            </button>
            {/* Delete */}
            <button
              onClick={e => { e.stopPropagation(); onDelete(story.id); onClose(); }}
              className="w-7 h-7 rounded-full bg-black/40 hover:bg-red-600/70 flex items-center justify-center text-white transition-colors">
              <Trash2 size={12} />
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Story content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 z-10">
          {story.emoji && <span className="text-7xl drop-shadow-lg">{story.emoji}</span>}
          {story.text  && <p className="text-white font-bold text-center text-lg leading-snug drop-shadow-lg">{story.text}</p>}
          {story.type === "shared" && story.mediaType === "video" && (
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play size={20} className="text-white ml-1" fill="white" />
            </div>
          )}
        </div>

        {/* Nav tap zones */}
        <button className="absolute left-0 top-0 w-2/5 h-full z-10" onClick={goPrev} />
        <button className="absolute right-0 top-0 w-2/5 h-full z-10" onClick={goNext} />

        {idx > 0 && (
          <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white">
            <ChevronLeft size={18} />
          </button>
        )}
        <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white">
          <ChevronRight size={18} />
        </button>

        {/* Dot nav */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
          {stories.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/40 w-1.5"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Highlight Viewer ─────────────────────────────────────────────────────────

function HighlightViewer({
  highlights, startIndex, onClose, onDelete,
}: {
  highlights: Highlight[];
  startIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [hlIdx,    setHlIdx]    = useState(startIndex);
  const [slideIdx, setSlideIdx] = useState(0);
  const [paused,   setPaused]   = useState(false);

  const hl    = highlights[hlIdx];
  const slide = hl.slides[slideIdx];
  const total = hl.slides.length;

  const goNext = () => {
    if (slideIdx < total - 1) setSlideIdx(s => s + 1);
    else if (hlIdx < highlights.length - 1) { setHlIdx(h => h + 1); setSlideIdx(0); }
    else onClose();
  };
  const goPrev = () => {
    if (slideIdx > 0) setSlideIdx(s => s - 1);
    else if (hlIdx > 0) { setHlIdx(h => h - 1); setSlideIdx(highlights[hlIdx - 1].slides.length - 1); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full max-w-sm h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
        onMouseDown={() => setPaused(true)} onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>

        {/* Progress */}
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
          {hl.slides.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full rounded-full bg-white"
                style={{ width: i < slideIdx ? "100%" : i === slideIdx ? "100%" : "0%", transition: i === slideIdx ? `width ${paused ? "0s" : "3.5s"} linear` : "none" }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-3 right-3 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${hl.color} border-2 border-white/40 overflow-hidden`}>
              {hl.coverUrl && <img src={hl.coverUrl} alt={hl.label} className="w-full h-full object-cover" />}
            </div>
            <span className="text-white text-xs font-bold tracking-widest">{hl.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={e => { e.stopPropagation(); onDelete(hl.id); onClose(); }}
              className="w-7 h-7 rounded-full bg-black/40 hover:bg-red-600/70 flex items-center justify-center text-white transition-colors">
              <Trash2 size={12} />
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Slide */}
        <div className={`w-full h-full bg-gradient-to-br ${hl.color} flex flex-col items-center justify-center gap-5 px-8`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent)]" />
          {slide?.imageUrl && <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
          <div className="relative z-10 flex flex-col items-center gap-4">
            {slide?.emoji && <span className="text-7xl drop-shadow-lg">{slide.emoji}</span>}
            {slide?.text  && <p className="text-white font-bold text-center text-base leading-snug drop-shadow">{slide.text}</p>}
          </div>
          <p className="text-white/40 text-xs relative z-10">{slideIdx + 1} / {total}</p>
        </div>

        <button className="absolute left-0 top-0 w-2/5 h-full z-10" onClick={goPrev} />
        <button className="absolute right-0 top-0 w-2/5 h-full z-10" onClick={goNext} />
        {(hlIdx > 0 || slideIdx > 0) && (
          <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white">
            <ChevronLeft size={18} />
          </button>
        )}
        <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white">
          <ChevronRight size={18} />
        </button>
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
          {highlights.map((_, i) => (
            <button key={i} onClick={() => { setHlIdx(i); setSlideIdx(0); }}
              className={`h-1.5 rounded-full transition-all ${i === hlIdx ? "bg-white w-4" : "bg-white/40 w-1.5"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Create Story Modal ───────────────────────────────────────────────────────

function CreateStoryModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [emoji,    setEmoji]    = useState("✨");
  const [text,     setText]     = useState("");
  const [imgFile,  setImgFile]  = useState<File | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createStory = trpc.story.create.useMutation();

  const handleCreate = async () => {
    if (!emoji && !text && !imgFile) return setError("Add at least an emoji, text, or image.");
    setError(null); setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (imgFile) {
        const ext = imgFile.name.split(".").pop();
        const fileName = `stories/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("media").upload(fileName, imgFile, { upsert: false });
        if (upErr) throw new Error(upErr.message);
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
      await createStory.mutateAsync({ emoji: emoji || null, text: text || null, imageUrl });
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message ?? "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/5 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#A91D3A] to-[#741029] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-base flex items-center gap-2"><Sparkles size={15} /> New Story</h3>
            <p className="text-white/60 text-xs mt-0.5">Expires in 24 hours</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><X size={16} /></button>
        </div>

        {/* Live preview */}
        <div className="relative h-28 bg-gradient-to-br from-[#A91D3A] to-[#741029] flex items-center justify-center overflow-hidden">
          {imgFile && <img src={URL.createObjectURL(imgFile)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
          <div className="relative z-10 text-center">
            {emoji && <p className="text-4xl mb-1">{emoji}</p>}
            {text  && <p className="text-white text-xs font-bold px-4">{text}</p>}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Emoji</label>
            <input className={inputCls} placeholder="✨ Type or paste an emoji" value={emoji} onChange={e => setEmoji(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Text</label>
            <textarea className={`${inputCls} resize-none`} rows={2} placeholder="What's happening?" value={text} onChange={e => setText(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Background Image (optional)</label>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-[#A91D3A]/50 rounded-xl p-4 text-center cursor-pointer transition-colors">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImgFile(e.target.files?.[0] ?? null)} />
              {imgFile ? <p className="text-green-400 text-xs font-semibold">✓ {imgFile.name}</p>
                : <><Upload size={16} className="mx-auto text-white/20 mb-1" /><p className="text-xs text-white/30">Upload image</p></>}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-semibold hover:border-white/30 hover:text-white transition-all">Cancel</button>
            <button onClick={handleCreate} disabled={saving}
              className="flex-1 py-2.5 bg-[#A91D3A] hover:bg-[#c4223f] text-white rounded-lg text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Posting…</> : <><Sparkles size={13} /> Post Story</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Share to Story Modal ─────────────────────────────────────────────────────

function ShareToStoryModal({ item, onClose, onSuccess }: { item: MediaItem; onClose: () => void; onSuccess: () => void }) {
  const [emoji,   setEmoji]   = useState("📸");
  const [text,    setText]    = useState(item.title);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const createFromMedia = trpc.story.createFromMedia.useMutation();

  const handleShare = async () => {
    setError(null); setSaving(true);
    try {
      await createFromMedia.mutateAsync({ mediaId: item.id, emoji: emoji || null, text: text || null });
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message ?? "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/5 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#A91D3A] to-[#741029] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-base">Share to Story</h3>
            <p className="text-white/60 text-xs mt-0.5">Visible for 24 hours</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><X size={16} /></button>
        </div>

        {/* Preview */}
        <div className="relative h-28 overflow-hidden flex items-center justify-center bg-black">
          <img src={item.url} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="relative z-10 text-center px-4">
            <p className="text-2xl mb-1">{emoji}</p>
            <p className="text-white text-xs font-bold">{text}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Emoji</label>
              <input className={inputCls} placeholder="📸" value={emoji} onChange={e => setEmoji(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Caption</label>
              <input className={inputCls} placeholder="Caption…" value={text} onChange={e => setText(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-semibold hover:border-white/30 hover:text-white transition-all">Cancel</button>
            <button onClick={handleShare} disabled={saving}
              className="flex-1 py-2.5 bg-[#A91D3A] hover:bg-[#c4223f] text-white rounded-lg text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Sharing…</> : <><Share2 size={13} /> Share</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Archive to Highlight Modal ───────────────────────────────────────────────

function ArchiveModal({ story, onClose, onSuccess }: { story: StoryItem; onClose: () => void; onSuccess: () => void }) {
  const [label,  setLabel]  = useState("");
  const [color,  setColor]  = useState(COLOR_OPTIONS[0].value);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const archive = trpc.story.archiveToHighlight.useMutation();

  const handleArchive = async () => {
    if (!label.trim()) return setError("Label is required.");
    setError(null); setSaving(true);
    try {
      await archive.mutateAsync({ storyId: story.id, label: label.trim(), color });
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message ?? "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/5 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#C5A059] to-[#a07d3a] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-base flex items-center gap-2"><BookMarked size={15} /> Save to Highlights</h3>
            <p className="text-white/70 text-xs mt-0.5">Archive this story permanently</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Highlight Name *</label>
            <input className={inputCls} placeholder="e.g. Basketball Finals" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setColor(opt.value)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${opt.value} border-2 transition-all ${color === opt.value ? "border-white scale-110" : "border-transparent"}`} />
              ))}
            </div>
          </div>
          {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-semibold hover:border-white/30 hover:text-white transition-all">Cancel</button>
            <button onClick={handleArchive} disabled={saving}
              className="flex-1 py-2.5 bg-[#C5A059] hover:bg-[#d4b06a] text-white rounded-lg text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><BookMarked size={13} /> Save</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Highlight Modal (manual, not from story) ─────────────────────────────

function AddHighlightModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [label,     setLabel]     = useState("");
  const [color,     setColor]     = useState(COLOR_OPTIONS[0].value);
  const [emoji,     setEmoji]     = useState("🌟");
  const [text,      setText]      = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createHL = trpc.highlight.create.useMutation();

  const handleCreate = async () => {
    if (!label.trim()) return setError("Name is required.");
    if (!text && !emoji) return setError("Add at least text or an emoji for the first slide.");
    setError(null); setSaving(true);
    try {
      let coverUrl: string | null = null;
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const fileName = `highlights/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("media").upload(fileName, coverFile, { upsert: false });
        if (upErr) throw new Error(upErr.message);
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
        coverUrl = urlData.publicUrl;
      }
      await createHL.mutateAsync({ label: label.trim(), color, coverUrl, slides: [{ emoji: emoji || null, text: text || null, order: 0 }] });
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message ?? "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/5 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#C5A059] to-[#a07d3a] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-base flex items-center gap-2"><Star size={14} className="fill-white" /> New Highlight</h3>
            <p className="text-white/70 text-xs mt-0.5">Permanent — never expires</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Highlight Name *</label>
            <input className={inputCls} placeholder="e.g. Basketball Finals" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Color Theme</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setColor(opt.value)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${opt.value} border-2 transition-all ${color === opt.value ? "border-white scale-110" : "border-transparent"}`} />
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Cover Photo (optional)</label>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-[#C5A059]/50 rounded-xl p-4 text-center cursor-pointer transition-colors">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} />
              {coverFile ? <p className="text-green-400 text-xs font-semibold">✓ {coverFile.name}</p>
                : <><Upload size={16} className="mx-auto text-white/20 mb-1" /><p className="text-xs text-white/30">Upload cover</p></>}
            </div>
          </div>
          <div>
            <label className={labelCls}>First Slide</label>
            <div className="space-y-2">
              <input className={inputCls} placeholder="Emoji" value={emoji} onChange={e => setEmoji(e.target.value)} />
              <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Slide text…" value={text} onChange={e => setText(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-semibold hover:border-white/30 hover:text-white transition-all">Cancel</button>
            <button onClick={handleCreate} disabled={saving}
              className="flex-1 py-2.5 bg-[#C5A059] hover:bg-[#d4b06a] text-white rounded-lg text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : <><Star size={13} /> Create</>}
            </button>
          </div>
        </div>
      </div>
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
  const [file,      setFile]      = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createMedia = trpc.media.create.useMutation();
  const TAGS = step === "post" ? TAGS_POST : TAGS_REEL;

  const handleSubmit = async () => {
    if (!file)  return setError("Please select a file.");
    if (!title) return setError("Please enter a title.");
    setError(null); setUploading(true);
    try {
      const ext      = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("media").upload(fileName, file, { upsert: false });
      if (uploadErr) throw new Error(uploadErr.message);
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
      await createMedia.mutateAsync({
        title, type: file.type.startsWith("video/") ? "video" : "image",
        url: urlData.publicUrl, fileName,
        sportId: sportId || null, matchId: null,
        tag: tag || null, size: `${(file.size / 1024).toFixed(0)} KB`,
      });
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message ?? "Upload failed."); }
    finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/5 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#A91D3A] to-[#741029] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-base">{step === "choose" ? "Upload Media" : step === "post" ? "New Post" : "New Reel"}</h3>
            <p className="text-white/60 text-xs mt-0.5">{step === "choose" ? "What would you like to share?" : step === "post" ? "Share a match moment" : "Upload a video highlight"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><X size={16} /></button>
        </div>
        <div className="p-5">
          {step === "choose" && (
            <div className="space-y-3">
              {[
                { type: "post" as const, icon: ImageIcon, label: "Post",  sub: "Share a photo or image update",  iconBg: "bg-[#A91D3A]/20", iconColor: "text-[#A91D3A]" },
                { type: "reel" as const, icon: Film,      label: "Reel",  sub: "Upload a short video highlight", iconBg: "bg-purple-500/20", iconColor: "text-purple-400" },
              ].map(({ type, icon: Icon, label, sub, iconBg, iconColor }) => (
                <button key={type} onClick={() => setStep(type)}
                  className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:border-[#A91D3A]/40 rounded-2xl transition-all group text-left">
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}><Icon size={22} className={iconColor} /></div>
                  <div><p className="text-white font-bold text-sm">{label}</p><p className="text-white/40 text-xs mt-0.5">{sub}</p></div>
                  <ChevronRight size={16} className="text-white/20 ml-auto group-hover:text-[#A91D3A] transition-colors" />
                </button>
              ))}
            </div>
          )}
          {(step === "post" || step === "reel") && (
            <div className="space-y-4">
              <button onClick={() => setStep("choose")} className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors mb-1">
                <ChevronLeft size={14} /> Back
              </button>
              <div>
                <label className={labelCls}>{step === "post" ? "Photo / Image" : "Video File"}</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-[#A91D3A]/50 rounded-2xl p-5 text-center cursor-pointer transition-colors group">
                  <input ref={fileRef} type="file" accept={step === "post" ? "image/*" : "video/*"} className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  {file ? <p className="text-green-400 text-sm font-semibold">✓ {file.name}</p>
                    : <><Upload size={22} className="mx-auto text-white/20 group-hover:text-[#A91D3A]/60 transition-colors mb-2" /><p className="text-xs text-white/30">Click to upload or drag & drop</p></>}
                </div>
              </div>
              {step === "post" ? (
                <>
                  <div><label className={labelCls}>Title *</label><input className={inputCls} placeholder="e.g. Basketball Finals Game 7" value={title} onChange={e => setTitle(e.target.value)} /></div>
                  <div><label className={labelCls}>Caption</label><textarea className={`${inputCls} resize-none`} rows={2} placeholder="Write a caption..." value={caption} onChange={e => setCaption(e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <SportDropdown value={sportId} onChange={setSportId} />
                    <div><label className={labelCls}>Tag</label>
                      <select className={inputCls} value={tag} onChange={e => setTag(e.target.value)}>
                        <option value="">Select</option>{TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div><label className={labelCls}>Reel Title *</label><input className={inputCls} placeholder="e.g. Best Dunks Compilation" value={title} onChange={e => setTitle(e.target.value)} /></div>
                  <SportDropdown value={sportId} onChange={setSportId} />
                  <div><label className={labelCls}>Tag</label>
                    <select className={inputCls} value={tag} onChange={e => setTag(e.target.value)}>
                      <option value="">Select</option>{TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </>
              )}
              {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} disabled={uploading} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-semibold hover:border-white/30 hover:text-white transition-all disabled:opacity-40">Cancel</button>
                <button onClick={handleSubmit} disabled={uploading}
                  className="flex-1 py-2.5 bg-[#A91D3A] hover:bg-[#c4223f] text-white rounded-lg text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : step === "post" ? "Share Post" : "Upload Reel"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ item, onClose, onSuccess }: { item: MediaItem; onClose: () => void; onSuccess: () => void }) {
  const [title,   setTitle]   = useState(item.title);
  const [sportId, setSportId] = useState(item.sportId ?? "");
  const [tag,     setTag]     = useState(item.tag ?? "");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const updateMedia = trpc.media.update.useMutation();
  const TAGS = item.type === "video" ? TAGS_REEL : TAGS_POST;

  const handleSave = async () => {
    if (!title.trim()) return setError("Title is required.");
    setError(null); setSaving(true);
    try {
      await updateMedia.mutateAsync({ id: item.id, title: title.trim(), sportId: sportId || null, tag: tag || null });
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message ?? "Update failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/5 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#A91D3A] to-[#741029] px-5 py-4 flex items-center justify-between">
          <div><h3 className="text-white font-black text-base">Edit Media</h3><p className="text-white/60 text-xs mt-0.5">Update title, sport, or tag</p></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className={labelCls}>Title *</label><input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} /></div>
          <SportDropdown value={sportId} onChange={setSportId} />
          <div><label className={labelCls}>Tag</label>
            <select className={inputCls} value={tag} onChange={e => setTag(e.target.value)}>
              <option value="">None</option>{TAGS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-semibold hover:border-white/30 hover:text-white transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 bg-[#A91D3A] hover:bg-[#c4223f] text-white rounded-lg text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirmModal({ item, onClose, onSuccess }: { item: MediaItem; onClose: () => void; onSuccess: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const deleteMedia = trpc.media.delete.useMutation();

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteMedia.mutateAsync({ id: item.id, fileName: item.fileName }); onSuccess(); onClose(); }
    catch (e: any) { console.error(e); }
    finally { setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/5 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-400" /></div>
          <h3 className="text-white font-black text-base mb-2">Delete Media?</h3>
          <p className="text-white/40 text-sm mb-6"><span className="text-white/70 font-semibold">"{item.title}"</span> will be permanently removed.</p>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={deleting} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-semibold hover:border-white/30 hover:text-white transition-all">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Detail Modal ────────────────────────────────────────────────────────

function PostDetailModal({ item, onClose, onEdit, onDelete, onShare }: {
  item: MediaItem; onClose: () => void; onEdit: () => void; onDelete: () => void; onShare: () => void;
}) {
  const [liked,   setLiked]   = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [comment, setComment] = useState("");
  const bgClass = gradientFor(item.sport);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/5 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className={`relative h-72 bg-gradient-to-br ${bgClass} flex items-center justify-center shrink-0`}>
          {item.url ? <img src={item.url} alt={item.title} className="w-full h-full object-cover absolute inset-0" /> : <ImageIcon size={56} className="text-white/25 relative z-10" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {item.tag && <span className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-full backdrop-blur-sm">{item.tag}</span>}
          <div className="absolute top-3 right-3 flex gap-2">
            <button onClick={e => { e.stopPropagation(); onShare(); }} className="w-8 h-8 rounded-full bg-black/40 hover:bg-[#A91D3A]/70 flex items-center justify-center text-white transition-colors" title="Share to Story"><Share2 size={13} /></button>
            <button onClick={e => { e.stopPropagation(); onEdit(); }}  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"><Pencil size={13} /></button>
            <button onClick={e => { e.stopPropagation(); onDelete(); }} className="w-8 h-8 rounded-full bg-black/40 hover:bg-red-600/80 flex items-center justify-center text-white transition-colors"><Trash2 size={13} /></button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"><X size={15} /></button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button onClick={() => setLiked(v => !v)} className={`transition-colors ${liked ? "text-red-500" : "text-white/40 hover:text-red-400"}`}><Heart size={22} fill={liked ? "currentColor" : "none"} /></button>
              <button className="text-white/40 hover:text-white transition-colors"><MessageCircle size={22} /></button>
              <button onClick={onShare} className="text-white/40 hover:text-white transition-colors" title="Share to Story"><Share2 size={22} /></button>
            </div>
            <button onClick={() => setSaved(v => !v)} className={`transition-colors ${saved ? "text-white" : "text-white/30 hover:text-white/60"}`}><Bookmark size={22} fill={saved ? "currentColor" : "none"} /></button>
          </div>
          <p className="text-white font-black text-sm mb-1">{item.title}</p>
          {item.sport && <p className="text-[#C5A059] text-xs font-bold mb-1 uppercase tracking-widest">{item.sport}</p>}
          <p className="text-white/20 text-xs uppercase tracking-widest mb-4">{new Date(item.createdAt).toLocaleDateString()}</p>
          <div className="flex items-center gap-2 border-t border-white/5 pt-4">
            <div className="w-7 h-7 rounded-full bg-[#A91D3A] flex items-center justify-center text-white text-xs font-black shrink-0">IA</div>
            <input className="flex-1 bg-zinc-800 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#A91D3A]/50"
              placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} />
            {comment && <button onClick={() => setComment("")} className="text-[#A91D3A] font-bold text-xs hover:text-red-400 transition-colors">Post</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reel Detail Modal ────────────────────────────────────────────────────────

function ReelDetailModal({ item, onClose, onEdit, onDelete, onShare }: {
  item: MediaItem; onClose: () => void; onEdit: () => void; onDelete: () => void; onShare: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const bgClass = gradientFor(item.sport);
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`relative w-72 h-[75vh] rounded-3xl overflow-hidden bg-gradient-to-br ${bgClass} shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />
        {item.url && <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"><Play size={22} className="text-white ml-1" fill="white" /></div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={e => { e.stopPropagation(); onShare(); }} className="w-8 h-8 rounded-full bg-black/40 hover:bg-[#A91D3A]/70 flex items-center justify-center text-white transition-colors" title="Share to Story"><Share2 size={13} /></button>
          <button onClick={e => { e.stopPropagation(); onEdit(); }}   className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"><Pencil size={13} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="w-8 h-8 rounded-full bg-black/40 hover:bg-red-600/80 flex items-center justify-center text-white transition-colors"><Trash2 size={13} /></button>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"><X size={14} /></button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white font-bold text-sm leading-tight mb-1">{item.title}</p>
          {item.sport && <p className="text-[#C5A059] text-xs mb-3 font-bold">{item.sport}</p>}
          <div className="flex items-center gap-4">
            <button onClick={() => setLiked(v => !v)} className={`transition-colors ${liked ? "text-red-400" : "text-white/70 hover:text-white"}`}><Heart size={20} fill={liked ? "currentColor" : "none"} /></button>
            <button className="text-white/70 hover:text-white transition-colors"><MessageCircle size={20} /></button>
            <button onClick={onShare} className="text-white/70 hover:text-white transition-colors" title="Share to Story"><Share2 size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ item, onClick, onEdit, onDelete }: { item: MediaItem; onClick: () => void; onEdit: () => void; onDelete: () => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const bgClass = gradientFor(item.sport);
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-black/50 group">
      <div className={`relative h-52 bg-gradient-to-br ${bgClass} flex items-center justify-center cursor-pointer`} onClick={onClick}>
        {item.url ? <img src={item.url} alt={item.title} className="w-full h-full object-cover absolute inset-0" /> : <ImageIcon size={44} className="text-white/25" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {item.tag && <span className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-full backdrop-blur-sm">{item.tag}</span>}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onEdit(); }}   className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white"><Pencil size={12} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="w-7 h-7 rounded-full bg-black/50 hover:bg-red-600/80 flex items-center justify-center text-white"><Trash2 size={12} /></button>
        </div>
      </div>
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setLiked(v => !v)} className={`transition-colors ${liked ? "text-red-500" : "text-white/40 hover:text-red-400"}`}><Heart size={19} fill={liked ? "currentColor" : "none"} /></button>
          <button onClick={onClick} className="text-white/40 hover:text-white transition-colors"><MessageCircle size={19} /></button>
          <button className="text-white/40 hover:text-white transition-colors"><Share2 size={19} /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit}   className="text-white/20 hover:text-[#C5A059] transition-colors"><Pencil size={14} /></button>
          <button onClick={onDelete} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
          <button onClick={() => setSaved(v => !v)} className={`transition-colors ${saved ? "text-white" : "text-white/20 hover:text-white/50"}`}><Bookmark size={19} fill={saved ? "currentColor" : "none"} /></button>
        </div>
      </div>
      <div className="px-3 pb-3">
        <p className="text-xs text-white/80 font-black leading-snug line-clamp-1 cursor-pointer" onClick={onClick}>{item.title}</p>
        <p className="text-[10px] text-white/20 mt-0.5 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()} · {item.sport ?? "General"}</p>
      </div>
    </div>
  );
}

// ─── Reel Card ────────────────────────────────────────────────────────────────

function ReelCard({ item, onClick, onEdit, onDelete }: { item: MediaItem; onClick: () => void; onEdit: () => void; onDelete: () => void }) {
  const bgClass = gradientFor(item.sport);
  return (
    <div onClick={onClick} className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${bgClass} aspect-[9/16] cursor-pointer group border border-white/5`}>
      {item.url && <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-60" muted />}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors"><Play size={15} className="text-white ml-0.5" fill="white" /></div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={e => { e.stopPropagation(); onEdit(); }}   className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white"><Pencil size={11} /></button>
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="w-7 h-7 rounded-full bg-black/50 hover:bg-red-600/80 flex items-center justify-center text-white"><Trash2 size={11} /></button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-[10px] font-bold leading-tight line-clamp-2">{item.title}</p>
        {item.sport && <p className="text-[#C5A059] text-[9px] mt-0.5 font-bold">{item.sport}</p>}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ type, onUpload }: { type: "posts" | "reels"; onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
        {type === "posts" ? <Camera size={28} className="text-white/20" /> : <Film size={28} className="text-white/20" />}
      </div>
      <p className="text-white/30 text-sm font-bold uppercase tracking-widest">No {type} yet</p>
      <button onClick={onUpload} className="flex items-center gap-2 px-5 py-2 rounded-lg border border-white/10 hover:border-[#A91D3A]/50 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-all">
        <Plus size={13} /> Upload first {type === "posts" ? "post" : "reel"}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [activeTab,    setActiveTab]    = useState<"posts" | "reels">("posts");
  const [storyViewer,  setStoryViewer]  = useState<{ startIndex: number } | null>(null);
  const [hlViewer,     setHlViewer]     = useState<{ startIndex: number } | null>(null);
  const [showUpload,   setShowUpload]   = useState(false);
  const [showAddStory, setShowAddStory] = useState(false);
  const [showAddHL,    setShowAddHL]    = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editItem,     setEditItem]     = useState<MediaItem | null>(null);
  const [deleteItem,   setDeleteItem]   = useState<MediaItem | null>(null);
  const [shareItem,    setShareItem]    = useState<MediaItem | null>(null);
  const [archiveStory, setArchiveStory] = useState<StoryItem | null>(null);

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: allMedia    = [], isLoading: mediaLoading, refetch: refetchMedia }      = trpc.media.getAll.useQuery();
  const { data: stories     = [], isLoading: storyLoading, refetch: refetchStories }    = trpc.story.getActive.useQuery();
  const { data: highlights  = [], isLoading: hlLoading,   refetch: refetchHighlights } = trpc.highlight.getAll.useQuery();

  const deleteStory = trpc.story.delete.useMutation({ onSuccess: refetchStories });
  const deleteHL    = trpc.highlight.delete.useMutation({ onSuccess: refetchHighlights });

  const posts = allMedia.filter(m => m.type === "image");
  const reels = allMedia.filter(m => m.type === "video");

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white">

      {/* ── Modals ── */}
      {storyViewer !== null && stories.length > 0 && (
        <StoryViewer
          stories={stories} startIndex={storyViewer.startIndex}
          onClose={() => setStoryViewer(null)}
          onDelete={id => deleteStory.mutate({ id })}
          onArchive={s => { setArchiveStory(s); setStoryViewer(null); }}
        />
      )}
      {hlViewer !== null && highlights.length > 0 && (
        <HighlightViewer
          highlights={highlights} startIndex={hlViewer.startIndex}
          onClose={() => setHlViewer(null)}
          onDelete={id => deleteHL.mutate({ id })}
        />
      )}
      {showUpload   && <UploadModal        onClose={() => setShowUpload(false)}   onSuccess={refetchMedia} />}
      {showAddStory && <CreateStoryModal   onClose={() => setShowAddStory(false)} onSuccess={refetchStories} />}
      {showAddHL    && <AddHighlightModal  onClose={() => setShowAddHL(false)}    onSuccess={refetchHighlights} />}
      {shareItem    && <ShareToStoryModal  item={shareItem} onClose={() => setShareItem(null)}    onSuccess={refetchStories} />}
      {archiveStory && <ArchiveModal       story={archiveStory} onClose={() => setArchiveStory(null)} onSuccess={refetchHighlights} />}
      {selectedItem && (
        selectedItem.type === "video"
          ? <ReelDetailModal item={selectedItem} onClose={() => setSelectedItem(null)}
              onEdit={() => { setEditItem(selectedItem); setSelectedItem(null); }}
              onDelete={() => { setDeleteItem(selectedItem); setSelectedItem(null); }}
              onShare={() => { setShareItem(selectedItem); setSelectedItem(null); }}
            />
          : <PostDetailModal item={selectedItem} onClose={() => setSelectedItem(null)}
              onEdit={() => { setEditItem(selectedItem); setSelectedItem(null); }}
              onDelete={() => { setDeleteItem(selectedItem); setSelectedItem(null); }}
              onShare={() => { setShareItem(selectedItem); setSelectedItem(null); }}
            />
      )}
      {editItem   && <EditModal          item={editItem}   onClose={() => setEditItem(null)}   onSuccess={refetchMedia} />}
      {deleteItem && <DeleteConfirmModal item={deleteItem} onClose={() => setDeleteItem(null)} onSuccess={refetchMedia} />}

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5 px-6 py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-black italic tracking-tight text-white flex items-center gap-4">
            <div className="w-2 h-8 bg-[#A91D3A] rounded-full shadow-[0_0_16px_rgba(169,29,58,0.6)]" />
            MEDIA HUB
          </h1>
          <div className="flex gap-6 text-center">
            <div><p className="font-black text-lg leading-none text-[#C5A059]">{posts.length}</p><p className="text-[10px] text-white/30 tracking-widest uppercase mt-1">Posts</p></div>
            <div><p className="font-black text-lg leading-none text-[#C5A059]">{reels.length}</p><p className="text-[10px] text-white/30 tracking-widest uppercase mt-1">Reels</p></div>
            <div><p className="font-black text-lg leading-none text-[#C5A059]">{stories.length}</p><p className="text-[10px] text-white/30 tracking-widest uppercase mt-1">Stories</p></div>
            <div><p className="font-black text-lg leading-none text-[#C5A059]">{highlights.length}</p><p className="text-[10px] text-white/30 tracking-widest uppercase mt-1">Highlights</p></div>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-[#A91D3A] hover:bg-[#c4223f] text-white text-xs font-black tracking-widest uppercase px-5 py-2.5 rounded-lg transition-colors shadow-[0_0_16px_rgba(169,29,58,0.4)]">
            <Plus size={14} /> Upload Media
          </button>
        </div>
      </header>

      {/* ══ STORIES ROW ══════════════════════════════════════════════════════ */}
      <div className="border-b border-white/5 px-6 py-4 bg-[#0A0A0A]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-[#A91D3A]" />
            <span className="text-[10px] font-black tracking-widest uppercase text-white/40">Stories</span>
            <span className="text-[9px] text-white/20 italic">· expires in 24h</span>
            {storyLoading && <Loader2 size={11} className="animate-spin text-white/20 ml-1" />}
          </div>
          {/* ★ Distinct "Add Story" button — red, pill shape */}
          <button onClick={() => setShowAddStory(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A91D3A] hover:bg-[#c4223f] text-white text-[10px] font-black tracking-widest uppercase transition-colors shadow-[0_0_12px_rgba(169,29,58,0.5)]">
            <Plus size={11} /> Add Story
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Your story bubble (always shown — clicking opens create modal) */}
          <button onClick={() => setShowAddStory(true)} className="flex flex-col items-center gap-2 shrink-0 group">
            <div className="relative w-16 h-16">
              {/* Gradient ring — distinct from highlights (animated pulse) */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#A91D3A] to-rose-400 animate-pulse opacity-70" />
              <div className="absolute inset-[2px] rounded-full bg-[#0A0A0A] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#A91D3A]/20 flex items-center justify-center">
                  <Plus size={20} className="text-[#A91D3A]" />
                </div>
              </div>
            </div>
            <span className="text-[9px] font-black tracking-widest text-white/30 uppercase">Your Story</span>
          </button>

          {/* Active stories from DB */}
          {stories.map((story, i) => (
            <button key={story.id} onClick={() => setStoryViewer({ startIndex: i })} className="flex flex-col items-center gap-2 shrink-0 group">
              <div className="relative w-16 h-16">
                {/* Story ring — solid gradient, no pulse (already posted) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#A91D3A] via-rose-500 to-orange-400" />
                <div className="absolute inset-[2px] rounded-full bg-[#0A0A0A]">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {story.imageUrl
                      ? <img src={story.imageUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-[#A91D3A] to-[#741029] flex items-center justify-center text-2xl">{story.emoji ?? "✨"}</div>
                    }
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black tracking-widest text-white/30 group-hover:text-white/60 max-w-[64px] text-center leading-tight uppercase transition-colors">
                {timeLeft(story.expiresAt)}
              </span>
            </button>
          ))}

          {!storyLoading && stories.length === 0 && (
            <p className="text-white/15 text-xs italic self-center pl-2">No active stories</p>
          )}
        </div>
      </div>

      {/* ══ HIGHLIGHTS ROW ═══════════════════════════════════════════════════ */}
      <div className="border-b border-white/5 px-6 py-4 bg-[#0A0A0A]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={13} className="text-[#C5A059] fill-[#C5A059]" />
            <span className="text-[10px] font-black tracking-widest uppercase text-white/40">Highlights</span>
            <span className="text-[9px] text-white/20 italic">· permanent</span>
            {hlLoading && <Loader2 size={11} className="animate-spin text-white/20 ml-1" />}
          </div>
          {/* ★ Distinct "Add Highlight" button — gold, pill shape */}
          <button onClick={() => setShowAddHL(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C5A059] hover:bg-[#d4b06a] text-white text-[10px] font-black tracking-widest uppercase transition-colors">
            <Plus size={11} /> Add Highlight
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {highlights.map((h, i) => (
            <button key={h.id} onClick={() => setHlViewer({ startIndex: i })} className="flex flex-col items-center gap-2 shrink-0 group">
              <div className="relative w-16 h-16">
                {/* Highlight ring — gold gradient, no animation, clearly different */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C5A059] to-amber-300 group-hover:scale-105 transition-transform" />
                <div className="absolute inset-[2px] rounded-full bg-[#0A0A0A]">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${h.color} overflow-hidden flex items-center justify-center`}>
                    {h.coverUrl
                      ? <img src={h.coverUrl} alt={h.label} className="w-full h-full object-cover" />
                      : <Star size={20} className="text-white/60 fill-white/30" />
                    }
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-black tracking-widest text-white/30 group-hover:text-white/60 max-w-[64px] text-center leading-tight uppercase transition-colors">{h.label}</span>
            </button>
          ))}

          {!hlLoading && highlights.length === 0 && (
            <p className="text-white/15 text-xs italic self-center pl-2">No highlights yet — save a story or create one</p>
          )}
        </div>
      </div>

      {/* ══ TABS ═════════════════════════════════════════════════════════════ */}
      <div className="border-b border-white/5 px-6 bg-[#0A0A0A]">
        <div className="flex">
          {(["posts", "reels"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-3.5 text-[10px] font-black tracking-widest uppercase border-b-2 transition-colors ${activeTab === tab ? "border-[#A91D3A] text-white" : "border-transparent text-white/30 hover:text-white/60"}`}>
              {tab === "posts" ? <Grid3X3 size={13} /> : <Film size={13} />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ══════════════════════════════════════════════════════════ */}
      <div className="p-6">
        {mediaLoading && (
          <div className="flex items-center justify-center py-24 gap-3 text-white/30">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-bold uppercase tracking-widest">Loading media…</span>
          </div>
        )}

        {!mediaLoading && activeTab === "posts" && (
          posts.length === 0
            ? <EmptyState type="posts" onUpload={() => setShowUpload(true)} />
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map(item => (
                  <PostCard key={item.id} item={item}
                    onClick={() => setSelectedItem(item)}
                    onEdit={() => setEditItem(item)}
                    onDelete={() => setDeleteItem(item)}
                  />
                ))}
                <div onClick={() => setShowUpload(true)}
                  className="border-2 border-dashed border-white/5 hover:border-[#A91D3A]/30 rounded-2xl flex flex-col items-center justify-center py-14 gap-3 cursor-pointer group transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-[#A91D3A]/10 flex items-center justify-center transition-colors">
                    <Camera size={20} className="text-white/20 group-hover:text-[#A91D3A]/60 transition-colors" />
                  </div>
                  <p className="text-xs font-black text-white/20 group-hover:text-[#A91D3A]/60 tracking-widest uppercase transition-colors">Add Post</p>
                </div>
              </div>
        )}

        {!mediaLoading && activeTab === "reels" && (
          reels.length === 0
            ? <EmptyState type="reels" onUpload={() => setShowUpload(true)} />
            : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {reels.map(item => (
                  <ReelCard key={item.id} item={item}
                    onClick={() => setSelectedItem(item)}
                    onEdit={() => setEditItem(item)}
                    onDelete={() => setDeleteItem(item)}
                  />
                ))}
                <div onClick={() => setShowUpload(true)}
                  className="aspect-[9/16] border-2 border-dashed border-white/5 hover:border-[#A91D3A]/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer group transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-[#A91D3A]/10 flex items-center justify-center transition-colors">
                    <Film size={17} className="text-white/20 group-hover:text-[#A91D3A]/60 transition-colors" />
                  </div>
                  <p className="text-[10px] font-black text-white/20 group-hover:text-[#A91D3A]/60 tracking-widest uppercase transition-colors text-center leading-tight">Add Reel</p>
                </div>
              </div>
        )}
      </div>
    </div>
  );
}