import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

/**
 * supabaseAdmin — Service-role Supabase client.
 *
 * ⚠️  This client uses the SERVICE ROLE KEY and intentionally bypasses
 *     Row Level Security (RLS). Only use it for trusted server-side operations
 *     where RLS is not appropriate (e.g. admin data migrations, background jobs).
 *
 * NEVER expose this client to the browser or pass it to client components.
 * NEVER use it inside tRPC procedures — use ctx.supabase (the anon client with
 * user cookies) there instead so RLS policies apply correctly.
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only, never NEXT_PUBLIC_)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n" +
    "Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.\n" +
    "Find it in: Supabase Dashboard → Project Settings → API → service_role key."
  );
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    // Service role client should never persist sessions
    autoRefreshToken: false,
    persistSession: false,
  },
});
