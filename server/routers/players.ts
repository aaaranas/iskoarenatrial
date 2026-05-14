import { router, publicProcedure } from "../trpc";
import { supabaseAdmin } from "@/lib/supabase/server";

export const playersRouter = router({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabaseAdmin.from("players").select("*");
    if (error) throw error;
    return data || [];
  }),
});
