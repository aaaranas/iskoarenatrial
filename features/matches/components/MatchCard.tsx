"use client";
import React, { useState, useRef } from "react";
import { Match } from "@/types";
import { MapPin, Edit3, Trash2, Clock, Flag } from "lucide-react";
import { DeleteMatchModal } from "./DeleteMatchModal";
import { EditMatchModal } from "./EditMatchModal";
import { formatMatchDate } from "@/lib/format-match-date";
import { pickSportPhoto } from "@/lib/sport-photos";

interface MatchCardProps {
  match: Match;
  // Optional so the card can also render in read-only contexts (e.g. LiveCarousel).
  onOpenDetails?: () => void;
  onFinalize?: () => void;
  // When provided, the parent owns the edit/delete modals (see Box.tsx).
  // When omitted, MatchCard falls back to its built-in dialogs.
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MatchCard = ({ match, onOpenDetails, onFinalize, onEdit, onDelete }: MatchCardProps) => {
  const isLive = match.statusType?.toLowerCase() === "live";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const suppressNextClick = useRef(false);

  // Use the real sport photo for this match (deterministic by match ID).
  // Falls back to the first volleyball shot if no sport folder exists yet.
  const cardImage =
    pickSportPhoto(match.league, match.id) ?? "/sport/volleyball/IMG_5987.JPG";

  const handleEditOpenChange = (open: boolean) => {
    if (!open) {
      suppressNextClick.current = true;
      setTimeout(() => {
        suppressNextClick.current = false;
      }, 300);
    }
    setEditDialogOpen(open);
  };

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) {
      suppressNextClick.current = true;
      setTimeout(() => {
        suppressNextClick.current = false;
      }, 300);
    }
    setDeleteDialogOpen(open);
  };

  const handleCardClick = () => {
    if (suppressNextClick.current) {
      return;
    }
    onOpenDetails?.();
  };

  return (
    <div
      className="group relative h-[350px] sm:h-[420px] lg:h-[480px] w-full bg-[#050505] rounded-sm overflow-hidden border border-white/5 transition-all duration-500 hover:border-[#C5A059]/40 hover:shadow-2xl hover:shadow-[#A91D3A]/10 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={cardImage}
          alt="Match Poster"
          className="h-full w-full object-cover transition-all duration-1000 grayscale-[0.5] brightness-[0.5] contrast-[1.1] group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-[0.7]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-60" />
      </div>


      <div className="relative z-10 h-full p-6 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
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
          <div className={`px-2 py-0.5 rounded-[2px] text-[8px] font-black tracking-[0.2em] border ${
            isLive
              ? "bg-[#A91D3A] border-[#A91D3A] text-white shadow-[0_0_15px_rgba(169,29,58,0.4)]"
              : match.statusType === "upcoming"
              ? "bg-green-500/20 border-green-500/60 text-green-400"
              : "bg-black/40 backdrop-blur-md border-white/10 text-zinc-400"
          }`}>
            {match.statusType === "live"
              ? "LIVE"
              : match.statusType === "upcoming"
              ? "UPCOMING"
              : "COMPLETED"}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-tight">
              {match.homeTeam} <br />
              <span className="text-zinc-500 not-italic font-light text-lg">vs</span> <br />
              {match.awayTeam}
            </h3>

            {/* Action buttons — reveal on hover, staggered top-to-bottom */}
            <div className="flex flex-col items-end gap-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => (onEdit ? onEdit() : setEditDialogOpen(true))}
                className="p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-[#C5A059] hover:text-black transition-all opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 duration-300"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => (onDelete ? onDelete() : setDeleteDialogOpen(true))}
                className="p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-[#A91D3A] transition-all opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 duration-300 delay-75"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {isLive && onFinalize && (
                <button
                  onClick={(e) => { e.stopPropagation(); onFinalize(); }}
                  className="p-2.5 bg-[#C5A059]/20 backdrop-blur-md rounded-full border border-[#C5A059] hover:bg-[#C5A059] transition-all opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 duration-300 delay-150"
                  title="Finalize Match"
                >
                  <Flag className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
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
                <span className="text-[9px] font-bold uppercase tracking-widest">{formatMatchDate(match.rawDate)}</span>
              </div>
              <span className="text-[8px] font-black text-[#C5A059] uppercase tracking-widest">{match.category || "Intramurals"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <EditMatchModal match={match} open={editDialogOpen} onOpenChange={handleEditOpenChange} />
      <DeleteMatchModal match={match} open={deleteDialogOpen} onOpenChange={handleDeleteOpenChange} />
    </div>
  );
};
