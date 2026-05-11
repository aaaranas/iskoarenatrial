// src/app/page.tsx
"use client";

import LandingPage from "@/features/landing/LandingPage";
import { supabase } from "@/lib/supabase/client";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const handleLogin = async () => {
    // 1. We invalidate the tRPC session so it re-fetches the new user
    await utils.auth.getSession.invalidate();
    // 2. We sync cookies with the server
    router.refresh();
    // 3. We move to the protected dashboard
    router.push("/dashboard");
  };

  return (
    <>
      <LandingPage onLogin={handleLogin} />
      <Toaster />
    </>
  );
}
