"use client";

import { useState, useRef } from "react";
import {
  Grid3X3, Film, Plus, Star, Play, Image as ImageIcon,
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Trophy, Flame, Users, Camera, X, Upload, ChevronLeft, ChevronRight,
  Loader2,
} from "lucide-react";
import { trpc } from "@/utils/trpc";

// ─── Filler Data ─────────────────────────────────────────────────────────────

const HIGHLIGHTS = [
  { id: 1, label: "BASKETBALL", color: "from-red-700 to-rose-500",      slides: [{ emoji: "🏀", text: "Basketball Finals — Game 7 overtime thriller!" }, { emoji: "🏆", text: "COS Scions take the crown!" }, { emoji: "🎉", text: "Champions celebrate on court." }] },
  { id: 2, label: "VOLLEYBALL", color: "from-purple-800 to-violet-600", slides: [{ emoji: "🏐", text: "Volleyball semi-finals — 5-set epic!" }, { emoji: "💥", text: "CSS Stallions spike their way to the finals." }] },
  { id: 3, label: "SWIMMING",   color: "from-yellow-700 to-amber-500",  slides: [{ emoji: "🏊", text: "100m Freestyle — new school record!" }, { emoji: "⏱️", text: "Time: 48.32s — fastest in UP Cebu history." }] },
  { id: 4, label: "TRACK",      color: "from-teal-700 to-emerald-500",  slides: [{ emoji: "⚡", text: "100m Sprint finals — Day 3." }, { emoji: "🥇", text: "Gold medal for SOM Tycoons!" }, { emoji: "📸", text: "Finish line photo." }] },
  { id: 5, label: "OPENING",    color: "from-red-600 to-orange-500",    slides: [{ emoji: "🎉", text: "IskoArena Intramurals 2025 is OPEN!" }, { emoji: "🔥", text: "Opening parade of athletes." }] },
  { id: 6, label: "AWARDS",     color: "from-yellow-600 to-amber-400",  slides: [{ emoji: "🏆", text: "Awards Night — best athletes honored." }, { emoji: "🌟", text: "MVP of the intramurals announced." }] },
  { id: 7, label: "CLOSING",    color: "from-stone-700 to-stone-500",   slides: [{ emoji: "🎊", text: "Closing ceremony — end of an amazing week!" }] },
  { id: 8, label: "BTS",        color: "from-purple-700 to-pink-600",   slides: [{ emoji: "📸", text: "Behind the scenes — Day 1 prep." }, { emoji: "🎥", text: "Camera crew setting up." }, { emoji: "😂", text: "Athletes having fun off-camera." }] },
];

const POSTS = [
  { id: 1, sport: "Basketball",       caption: "🏀 What a game! Team A clinches the championship in overtime thriller!", likes: 214, comments: 38, time: "2h",  bgClass: "from-red-900 via-red-700 to-rose-600",        icon: Trophy, tag: "FINALS"        },
  { id: 2, sport: "Volleyball",       caption: "🏐 Incredible rally from Team C in the semi-finals. The crowd went wild!", likes: 189, comments: 24, time: "5h",  bgClass: "from-purple-900 via-purple-700 to-violet-600", icon: Flame,  tag: "SEMI-FINALS"  },
  { id: 3, sport: "Swimming",         caption: "🏊 New school record broken! 100m freestyle final ends with a jaw-dropping finish!", likes: 301, comments: 56, time: "1d",  bgClass: "from-teal-900 via-teal-700 to-cyan-600",      icon: Star,   tag: "RECORD BROKEN"},
  { id: 4, sport: "Track & Field",    caption: "⚡ Lightning speed on the track! Our athletes gave everything in the 100m sprint.", likes: 145, comments: 19, time: "1d",  bgClass: "from-amber-900 via-amber-700 to-yellow-600",  icon: Flame,  tag: "DAY 3"        },
  { id: 5, sport: "Opening Ceremony", caption: "🎉 The IskoArena Intramurals 2025 is officially OPEN! May the best team win!", likes: 512, comments: 94, time: "3d",  bgClass: "from-rose-900 via-red-700 to-orange-600",     icon: Trophy, tag: "OPENING"       },
  { id: 6, sport: "Badminton",        caption: "🏸 Precision and power in the mixed doubles bracket. Team B advances to the semis!", likes: 97, comments: 12, time: "4d",  bgClass: "from-green-900 via-green-700 to-emerald-600", icon: Users,  tag: "QUARTERFINALS"},
];

