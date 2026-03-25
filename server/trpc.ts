import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { supabase } from '@/lib/supabase/client';

const t = initTRPC.create({
  transformer: superjson, // Allows sending Dates and Maps easily
});

export const router = t.router;
export const publicProcedure = t.procedure;

// PROTECTED PROCEDURE (For Admins)
export const adminProcedure = t.procedure.use(async ({ next }) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const { data: profile } = await supabase
    .from('profiles')
    .eq('id', user.id)
    .single();

  // Only allow Global Admins or College Admins
  if (profile?.role !== 'super_admin' && profile?.role !== 'college_admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: "Insufficient permissions" });
  }

  return next({ ctx: { user, profile } });
});
