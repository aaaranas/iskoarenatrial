"use client";
import React, { useState, useRef } from "react";
import type { Match, MediaItem } from "@/types";
import { resizeImageFile } from "@/lib/dataManager";

interface MediaPageProps {
  matches: Match[];
  media: MediaItem[];
  onAddMedia: (item: Omit<MediaItem, "id" | "createdAt">) => void; // Added for Vercel build
  onUploadMedia?: (item: Omit<MediaItem, "id" | "createdAt">) => void; // optional, in case you still use it
}

export default function MediaPage({ matches, media, onAddMedia, onUploadMedia }: MediaPageProps) {
  const [title, setTitle] = useState("");
  const [matchVal, setMatchVal] = useState("");
  const [preview, setPreview] = useState<{ src: string; isVideo: boolean; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#A91D3A] focus:ring-2 focus:ring-[#A91D3A]/10 bg-white text-black";
  const labelCls = "block text-sm font-medium text-black mb-2";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      resizeImageFile(file, 800, (dataUrl) => setPreview({ src: dataUrl, isVideo: false, name: file.name }));
    } else if (file.type.startsWith("video/")) {
      setPreview({ src: "", isVideo: true, name: file.name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) {
      alert("Please select a file");
      return;
    }
    if (!title) {
      alert("Please enter a title");
      return;
    }
    const [matchId, sport] = matchVal ? matchVal.split("|") : ["", ""];
    const mediaItem = {
      title,
      type: (preview.isVideo ? "video" : "image") as "video" | "image",
      data: preview.src,
      fileName: preview.name,
      matchId: matchId ? parseInt(matchId) : null,
      sport: sport || "",
      size: "—",
    };

    // Use onAddMedia (required prop) for the dashboard
    onAddMedia(mediaItem);

    // Call optional onUploadMedia if it exists (for backward compatibility)
    if (onUploadMedia) onUploadMedia(mediaItem);

    setTitle("");
    setMatchVal("");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      {/* Upload Form */}
      <div className="bg-white rounded-xl p-6 shadow-md drop-shadow-2xl border border-gray-200 mb-6">
        <h3 className="text-[#A91D3A] text-lg font-semibold mb-5">Upload Media</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className={labelCls}>Select Image or Video *</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className={inputCls}
              onChange={handleFileChange}
              required
            />
          </div>

          {preview && (
            <div className="mb-5 p-4 bg-gray-50 rounded-lg">
              {preview.isVideo ? (
                <p className="text-sm text-emerald-600 font-medium">✓ Video selected: {preview.name}</p>
              ) : (
                <img src={preview.src} alt="Preview" className="max-w-[200px] rounded-lg" />
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className={labelCls}>Title *</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Media title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Related Match</label>
              <select className={inputCls} value={matchVal} onChange={(e) => setMatchVal(e.target.value)}>
                <option value="">Select a match (optional)</option>
                {matches.map((m) => (
                  <option key={m.id} value={`${m.id}|${m.sport}`}>
                    {m.sport} - {m.teamA} vs {m.teamB}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-[#A91D3A] hover:bg-[#8B1528] text-white rounded-md text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            Upload Media
          </button>
        </form>
      </div>

      {/* Media Gallery */}
      <div className="bg-white rounded-xl p-6 drop-shadow-2xl shadow-md border border-gray-200">
        <h3 className="text-[#A91D3A] text-lg font-semibold mb-5">Media Gallery</h3>
        {media.length === 0 ? (
          <p className="text-center text-gray-400 italic py-10">No media uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {media.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="w-full h-[120px] bg-gray-100 flex items-center justify-center text-4xl overflow-hidden">
                  {item.type === "image" ? (
                    <img src={item.data} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    "🎥"
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-black truncate">{item.title}</p>
                  <p className="text-xs text-gray-400">
                    {item.type} • {item.size}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}