"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

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
  const [role,    setRole]    = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole((profile?.role as Role) ?? null);
      setLoading(false);
    };

    fetchRole();
  }, []);

  const isAdmin = !loading && role === "admin";

  return (
    <RoleContext.Provider value={{ role, isAdmin, loading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}