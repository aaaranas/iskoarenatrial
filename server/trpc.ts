import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { createClient } from '@supabase/supabase-js';
import type { Context } from '@/server/trpc/context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Server-side Supabase client using the service role key so it can verify
// JWTs and read profiles without being blocked by RLS.
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PROTECTED PROCEDURE (For Admins)
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.token) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const { data: { user }, error } = await supabaseServer.auth.getUser(ctx.token);
  if (error || !user) throw new TRPCError({ code: 'UNAUTHORIZED' });

  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: "Insufficient permissions" });
  }

  return next({ ctx: { ...ctx, user, profile } });
});