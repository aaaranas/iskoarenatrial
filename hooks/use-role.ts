//hooks/use-role.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Role = "admin" | "user" | null;

export function useRole() {
  const [role, setRole]       = useState<Role>(null);
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

      setRole((profile?.role as Role) ?? "user");
      setLoading(false);
    };

    fetchRole();
  }, []);

  const isAdmin = !loading && role === "admin";

  return { role, isAdmin, loading };
}