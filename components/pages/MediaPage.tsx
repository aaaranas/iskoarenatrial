"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Grid3X3, Film, Plus, Play, Image as ImageIcon,
  Heart, MessageCircle, Share2, Bookmark, Camera, X, Upload,
  ChevronLeft, ChevronRight, Loader2, Pencil, Trash2, Check,
  BookMarked, Search, Zap, TrendingUp, Eye,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/components/providers/role-provider";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

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

        {/* Progress */}
        <div className="absolute top-5 left-4 right-4 z-20 flex gap-1.5">
          {hl.slides.map((_, i) => (
            <div key={i} className="flex-1 h-[2px] rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-none"
                style={{ width: i < slideIdx ? "100%" : i === slideIdx ? `${progress}%` : "0%" }} />
            </div>
          ))}
        </div>

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

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step,      setStep]      = useState<"choose" | "post" | "reel">("choose");
  const [title,     setTitle]     = useState("");
  const [caption,   setCaption]   = useState("");
  const [sportId,   setSportId]   = useState("");
  const [tag,       setTag]       = useState("");
  const [file,      setFile]      = useState<File | null>(null);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error,     setError]     = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const TAGS    = step === "post" ? TAGS_POST : TAGS_REEL;

  const handleFile = (f: File) => {
    setFile(f);
    const r = new FileReader();
    r.onload = e => setPreview(e.target?.result as string);
    r.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!file || !title) return setError(!file ? "Choose a file." : "Title is required.");
    setError(null); setUploading(true); setUploadPct(15);
    try {
      const ext      = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      setUploadPct(35);
      const { error: upErr } = await supabase.storage.from("media").upload(fileName, file, { upsert: false });
      if (upErr) throw new Error(upErr.message);
      setUploadPct(70);
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
      const { error: dbErr } = await supabase.from("media").insert({
        title,
        type:      file.type.startsWith("video/") ? "video" : "image",
        url:       urlData.publicUrl,
        file_name: fileName,
        sport_id:  sportId || null,
        match_id:  null,
        tag:       tag  || null,
        size:      `${(file.size / 1024).toFixed(0)} KB`,
      });
      if (dbErr) throw new Error(dbErr.message);
      setUploadPct(100);
      setTimeout(() => { onSuccess(); onClose(); }, 400);
    } catch (e: any) {
      setError(e.message ?? "Upload failed.");
      setUploading(false); setUploadPct(0);
    }
  };

  const back = () => { setStep("choose"); setFile(null); setPreview(null); setError(null); };

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

            {/* Drop zone */}
            <div
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onDragOver={e => e.preventDefault()}
              onClick={() => !file && fileRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed overflow-hidden transition-all ${file ? "border-zinc-700 cursor-default" : "border-zinc-700 hover:border-zinc-500 cursor-pointer"}`}>
              <input ref={fileRef} type="file" accept={step === "post" ? "image/*" : "video/*"} className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {file && preview ? (
                <div className="relative">
                  {step === "post"
                    ? <img src={preview} alt="" className="w-full h-44 object-cover" />
                    : <div className="h-32 bg-zinc-900 flex items-center justify-center gap-3">
                        <Film size={20} className="text-zinc-500" />
                        <span className="text-zinc-400 text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                      </div>
                  }
                  <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black flex items-center justify-center text-white transition-all backdrop-blur-sm">
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-0.5">
                    <p className="text-white/70 text-[10px]">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Upload size={17} className="text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 text-sm font-medium">Drop here or click to browse</p>
                  <p className="text-zinc-600 text-xs">{step === "post" ? "PNG, JPG, WEBP" : "MP4, MOV, WEBM"}</p>
                </div>
              )}
            </div>

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
                  <span>Uploading…</span><span>{uploadPct}%</span>
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
                {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> : step === "post" ? "Share Post" : "Upload Reel"}
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
  const [label, setLabel]   = useState("");
  const [color, setColor]   = useState(COLOR_OPTIONS[0].value);
  const [emoji, setEmoji]   = useState("🌟");
  const [text,  setText]    = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);
  const createHL = trpc.highlight.create.useMutation();

  const handleCreate = async () => {
    if (!label.trim()) return setError("Name is required.");
    setError(null); setSaving(true);
    try {
      let coverUrl: string | null = null;
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const fn  = `highlights/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("media").upload(fn, coverFile, { upsert: false });
        if (upErr) throw new Error(upErr.message);
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(fn);
        coverUrl = urlData.publicUrl;
      }
      await createHL.mutateAsync({ label: label.trim(), color, coverUrl, slides: [{ emoji: emoji || null, text: text || null, order: 0 }] });
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message ?? "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="New Highlight" sub="Create a story highlight" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div>
          <label className={labelCls}>Name *</label>
          <input className={inputCls} placeholder="e.g. Basketball Finals" value={label} onChange={e => setLabel(e.target.value)} />
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
            {saving ? <><Loader2 size={13} className="animate-spin" /> Creating…</> : "Create Highlight"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Share to Story Modal ─────────────────────────────────────────────────────

function ShareToStoryModal({ item, onClose, onSuccess }: { item: MediaItem; onClose: () => void; onSuccess: () => void }) {
  const [label,  setLabel]  = useState(item.title.toUpperCase().slice(0, 20));
  const [color,  setColor]  = useState(COLOR_OPTIONS[0].value);
  const [emoji,  setEmoji]  = useState("📸");
  const [text,   setText]   = useState(item.title);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const createFromMedia = trpc.highlight.createFromMedia.useMutation();

  const handleShare = async () => {
    if (!label.trim()) return setError("Label is required.");
    setError(null); setSaving(true);
    try {
      await createFromMedia.mutateAsync({ mediaId: item.id, label: label.trim(), color, emoji: emoji || null, text: text || null });
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message ?? "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="Add to Story" sub="Create a highlight from this media" onClose={onClose} />
      <div className={`relative h-28 bg-gradient-to-br ${color} overflow-hidden`}>
        <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          <span className="text-4xl">{emoji}</span>
          <p className="text-white font-bold text-sm max-w-[160px] leading-snug">{text}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div><label className={labelCls}>Label *</label><input className={inputCls} placeholder="GAME DAY" value={label} onChange={e => setLabel(e.target.value)} /></div>
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
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><BookMarked size={13} /> Add to Story</>}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ item, onClose, onSuccess }: { item: MediaItem; onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle]   = useState(item.title);
  const [sportId, setSportId] = useState(item.sportId ?? "");
  const [tag, setTag]       = useState(item.tag ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const TAGS = item.type === "video" ? TAGS_REEL : TAGS_POST;

  const handleSave = async () => {
    if (!title.trim()) return setError("Title required.");
    setError(null); setSaving(true);
    try {
      const { error: dbErr } = await supabase.from("media").update({
        title:    title.trim(),
        sport_id: sportId || null,
        tag:      tag     || null,
      }).eq("id", item.id);
      if (dbErr) throw new Error(dbErr.message);
      onSuccess(); onClose();
    } catch (e: any) { setError(e.message ?? "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="Edit Media" sub="Update title, sport, or tag" onClose={onClose} />
      <div className="p-5 space-y-4">
        <div><label className={labelCls}>Title *</label><input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} /></div>
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
      await supabase.storage.from("media").remove([item.fileName]);
      const { error } = await supabase.from("media").delete().eq("id", item.id);
      if (error) throw new Error(error.message);
      onSuccess(); onClose();
    } catch (e: any) { console.error(e); setDeleting(false); }
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
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const cfg = sportConfig(item.sport);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(24px)", backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="relative shrink-0" style={{ aspectRatio: "16/9" }}>
          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          {item.tag && (
            <div className="absolute top-3 left-3">
              <span className="text-[9px] font-bold tracking-widest text-white/80 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                {item.tag}
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {[
              { icon: BookMarked, action: onShare, hover: "hover:bg-[#A91D3A]/70", adminOnly: false },
              { icon: Pencil,     action: onEdit,  hover: "hover:bg-zinc-600",     adminOnly: true  },
              { icon: Trash2,     action: onDelete, hover: "hover:bg-red-600/70", adminOnly: true  },
              { icon: X,          action: onClose,  hover: "hover:bg-zinc-600",    adminOnly: false },
            ].filter(b => !b.adminOnly || isAdmin).map(({ icon: Icon, action, hover }, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); action(); }}
                className={`w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm ${hover} flex items-center justify-center text-white/60 hover:text-white transition-all`}>
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-white font-semibold text-sm">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                {item.sport && <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.accent }}>{item.sport}</span>}
                {item.sport && <span className="text-zinc-700">·</span>}
                <span className="text-zinc-600 text-[10px]">{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => setLiked(v => !v)} className={`transition-all duration-200 ${liked ? "text-red-400 scale-110" : "text-zinc-600 hover:text-zinc-300"}`}>
                <Heart size={18} fill={liked ? "currentColor" : "none"} />
              </button>
              <button onClick={onShare} className="text-zinc-600 hover:text-zinc-300 transition-colors"><Share2 size={18} /></button>
              <button onClick={() => setSaved(v => !v)} className={`transition-all duration-200 ${saved ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}>
                <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
              </button>
            </div>
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
  const [liked,   setLiked]   = useState(false);
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
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-800"
        style={{ width: "300px", aspectRatio: "9/16" }}
        onClick={e => e.stopPropagation()}>
        {item.url
          ? <video ref={videoRef} src={item.url} className="absolute inset-0 w-full h-full object-cover" loop />
          : <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient}`} />
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {[
            { icon: BookMarked, action: onShare, hover: "hover:bg-[#A91D3A]/70", adminOnly: false },
            { icon: Pencil,     action: onEdit,  hover: "hover:bg-zinc-600",     adminOnly: true  },
            { icon: Trash2,     action: onDelete, hover: "hover:bg-red-600/70", adminOnly: true  },
            { icon: X,          action: onClose,  hover: "hover:bg-zinc-600",    adminOnly: false },
          ].filter(b => !b.adminOnly || isAdmin).map(({ icon: Icon, action, hover }, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); action(); }}
              className={`w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm ${hover} flex items-center justify-center text-white/60 hover:text-white transition-all`}>
              <Icon size={13} />
            </button>
          ))}
        </div>
        <button className="absolute inset-0 flex items-center justify-center" onClick={e => { e.stopPropagation(); togglePlay(); }}>
          {!playing && (
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center hover:bg-white/25 transition-all">
              <Play size={26} className="text-white ml-1" fill="white" />
            </div>
          )}
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-semibold text-sm leading-tight mb-1">{item.title}</p>
          {item.sport && <p className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: cfg.accent }}>{item.sport}</p>}
          <div className="flex items-center gap-4">
            <button onClick={() => setLiked(v => !v)} className={`transition-all ${liked ? "text-red-400 scale-110" : "text-white/60 hover:text-white"}`}>
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
            </button>
            <button onClick={onShare} className="text-white/60 hover:text-white transition-colors"><Share2 size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Featured Hero Card ───────────────────────────────────────────────────────

function HeroCard({ item, onClick, onShare }: { item: MediaItem; onClick: () => void; onShare: () => void }) {
  const cfg = sportConfig(item.sport);
  return (
    <div className="relative rounded-2xl overflow-hidden cursor-pointer group" style={{ aspectRatio: "16/7" }} onClick={onClick}>
      <img src={item.url} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Sport accent line */}
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: cfg.accent }} />

      <div className="absolute bottom-0 left-0 p-6 pr-12">
        {item.tag && (
          <div className="flex items-center gap-2 mb-3">
            <Zap size={10} style={{ color: cfg.accent }} />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: cfg.accent }}>{item.tag}</span>
          </div>
        )}
        <h2 className="text-white font-bold text-2xl leading-tight mb-2 max-w-[400px]">{item.title}</h2>
        <div className="flex items-center gap-3">
          {item.sport && <span className="text-white/50 text-xs font-medium">{item.sport}</span>}
          <span className="text-white/25 text-xs">{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <button onClick={e => { e.stopPropagation(); onShare(); }}
          className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm hover:bg-[#A91D3A]/80 flex items-center justify-center text-white transition-all">
          <BookMarked size={14} />
        </button>
      </div>

      {/* Featured badge */}
      <div className="absolute top-4 left-6">
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
          <TrendingUp size={10} className="text-white/60" />
          <span className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Featured</span>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ item, onClick, onEdit, onDelete, onShare, featured, isAdmin }: {
  item: MediaItem; onClick: () => void; onEdit: () => void; onDelete: () => void; onShare: () => void; featured?: boolean; isAdmin: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const cfg = sportConfig(item.sport);

  return (
    <article
      className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/60 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl cursor-pointer"
      style={featured ? { gridColumn: "span 2", gridRow: "span 2" } : {}}>
      <div className="relative overflow-hidden" style={{ aspectRatio: featured ? "4/3" : "1/1" }} onClick={onClick}>
        <img src={item.url} alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {item.tag && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[9px] font-bold tracking-widest text-white/80 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {item.tag}
            </span>
          </div>
        )}

        {/* Actions on hover — admin only */}
        {isAdmin && (
          <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-[-4px] group-hover:translate-y-0">
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

        {/* Bottom overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <p className="text-white font-semibold text-xs leading-snug line-clamp-2">{item.title}</p>
          {item.sport && <p className="text-[10px] font-semibold mt-0.5 uppercase" style={{ color: cfg.accent }}>{item.sport}</p>}
        </div>
      </div>

      {/* Footer — minimal */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-zinc-300 text-[11px] font-medium truncate">{item.title}</p>
          {item.sport && <p className="text-[9px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: cfg.accent }}>{item.sport}</p>}
        </div>
        <button onClick={e => { e.stopPropagation(); setLiked(v => !v); }}
          className={`shrink-0 ml-2 transition-all duration-200 ${liked ? "text-red-400 scale-110" : "text-zinc-700 hover:text-zinc-400"}`}>
          <Heart size={14} fill={liked ? "currentColor" : "none"} />
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [activeTab,    setActiveTab]    = useState<"posts" | "reels">("posts");
  const [hlViewer,     setHlViewer]     = useState<{ startIndex: number } | null>(null);
  const [showUpload,   setShowUpload]   = useState(false);
  const [showAddHL,    setShowAddHL]    = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editItem,     setEditItem]     = useState<MediaItem | null>(null);
  const [deleteItem,   setDeleteItem]   = useState<MediaItem | null>(null);
  const [shareItem,    setShareItem]    = useState<MediaItem | null>(null);
  const [search,       setSearch]       = useState("");
  const [sportFilter,  setSportFilter]  = useState("all");

  const { data: allMedia   = [], isLoading: mediaLoading, refetch: refetchMedia }     = trpc.media.getAll.useQuery();
  const { data: highlights = [], isLoading: hlLoading,   refetch: refetchHighlights } = trpc.highlight.getAll.useQuery();
  const { data: sports     = [] }                                                      = trpc.sport.getAll.useQuery();
  const deleteHL  = trpc.highlight.delete.useMutation({ onSuccess: refetchHighlights });
  const { isAdmin } = useRole();

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

  // Hero: most recent post with an image
  const heroPost = posts[0] ?? null;

  const statItems = [
    { label: "Posts",   value: allMedia.filter(m => m.type === "image").length, icon: ImageIcon },
    { label: "Reels",   value: allMedia.filter(m => m.type === "video").length, icon: Film      },
    { label: "Stories", value: highlights.length,                                icon: Zap       },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ── Modals ── */}
      {hlViewer !== null && highlights.length > 0 && (
        <HighlightViewer highlights={highlights} startIndex={hlViewer.startIndex}
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

      {/* ── Stories Strip ── */}
      <div className="border-b border-zinc-800/60 bg-zinc-950">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={11} className="text-[#A91D3A]" />
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500">Stories</span>
            {hlLoading && <Loader2 size={10} className="animate-spin text-zinc-700" />}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {/* New — admin only */}
            {isAdmin && (
              <button onClick={() => setShowAddHL(true)} className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-700 group-hover:border-zinc-500 flex items-center justify-center transition-all">
                  <Plus size={16} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
                <span className="text-[9px] font-medium tracking-widest text-zinc-700 uppercase">New</span>
              </button>
            )}

            {highlights.map((h, i) => (
              <button key={h.id} onClick={() => setHlViewer({ startIndex: i })} className="flex flex-col items-center gap-2 shrink-0 group">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${h.color} overflow-hidden ring-2 ring-transparent group-hover:ring-[#A91D3A] ring-offset-2 ring-offset-zinc-950 transition-all duration-200 group-hover:scale-105`}>
                  {h.coverUrl
                    ? <img src={h.coverUrl} alt={h.label} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-white/50" /></div>}
                </div>
                <span className="text-[9px] font-medium tracking-wide text-zinc-600 group-hover:text-zinc-400 max-w-[56px] text-center leading-tight uppercase transition-colors truncate w-full">{h.label}</span>
              </button>
            ))}

            {!hlLoading && highlights.length === 0 && (
              <p className="text-zinc-700 text-xs italic self-center pl-1">No highlights yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Toolbar: Tabs + Search + Sport Pills ── */}
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
        {mediaLoading && (
          <div className="flex items-center justify-center py-32 gap-3 text-zinc-700">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading media…</span>
          </div>
        )}

        {/* ── Posts view ── */}
        {!mediaLoading && activeTab === "posts" && (
          posts.length === 0 && !search && sportFilter === "all"
            ? <EmptyState type="posts" onUpload={isAdmin ? () => setShowUpload(true) : () => {}} />
            : <div className="space-y-4">
                {/* Hero */}
                {heroPost && !search && sportFilter === "all" && (
                  <HeroCard item={heroPost}
                    onClick={() => setSelectedItem(heroPost)}
                    onShare={() => setShareItem(heroPost)} />
                )}

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {(search || sportFilter !== "all" ? posts : posts.slice(1)).map(item => (
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
              </div>
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