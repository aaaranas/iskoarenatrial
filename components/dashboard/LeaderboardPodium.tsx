import React from "react";
import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LeaderboardPodiumProps {
  titleAlign?: "left" | "center" | "right";
}

export const LeaderboardPodium = ({ titleAlign = "left" }: LeaderboardPodiumProps) => {
  return (
    <section className="space-y-8 animate-in fade-in duration-700 delay-150 pt-4 w-full">
      {/* Horizontal scroll wrapper — on mobile the podium (3 cards + gaps) is
          ~592px wide which overflows narrow viewports. Wrapping in
          overflow-x-auto lets the podium scroll within its container instead
          of pushing the whole page past the viewport edge. */}
      <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 sm:overflow-visible">
        <div className="flex items-end gap-4 h-[340px] min-w-max sm:min-w-0 sm:w-full">

        {/* ── 2nd Place ── */}
        <Card
          className="relative w-44 sm:w-52 md:w-64 rounded-xl p-6 pt-14 flex flex-col items-center justify-between h-[242px] border-0 shadow-none"
          style={{ backgroundColor: "var(--surface-card)" }}
        >
          <CardContent className="p-0 flex flex-col items-center justify-between w-full h-full">
            <div
              className="absolute -top-10 flex items-center justify-center size-20 rounded-full p-1 shadow-md border"
              style={{
                backgroundColor: "var(--surface-overlay)",
                borderColor: "var(--border-default)",
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: "var(--surface-sunken)" }}
              >
                <User className="size-8" style={{ color: "var(--text)" }} />
              </div>
            </div>

            <div className="text-center space-y-1.5 mt-5">
              <p
                className="text-base font-bold uppercase tracking-widest font-heading"
                style={{ color: "var(--text)" }}
              >
                ARTSCOMM PHOENIX
              </p>
            </div>

            <div className="text-center mt-2">
              <p
                className="text-4xl font-normal leading-none"
                style={{ color: "var(--text)" }}
              >
                2,840
              </p>
              <p
                className="text-[11px] font-normal uppercase tracking-wider mt-1.5"
                style={{ color: "var(--text)" }}
              >
                TOTAL POINTS
              </p>
            </div>

            <div
              className="px-5 py-1.5 rounded-full text-base mt-3 font-heading"
              style={{
                backgroundColor: "var(--surface-sunken)",
                color: "var(--text)",
              }}
            >
              02
            </div>
          </CardContent>
        </Card>

        {/* ── 1st Place ── */}
        <Card
          className="relative w-52 sm:w-60 md:w-72 rounded-t-xl rounded-b-lg p-6 pt-16 flex flex-col items-center justify-between h-[312px] border-0 shadow-none"
          style={{ backgroundColor: "var(--accent-maroon1)" }}
        >
          <CardContent className="p-0 flex flex-col items-center justify-between w-full h-full">
            <div
              className="absolute -top-12 flex items-center justify-center size-24 rounded-full p-0.5"
              style={{
                backgroundColor: "var(--accent-maroon)",
                boxShadow: "0 6px 24px rgba(123,17,19,0.32)",
              }}
            >
              <div
                className="w-full h-full rounded-full border-4 flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: "var(--surface-overlay)",
                  borderColor: "var(--surface-raised)",
                }}
              >
                <User className="size-10" style={{ color: "var(--text)" }} />
              </div>
            </div>

            <div
              className="absolute top-10 text-base uppercase tracking-wider px-3 py-1 rounded font-heading"
              style={{
                backgroundColor: "var(--accent-maroon)",
                color: "var(--text-inverse)",
              }}
            >
              CURRENTLY LEADING
            </div>

            <div className="text-center space-y-1.5 mt-7">
              <p
                className="text-base font-bold uppercase tracking-widest font-heading"
                style={{ color: "var(--accent-text)" }}
              >
                COS SCIONS
              </p>
            </div>

            <div className="text-center mt-2">
              <p
                className="text-6xl font-normal tracking-tighter leading-none"
                style={{ color: "var(--text)" }}
              >
                3,120
              </p>
              <p
                className="text-[11px] font-normal uppercase tracking-wider mt-2"
                style={{ color: "var(--text)" }}
              >
                TOTAL POINTS
              </p>
            </div>

            <div
              className="px-7 py-2 rounded-full text-base mt-5 font-heading"
              style={{
                backgroundColor: "var(--accent-maroon)",
                color: "var(--text-inverse)",
                boxShadow: "0 3px 14px rgba(123,17,19,0.28)",
              }}
            >
              01
            </div>

            <div
              className="absolute bottom-0 left-0 w-full h-0.5"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--accent-maroon), transparent)",
              }}
            />
          </CardContent>
        </Card>

        {/* ── 3rd Place ── */}
        <Card
          className="relative w-44 sm:w-52 md:w-64 rounded-xl p-6 pt-14 flex flex-col items-center justify-between h-[242px] border-0 shadow-none"
          style={{ backgroundColor: "var(--surface-card)" }}
        >
          <CardContent className="p-0 flex flex-col items-center justify-between w-full h-full">
            <div
              className="absolute -top-10 flex items-center justify-center size-20 rounded-full p-1 shadow-md border"
              style={{
                backgroundColor: "var(--surface-overlay)",
                borderColor: "var(--border-default)",
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: "var(--surface-sunken)" }}
              >
                <User className="size-8" style={{ color: "var(--text)" }} />
              </div>
            </div>

            <div className="text-center space-y-1.5 mt-5">
              <p
                className="text-base font-bold uppercase tracking-widest font-heading"
                style={{ color: "var(--text)" }}
              >
                CSS STALLIONS
              </p>
            </div>

            <div className="text-center mt-2">
              <p
                className="text-4xl font-normal leading-none"
                style={{ color: "var(--text)" }}
              >
                2,410
              </p>
              <p
                className="text-[11px] font-normal uppercase tracking-wider mt-1.5"
                style={{ color: "var(--text)" }}
              >
                TOTAL POINTS
              </p>
            </div>

            <div
              className="px-5 py-1.5 rounded-full text-base mt-3 font-heading"
              style={{
                backgroundColor: "var(--surface-sunken)",
                color: "var(--text)",
              }}
            >
              03
            </div>
          </CardContent>
        </Card>

        </div>
      </div>
    </section>
  );
};