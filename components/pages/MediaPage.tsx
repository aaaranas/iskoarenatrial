"use client";

import { useState } from "react";
import {
  Grid3X3,
  Film,
  Plus,
  Star,
  Play,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trophy,
  Flame,
  Users,
  Camera,
} from "lucide-react";

// ─── Filler Data ────────────────────────────────────────────────────────────

const HIGHLIGHTS = [
  { id: "new", label: "NEW", isNew: true },
  { id: 1, label: "BASKETBALL", color: "from-red-700 to-rose-500" },
  { id: 2, label: "VOLLEYBALL", color: "from-purple-800 to-violet-600" },
  { id: 3, label: "SWIMMING", color: "from-yellow-700 to-amber-500" },
  { id: 4, label: "TRACK", color: "from-teal-700 to-emerald-500" },
  { id: 5, label: "OPENING", color: "from-red-600 to-orange-500" },
  { id: 6, label: "AWARDS", color: "from-yellow-600 to-amber-400" },
  { id: 7, label: "CLOSING", color: "from-stone-700 to-stone-500" },
  { id: 8, label: "BEHIND THE SCENES", color: "from-purple-700 to-pink-600" },
];

const POSTS = [
  {
    id: 1,
    type: "post",
    sport: "Basketball",
    event: "Finals Night",
    caption: "🏀 What a game! Team A clinches the championship in overtime thriller. Full recap on the highlights reel!",
    likes: 214,
    comments: 38,
    time: "2h",
    bgClass: "from-red-900 via-red-700 to-rose-600",
    icon: Trophy,
    tag: "FINALS",
  },
  {
    id: 2,
    type: "post",
    sport: "Volleyball",
    event: "Semi-Finals",
    caption: "🏐 Incredible rally from Team C in the semi-finals. The crowd went absolutely wild in the 5th set!",
    likes: 189,
    comments: 24,
    time: "5h",
    bgClass: "from-purple-900 via-purple-700 to-violet-600",
    icon: Flame,
    tag: "SEMI-FINALS",
  },
  {
    id: 3,
    type: "post",
    sport: "Swimming",
    event: "100m Freestyle",
    caption: "🏊 New school record broken! 100m freestyle final ends with a jaw-dropping finish. Congrats to our champion!",
    likes: 301,
    comments: 56,
    time: "1d",
    bgClass: "from-teal-900 via-teal-700 to-cyan-600",
    icon: Star,
    tag: "RECORD BROKEN",
  },
  {
    id: 4,
    type: "post",
    sport: "Track & Field",
    event: "100m Sprint",
    caption: "⚡ Lightning speed on the track! Our athletes gave everything in the 100m sprint. Proud of every single one.",
    likes: 145,
    comments: 19,
    time: "1d",
    bgClass: "from-amber-900 via-amber-700 to-yellow-600",
    icon: Flame,
    tag: "DAY 3",
  },
  {
    id: 5,
    type: "post",
    sport: "Opening Ceremony",
    event: "Intramurals 2025",
    caption: "🎉 The IskоArena Intramurals 2025 is officially OPEN! Let the games begin. May the best team win!",
    likes: 512,
    comments: 94,
    time: "3d",
    bgClass: "from-rose-900 via-red-700 to-orange-600",
    icon: Trophy,
    tag: "OPENING",
  },
  {
    id: 6,
    type: "post",
    sport: "Badminton",
    event: "Mixed Doubles",
    caption: "🏸 Precision and power in the mixed doubles bracket. Team B advances to the semis with a clean sweep!",
    likes: 97,
    comments: 12,
    time: "4d",
    bgClass: "from-green-900 via-green-700 to-emerald-600",
    icon: Users,
    tag: "QUARTERFINALS",
  },
];

const REELS = [
  {
    id: 1,
    title: "Best Dunks – Basketball Finals",
    duration: "0:58",
    views: "2.1K",
    bgClass: "from-red-900 to-rose-700",
    icon: Trophy,
  },
  {
    id: 2,
    title: "Opening Ceremony Highlights",
    duration: "1:34",
    views: "3.8K",
    bgClass: "from-orange-900 to-amber-700",
    icon: Flame,
  },
  {
    id: 3,
    title: "Swimming – Record-Breaking Moment",
    duration: "0:42",
    views: "1.5K",
    bgClass: "from-teal-900 to-cyan-700",
    icon: Star,
  },
  {
    id: 4,
    title: "Volleyball Spike Compilation",
    duration: "1:12",
    views: "1.9K",
    bgClass: "from-purple-900 to-violet-700",
    icon: Flame,
  },
  {
    id: 5,
    title: "Track & Field – Sprint Finals",
    duration: "0:31",
    views: "987",
    bgClass: "from-yellow-900 to-yellow-700",
    icon: Trophy,
  },
  {
    id: 6,
    title: "Behind the Scenes – Day 1",
    duration: "2:05",
    views: "1.2K",
    bgClass: "from-pink-900 to-rose-700",
    icon: Camera,
  },
];

// ─── Sub-Components ──────────────────────────────────────────────────────────

