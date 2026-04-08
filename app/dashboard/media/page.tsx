"use client";
import React, { useState, useRef } from "react";
import type { Match, MediaItem } from "@/types";
import { resizeImageFile } from "@/lib/dataManager";
import { Upload, Film, Image as ImageIcon, X, PlayCircle, Calendar } from "lucide-react"; // Note: Assumes lucide-react is installed, if not, I can swap for SVGs
import MediaPage from "@/components/pages/MediaPage";

interface MediaPageProps {
  matches: Match[];
  media: MediaItem[];
  onUploadMedia: (item: Omit<MediaItem, "id" | "createdAt">) => void;
}

export default function MediaPageWrapper() {
  // Mock data for matches and media
  const matches = [];
  const media = [];

  const handleAddMedia = (item) => {
    console.log("Media added:", item);
  };

  return <MediaPage matches={matches} media={media} onAddMedia={handleAddMedia} />;
}
