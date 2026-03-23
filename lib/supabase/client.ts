import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// env variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// client 
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);



