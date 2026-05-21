"use client";
import React from "react";
import { College } from "./CollegeRow";

// Per-college brand identity keyed by org code
const COLLEGE_IDENTITY: Record<string, {
  mascot: string; color: string; tagline: string;
  photo: string; logo: string;
}> = {
  COS:  { mascot: "SCIONS",    color: "#F4D27A", tagline: "BUILT IN THE LAB. BORN IN THE ARENA.",  photo: "/iskolarobadminton.jpg", logo: "/colleges/cos_logo.jpg" },
  CSS:  { mascot: "STALLIONS", color: "#E11D48", tagline: "HOOVES DOWN. EYES UP. FOREVER FIRST.",  photo: "/iskolarobaseball.jpg",  logo: "/colleges/css_logo.jpg" },
  CCAD: { mascot: "PHOENIX",   color: "#22C55E", tagline: "RISE. BURN. RISE AGAIN.",               photo: "/iskolarofrisbee2.jpg",  logo: "/colleges/ccad_logo.jpg" },
  SOM:  { mascot: "TYCOONS",   color: "#3B82F6", tagline: "EVERY POINT IS PROFIT.",                photo: "/iskolarovolley.jpg",    logo: "/colleges/som_logo.jpg" },
};

// Text color on top of each college's brand color
const TEXT_ON_COLOR: Record<string, string> = {
  COS: "#0a0a0a",  // dark on yellow
  CSS: "#ffffff",
  CCAD: "#0a0a0a",
  SOM: "#ffffff",
};

export function CollegeCard({
  college,
  index,
  onViewProfile,
}: {
  college: College;
  index: number;
  onViewProfile: (college: College) => void;
}) {
  const org = college.org ?? "";
  const identity = COLLEGE_IDENTITY[org] ?? { mascot: college.name.toUpperCase(), color: "#A91D3A", tagline: "", photo: "", logo: "" };
  const { mascot, color, tagline, photo, logo } = identity;
  const textOnColor = TEXT_ON_COLOR[org] ?? "#ffffff";

  // Odd rows flip the layout so the color bar alternates sides
  const reverse = index % 2 === 1;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "#050505",
        minHeight: 300,
      }}
    >
      {/* Sport photo — fills the opposite half from the text */}
      {photo && (
        <div style={{
          position: "absolute",
          top: 0, bottom: 0,
          [reverse ? "left" : "right"]: 0,
          width: "52%",
          zIndex: 0,
        }}>
          <img
            src={photo}
            alt=""
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              filter: "grayscale(0.5) contrast(1.05) brightness(0.5)",
            }}
          />
          {/* Fade the photo edge toward the text side */}
          <div style={{
            position: "absolute", inset: 0,
            background: reverse
              ? `linear-gradient(270deg, #050505 0%, #050505cc 18%, transparent 55%)`
              : `linear-gradient(90deg, #050505 0%, #050505cc 18%, transparent 55%)`,
          }} />
          {/* College color glow wash */}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse 60% 70% at ${reverse ? "20%" : "80%"} 50%, ${color}18 0%, transparent 65%)`,
          }} />
        </div>
      )}

      {/* Brand color vertical edge bar */}
      <div style={{
        position: "absolute",
        top: 0, bottom: 0,
        [reverse ? "right" : "left"]: 0,
        width: 5,
        background: color,
        boxShadow: `${reverse ? "-" : ""}4px 0 32px ${color}55`,
        zIndex: 2,
      }} />

      {/* Giant mascot watermark — centered */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-bebas), sans-serif",
          fontSize: "clamp(110px, 16vw, 240px)",
          lineHeight: 0.8,
          color: `${color}09`,
          fontStyle: "italic",
          letterSpacing: "-0.03em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 1,
        }}
      >
        {mascot}
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          padding: "40px 48px",
          display: "flex",
          flexDirection: reverse ? "row-reverse" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
        }}
      >
        {/* Text block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* College code pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            background: `${color}18`,
            border: `1px solid ${color}44`,
            borderRadius: 999,
            marginBottom: 16,
          }}>
            <span style={{
              fontSize: 9,
              fontWeight: 900,
              color: color,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",  // prevents the pill from warping into a circle on narrow screens
            }}>
              {org} · {college.playerCount ?? 0} PLAYERS · {college.sports.length} SPORTS
            </span>
          </div>

          {/* Full college name */}
          <p style={{
            margin: "0 0 6px",
            fontSize: 10,
            fontWeight: 800,
            color: color,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
          }}>
            {college.name}
          </p>

          {/* Giant mascot name */}
          <h2 style={{
            margin: 0,
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: "clamp(52px, 7vw, 88px)",
            lineHeight: 0.88,
            letterSpacing: "0.01em",
            color: "#ffffff",
            fontStyle: "italic",
          }}>
            {mascot}
          </h2>

          {/* Tagline */}
          {tagline && (
            <p style={{
              margin: "14px 0 0",
              maxWidth: 440,
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.6,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}>
              "{tagline}"
            </p>
          )}

          {/* Stats row */}
          <div style={{ marginTop: 26, display: "flex", gap: 28, alignItems: "flex-end" }}>
            {[
              { label: "Players", value: college.playerCount ?? 0, accent: "#ffffff" },
              { label: "Sports",  value: college.sports.length, accent: color },
              { label: "Est.",    value: college.established, accent: "rgba(255,255,255,0.45)" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{
                  fontFamily: "var(--font-bebas), sans-serif",
                  fontSize: 40,
                  lineHeight: 0.9,
                  color: s.accent,
                  letterSpacing: "0.02em",
                  fontStyle: "italic",
                }}>
                  {s.value}
                </div>
                <div style={{
                  marginTop: 5,
                  fontSize: 7,
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logo + CTA */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: reverse ? "flex-start" : "flex-end",
          gap: 16,
          flexShrink: 0,
          width: 180,
        }}>
          {/* Circular logo / monogram */}
          <div style={{
            width: 110,
            height: 110,
            borderRadius: 999,
            background: college.logoUrl ? "#fff" : `${color}22`,
            overflow: "hidden",
            border: `3px solid ${color}`,
            boxShadow: `0 0 40px ${color}44, 0 12px 32px rgba(0,0,0,0.6)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            {/* Prefer DB logo_url, fall back to public/colleges asset, then initials */}
            {college.logoUrl || logo ? (
              <img
                src={college.logoUrl ?? logo}
                alt={college.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{
                fontFamily: "var(--font-bebas), sans-serif",
                fontSize: 34,
                color: color,
                letterSpacing: "0.04em",
              }}>
                {org || college.name.slice(0, 3).toUpperCase()}
              </span>
            )}
          </div>

          {/* View roster CTA */}
          <button
            onClick={() => onViewProfile(college)}
            style={{
              width: "100%",
              padding: "11px 16px",
              background: color,
              color: textOnColor,
              border: "none",
              borderRadius: 6,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: `0 8px 28px ${color}33`,
              transition: "opacity 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          >
            View Roster →
          </button>
        </div>
      </div>
    </div>
  );
}
