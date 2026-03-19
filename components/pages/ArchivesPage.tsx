"use client";
import React from "react";
import { ArchiveHeader } from "../archives/ArchiveHeader";
import { ArchiveSidebar } from "../archives/ArchiveSidebar";
import { ArchiveGrid } from "../archives/ArchiveGrid";
import { Grid, List } from "lucide-react";

export default function ArchivesPage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white p-8">
      <ArchiveHeader />

      <div className="flex gap-8">
        <ArchiveSidebar />

        <main className="flex-1">
          {/* Alphabet Bar */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
            <div className="flex gap-2">
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(l => (
                <span key={l} className="text-xs text-gray-500 hover:text-white cursor-pointer">{l}</span>
              ))}
            </div>
            <div className="flex gap-2 bg-[#1A1A1A] p-1 rounded-lg">
              <Grid className="w-5 h-5 text-[#C5A059] cursor-pointer" />
              <List className="w-5 h-5 text-gray-500 cursor-pointer" />
            </div>
          </div>

          <ArchiveGrid />
        </main>
      </div>
    </div>
  );
}
