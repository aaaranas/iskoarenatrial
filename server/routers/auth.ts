import { router, publicProcedure } from "../trpc";

export const authRouter = router({
  // Returns the current user + profile from context (already fetched in createContext).
  // This avoids a redundant Supabase round-trip — context is the single source of truth.
  getSession: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    return { user: ctx.user, profile: ctx.profile };
  }),
});
