//app/dashboard/teams/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { College } from "@/features/teams/components/CollegeTable";
import { CollegeCard } from "@/features/teams/components/CollegeCard";
import { CollegeProfilePage } from "@/features/teams/components/CollegeProfilePage";
import { supabase } from "@/lib/supabase/client";

const FIXED_ORGS = ["COS", "CSS", "SOM", "CCAD"];

// Mascot names keyed by org for the tab filter labels
const ORG_LABELS: Record<string, string> = {
  COS:  "SCIONS",
  CSS:  "STALLIONS",
  CCAD: "PHOENIX",
  SOM:  "TYCOONS",
};

export default function TeamsPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [profileCollege, setProfileCollege] = useState<College | null>(null);

  useEffect(() => {
    async function loadColleges() {
      // Fetch teams and the full sports list in parallel
      const [teamsResult, sportsResult] = await Promise.all([
        (supabase as any)
          .from("teams")
          .select("*")
          .in("org", FIXED_ORGS)
          .order("created_at", { ascending: true }),
        (supabase as any)
          .from("sports")
          .select("name")
          .order("name", { ascending: true }),
      ]);

      if (teamsResult.error) {
        console.error("❌ Error fetching teams:", teamsResult.error);
      } else {
        // Use the real sports list from DB; fall back to the teams row value if unavailable
        const sportNames: string[] = sportsResult.data?.map((s: { name: string }) => s.name) ?? [];

        setColleges(
          teamsResult.data.map((t: any) => ({
            id: t.id,
            name: t.college,
            org: t.org,
            established: t.established ?? "N/A",
            activeTeams: t.active_teams ?? 0,
            sports: sportNames.length > 0 ? sportNames : (t.sports ?? []),
            status: t.status ?? "Active",
            logoUrl: t.logo_url ?? null,
          }))
        );
      }
      setIsLoading(false);
    }
    loadColleges();
  }, []);

  const filtered = colleges.filter((c) => activeTab === "ALL" || c.org === activeTab);

  if (profileCollege) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <CollegeProfilePage college={profileCollege} onBack={() => setProfileCollege(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        height: 320,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {/* Maroon radial glow */}
        <div style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(5,5,5,0.9) 65%, #050505 100%), " +
            "radial-gradient(ellipse 55% 55% at 50% 35%, rgba(169,29,58,0.12) 0%, transparent 70%)",
        }} />

        {/* Ghost wordmark watermark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -44%)",
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: "clamp(120px, 20vw, 260px)",
            lineHeight: 0.8,
            color: "rgba(255,255,255,0.025)",
            fontStyle: "italic",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          THE COLLEGES
        </div>

        <div style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 40px 28px",
          textAlign: "center",
        }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 14,
            color: "#C5A059",
          }}>
            <span style={{ width: 24, height: 1, background: "#C5A059", opacity: 0.55 }} />
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase" }}>
              UP CEBU ISKOLARO 2026
            </span>
            <span style={{ width: 24, height: 1, background: "#C5A059", opacity: 0.55 }} />
          </div>

          <h1 style={{
            margin: 0,
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: "clamp(56px, 8vw, 92px)",
            lineHeight: 0.92,
            color: "#f5f0f0",
            letterSpacing: "0.02em",
          }}>
            THE{" "}
            <span style={{ color: "#A91D3A", fontStyle: "italic" }}>COLLEGES</span>
          </h1>

          <p style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 400, lineHeight: 1.7 }}>
            Four institutions. Four mascots. One scoreboard.
          </p>
        </div>
      </div>

      {/* ── Toolbar: college filter tabs ─────────────────────────────────────── */}
      <div style={{
        padding: "16px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "rgba(0,0,0,0.35)",
        flexWrap: "wrap",
      }}>
        {["ALL", ...FIXED_ORGS].map((tab) => {
          const label = tab === "ALL" ? "ALL" : `${tab} · ${ORG_LABELS[tab]}`;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "7px 14px",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                background: isActive ? "#A91D3A" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      {isLoading ? (
        /* Loading skeleton rows */
        <div>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                minHeight: 300,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: i % 2 ? "#070707" : "#050505",
                display: "flex",
                alignItems: "center",
                padding: "40px 48px",
                gap: 32,
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ width: 120, height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 4 }} />
                <div style={{ width: 240, height: 52, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
                <div style={{ width: 320, height: 10, background: "rgba(255,255,255,0.04)", borderRadius: 4 }} />
              </div>
              <div style={{ width: 110, height: 110, borderRadius: 999, background: "rgba(255,255,255,0.05)" }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 40px",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: 64,
            color: "rgba(255,255,255,0.06)",
            letterSpacing: "0.05em",
            marginBottom: 20,
          }}>
            NO RESULTS
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 20 }}>
            No colleges match the current filter.
          </p>
          <button
            onClick={() => setActiveTab("ALL")}
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid rgba(169,29,58,0.5)",
              color: "#A91D3A",
              borderRadius: 6,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Editorial rows */
        <div>
          {filtered.map((college, i) => (
            <CollegeCard
              key={college.id ?? college.name}
              college={college}
              index={i}
              onViewProfile={setProfileCollege}
            />
          ))}
        </div>
      )}

      {/* ── Bottom bar ────────────────────────────────────────────────────────── */}
      {!isLoading && filtered.length > 0 && (
        <div style={{
          padding: "20px 48px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{
            fontSize: 9,
            fontWeight: 900,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}>
            {filtered.length} {filtered.length === 1 ? "College" : "Colleges"}
          </span>
        </div>
      )}
    </div>
  );
}
