"use client";
import React, { useState, useRef } from "react";
import type { Match, MediaItem } from "@/types";
import { resizeImageFile } from "@/lib/dataManager";
import { Upload, Film, Image as ImageIcon, X, PlayCircle, Calendar } from "lucide-react"; // Note: Assumes lucide-react is installed, if not, I can swap for SVGs

interface MediaPageProps {
  matches: Match[];
  media: MediaItem[];
  onUploadMedia: (item: Omit<MediaItem, "id" | "createdAt">) => void;
}

export default function MediaPage({ matches = [], media = [], onUploadMedia }: MediaPageProps) {
  const [title, setTitle] = useState("");
  const [matchVal, setMatchVal] = useState("");
  const [preview, setPreview] = useState<{ src: string; isVideo: boolean; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm transition-all focus:ring-2 focus:ring-[#A91D3A]/20 focus:border-[#A91D3A] outline-none bg-white text-gray-800";
  const labelCls = "block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2";

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
    if (!preview) return;
    const [matchId, sport] = matchVal ? matchVal.split("|") : ["", ""];
    onUploadMedia({
      title,
      type: preview.isVideo ? "video" : "image",
      data: preview.src,
      fileName: preview.name,
      matchId: matchId ? parseInt(matchId) : null,
      sport: sport || "",
      size: "—",
    });
    // Reset form
    setTitle("");
    setMatchVal("");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      {/* --- UPLOAD SECTION --- */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#A91D3A] px-6 py-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Upload size={18} /> Upload New Content
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: File Picker */}
            <div className="lg:col-span-5">
              <label className={labelCls}>Media File</label>
              {!preview ? (
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl h-48 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#A91D3A] hover:bg-red-50/30 transition-all group"
                >
                  <div className="p-3 bg-gray-50 rounded-full group-hover:bg-[#A91D3A]/10 transition-colors">
                    <ImageIcon className="text-gray-400 group-hover:text-[#A91D3A]" size={28} />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Click to upload image or video</p>
                  <p className="text-xs text-gray-400">Max size 10MB</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden h-48 bg-gray-900 flex items-center justify-center border border-gray-200">
                  {preview.isVideo ? (
                    <div className="text-center">
                      <Film size={48} className="text-white/20 mx-auto mb-2" />
                      <p className="text-xs text-white px-4 truncate max-w-[200px]">{preview.name}</p>
                    </div>
                  ) : (
                    <img src={preview.src} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  <button 
                    type="button"
                    onClick={() => setPreview(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Right: Form Details */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className={labelCls}>Content Title</label>
                <input 
                  type="text" 
                  className={inputCls} 
                  placeholder="e.g. Championship Winning Goal" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className={labelCls}>Link to Match (Optional)</label>
                <select 
                  className={inputCls} 
                  value={matchVal} 
                  onChange={(e) => setMatchVal(e.target.value)}
                >
                  <option value="">General Media (No specific match)</option>
                  {matches?.map((m) => (
                    <option key={m.id} value={`${m.id}|${m.sport}`}>
                      {m.sport}: {m.teamA} vs {m.teamB}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4">
                <button 
                  disabled={!preview || !title}
                  type="submit" 
                  className="w-full lg:w-auto px-8 py-3 bg-[#A91D3A] hover:bg-[#8B1528] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg shadow-[#A91D3A]/20 transition-all active:scale-95"
                >
                  Publish Media
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* --- GALLERY SECTION --- */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Media Library <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{media.length}</span>
          </h3>
        </div>

        {media.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl py-20 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <ImageIcon className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-400 font-medium">Your media gallery is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {media.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {item.type === "image" ? (
                    <img 
                      src={item.data} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
                      <PlayCircle size={40} className="text-white/50" />
                      <span className="text-[10px] mt-2 uppercase tracking-widest text-white/40">Video Preview</span>
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase text-white shadow-sm ${item.type === 'video' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                      {item.type}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-bold text-gray-900 truncate mb-1" title={item.title}>
                    {item.title}
                  </h4>
                  {item.sport && (
                    <div className="flex items-center gap-1.5 text-xs text-[#A91D3A] font-semibold mb-3">
                      <Calendar size={12} />
                      {item.sport} Match
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-[10px] font-medium text-gray-400">ID: #{item.id}</span>
                    <button className="text-xs font-bold text-gray-500 hover:text-[#A91D3A] transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
