import { router, publicProcedure } from "../trpc";
import { supabase } from "@/lib/supabase/client";

export const playersRouter = router({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase.from("players").select("*");
    if (error) throw error;
    return data || [];
  }),
});
