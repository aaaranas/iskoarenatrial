"use client";
import React, { useState } from "react";
import {
  ArchiveHeader,
  ArchiveFilterSidebar,
  ArchiveCard,
} from "@/components/archives/ArchiveComponents";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { trpc } from "@/utils/trpc";

const PAGE_SIZE = 12;

export default function ArchivesPage() {
  const [offset, setOffset] = useState(0);
  const [activeType, setActiveType] = useState<string | undefined>(undefined);

  const { data, isLoading } = trpc.media.getAll.useQuery({
    limit: PAGE_SIZE,
    offset,
    type: activeType,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const categories = [
    { name: "All", active: activeType === undefined },
    { name: "Videos", active: activeType === "video" },
    { name: "Images", active: activeType === "image" },
  ];

  // Map DB media shape → ArchiveCard item shape
  const archiveItems = items.map((m: any) => ({
    id: m.id,
    title: m.title ?? "Untitled",
    tag: (m.type === "video" ? "VIDEO" : "IMAGE"),
    date: m.created_at
      ? new Date(m.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
      : "—",
    views: "—",
    type: m.type ?? "image",
    img: m.url ?? "",
    duration: undefined,
  }));

  return (
    <div className="bg-[#050505] min-h-screen text-white flex flex-col lg:flex-row p-6 lg:p-12 font-sans selection:bg-[#A91D3A] selection:text-white">

      {/* 1. Left Sidebar */}
      <ArchiveFilterSidebar categories={categories} />

      {/* 2. Main Content */}
      <main className="flex-1 lg:pl-12">
        <ArchiveHeader />

        <section className="relative">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">Results Library</h3>
              <div className="h-px w-24 bg-white/10" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-8">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="h-64 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : archiveItems.length === 0 ? (
            <div className="text-center py-20 text-white/30 text-sm">
              No media found. Upload some highlights first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-8">
              {archiveItems.map((item: any) => (
                <ArchiveCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-24 pt-10 border-t border-white/5 flex justify-between items-center">
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total} items
              </p>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setOffset((p) => Math.max(0, p - PAGE_SIZE))}
                  disabled={currentPage === 1}
                  className="text-gray-600 hover:text-white transition-colors disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setOffset((n - 1) * PAGE_SIZE)}
                    className={`w-8 h-8 text-[10px] font-black rounded-lg transition-all ${
                      n === currentPage
                        ? "bg-[#A91D3A] text-white shadow-lg shadow-[#A91D3A]/30"
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setOffset((p) => Math.min((totalPages - 1) * PAGE_SIZE, p + PAGE_SIZE))}
                  disabled={currentPage === totalPages}
                  className="text-[#A91D3A] hover:text-white transition-colors disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 3. Right Alpha Strip */}
      <aside className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 items-center opacity-30 hover:opacity-100 transition-opacity hidden 2xl:flex">
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
          <span key={l} className="text-[8px] font-black cursor-pointer hover:text-[#A91D3A] transition-colors">{l}</span>
        ))}
      </aside>
    </div>
  );
}
