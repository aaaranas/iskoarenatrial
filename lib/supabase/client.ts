import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing or invalid. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.");
}

// Cookie-based storage adapter — stores the auth session in cookies instead of
// localStorage so that @supabase/ssr server-side clients (middleware + tRPC
// handlers) can read the same session from request cookies. Falls back to a
// no-op on the server (typeof document === 'undefined') so server-side tRPC
// routers that import this file for anon-key queries continue to work.
const cookieStorageAdapter = {
  getItem(key: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  },
  setItem(key: string, value: string): void {
    if (typeof document === 'undefined') return;
    // 1-year max-age; SameSite=Lax is safe for same-origin tRPC requests
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
  },
  removeItem(key: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorageAdapter,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
