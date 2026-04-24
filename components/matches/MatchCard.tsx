"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Match } from "@/types";
import { MapPin, Edit3, Trash2, Clock } from "lucide-react";
import { DeleteMatchModal } from "./DeleteMatchModal";
import { EditMatchModal } from "./EditMatchModal";

interface MatchCardProps {
  match: Match;
  onOpenDetails: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFinalize?: () => void;
}

export const MatchCard = ({ match, onOpenDetails, onEdit, onDelete, onFinalize }: MatchCardProps) => {
  const isLive = match.statusType?.toLowerCase() === "live";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);


  const fallbackImages = [
    "/iskolarobaseball.jpg",
    "/iskolarofrisbee.jpg",
    "/iskolarosocer.jpg",
    "/iskolarofrisbee2.jpg",
    "/iskolarovolley.jpg"
  ];

  // id is a string (UUID) — use a hash to pick a fallback image
  const idHash = match.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cardImage = fallbackImages[idHash % fallbackImages.length];

  return (
    <div className="group relative h-[350px] sm:h-[420px] lg:h-[480px] w-full bg-[#050505] rounded-sm overflow-hidden border border-white/5 transition-all duration-500 hover:border-[#C5A059]/40 hover:shadow-2xl hover:shadow-[#A91D3A]/10" >
      <div className="absolute inset-0 z-10" onClick={onOpenDetails} />     
      

      {/* Cinematic Poster Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={cardImage}
          alt={`${match.homeTeam} vs ${match.awayTeam}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-all duration-1000 grayscale-[0.5] brightness-[0.5] contrast-[1.1] group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-[0.7]"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-60" />
      </div>

      {/* Admin Quick Actions */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" onClick={(e) => e.stopPropagation()}>

        {isLive && onFinalize && (
          <button
            onClick={onFinalize}
            className="p-2.5 bg-[#C5A059]/20 backdrop-blur-md rounded-full border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-black transition-all"
            title="Finalize Match"
          >
            <span className="text-[8px] font-black uppercase">End</span>
          </button>
        )}
        <button
          onClick={() => { onEdit ? onEdit() : setEditDialogOpen(true); }}
          className="p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-[#C5A059] hover:text-black transition-all"
          title="Edit Match"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => { onDelete ? onDelete() : setDeleteDialogOpen(true); }}
          className="p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-[#A91D3A] transition-all"
          title="Delete Match"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      
      
      {/* Card Content */}
      <div className="relative z-10 h-full p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-100">{match.league}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 pl-3">
              <MapPin className="w-2.5 h-2.5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">{match.venue}</span>
            </div>
          </div>
          <div className={`px-2 py-0.5 rounded-[2px] text-[8px] font-black tracking-[0.2em] border ${isLive ? "bg-[#A91D3A] border-[#A91D3A] text-white shadow-[0_0_15px_rgba(169,29,58,0.4)]" : "bg-black/40 backdrop-blur-md border-white/10 text-zinc-400"}`}>
            {isLive ? "LIVE" : match.status}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-tight">
              {match.homeTeam} <br />
              <span className="text-zinc-500 not-italic font-light text-lg">vs</span> <br />
              {match.awayTeam}
            </h3>
          </div>
          <div className="pt-4 border-t border-white/10 flex items-end justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black tabular-nums text-white">{match.homeScore ?? 0}</span>
              <span className="text-xl font-thin text-zinc-700">-</span>
              <span className="text-4xl font-black tabular-nums text-white">{match.awayScore ?? 0}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Clock className="w-2.5 h-2.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{match.date}</span>
              </div>
              <span className="text-[8px] font-black text-[#C5A059] uppercase tracking-widest">{match.category || "Intramurals"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <EditMatchModal match={match} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      <DeleteMatchModal match={match} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
    </div>
  );
};
