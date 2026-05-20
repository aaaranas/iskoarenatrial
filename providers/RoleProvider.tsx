"use client";

import { createContext, useContext } from "react";
import { trpc } from "@/lib/trpc";

// Matches actual DB values: "admin" | "user". null = unauthenticated or no row.
type Role = "admin" | "user" | null;

interface RoleContextValue {
  role: Role;
  isAdmin: boolean;
  loading: boolean;
}

const RoleContext = createContext<RoleContextValue>({
  role: null,
  isAdmin: false,
  loading: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // Shares the tRPC cache with DashboardLayout's getSession call — React Query
  // dedupes by query key, so this hook does NOT issue a second network request.
  // Previously this provider made two extra round-trips (auth.getUser + a separate
  // profiles select) that duplicated the layout's session fetch on every load.
  const { data, isLoading } = trpc.auth.getSession.useQuery();
  const role: Role = ((data?.profile as { role?: string } | null)?.role as Role) ?? null;
  const isAdmin = !isLoading && role === "admin";

  return (
    <RoleContext.Provider value={{ role, isAdmin, loading: isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}