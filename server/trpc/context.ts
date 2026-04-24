import { createServerClient } from '@supabase/ssr';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

/**
 * createContext is called once per tRPC request.
 * It uses the fetch adapter's Request object (App Router compatible)
 * to read auth cookies and build a server-side Supabase client.
 */
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read cookies from the incoming request headers
        getAll() {
          const cookieHeader = opts.req.headers.get('cookie') ?? '';
          return cookieHeader.split(';').flatMap((pair) => {
            const [name, ...rest] = pair.trim().split('=');
            if (!name) return [];
            return [{ name: name.trim(), value: rest.join('=').trim() }];
          });
        },
        // tRPC fetch adapter is stateless — we don't set cookies here.
        // Cookie refresh is handled by Next.js middleware.
        setAll() {},
      },
    }
  );

  // Use getUser() — never getSession() — for secure server-side auth checks.
  const { data: { user } } = await supabase.auth.getUser();

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
