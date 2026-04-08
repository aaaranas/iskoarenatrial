import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// env variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// client 
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing or invalid. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);



