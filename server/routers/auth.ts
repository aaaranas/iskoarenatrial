import { router, publicProcedure } from "../trpc";
import { supabase } from "@/lib/supabase/client";

export const authRouter = router({
  getSession: publicProcedure.query(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    return { user, profile };
  }),
});