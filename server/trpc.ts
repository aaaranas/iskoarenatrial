import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { createCookieSupabaseClient } from '@/lib/supabase/server-client';

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Uses the cookie-aware server client so the session is readable in the
// tRPC API route context. The old browser client singleton had no cookie
// handler and always returned null (getUser = null → always UNAUTHORIZED).
export const adminProcedure = t.procedure.use(async ({ next }) => {
  const supabase = await createCookieSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: "Insufficient permissions" });
  }

  return next({ ctx: { user, profile } });
});
