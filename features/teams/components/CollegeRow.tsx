// Canonical College shape used by the teams page, CollegeCard, and CollegeProfilePage.
// File kept under its original name to avoid re-pathing every import; the previous
// CollegeRow React component was removed when the Bold redesign replaced the
// table layout with editorial card rows.
"use client";

export interface College {
  id?: string;
  name: string;
  org?: string;           // canonical college code: COS | CSS | CCAD | SOM
  established: string;
  activeTeams: number;
  sports: string[];
  status: "Active" | "Pending" | "Inactive";
  logoUrl?: string | null;
}
