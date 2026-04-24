import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const mediaRouter = router({
  getAll: publicProcedure
    .input(z.object({
      type: z.string().optional(),   // 'video' | 'image' | undefined (all)
      sport: z.string().optional(),
      limit: z.number().min(1).max(100).default(12),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("media")
        .select("id, title, url, type, sport, created_at, match_id", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.type) query = query.eq("type", input.type);
      if (input.sport) query = query.eq("sport", input.sport);

      const { data, error, count } = await query;

      if (error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

      return {
        items: data || [],
        total: count ?? 0,
      };
    }),
});
