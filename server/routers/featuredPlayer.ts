// Top Performer ("featured player") router.
//
// Data model: featured_players is append-only — admins create a new row each
// time they want to change the dashboard spotlight. The dashboard reads the
// MOST RECENT row by created_at DESC, so older entries are silently retired
// without needing an is_active flag.
//
// The card joins through to players (name, photo_url, jersey_number) and
// sports (name) so the UI can render everything from a single query.

import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";

// Shape returned to the dashboard and landing page. Computed in getCurrent.
type CurrentFeaturedPlayer = {
  id: string;
  label: string;
  playerId: string;
  playerName: string;
  photoUrl: string | null;
  jerseyNumber: number | null;
  sportName: string | null;
  // College org code (COS/CSS/CCAD/SOM) — resolved from players.college_id → teams.org.
  // Null when the player has no college_id or the team lookup fails.
  collegeOrg: string | null;
  stats: { label: string; value: number }[]; // 0-4 entries
  createdAt: string;
} | null;

export const featuredPlayerRouter = router({
  // PUBLIC — returns the latest row, hydrated with player + sport info,
  // or `null` if no entry has ever been set.
  //
  // We split this into two single-level queries instead of one nested join.
  // PostgREST nested-relation hints (transitive FKs through two tables) are
  // brittle in this codebase — the established pattern is one-level joins.
  getCurrent: publicProcedure.query(async (): Promise<CurrentFeaturedPlayer> => {
    // ── Step 1: featured_players + immediate player join ──────────────────
    // `as any` bypasses stale Supabase types — the featured_players table
    // hasn't been added to types/supabase.ts yet. Runtime select works.
    const result = await ((supabaseAdmin as any).from("featured_players"))
      .select(`
        id,
        label,
        player_id,
        stat_1_label, stat_1_value,
        stat_2_label, stat_2_value,
        stat_3_label, stat_3_value,
        stat_4_label, stat_4_value,
        created_at,
        player:player_id (id, name, photo_url, jersey_number, sport_id, college_id)
      `)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.error.message,
      });
    }

    // maybeSingle returns null when the table is empty — handle gracefully.
    const row = result.data as any | null;
    if (!row) return null;

    // ── Step 2: resolve sport name + college org in parallel ─────────────
    // Two independent lookups — run them together via Promise.all for speed.
    const playerSportId    = row.player?.sport_id   as string | null | undefined;
    const playerCollegeId  = row.player?.college_id as string | null | undefined;

    const [sportResult, collegeResult] = await Promise.all([
      playerSportId
        ? supabaseAdmin.from("sports").select("name").eq("id", playerSportId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      playerCollegeId
        ? supabaseAdmin.from("teams").select("org").eq("id", playerCollegeId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    // Both lookups are non-fatal: card still renders if either query errors.
    if (sportResult.error) {
      console.error("featuredPlayer.getCurrent: sport lookup failed:", sportResult.error.message);
    }
    if (collegeResult.error) {
      console.error("featuredPlayer.getCurrent: college lookup failed:", collegeResult.error.message);
    }

    const sportName   = (sportResult.data  as any)?.name ?? null;
    const collegeOrg  = (collegeResult.data as any)?.org  ?? null;

    // Compact the 4 stat slots into an array of only the filled ones, so the
    // UI can render exactly what was saved (0-4 columns).
    const stats: { label: string; value: number }[] = [];
    for (let i = 1; i <= 4; i++) {
      const label = row[`stat_${i}_label`] as string | null;
      const value = row[`stat_${i}_value`] as number | null;
      if (label && value !== null && value !== undefined) {
        stats.push({ label, value: Number(value) });
      }
    }

    return {
      id:           row.id,
      label:        row.label ?? "TOP PERFORMER",
      playerId:     row.player_id,
      playerName:   row.player?.name ?? "Unknown",
      photoUrl:     row.player?.photo_url ?? null,
      jerseyNumber: row.player?.jersey_number ?? null,
      sportName,
      collegeOrg,
      stats,
      createdAt:    row.created_at,
    };
  }),

  // ADMIN — creates a new featured_players row. The new row becomes the
  // "current" entry by virtue of being the newest. Older rows stay in place
  // for history but no longer drive the dashboard.
  set: adminProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        // Label is required so the badge has something to render; default
        // applies when admin leaves the field empty.
        label: z.string().trim().min(1).max(60).default("TOP PERFORMER"),
        // Each stat slot is optional. Both label AND value must be present
        // for a stat to be saved; orphan label/value pairs are coerced to null.
        stat_1_label: z.string().trim().max(12).nullable().optional(),
        stat_1_value: z.number().finite().nullable().optional(),
        stat_2_label: z.string().trim().max(12).nullable().optional(),
        stat_2_value: z.number().finite().nullable().optional(),
        stat_3_label: z.string().trim().max(12).nullable().optional(),
        stat_3_value: z.number().finite().nullable().optional(),
        stat_4_label: z.string().trim().max(12).nullable().optional(),
        stat_4_value: z.number().finite().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Helper: only include a stat slot when BOTH label and value are set.
      // Returns the value (or null) for label and value columns.
      const pair = (label?: string | null, value?: number | null) => {
        const validLabel = label && label.length > 0 ? label : null;
        const validValue = value !== null && value !== undefined ? value : null;
        if (!validLabel || validValue === null) return { label: null, value: null };
        return { label: validLabel, value: validValue };
      };

      const s1 = pair(input.stat_1_label, input.stat_1_value);
      const s2 = pair(input.stat_2_label, input.stat_2_value);
      const s3 = pair(input.stat_3_label, input.stat_3_value);
      const s4 = pair(input.stat_4_label, input.stat_4_value);

      const payload = {
        player_id:    input.playerId,
        label:        input.label,
        stat_1_label: s1.label, stat_1_value: s1.value,
        stat_2_label: s2.label, stat_2_value: s2.value,
        stat_3_label: s3.label, stat_3_value: s3.value,
        stat_4_label: s4.label, stat_4_value: s4.value,
        created_by:   ctx.user.id,
      };

      // Same `as any` reason as getCurrent — bypassing stale types.
      const { data, error } = await ((supabaseAdmin as any).from("featured_players"))
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }

      return data;
    }),
});
