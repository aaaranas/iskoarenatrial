"use client";

import React, { useState, useRef } from "react";
import {
  Play,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Plus,
  X,
  Upload,
  Film,
  Image as ImageIcon,
  Star,
  MoreHorizontal,
  Grid3X3,
  Clapperboard,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { MediaItem, Match } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MediaPageProps {
  matches: Match[];
  media: MediaItem[];
  onAddMedia: (item: Omit<MediaItem, "id" | "createdAt">) => void;
}

type MediaCategory = "highlights" | "posts" | "reels";

// ---------------------------------------------------------------------------
// Mock / seed data helpers (used when media array is empty for visual demo)
// ---------------------------------------------------------------------------

const PLACEHOLDER_GRADIENTS = [
  "from-[#A91D3A] to-[#C5A059]",
  "from-[#1a1a2e] to-[#A91D3A]",
  "from-[#C5A059] to-[#8B6914]",
  "from-[#0f2027] to-[#203a43]",
  "from-[#A91D3A] to-[#8B1528]",
  "from-[#C5A059] to-[#A91D3A]",
  "from-[#1a1a2e] to-[#C5A059]",
  "from-[#2c3e50] to-[#A91D3A]",
  "from-[#0f2027] to-[#C5A059]",
];

function PlaceholderThumb({
  index,
  isReel = false,
}: {
  index: number;
  isReel?: boolean;
}) {
  const grad = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
  return (
    <div
      className={cn(
        "w-full h-full bg-gradient-to-br flex items-center justify-center",
        grad
      )}
    >
      {isReel ? (
        <Clapperboard className="size-8 text-white/40" />
      ) : (
        <ImageIcon className="size-8 text-white/40" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Circular highlight story bubble */
function HighlightBubble({
  item,
  index,
  onClick,
}: {
  item?: MediaItem;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 shrink-0 group"
    >
      {/* Ring */}
      <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#A91D3A] via-[#C5A059] to-[#A91D3A]">
        <div className="p-[2px] rounded-full bg-background">
          <div className="size-16 rounded-full overflow-hidden bg-muted">
            {item?.url ? (
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <PlaceholderThumb index={index} />
            )}
          </div>
        </div>
      </div>
      <span className="text-[10px] font-medium text-foreground/70 truncate max-w-[64px] uppercase tracking-wider">
        {item?.title ?? `Event ${index + 1}`}
      </span>
    </button>
  );
}

/** Instagram-style post card */
function PostCard({
  item,
  index,
  onClick,
}: {
  item?: MediaItem;
  index: number;
  onClick: () => void;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Card className="overflow-hidden border-border/60 bg-card group hover:border-[#C5A059]/40 transition-colors duration-200">
      {/* Image area */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer bg-muted"
        onClick={onClick}
      >
        {item?.url ? (
          <img
            src={item.url}
            alt={item.title ?? "Post"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PlaceholderThumb index={index} />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-4 text-white">
            <span className="flex items-center gap-1 font-semibold text-sm drop-shadow">
              <Heart className="size-4 fill-white" />
              {Math.floor(Math.random() * 200 + 10)}
            </span>
            <span className="flex items-center gap-1 font-semibold text-sm drop-shadow">
              <MessageCircle className="size-4 fill-white" />
              {Math.floor(Math.random() * 40)}
            </span>
          </div>
        </div>
        {/* Sport badge */}
        {item?.sport && (
          <Badge className="absolute top-2 left-2 text-[9px] uppercase tracking-wider bg-black/60 text-white border-0 backdrop-blur-sm">
            {item.sport}
          </Badge>
        )}
      </div>

      <CardContent className="p-3">
        {/* Action row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiked(!liked)}
              className="transition-transform active:scale-90"
            >
              <Heart
                className={cn(
                  "size-5 transition-colors",
                  liked
                    ? "fill-[#A91D3A] text-[#A91D3A]"
                    : "text-muted-foreground hover:text-[#A91D3A]"
                )}
              />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="size-5" />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="size-5" />
            </button>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className="transition-transform active:scale-90"
          >
            <Bookmark
              className={cn(
                "size-5 transition-colors",
                saved
                  ? "fill-[#C5A059] text-[#C5A059]"
                  : "text-muted-foreground hover:text-[#C5A059]"
              )}
            />
          </button>
        </div>

        {/* Caption */}
        <p className="text-xs font-semibold text-foreground truncate">
          {item?.title ?? `Match Highlight #${index + 1}`}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {item?.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "IskoArena"}
        </p>
      </CardContent>
    </Card>
  );
}

/** Reel card — portrait 9:16 */
function ReelCard({
  item,
  index,
  onClick,
}: {
  item?: MediaItem;
  index: number;
  onClick: () => void;
}) {
  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer group bg-muted shrink-0"
      style={{ width: 160, height: 284 }}
      onClick={onClick}
    >
      {item?.url ? (
        <img
          src={item.url}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <PlaceholderThumb index={index} isReel />
      )}

      {/* Dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
          <Play className="size-5 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {item?.sport && (
          <Badge className="mb-1.5 text-[8px] uppercase tracking-wider bg-[#A91D3A]/80 text-white border-0 backdrop-blur-sm">
            {item.sport}
          </Badge>
        )}
        <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">
          {item?.title ?? `Reel ${index + 1}`}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <Heart className="size-3 text-white/60" />
          <span className="text-[9px] text-white/60">
            {Math.floor(Math.random() * 500 + 50)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload Modal
// ---------------------------------------------------------------------------

function UploadModal({
  open,
  onClose,
  matches,
  onAddMedia,
}: {
  open: boolean;
  onClose: () => void;
  matches: Match[];
  onAddMedia: (item: Omit<MediaItem, "id" | "createdAt">) => void;
}) {
  const [title, setTitle] = useState("");
  const [matchVal, setMatchVal] = useState("");
  const [sport, setSport] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "reel">(
    "image"
  );
  const [preview, setPreview] = useState<{
    src: string;
    isVideo: boolean;
    name: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls =
    "w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 transition-colors";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    if (file.type.startsWith("image/")) {
      reader.onload = (ev) =>
        setPreview({
          src: ev.target?.result as string,
          isVideo: false,
          name: file.name,
        });
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      setPreview({ src: "", isVideo: true, name: file.name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return alert("Please select a file");
    if (!title.trim()) return alert("Please enter a title");

    const [matchId, matchSport] = matchVal
      ? matchVal.split("|")
      : ["", ""];

    onAddMedia({
      title: title.trim(),
      type: preview.isVideo ? "video" : "image",
      url: preview.src,
      fileName: preview.name,
      matchId: matchId || null,
      sport: sport || matchSport || "",
      size: "—",
    });

    // Reset
    setTitle("");
    setMatchVal("");
    setSport("");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Upload Media
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Type selector */}
          <div className="flex gap-2">
            {(["image", "video", "reel"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMediaType(t)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all",
                  mediaType === t
                    ? "bg-[#A91D3A] text-white border-[#A91D3A]"
                    : "border-border text-muted-foreground hover:border-[#C5A059]"
                )}
              >
                {t === "image" && <ImageIcon className="inline size-3.5 mr-1" />}
                {t === "video" && <Film className="inline size-3.5 mr-1" />}
                {t === "reel" && <Clapperboard className="inline size-3.5 mr-1" />}
                {t}
              </button>
            ))}
          </div>

          {/* File input */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
              Select File *
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className={inputCls}
              onChange={handleFileChange}
              required
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="rounded-lg overflow-hidden border border-border bg-muted">
              {preview.isVideo ? (
                <div className="flex items-center gap-2 p-3">
                  <Film className="size-4 text-[#C5A059]" />
                  <span className="text-xs text-foreground font-medium">
                    {preview.name}
                  </span>
                </div>
              ) : (
                <img
                  src={preview.src}
                  alt="Preview"
                  className="w-full max-h-48 object-cover"
                />
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
              Title *
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Finals Game 3 Highlights"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Sport */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
              Sport
            </label>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Basketball, Volleyball…"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
            />
          </div>

          {/* Related match */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
              Related Match
            </label>
            <select
              className={inputCls}
              value={matchVal}
              onChange={(e) => setMatchVal(e.target.value)}
            >
              <option value="">None</option>
              {matches.map((m) => (
                <option key={m.id} value={`${m.id}|${m.homeTeam}`}>
                  {m.homeTeam} vs {m.awayTeam}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#A91D3A] hover:bg-[#8B1528] text-white"
            >
              <Upload className="size-3.5 mr-1.5" />
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Lightbox / viewer
// ---------------------------------------------------------------------------

function MediaViewer({
  item,
  onClose,
}: {
  item: MediaItem | null;
  onClose: () => void;
}) {
  if (!item) return null;
  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-black border-border">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 size-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <X className="size-4" />
        </button>
        <div className="relative bg-black">
          {item.type === "video" ? (
            <div className="aspect-video flex items-center justify-center bg-black">
              <Play className="size-16 text-white/40" />
            </div>
          ) : item.url ? (
            <img
              src={item.url}
              alt={item.title}
              className="w-full max-h-[70vh] object-contain"
            />
          ) : (
            <div className="aspect-video flex items-center justify-center">
              <ImageIcon className="size-16 text-white/20" />
            </div>
          )}
        </div>
        <div className="p-4 bg-background">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-sm">{item.title}</h3>
              {item.sport && (
                <Badge className="mt-1 text-[9px] uppercase tracking-wider bg-[#A91D3A] text-white border-0">
                  {item.sport}
                </Badge>
              )}
            </div>
            <div className="flex gap-3 text-muted-foreground">
              <Heart className="size-5 hover:text-[#A91D3A] cursor-pointer transition-colors" />
              <Bookmark className="size-5 hover:text-[#C5A059] cursor-pointer transition-colors" />
              <Share2 className="size-5 hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

// Seed indices for demo placeholders when real media is empty
const HIGHLIGHT_COUNT = 8;
const POST_COUNT = 9;
const REEL_COUNT = 6;

export default function MediaPage({ matches, media, onAddMedia }: MediaPageProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeViewer, setActiveViewer] = useState<MediaItem | null>(null);
  const [tab, setTab] = useState<"posts" | "reels">("posts");
  const [visiblePosts, setVisiblePosts] = useState(6); // Number of posts to show initially
  const [visibleReels, setVisibleReels] = useState(4); // Number of reels to show initially
  const reelScrollRef = useRef<HTMLDivElement>(null);

  // Partition real media into categories
  const highlights = media.filter((m) => m.type === "image").slice(0, HIGHLIGHT_COUNT);
  const posts = media.filter((m) => m.type === "image");
  const reels = media.filter((m) => m.type === "video");

  // Add filler content if no real data is available
  const fillerPosts = Array.from({ length: Math.max(POST_COUNT - posts.length, 0) }).map((_, i) => ({
    id: `placeholder-post-${i}`,
    title: `Placeholder Post ${i + 1}`,
    type: "image",
    url: "https://via.placeholder.com/300",
    createdAt: new Date().toISOString(),
  }));

  const fillerReels = Array.from({ length: Math.max(REEL_COUNT - reels.length, 0) }).map((_, i) => ({
    id: `placeholder-reel-${i}`,
    title: `Placeholder Reel ${i + 1}`,
    type: "video",
    url: "https://via.placeholder.com/300",
    createdAt: new Date().toISOString(),
  }));

  const combinedPosts = [...posts, ...fillerPosts].slice(0, visiblePosts);
  const combinedReels = [...reels, ...fillerReels].slice(0, visibleReels);

  const scrollReels = (dir: "left" | "right") => {
    if (!reelScrollRef.current) return;
    reelScrollRef.current.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  const loadMorePosts = () => setVisiblePosts((prev) => prev + 6);
  const loadMoreReels = () => setVisibleReels((prev) => prev + 4);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Profile Header */}
      <div className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#A91D3A] via-[#C5A059] to-[#A91D3A]">
              <div className="size-12 rounded-full bg-background flex items-center justify-center overflow-hidden">
                <span className="text-xs font-black text-[#A91D3A] uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  IA
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none" style={{ fontFamily: "var(--font-heading)" }}>
                IskoArena
              </h1>
              <p className="text-[12px] text-muted-foreground uppercase tracking-widest mt-0.5">
                Official Media Hub
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-8">
            {[{ label: "Posts", value: combinedPosts.length }, { label: "Followers", value: "1,248" }, { label: "Following", value: "84" }].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-black leading-none text-foreground">{value}</p>
                <p className="text-[12px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <Button onClick={() => setUploadOpen(true)} className="bg-[#A91D3A] hover:bg-[#8B1528] text-white text-xs font-bold uppercase tracking-wider h-8 px-4 gap-1.5">
            <Plus className="size-3.5" />
            Post
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Highlights Row */}
        <section className="py-6 border-b border-border/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-[#C5A059]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                Highlights
              </h2>
            </div>
            <button onClick={() => setUploadOpen(true)} className="size-14 rounded-full border-2 border-dashed border-border flex items-center justify-center hover:border-[#C5A059] transition-colors group">
              <Plus className="size-5 text-muted-foreground group-hover:text-[#C5A059] transition-colors" />
            </button>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setUploadOpen(true)} className="flex flex-col items-center gap-2 shrink-0 group">
              <div className="size-16 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/50 group-hover:border-[#C5A059] transition-colors">
                <Plus className="size-5 text-muted-foreground group-hover:text-[#C5A059] transition-colors" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">New</span>
            </button>
            {Array.from({ length: HIGHLIGHT_COUNT }).map((_, i) => (
              <HighlightBubble key={i} item={highlights[i]} index={i} onClick={() => highlights[i] && setActiveViewer(highlights[i])} />
            ))}
          </div>
        </section>

        {/* Posts / Reels Tabs */}
        <section className="pt-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "posts" | "reels")}>
            <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto p-0 mb-0">
              <TabsTrigger
                value="posts"
                className={cn(
                  "flex-1 rounded-none border-b-2 border-transparent pb-3 pt-3 text-[11px] uppercase tracking-widest font-bold gap-2 data-[state=active]:border-[#A91D3A] data-[state=active]:text-foreground data-[state=active]:bg-transparent text-muted-foreground"
                )}
              >
                <Grid3X3 className="size-3.5" />
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="reels"
                className={cn(
                  "flex-1 rounded-none border-b-2 border-transparent pb-3 pt-3 text-[11px] uppercase tracking-widest font-bold gap-2 data-[state=active]:border-[#A91D3A] data-[state=active]:text-foreground data-[state=active]:bg-transparent text-muted-foreground"
                )}
              >
                <Clapperboard className="size-3.5" />
                Reels
              </TabsTrigger>
            </TabsList>

            {/* ── Posts Grid ── */}
            <TabsContent value="posts" className="mt-0 pt-6">
              {posts.length === 0 && (
                <div className="grid grid-cols-3 gap-1 mb-6">
                  {Array.from({ length: POST_COUNT }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-sm overflow-hidden bg-muted relative group cursor-pointer"
                      onClick={() => setUploadOpen(true)}
                    >
                      <PlaceholderThumb index={i} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                        <Plus className="size-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {posts.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Show real items */}
                  {[...posts, ...fillerPosts].map((item, i) => (
                    <PostCard
                      key={item.id}
                      item={item}
                      index={i}
                      onClick={() => setActiveViewer(item)}
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMorePosts}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-[#C5A059] hover:text-[#C5A059] transition-all text-xs font-semibold uppercase tracking-wider"
                >
                  <Plus className="size-4" />
                  Load More Posts
                </button>
              </div>
            </TabsContent>

            {/* ── Reels Row ── */}
            <TabsContent value="reels" className="mt-0 pt-6">
              <div className="relative">
                {/* Scroll buttons */}
                <button
                  onClick={() => scrollReels("left")}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:border-[#C5A059] transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => scrollReels("right")}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:border-[#C5A059] transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>

                <div
                  ref={reelScrollRef}
                  className="flex gap-3 overflow-x-auto pb-4 scroll-smooth"
                  style={{ scrollbarWidth: "none" }}
                >
                  {/* Add new reel */}
                  <div
                    className="shrink-0 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#C5A059] transition-colors bg-muted/30"
                    style={{ width: 160, height: 284 }}
                    onClick={() => setUploadOpen(true)}
                  >
                    <Plus className="size-8 text-muted-foreground" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      New Reel
                    </span>
                  </div>

                  {reels.length > 0
                    ? reels.map((item, i) => (
                        <ReelCard
                          key={item.id}
                          item={item}
                          index={i}
                          onClick={() => setActiveViewer(item)}
                        />
                      ))
                    : Array.from({ length: REEL_COUNT }).map((_, i) => (
                        <ReelCard
                          key={`reel-placeholder-${i}`}
                          item={undefined}
                          index={i}
                          onClick={() => setUploadOpen(true)}
                        />
                      ))}
                </div>
              </div>

              {/* Upload CTA */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setUploadOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-[#C5A059] hover:text-[#C5A059] transition-all text-xs font-semibold uppercase tracking-wider"
                >
                  <Clapperboard className="size-4" />
                  Upload Reel
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} matches={matches} onAddMedia={onAddMedia} />
      <MediaViewer item={activeViewer} onClose={() => setActiveViewer(null)} />
    </div>
  );
}