function HighlightBubble({
  h,
  active,
  onClick,
}: {
  h: (typeof HIGHLIGHTS)[number];
  active: boolean;
  onClick: () => void;
}) {
  if ("isNew" in h && h.isNew) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 flex-shrink-0"
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-red-500 transition-colors">
          <Plus size={20} className="text-gray-400" />
        </div>
        <span className="text-[10px] font-bold tracking-widest text-gray-400">
          NEW
        </span>
      </button>
    );
  }

  const hl = h as Exclude<(typeof HIGHLIGHTS)[number], { isNew: boolean }>;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 flex-shrink-0"
    >
      <div
        className={`w-16 h-16 rounded-full bg-gradient-to-br ${hl.color} flex items-center justify-center ring-2 transition-all ${
          active
            ? "ring-red-500 ring-offset-2 ring-offset-white scale-110"
            : "ring-transparent hover:ring-red-400 hover:ring-offset-1 hover:ring-offset-white"
        }`}
      >
        <ImageIcon size={22} className="text-white/60" />
      </div>
      <span className="text-[9px] font-bold tracking-widest text-gray-600 max-w-[64px] text-center leading-tight">
        {hl.label}
      </span>
    </button>
  );
}

function PostCard({ post }: { post: (typeof POSTS)[number] }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const Icon = post.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Media placeholder */}
      <div
        className={`relative h-56 bg-gradient-to-br ${post.bgClass} flex items-center justify-center`}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />
        <Icon size={48} className="text-white/30" />
        <span className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded-full backdrop-blur-sm">
          {post.tag}
        </span>
        <span className="absolute top-3 right-3 text-white/70">
          <MoreHorizontal size={18} />
        </span>
      </div>

      {/* Actions */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLiked((v) => !v)}
            className={`transition-colors ${liked ? "text-red-500" : "text-gray-600 hover:text-red-400"}`}
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <MessageCircle size={20} />
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <Share2 size={20} />
          </button>
        </div>
        <button
          onClick={() => setSaved((v) => !v)}
          className={`transition-colors ${saved ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
        >
          <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Likes */}
      <div className="px-3 pb-1">
        <span className="text-xs font-bold text-gray-800">
          {liked ? post.likes + 1 : post.likes} likes
        </span>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
          <span className="font-bold text-gray-900 mr-1">iskoarena</span>
          {post.caption}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
          {post.time} ago · {post.sport}
        </p>
      </div>
    </div>
  );
}

function ReelCard({ reel }: { reel: (typeof REELS)[number] }) {
  const Icon = reel.icon;

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${reel.bgClass} aspect-[9/16] cursor-pointer group`}
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon size={32} className="text-white/20" />
      </div>

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Play size={16} className="text-white ml-0.5" fill="white" />
        </div>
      </div>

      {/* Duration */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
        {reel.duration}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-[10px] font-semibold leading-tight line-clamp-2">
          {reel.title}
        </p>
        <p className="text-white/60 text-[9px] mt-0.5">{reel.views} views</p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Nav */}
      <header className="bg-black text-white px-4 py-3 flex items-center gap-3">
        <div className="w-6 h-6 border border-white/30 rounded flex items-center justify-center">
          <Grid3X3 size={12} />
        </div>
        <span className="text-sm font-bold tracking-widest uppercase">
          Media
        </span>
      </header>

      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full border-2 border-red-600 flex items-center justify-center bg-red-50">
              <span className="text-red-700 font-black text-lg">IA</span>
            </div>
            <div>
              <h1 className="font-black text-sm tracking-widest uppercase">
                IskоArena
              </h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">
                Official Media Hub
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-5 text-center">
            <div>
              <p className="font-black text-sm">6</p>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">
                Posts
              </p>
            </div>
            <div>
              <p className="font-black text-sm">1,248</p>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">
                Followers
              </p>
            </div>
            <div>
              <p className="font-black text-sm">84</p>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">
                Following
              </p>
            </div>
          </div>

          {/* Post Button */}
          <button className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold tracking-widest px-3 py-2 rounded-lg transition-colors">
            <Plus size={14} />
            POST
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-black tracking-widest uppercase">
              Highlights
            </span>
          </div>
          <button className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-red-500 transition-colors">
            <Plus size={13} className="text-gray-500" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
          {HIGHLIGHTS.map((h) => (
            <HighlightBubble
              key={h.id}
              h={h}
              active={activeHighlight === h.id}
              onClick={() =>
                setActiveHighlight(
                  activeHighlight === h.id ? null : (h.id as number)
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold tracking-widest uppercase border-b-2 transition-colors ${
              activeTab === "posts"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Grid3X3 size={14} />
            Posts
          </button>
          <button
            onClick={() => setActiveTab("reels")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold tracking-widest uppercase border-b-2 transition-colors ${
              activeTab === "reels"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Film size={14} />
            Reels
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Upload placeholder */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-12 gap-3 hover:border-red-400 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-red-50 flex items-center justify-center transition-colors">
                <Camera size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
              </div>
              <p className="text-xs font-bold text-gray-400 group-hover:text-red-500 tracking-widest uppercase transition-colors">
                Add Post
              </p>
            </div>
          </div>
        )}

        {activeTab === "reels" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {REELS.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}

            {/* Upload placeholder */}
            <div className="aspect-[9/16] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-red-400 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-red-50 flex items-center justify-center transition-colors">
                <Film size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 group-hover:text-red-500 tracking-widest uppercase transition-colors text-center leading-tight">
                Add Reel
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}