// Service-role Supabase client — bypasses RLS. Importing this from a client
// component would bundle the SUPABASE_SERVICE_ROLE_KEY into the browser, which
// is a full DB compromise. The "server-only" guard makes Next.js fail the build
// the moment any client component tries to import it. (Audit bug #3 fix.)
import "server-only";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
