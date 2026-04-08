"use client";

import React from "react";
import { Box } from "../matches/Box";
import type { Match } from "@/types";

interface MatchesPageProps {
  matches: Match[];
  onAddMatch: (match: Omit<Match, "id" | "createdAt">) => void;
  onDeleteMatch: (id: number) => void;
}

export default function MatchesPage({ matches, onAddMatch, onDeleteMatch }: MatchesPageProps) {
  return <Box matches={matches} onAddMatch={onAddMatch} onDeleteMatch={onDeleteMatch} />;
}