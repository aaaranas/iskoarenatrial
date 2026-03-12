"use client";
import React, { useState, useRef } from "react";
import type { Match, MediaItem } from "@/types";
import { resizeImageFile } from "@/lib/dataManager";

interface MediaPageProps {
  matches: Match[];
  media: MediaItem[];
  onUploadMedia: (item: Omit<MediaItem, "id" | "createdAt">) => void;
}

export default function MediaPage({ matches, media, onUploadMedia }: MediaPageProps) {
  const [title, setTitle] = useState("");
  const [matchVal, setMatchVal] = useState("");
  const [preview, setPreview] = useState<{ src: string; isVideo: boolean; name: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      resizeImageFile(file, 800, (dataUrl) =>
        setPreview({ src: dataUrl, isVideo: false, name: file.name })
      );
    } else if (file.type.startsWith("video/")) {
      setPreview({ src: "", isVideo: true, name: file.name });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) { alert("Please select a file"); return; }
    if (!title) { alert("Please enter a title"); return; }
    const [matchId, sport] = matchVal ? matchVal.split("|") : ["", ""];
    onUploadMedia({
      title,
      type: preview.isVideo ? "video" : "image",
      data: preview.src,
      fileName: preview.name,
      matchId: matchId ? parseInt(matchId) : null,
      sport: sport || "",
      size: "—",
    });
    setTitle("");
    setMatchVal("");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="min-h-screen bg-[#0a0a0a]">
      {/* Google Font Import via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,900&family=Barlow:wght@400;500;600&display=swap');

        .media-hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(4rem, 12vw, 9rem);
          font-weight: 900;
          font-style: italic;
          line-height: 0.9;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #fff;
          position: relative;
        }

        .media-hero-title span.accent {
          color: #A91D3A;
          display: inline-block;
        }

        .hero-bar {
          display: inline-block;
          height: 6px;
          background: #A91D3A;
          width: 80px;
          margin-bottom: 12px;
        }

        .upload-zone {
          border: 2px dashed rgba(169, 29, 58, 0.4);
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
          background: rgba(169, 29, 58, 0.04);
        }
        .upload-zone:hover,
        .upload-zone.drag-over {
          border-color: #A91D3A;
          background: rgba(169, 29, 58, 0.08);
        }

        .field-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          transition: border-color 0.2s, background 0.2s;
          outline: none;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.3); }
        .field-input:focus {
          border-color: #A91D3A;
          background: rgba(169, 29, 58, 0.06);
        }
        .field-input option { background: #1a1a1a; color: #fff; }

        .field-label {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
        }

        .submit-btn {
          padding: 14px 36px;
          background: #A91D3A;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, transform 0.15s;
        }
        .submit-btn:hover {
          background: #c4223f;
          transform: translateY(-2px);
        }
        .submit-btn:active { transform: translateY(0); }

        .gallery-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        }
        .gallery-card:hover {
          transform: translateY(-4px);
          border-color: rgba(169, 29, 58, 0.5);
          box-shadow: 0 12px 40px rgba(169, 29, 58, 0.15);
        }
        .gallery-card:hover .card-overlay {
          opacity: 1;
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(169,29,58,0.7) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .section-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
        }
        .section-divider h3 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          font-style: italic;
          text-transform: uppercase;
          color: #fff;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .section-divider .line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .section-divider .dot {
          width: 8px; height: 8px;
          background: #A91D3A;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .badge-image { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .badge-video { background: rgba(169,29,58,0.25); color: #f87171; }

        /* Lightbox */
        .lightbox-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .lightbox-inner {
          position: relative;
          max-width: 90vw;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .lightbox-img {
          max-width: 100%;
          max-height: 78vh;
          border-radius: 10px;
          object-fit: contain;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.08);
          animation: scaleIn 0.2s ease;
        }
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .lightbox-close {
          position: fixed; top: 20px; right: 24px;
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          color: #fff; font-size: 1.2rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
          font-family: sans-serif;
        }
        .lightbox-close:hover { background: rgba(169,29,58,0.5); border-color: #A91D3A; }

        .lightbox-caption {
          text-align: center;
        }
        .lightbox-caption .title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem; font-weight: 800; font-style: italic;
          color: #fff; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .lightbox-caption .meta {
          font-family: 'Barlow', sans-serif;
          font-size: 0.75rem; color: rgba(255,255,255,0.35); margin-top: 4px;
        }
        .lightbox-nav {
          position: fixed; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          color: #fff; font-size: 1.1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .lightbox-nav:hover { background: rgba(169,29,58,0.5); border-color: #A91D3A; }
        .lightbox-nav.prev { left: 16px; }
        .lightbox-nav.next { right: 16px; }

        .upload-section {
          background: #111;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 36px;
        }

        .gallery-section {
          background: #111;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 36px;
        }
      `}</style>

      {/* Page Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0508 50%, #0f0f0f 100%)', borderBottom: '1px solid rgba(169,29,58,0.2)', padding: '40px 36px 36px' }}>
        {/* Background texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 60px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-bar" />
          <h1 className="media-hero-title">
            MEDIA <span className="accent">HUB</span>
          </h1>
          <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '12px', letterSpacing: '0.04em' }}>
            UPLOAD · ORGANIZE · SHOWCASE
          </p>
        </div>

        {/* Decorative red slash */}
        <div style={{
          position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%) rotate(-8deg)',
          width: '6px', height: '200%', background: 'rgba(169,29,58,0.15)', borderRadius: '3px',
        }} />
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Upload Section */}
        <div className="upload-section">
          <div className="section-divider">
            <div className="dot" />
            <h3>Upload Media</h3>
            <div className="line" />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Drop Zone */}
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                preview.isVideo ? (
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎥</div>
                    <p style={{ color: '#4ade80', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em' }}>
                      ✓ VIDEO READY: {preview.name}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
                    <img src={preview.src} alt="Preview" style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #A91D3A' }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ color: '#4ade80', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em' }}>✓ IMAGE READY</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Barlow', sans-serif", fontSize: '0.8rem', marginTop: '4px' }}>{preview.name}</p>
                      <p style={{ color: 'rgba(169,29,58,0.8)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.75rem', marginTop: '4px', letterSpacing: '0.05em', cursor: 'pointer' }}>CLICK TO CHANGE</p>
                    </div>
                  </div>
                )
              ) : (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.5 }}>📁</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 600, letterSpacing: '0.06em' }}>
                    DROP FILE HERE OR <span style={{ color: '#A91D3A' }}>BROWSE</span>
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Barlow', sans-serif", fontSize: '0.78rem', marginTop: '6px' }}>
                    Supports images and videos
                  </p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label className="field-label">Title *</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Championship Final Highlights"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="field-label">Related Match</label>
                <select
                  className="field-input"
                  value={matchVal}
                  onChange={(e) => setMatchVal(e.target.value)}
                >
                  <option value="">Select a match (optional)</option>
                  {matches.map((m) => (
                    <option key={m.id} value={`${m.id}|${m.sport}`}>
                      {m.sport} — {m.teamA} vs {m.teamB}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              ↑ &nbsp;Upload Media
            </button>
          </form>
        </div>

        {/* Gallery Section */}
        <div className="gallery-section">
          <div className="section-divider">
            <div className="dot" />
            <h3>Media Gallery</h3>
            <div className="line" />
            {media.length > 0 && (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {media.length} ITEM{media.length !== 1 ? 'S' : ''}
              </span>
            )}
          </div>

          {media.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '16px' }}>🖼</div>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: 'rgba(255,255,255,0.2)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                No media uploaded yet
              </p>
              <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.15)', fontSize: '0.8rem', marginTop: '6px' }}>
                Upload your first photo or video above
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {media.map((item) => (
                <div key={item.id} className="gallery-card" onClick={() => setLightbox(item)}>
                  <div style={{ width: '100%', height: '140px', background: '#1a1a1a', overflow: 'hidden', position: 'relative' }}>
                    {item.type === "image" ? (
                      <img src={item.data} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)' }}>
                        🎥
                      </div>
                    )}
                    <div className="card-overlay" />
                    {/* Type badge */}
                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                      <span className={`badge ${item.type === 'image' ? 'badge-image' : 'badge-video'}`}>{item.type}</span>
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                      {item.title}
                    </p>
                    {item.sport && (
                      <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.72rem', color: '#A91D3A', marginTop: '3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {item.sport}
                      </p>
                    )}
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                      {item.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Lightbox */}
      {lightbox && (() => {
        const idx = media.findIndex(m => m.id === lightbox.id);
        const prev = idx > 0 ? media[idx - 1] : null;
        const next = idx < media.length - 1 ? media[idx + 1] : null;
        return (
          <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            {prev && (
              <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setLightbox(prev); }}>‹</button>
            )}
            {next && (
              <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); setLightbox(next); }}>›</button>
            )}
            <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
              {lightbox.type === "image" ? (
                <img src={lightbox.data} alt={lightbox.title} className="lightbox-img" />
              ) : (
                <div style={{ fontSize: '5rem', padding: '60px 80px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>🎥</div>
              )}
              <div className="lightbox-caption">
                <div className="title">{lightbox.title}</div>
                <div className="meta">
                  {lightbox.sport && <span style={{ color: '#A91D3A', marginRight: 8 }}>{lightbox.sport}</span>}
                  {lightbox.type} · {lightbox.size}
                  {idx >= 0 && <span style={{ marginLeft: 8, opacity: 0.5 }}>{idx + 1} / {media.length}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}