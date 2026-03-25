// src/app/dashboard/page.tsx
"use client";

import React from "react";
import { trpc } from "@/utils/trpc";
import DashboardPage from "@/components/pages/DashboardPage";

export default function Overview() {
  // Fetch only the data needed for the overview
  const { data: matches } = trpc.match.getAll.useQuery();

  return (
    <div className="flex-1">
      <DashboardPage 
        matches={matches || []} 
        results={[]} 
        players={[]} 
        teams={[]} 
      />
    </div>
  );
}
