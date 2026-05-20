// Dashboard V2 — Top Performer broadcast spotlight card.
// 140px photo header w/ diagonal gradient + corner tag + 2-line italic name overlay,
// then a stats footer (rendered only when the entry has stats).
//
// Data is LIVE — driven by trpc.featuredPlayer.getCurrent. Admins see a pencil
// button to open the FeaturedPlayerModal and create a new featured entry.
"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Pencil, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/providers/RoleProvider";
import { FeaturedPlayerModal } from "./FeaturedPlayerModal";

export function TopPerformerCard() {
  const { isAdmin } = useRole();
  const [editOpen, setEditOpen] = useState(false);

  const { data: featured, isLoading } = trpc.featuredPlayer.getCurrent.useQuery();

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] h-[208px] flex items-center justify-center">
        <Loader2 size={16} className="animate-spin text-white/30" />
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  // No featured entry has ever been set. Non-admin sees a neutral placeholder;
  // admin sees a CTA that opens the editor modal.
  if (!featured) {
    return (
      <>
        <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] p-6 text-center">
          <Star size={20} className="mx-auto mb-2 text-white/25" />
          <p className="text-[10px] text-white/40 uppercase tracking-[0.18em] mb-3">
            No top performer set yet
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="px-3 h-8 bg-ia-accent/15 border border-ia-accent/40 text-ia-accent text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-ia-accent/25 transition-colors"
            >
              <Pencil size={10} className="inline mr-1.5" />
              Set Top Performer
            </button>
          )}
        </div>
        {isAdmin && (
          <FeaturedPlayerModal open={editOpen} onOpenChange={setEditOpen} />
        )}
      </>
    );
  }

  // ── Hydrated state ─────────────────────────────────────────────────────────
  // Two-line italic name split on the FIRST space — keeps the broadcast feel
  // (white first name on top, maroon last name underneath). Fallback to whole
  // string on one line if there's no space (e.g. single-word handles).
  const nameParts = featured.playerName.trim().split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : featured.playerName;
  const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1]  : "";

  return (
    <>
      <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-[3px] overflow-hidden relative group">
        {/* Photo header (140px) with gradient overlay + corner tag + name overlay */}
        <div className="relative h-[140px] overflow-hidden">
          {featured.photoUrl ? (
            <Image
              src={featured.photoUrl}
              alt={featured.playerName}
              fill
              sizes="360px"
              className="object-cover"
              style={{ objectPosition: "center 20%", filter: "saturate(0.9)" }}
            />
          ) : (
            // Photoless players still render with a neutral filled background +
            // a centered star so the card never collapses to broken-image.
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
              <Star size={40} className="text-white/10" />
            </div>
          )}

          {/* Diagonal gradient: dark bottom + dark left to make text legible on any photo */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.95) 100%), linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 50%)",
            }}
          />

          {/* Top-left corner tag — sharp maroon block with broadcast styling */}
          <div className="absolute top-3 left-3 bg-ia-accent px-2 py-[3px] font-bebas text-[11px] tracking-[0.18em] text-white">
            ★ {featured.label}
          </div>

          {/* Admin-only pencil button — top-right, only visible on hover */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              aria-label="Edit Top Performer"
              className="absolute top-3 right-3 size-7 bg-black/60 hover:bg-black/80 border border-white/20 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil size={11} className="text-white" />
            </button>
          )}

          {/* Name overlay — bottom-left, two lines (white + maroon) when last name exists */}
          <div className="absolute bottom-3 left-3.5 right-3.5">
            <div className="font-bebas italic text-3xl leading-[0.95] tracking-[0.02em] text-white">
              {firstName}
            </div>
            {lastName && (
              <div className="font-bebas italic text-3xl leading-[0.95] tracking-[0.02em] text-ia-accent">
                {lastName}
              </div>
            )}
            {/* Optional sport context line — keeps small-print info close to the name */}
            {featured.sportName && (
              <div className="mt-1.5 text-[9px] font-mono text-white/55 tracking-[0.18em] uppercase">
                {featured.sportName}
                {featured.jerseyNumber != null ? ` · #${featured.jerseyNumber}` : ""}
              </div>
            )}
          </div>
        </div>

        {/* Stats footer — renders only when the entry has stats. Column count
            equals the number of stats saved (1-4). Falls back to no footer
            entirely when admin saved a row without any stat pairs. */}
        {featured.stats.length > 0 && (
          <div
            className="grid border-t border-white/[0.07]"
            style={{ gridTemplateColumns: `repeat(${featured.stats.length}, minmax(0, 1fr))` }}
          >
            {featured.stats.map((stat, i) => (
              <div
                key={`${stat.label}-${i}`}
                className={`py-3 px-1.5 text-center ${
                  i < featured.stats.length - 1 ? "border-r border-white/[0.07]" : ""
                }`}
              >
                <div className="font-bebas text-[22px] tracking-[0.02em] text-white">{stat.value}</div>
                <div className="text-[9px] text-white/35 tracking-[0.12em] font-mono">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal lives at root so it isn't unmounted when the card re-renders */}
      {isAdmin && (
        <FeaturedPlayerModal
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={{
            playerId: featured.playerId,
            label: featured.label,
            stats: featured.stats,
          }}
        />
      )}
    </>
  );
}
