"use client";

import React from "react";
import type { Result, MediaItem } from "@/types";

interface ArchivesPageProps {
  results: Result[];
  media: MediaItem[];
}

export default function ArchivesPage({ results, media }: ArchivesPageProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Results Archive */}
      <section>
        <h2 className="text-2xl font-black tracking-tight mb-4">Results Archive</h2>
        {results.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">No results recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4">Sport</th>
                  <th className="py-3 pr-4">Team A</th>
                  <th className="py-3 pr-4">Score</th>
                  <th className="py-3 pr-4">Team B</th>
                  <th className="py-3">Winner</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/10 transition-colors">
                    <td className="py-3 pr-4 text-muted-foreground">{r.sport}</td>
                    <td className="py-3 pr-4 font-medium">{r.teamA}</td>
                    <td className="py-3 pr-4 font-mono font-semibold">
                      {r.scoreA} – {r.scoreB}
                    </td>
                    <td className="py-3 pr-4 font-medium">{r.teamB}</td>
                    <td className="py-3 font-semibold text-emerald-600">{r.winner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Media Archive */}
      <section>
        <h2 className="text-2xl font-black tracking-tight mb-4">Media Archive</h2>
        {media.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">No media uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="border border-border rounded-lg overflow-hidden bg-card shadow-sm"
              >
                {item.type === "image" ? (
                  <img src={item.url} alt={item.title} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium uppercase tracking-widest">
                    VIDEO
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-semibold truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.sport}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}