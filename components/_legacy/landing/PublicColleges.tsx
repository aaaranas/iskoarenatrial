"use client";

// Public read-only "Team" section — surfaces the 4 participating UP Cebu colleges
// (COS, CCAD, CSS, SOM) using the same teams data the admin side queries.
// No "View Profile" / "Add" / "Delete" affordances — visitors can only browse.

import Image from "next/image";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";

// The 4 UP Cebu colleges. Logos live in /public/colleges/<code>_logo.jpg and
// each carries its own brand colors — the card background stays neutral so the
// logos read cleanly without competing tints.
const COLLEGES = [
  { code: "COS",  name: "College of Science",                          logo: "/colleges/cos_logo.jpg"  },
  { code: "CCAD", name: "College of Communication, Art and Design",    logo: "/colleges/ccad_logo.jpg" },
  { code: "CSS",  name: "College of Social Sciences",                  logo: "/colleges/css_logo.jpg"  },
  { code: "SOM",  name: "School of Management",                        logo: "/colleges/som_logo.jpg"  },
];

// Counts how many teams belong to the given college code.
// Per the seed data, `teams.org` holds the canonical code (COS/CCAD/CSS/SOM)
// while `teams.college` holds the full display name and varies in spelling —
// so we match against `org` as the source of truth.
function countTeams(teams: any[] | undefined, code: string) {
  if (!teams) return 0;
  return teams.filter((t) => {
    const value = (t.org ?? "").toString().toUpperCase();
    return value === code.toUpperCase();
  }).length;
}

export default function PublicColleges() {
  const { data: teams, isLoading } = trpc.teams.getAll.useQuery();

  return (
    // id="team" — Team nav link scrolls here (developer team is now under #about)
    <section id="team" className="relative w-full bg-neutral-950 py-20 px-4 scroll-mt-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7B1113] mb-3">
            <span className="w-6 h-0.5 bg-[#7B1113] inline-block" />
            Participating Colleges
          </span>
          <h2 className="font-heading text-4xl md:text-5xl text-white leading-tight">
            Four Colleges. One Arena.
          </h2>
          <p className="text-white/55 mt-3 text-sm max-w-xl mx-auto">
            Meet the colleges of UP Cebu competing in this year’s Iskolaro Intramurals.
          </p>
        </div>

        {/* Loading shimmer */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-[#7B1113] animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Loading Colleges...</span>
          </div>
        )}

        {/* College grid — read-only cards, no profile drilldown for v1 */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COLLEGES.map((college) => {
              const activeTeams = countTeams(teams, college.code);
              return (
                <div
                  key={college.code}
                  className="bg-[#0a0a0a] border border-[#111] rounded-xl overflow-hidden flex flex-col items-center hover:border-[#7B1113]/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Crest area — neutral dark backdrop lets each logo's own colors stand out */}
                  <div className="w-full aspect-square bg-[#080808] flex items-center justify-center border-b border-[#111] p-6">
                    <Image
                      src={college.logo}
                      alt={`${college.name} logo`}
                      width={160}
                      height={160}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Body — full college name + team count */}
                  <div className="p-4 text-center w-full">
                    <p className="text-white font-bold text-sm leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
                      {college.name}
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-400" />
                      <span className="text-[10px] text-[#666] font-semibold uppercase tracking-wider">
                        {activeTeams} {activeTeams === 1 ? "Team" : "Teams"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
