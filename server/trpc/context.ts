import { createClient } from '@supabase/supabase-js';

export const createContext = async () => {
  return {};
};

export type Context = Awaited<ReturnType<typeof createContext>>;