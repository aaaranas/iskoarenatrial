import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { supabase } from '@/lib/supabase/client';

const t = initTRPC.create({
  transformer: superjson,
});

export const router          = t.router;
export const publicProcedure = t.procedure;

// PROTECTED PROCEDURE
// Every logged-in user is an admin on this platform —
// no role check needed, just verify the session exists.
export const adminProcedure = t.procedure.use(async ({ next }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Profile not found.' });
  }

  return next({ ctx: { user, profile } });
});