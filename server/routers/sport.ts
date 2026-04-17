import { router, publicProcedure } from "../trpc";
import { supabase } from "@/lib/supabase/client";
import { TRPCError } from "@trpc/server";

export const sportRouter = router({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("sports")
      .select("id, name")
      .order("name", { ascending: true });

    if (error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });

    return (data || []) as { id: string; name: string }[];
  }),
});