const REELS = [
  { id: 1, title: "Best Dunks – Basketball Finals",    duration: "0:58", views: "2.1K", bgClass: "from-red-900 to-rose-700",     icon: Trophy },
  { id: 2, title: "Opening Ceremony Highlights",       duration: "1:34", views: "3.8K", bgClass: "from-orange-900 to-amber-700", icon: Flame  },
  { id: 3, title: "Swimming – Record-Breaking Moment", duration: "0:42", views: "1.5K", bgClass: "from-teal-900 to-cyan-700",    icon: Star   },
  { id: 4, title: "Volleyball Spike Compilation",      duration: "1:12", views: "1.9K", bgClass: "from-purple-900 to-violet-700",icon: Flame  },
  { id: 5, title: "Track & Field – Sprint Finals",     duration: "0:31", views: "987",  bgClass: "from-yellow-900 to-yellow-700",icon: Trophy },
  { id: 6, title: "Behind the Scenes – Day 1",         duration: "2:05", views: "1.2K", bgClass: "from-pink-900 to-rose-700",    icon: Camera },
];

const GRADIENTS = [
  "from-red-900 via-red-700 to-rose-600",
  "from-purple-900 via-purple-700 to-violet-600",
  "from-teal-900 via-teal-700 to-cyan-600",
  "from-amber-900 via-amber-700 to-yellow-600",
  "from-green-900 via-green-700 to-emerald-600",
  "from-pink-900 via-pink-700 to-rose-600",
];

const TAGS_POST = ["FINALS", "SEMI-FINALS", "QUARTERFINALS", "RECORD BROKEN", "OPENING", "CLOSING", "DAY 1", "DAY 2", "DAY 3"];
const TAGS_REEL = ["HIGHLIGHTS", "COMPILATION", "BEST MOMENTS", "BEHIND THE SCENES", "CEREMONY"];

// ─── Shared style helpers ─────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20";
const labelCls =
  "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5";

// ─── Sport Dropdown ───────────────────────────────────────────────────────────
// Fetches sports live from Supabase via tRPC instead of using a hardcoded array.
// Shows a spinner while loading and falls back to a text input on error.

function SportDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { data: sports, isLoading, isError } = trpc.sport.getAll.useQuery();

  if (isLoading) {
    return (
      <div>
        <label className={labelCls}>Sport</label>
        <div className="flex items-center gap-2 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-500">
          <Loader2 size={13} className="animate-spin shrink-0" />
          Loading sports…
        </div>
      </div>
    );
  }

  if (isError) {
    // Graceful fallback — still lets the user type a sport manually
    return (
      <div>
        <label className={labelCls}>Sport</label>
        <input
          className={inputCls}
          placeholder="Type sport name…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div>
      <label className={labelCls}>Sport</label>
      <select
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select a sport</option>
        {(sports ?? []).map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Highlight Viewer ─────────────────────────────────────────────────────────

function HighlightViewer({
  highlights,
  startIndex,
  onClose,
}: {
  highlights: typeof HIGHLIGHTS;
  startIndex: number;
  onClose: () => void;
}) {
  const [hlIdx, setHlIdx] = useState(startIndex);
  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const hl = highlights[hlIdx];
  const totalSlides = hl.slides.length;

  const goNextSlide = () => {
    if (slideIdx < totalSlides - 1) setSlideIdx((s) => s + 1);
    else if (hlIdx < highlights.length - 1) { setHlIdx((h) => h + 1); setSlideIdx(0); }
    else onClose();
  };

  const goPrevSlide = () => {
    if (slideIdx > 0) setSlideIdx((s) => s - 1);
    else if (hlIdx > 0) { setHlIdx((h) => h - 1); setSlideIdx(highlights[hlIdx - 1].slides.length - 1); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <div
        className="relative w-full max-w-sm h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
          {hl.slides.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: i < slideIdx ? "100%" : i === slideIdx ? "100%" : "0%",
                  transition: i === slideIdx ? `width ${paused ? "0s" : "3.5s"} linear` : "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-3 right-3 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${hl.color} border-2 border-white/40`} />
            <span className="text-white text-xs font-bold tracking-widest">{hl.label}</span>
            <span className="text-white/50 text-[10px]">· just now</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Slide */}
        <div className={`w-full h-full bg-gradient-to-br ${hl.color} flex flex-col items-center justify-center gap-5 px-8`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent)]" />
          <span className="text-7xl relative z-10 drop-shadow-lg">{hl.slides[slideIdx].emoji}</span>
          <p className="text-white font-bold text-center text-base leading-snug relative z-10 drop-shadow">{hl.slides[slideIdx].text}</p>
          <p className="text-white/40 text-xs relative z-10">{slideIdx + 1} / {totalSlides}</p>
        </div>

        {/* Tap zones */}
        <button className="absolute left-0 top-0 w-2/5 h-full z-10" onClick={goPrevSlide} />
        <button className="absolute right-0 top-0 w-2/5 h-full z-10" onClick={goNextSlide} />

        {(hlIdx > 0 || slideIdx > 0) && (
          <button onClick={goPrevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all">
            <ChevronLeft size={18} />
          </button>
        )}
        <button onClick={goNextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all">
          <ChevronRight size={18} />
        </button>

        {/* Dot switcher */}
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

// ─── Add Highlight Modal ──────────────────────────────────────────────────────

function AddHighlightModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#A91D3A] to-[#741029] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-base">New Highlight</h3>
            <p className="text-white/60 text-xs mt-0.5">Create a new story highlight</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Highlight Name</label>
            <input className={inputCls} placeholder="e.g. Cheerdance, Esports..." value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Cover Photo</label>
            <div className="border-2 border-dashed border-gray-700 hover:border-red-500 rounded-xl p-6 text-center cursor-pointer transition-colors">
              <Upload size={22} className="mx-auto text-gray-600 mb-2" />
              <p className="text-xs text-gray-500">Click to upload cover</p>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold transition-colors border border-gray-700">Cancel</button>
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-[#A91D3A] hover:bg-[#8B1528] text-white rounded-lg text-sm font-bold transition-colors">Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({ onClose, onAdd }: { onClose: () => void; onAdd: (type: "post" | "reel", item: any) => void }) {
  const [step, setStep] = useState<"choose" | "post" | "reel">("choose");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [sport, setSport] = useState("");   // ← populated by SportDropdown
  const [tag, setTag] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const TAGS = step === "post" ? TAGS_POST : TAGS_REEL;

  const handleSubmit = () => {
    const grad = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    if (step === "post") {
      onAdd("post", { id: Date.now(), sport: sport || "General", caption, likes: 0, comments: 0, time: "just now", bgClass: grad, icon: Trophy, tag: tag || "NEW" });
    } else {
      onAdd("reel", { id: Date.now(), title, duration: "0:00", views: "0", bgClass: grad, icon: Film });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A91D3A] to-[#741029] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-base">
              {step === "choose" ? "Upload Media" : step === "post" ? "New Post" : "New Reel"}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">
              {step === "choose" ? "What would you like to share?" : step === "post" ? "Share a match moment" : "Upload a video highlight"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"><X size={16} /></button>
        </div>

        <div className="p-5">
          {/* Step 1 — choose type */}
          {step === "choose" && (
            <div className="space-y-3">
              <button onClick={() => setStep("post")}
                className="w-full flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 hover:border-red-500/50 rounded-xl transition-all group text-left">
                <div className="w-12 h-12 rounded-xl bg-[#A91D3A]/20 flex items-center justify-center shrink-0 group-hover:bg-[#A91D3A]/30 transition-colors">
                  <ImageIcon size={22} className="text-[#A91D3A]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Post</p>
                  <p className="text-gray-400 text-xs mt-0.5">Share a photo or image update</p>
                </div>
                <ChevronRight size={16} className="text-gray-600 ml-auto group-hover:text-red-400 transition-colors" />
              </button>

              <button onClick={() => setStep("reel")}
                className="w-full flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 hover:border-red-500/50 rounded-xl transition-all group text-left">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 group-hover:bg-purple-500/30 transition-colors">
                  <Film size={22} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Reel</p>
                  <p className="text-gray-400 text-xs mt-0.5">Upload a short video highlight</p>
                </div>
                <ChevronRight size={16} className="text-gray-600 ml-auto group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          )}

          {/* Step 2 — form */}
          {(step === "post" || step === "reel") && (
            <div className="space-y-4">
              <button onClick={() => setStep("choose")} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors mb-1">
                <ChevronLeft size={14} /> Back
              </button>

              {/* File upload */}
              <div>
                <label className={labelCls}>{step === "post" ? "Photo / Image" : "Video File"}</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 hover:border-red-500 rounded-xl p-5 text-center cursor-pointer transition-colors group">
                  <input ref={fileRef} type="file" accept={step === "post" ? "image/*" : "video/*"} className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  {file ? (
                    <p className="text-green-400 text-sm font-semibold">✓ {file.name}</p>
                  ) : (
                    <>
                      <Upload size={22} className="mx-auto text-gray-600 group-hover:text-red-400 transition-colors mb-2" />
                      <p className="text-xs text-gray-500">Click to upload or drag & drop</p>
                    </>
                  )}
                </div>
              </div>

              {step === "post" ? (
                <>
                  {/* Caption */}
                  <div>
                    <label className={labelCls}>Caption</label>
                    <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Write a caption..."
                      value={caption} onChange={(e) => setCaption(e.target.value)} />
                  </div>

                  {/* Sport + Tag side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* ★ Live sport dropdown */}
                    <SportDropdown value={sport} onChange={setSport} />

                    <div>
                      <label className={labelCls}>Tag</label>
                      <select className={inputCls} value={tag} onChange={(e) => setTag(e.target.value)}>
                        <option value="">Select</option>
                        {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelCls}>Reel Title *</label>
                    <input className={inputCls} placeholder="e.g. Best Dunks Compilation"
                      value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  {/* ★ Sport dropdown on reels too */}
                  <SportDropdown value={sport} onChange={setSport} />
                </>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold border border-gray-700 transition-colors">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-[#A91D3A] hover:bg-[#8B1528] text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                  {step === "post" ? "Share Post" : "Upload Reel"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Post Detail Modal ────────────────────────────────────────────────────────

function PostDetailModal({ post, onClose }: { post: (typeof POSTS)[number]; onClose: () => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState("");
  const Icon = post.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className={`relative h-72 bg-gradient-to-br ${post.bgClass} flex items-center justify-center shrink-0`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />
          <Icon size={56} className="text-white/25 relative z-10" />
          <span className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded-full backdrop-blur-sm">{post.tag}</span>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"><X size={15} /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button onClick={() => setLiked((v) => !v)} className={`transition-colors ${liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
                <Heart size={22} fill={liked ? "currentColor" : "none"} />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors"><MessageCircle size={22} /></button>
              <button className="text-gray-400 hover:text-white transition-colors"><Share2 size={22} /></button>
            </div>
            <button onClick={() => setSaved((v) => !v)} className={`transition-colors ${saved ? "text-white" : "text-gray-500 hover:text-gray-300"}`}>
              <Bookmark size={22} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="text-white font-bold text-sm mb-1">{liked ? post.likes + 1 : post.likes} likes</p>
          <p className="text-gray-300 text-sm leading-relaxed mb-1">
            <span className="text-white font-bold mr-1.5">iskoarena</span>{post.caption}
          </p>
          <p className="text-gray-600 text-xs uppercase tracking-wide mb-4">{post.time} ago · {post.sport}</p>

          <div className="flex items-center gap-2 border-t border-gray-800 pt-4">
            <div className="w-7 h-7 rounded-full bg-[#A91D3A] flex items-center justify-center text-white text-xs font-black shrink-0">IA</div>
            <input className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
            {comment && (
              <button onClick={() => setComment("")} className="text-[#A91D3A] font-bold text-xs hover:text-red-400 transition-colors">Post</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reel Detail Modal ────────────────────────────────────────────────────────

function ReelDetailModal({ reel, onClose }: { reel: (typeof REELS)[number]; onClose: () => void }) {
  const [liked, setLiked] = useState(false);
  const Icon = reel.icon;
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`relative w-72 h-[75vh] rounded-2xl overflow-hidden bg-gradient-to-br ${reel.bgClass} shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />
        <div className="absolute inset-0 flex items-center justify-center"><Icon size={40} className="text-white/20" /></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play size={22} className="text-white ml-1" fill="white" />
          </div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"><X size={14} /></button>
        <div className="absolute top-4 left-4 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">{reel.duration}</div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white font-bold text-sm leading-tight mb-1">{reel.title}</p>
          <p className="text-white/60 text-xs mb-3">{reel.views} views</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setLiked((v) => !v)} className={`transition-colors ${liked ? "text-red-400" : "text-white/70 hover:text-white"}`}>
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
            </button>
            <button className="text-white/70 hover:text-white transition-colors"><MessageCircle size={20} /></button>
            <button className="text-white/70 hover:text-white transition-colors"><Share2 size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onClick }: { post: (typeof POSTS)[number]; onClick: () => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const Icon = post.icon;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-600 transition-all">
      <div className={`relative h-52 bg-gradient-to-br ${post.bgClass} flex items-center justify-center cursor-pointer`} onClick={onClick}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />
        <Icon size={44} className="text-white/25" />
        <span className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded-full backdrop-blur-sm">{post.tag}</span>
        <button className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setLiked((v) => !v)} className={`transition-colors ${liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
            <Heart size={19} fill={liked ? "currentColor" : "none"} />
          </button>
          <button onClick={onClick} className="text-gray-400 hover:text-white transition-colors"><MessageCircle size={19} /></button>
          <button className="text-gray-400 hover:text-white transition-colors"><Share2 size={19} /></button>
        </div>
        <button onClick={() => setSaved((v) => !v)} className={`transition-colors ${saved ? "text-white" : "text-gray-500 hover:text-gray-300"}`}>
          <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="px-3 pb-1">
        <span className="text-xs font-bold text-white">{liked ? post.likes + 1 : post.likes} likes</span>
      </div>
      <div className="px-3 pb-3">
        <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 cursor-pointer" onClick={onClick}>
          <span className="font-bold text-white mr-1">iskoarena</span>{post.caption}
        </p>
        <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide">{post.time} ago · {post.sport}</p>
      </div>
    </div>
  );
}

// ─── Reel Card ────────────────────────────────────────────────────────────────

function ReelCard({ reel, onClick }: { reel: (typeof REELS)[number]; onClick: () => void }) {
  const Icon = reel.icon;
  return (
    <div onClick={onClick} className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${reel.bgClass} aspect-[9/16] cursor-pointer group`}>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />
      <div className="absolute inset-0 flex items-center justify-center"><Icon size={28} className="text-white/20" /></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Play size={15} className="text-white ml-0.5" fill="white" />
        </div>
      </div>
      <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">{reel.duration}</div>
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-[10px] font-semibold leading-tight line-clamp-2">{reel.title}</p>
        <p className="text-white/60 text-[9px] mt-0.5">{reel.views} views</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");
  const [hlViewer, setHlViewer] = useState<{ startIndex: number } | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showAddHighlight, setShowAddHighlight] = useState(false);
  const [selectedPost, setSelectedPost] = useState<(typeof POSTS)[number] | null>(null);
  const [selectedReel, setSelectedReel] = useState<(typeof REELS)[number] | null>(null);
  const [posts, setPosts] = useState(POSTS);
  const [reels, setReels] = useState(REELS);

  const handleAdd = (type: "post" | "reel", item: any) => {
    if (type === "post") setPosts((prev) => [item, ...prev]);
    else setReels((prev) => [item, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white">
      {hlViewer && <HighlightViewer highlights={HIGHLIGHTS} startIndex={hlViewer.startIndex} onClose={() => setHlViewer(null)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onAdd={handleAdd} />}
      {showAddHighlight && <AddHighlightModal onClose={() => setShowAddHighlight(false)} />}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      {selectedReel && <ReelDetailModal reel={selectedReel} onClose={() => setSelectedReel(null)} />}

      {/* ── Profile Header ── */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-[#A91D3A] flex items-center justify-center bg-[#A91D3A]/10 shrink-0">
              <span className="text-[#A91D3A] font-black text-xl" style={{ fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>IA</span>
            </div>
            <div>
              <h1 className="font-black text-base tracking-[0.15em] uppercase" style={{ fontFamily: "Georgia, serif" }}>IskoArena</h1>
              <p className="text-[11px] text-gray-500 tracking-[0.2em] uppercase mt-0.5">Official Media Hub</p>
            </div>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <p className="font-black text-lg leading-none">{posts.length}</p>
              <p className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mt-1">Posts</p>
            </div>
            <div>
              <p className="font-black text-lg leading-none">{reels.length}</p>
              <p className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mt-1">Reels</p>
            </div>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-[#A91D3A] hover:bg-[#8B1528] text-white text-xs font-black tracking-[0.15em] uppercase px-5 py-2.5 rounded-lg transition-colors shadow-md">
            <Plus size={14} /> Upload Media
          </button>
        </div>
      </div>

      {/* ── Highlights ── */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-black tracking-[0.2em] uppercase text-gray-200">Highlights</span>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setShowAddHighlight(true)} className="flex flex-col items-center gap-2 shrink-0 group">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 group-hover:border-[#A91D3A] flex items-center justify-center transition-colors">
              <Plus size={20} className="text-gray-500 group-hover:text-[#A91D3A] transition-colors" />
            </div>
            <span className="text-[9px] font-bold tracking-[0.15em] text-gray-500 group-hover:text-gray-300 transition-colors uppercase">New</span>
          </button>
          {HIGHLIGHTS.map((h, i) => (
            <button key={h.id} onClick={() => setHlViewer({ startIndex: i })} className="flex flex-col items-center gap-2 shrink-0 group">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${h.color} flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#A91D3A] group-hover:ring-offset-2 group-hover:ring-offset-gray-900 group-hover:scale-105 transition-all`}>
                <ImageIcon size={22} className="text-white/60" />
              </div>
              <span className="text-[9px] font-bold tracking-[0.1em] text-gray-500 group-hover:text-gray-300 max-w-[64px] text-center leading-tight uppercase transition-colors">{h.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <div className="flex">
          {(["posts", "reels"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-black tracking-[0.15em] uppercase border-b-2 transition-colors ${activeTab === tab ? "border-[#A91D3A] text-white" : "border-transparent text-gray-600 hover:text-gray-400"}`}>
              {tab === "posts" ? <Grid3X3 size={13} /> : <Film size={13} />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-5">
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />)}
            <div onClick={() => setShowUpload(true)}
              className="border-2 border-dashed border-gray-800 hover:border-[#A91D3A]/50 rounded-xl flex flex-col items-center justify-center py-14 gap-3 cursor-pointer group transition-colors">
              <div className="w-12 h-12 rounded-full bg-gray-800 group-hover:bg-[#A91D3A]/10 flex items-center justify-center transition-colors">
                <Camera size={20} className="text-gray-600 group-hover:text-[#A91D3A] transition-colors" />
              </div>
              <p className="text-xs font-bold text-gray-600 group-hover:text-[#A91D3A] tracking-widest uppercase transition-colors">Add Post</p>
            </div>
          </div>
        )}

        {activeTab === "reels" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {reels.map((reel) => <ReelCard key={reel.id} reel={reel} onClick={() => setSelectedReel(reel)} />)}
            <div onClick={() => setShowUpload(true)}
              className="aspect-[9/16] border-2 border-dashed border-gray-800 hover:border-[#A91D3A]/50 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer group transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-[#A91D3A]/10 flex items-center justify-center transition-colors">
                <Film size={17} className="text-gray-600 group-hover:text-[#A91D3A] transition-colors" />
              </div>
              <p className="text-[10px] font-bold text-gray-600 group-hover:text-[#A91D3A] tracking-widest uppercase transition-colors text-center leading-tight">Add Reel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}