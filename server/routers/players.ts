import { router, publicProcedure } from "../trpc";
import { supabaseAdmin } from "@/lib/supabase/server";

export const playersRouter = router({
  // Explicit column list + sports join. Two consumer-side reasons:
  //   1. Avoids select("*") leaking any future columns we wouldn't want public.
  //   2. Surfaces the sport NAME (via the join) so client filters can compare
  //      against match.league without an extra round-trip. The schema only
  //      stores sport_id (UUID) — older code that referenced p.sport (text)
  //      had been silently failing since the FK migration; B9 fixes that.
  getAll: publicProcedure.query(async () => {
    // The Supabase client cast is local to the .from() call so the awaited
    // return shape stays typed for tRPC consumers (StatsPage et al). Stale
    // types/supabase.ts doesn't yet know about college_id; remove the cast
    // once the leaderboards teammate regenerates types.
    //
    // SCHEMA NOTE: teams ≡ colleges 1:1 here. players.college_id holds the
    // team UUID (teams.id == college's UUID). players.team_id is vestigial:
    // planned but unwired — all rows have it NULL.
    const result = await (supabaseAdmin.from("players") as any)
      .select(`
        id,
        team_id,
        college_id,
        name,
        jersey_number,
        position,
        photo_url,
        is_active,
        created_at,
        sport:sport_id (id, name)
      `);
    if (result.error) throw result.error;

    // Explicit return type — preserves IntelliSense for tRPC consumers despite
    // the any-cast above. Keep in sync with the select() string.
    type PlayerRow = {
      id: string;
      team_id: string | null;
      college_id: string | null;
      name: string;
      jersey_number: number | null;
      position: string | null;
      photo_url: string | null;
      is_active: boolean | null;
      created_at: string;
      sport: { id: string; name: string } | null;
    };
    return ((result.data ?? []) as PlayerRow[]);
  }),
});
