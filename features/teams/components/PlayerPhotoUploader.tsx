"use client";

// Reusable player photo uploader — used by both the Add Player form in
// CollegeProfilePage and the edit mode in PlayerProfilePage.
//
// Uploads immediately on file selection (same pattern as ProfilePage's
// AvatarUploader). If the user cancels after selecting, a small orphaned
// file may remain in storage but that's acceptable for player photos.
//
// Storage: `avatars` bucket (already public, set up in CLAUDE.md)
// Path:    `players/{timestamp}.{ext}` — unique per upload, no conflict
// Limits:  5 MB max, image/* only

import React, { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const BUCKET = "avatars";

interface PlayerPhotoUploaderProps {
  /** Current photo URL (null = show initials). */
  currentUrl: string | null;
  /** Displayed as initials when no photo is set. */
  playerName: string;
  /** Brand accent colour for the initials background + ring. */
  accentColor: string;
  /** Called with the new public URL once the upload succeeds. */
  onUploaded: (url: string) => void;
  /** Width/height of the square thumbnail. Defaults to 80. */
  size?: number;
}

export function PlayerPhotoUploader({
  currentUrl,
  playerName,
  accentColor,
  onUploaded,
  size = 80,
}: PlayerPhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = playerName
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5 MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      // Unique path per upload prevents collisions and keeps old photos
      // (useful if admin ever wants to revert).
      const ext  = file.name.split(".").pop() ?? "jpg";
      const path = `players/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      // Bust browser cache by appending a timestamp so the new photo
      // shows immediately even if the same CDN URL was cached before.
      onUploaded(`${publicUrl}?t=${Date.now()}`);
      toast.success("Photo uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setIsUploading(false);
      // Allow re-selecting the same file if needed
      e.target.value = "";
    }
  };

  return (
    <div
      className="relative group cursor-pointer flex-shrink-0 overflow-hidden rounded-xl"
      style={{ width: size, height: size }}
      role="button"
      tabIndex={0}
      aria-label="Upload player photo"
      onClick={() => !isUploading && fileRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isUploading) {
          e.preventDefault();
          fileRef.current?.click();
        }
      }}
    >
      {/* Current photo or initials background */}
      {currentUrl ? (
        <img
          src={currentUrl}
          alt={playerName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-bebas text-2xl"
          style={{ background: `${accentColor}22`, color: accentColor }}
        >
          {initials}
        </div>
      )}

      {/* Hover / uploading overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity"
        style={{
          background: "rgba(0,0,0,0.65)",
          opacity: isUploading ? 1 : undefined,
        }}
        // Show on hover via CSS; always visible while uploading
        // We achieve this with the group-hover Tailwind utility below
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
          {isUploading ? (
            <Loader2 size={16} className="animate-spin text-white" />
          ) : (
            <>
              <Camera size={16} className="text-white" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white">
                {currentUrl ? "Change" : "Upload"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
