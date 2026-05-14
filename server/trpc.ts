import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { createCookieSupabaseClient } from '@/lib/supabase/server-client';

// Context is built once per request and shared across all procedures in the
// batch — saves re-instantiating the cookie Supabase client and re-running
// auth.getUser() in each procedure (previously: N round-trips per batch).
export async function createTRPCContext() {
  const supabase = await createCookieSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Authenticated procedure — caller must be signed in. Reuses ctx.user so we
// don't re-query the auth service.
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Admin-only procedure — verifies the caller's profile.role === 'admin'.
// The profile fetch still hits the DB once per request; cache later if needed.
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('*')
    .eq('id', ctx.user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: "Insufficient permissions" });
  }

  return next({ ctx: { ...ctx, profile } });
});
