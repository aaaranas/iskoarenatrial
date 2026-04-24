import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './trpc/context';

// ✅ Bind the context type so all procedures have full type-safety on ctx
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * PROTECTED PROCEDURE — for super_admin and college_admin roles only.
 *
 * Reads ctx.user and ctx.profile which are pre-fetched in createContext
 * using the server-side Supabase client (with real request cookies).
 * Never imports the browser Supabase client — that has no session on the server.
 */
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  if (ctx.profile?.role !== 'super_admin' && ctx.profile?.role !== 'college_admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
  }

  // Pass the narrowed context forward so downstream procedures know user is authenticated
  return next({ ctx: { ...ctx, user: ctx.user, profile: ctx.profile } });
});