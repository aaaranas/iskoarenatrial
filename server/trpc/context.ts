import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { createServerClient } from '@supabase/ssr';

export const createContext = async (opts: CreateNextContextOptions) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: opts.req.cookies }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  // Optionally pre-fetch profile here to make it available in all procedures
  const { data: profile } = user 
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null };

  return {
    supabase,
    user,
    profile,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
