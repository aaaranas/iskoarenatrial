// test-supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wfzwvjuidgswjsnpvcgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmend2anVpZGdzd2pzbnB2Y2d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg4MzM4MSwiZXhwIjoyMDg5NDU5MzgxfQ.F9AGh95bEtcD-k0hBUY957UZIW85rPy2yUI1COnylXI'
);

async function test() {
  const { data, error } = await supabase.from('test_table').select('*');
  if (error) console.log("ERROR:", error);
  else console.log("DATA:", data);
}
test();
