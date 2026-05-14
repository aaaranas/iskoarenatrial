import { router, publicProcedure } from "../trpc";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";

export const venueRouter = router({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabaseAdmin
      .from("venues")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return data ?? [];
  }),
});
