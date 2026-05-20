// Tournament bracket router — double elimination, 4-team structure.
//
// The 7 fixed bracket slots for a 4-team DE tournament:
//   wb_r1_1    WB Round 1 (Match 1) — slot 1
//   wb_r1_2    WB Round 1 (Match 2) — slot 2
//   wb_finals  WB Finals            — slot 3  (winner feeds grand_final home side)
//   lb_r1      LB Round 1           — slot 4
//   lb_finals  LB Finals            — slot 5  (winner feeds grand_final away side)
//   grand_final Grand Final         — slot 6
//   gf_reset   GF Reset             — slot 7  (only active if LB side wins GF)
//
// Advancement map (applied in updateResult):
//   wb_r1_1 winner → wb_finals.home  |  wb_r1_1 loser  → lb_r1.home
//   wb_r1_2 winner → wb_finals.away  |  wb_r1_2 loser  → lb_r1.away
//   wb_finals winner → grand_final.home  |  wb_finals loser → lb_finals.away
//   lb_r1 winner → lb_finals.home
//   lb_finals winner → grand_final.away
//   grand_final: WB side wins → tournament complete
//               LB side wins → gf_reset (home=LB winner loser, away=LB winner winner)
//   gf_reset winner → tournament complete

import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";

const db = () => supabaseAdmin as any; // bypass stale types for new tables

// ── Slot template ────────────────────────────────────────────────────────────
const SLOT_TEMPLATES: Array<{
  round_key: string;
  slot_order: number;
  round_label: string;
}> = [
  { round_key: "wb_r1_1",     slot_order: 1, round_label: "WB Round 1"    },
  { round_key: "wb_r1_2",     slot_order: 2, round_label: "WB Round 1"    },
  { round_key: "wb_finals",   slot_order: 3, round_label: "WB Finals"     },
  { round_key: "lb_r1",       slot_order: 4, round_label: "LB Round 1"    },
  { round_key: "lb_finals",   slot_order: 5, round_label: "LB Finals"     },
  { round_key: "grand_final", slot_order: 6, round_label: "Grand Final"   },
  { round_key: "gf_reset",    slot_order: 7, round_label: "GF Reset"      },
];

// ── Shared result type for getCurrent / getById ───────────────────────────────
type BracketSlot = {
  id: string;
  roundKey: string;
  slotOrder: number;
  roundLabel: string;
  homeTeamId: string | null;
  homeTeamOrg: string | null;
  homeTeamName: string | null;
  awayTeamId: string | null;
  awayTeamOrg: string | null;
  awayTeamName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: string | null;
  status: string;
};

type TournamentWithBracket = {
  id: string;
  name: string;
  sportId: string;
  sportName: string | null;
  category: string | null;
  year: number;
  status: string;
  createdAt: string;
  slots: BracketSlot[];
};

// Shapes a raw bracket_matches row + its team data into a BracketSlot.
function shapeSlot(row: any): BracketSlot {
  return {
    id:           row.id,
    roundKey:     row.round_key,
    slotOrder:    row.slot_order,
    roundLabel:   row.round_label,
    homeTeamId:   row.home_team_id ?? null,
    homeTeamOrg:  row.home_team?.org  ?? null,
    homeTeamName: row.home_team?.name ?? null,
    awayTeamId:   row.away_team_id ?? null,
    awayTeamOrg:  row.away_team?.org  ?? null,
    awayTeamName: row.away_team?.name ?? null,
    homeScore:    row.home_score ?? null,
    awayScore:    row.away_score ?? null,
    winnerId:     row.winner_id ?? null,
    status:       row.status,
  };
}

export const tournamentRouter = router({
  // ── PUBLIC ──────────────────────────────────────────────────────────────────

  // Returns the most-recently created active tournament with all bracket slots.
  // Used by the dashboard BracketPreview widget.
  getCurrent: publicProcedure.query(async (): Promise<TournamentWithBracket | null> => {
    const tResult = await db()
      .from("tournaments")
      .select("id, name, sport_id, category, year, status, created_at, sport:sport_id(name)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tResult.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tResult.error.message });
    if (!tResult.data) return null;

    const t = tResult.data as any;
    const slotsResult = await db()
      .from("bracket_matches")
      .select(`
        id, round_key, slot_order, round_label, status,
        home_team_id, home_score,
        away_team_id, away_score,
        winner_id,
        home_team:home_team_id(id, name, org),
        away_team:away_team_id(id, name, org)
      `)
      .eq("tournament_id", t.id)
      .order("slot_order", { ascending: true });

    if (slotsResult.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: slotsResult.error.message });

    return {
      id:        t.id,
      name:      t.name,
      sportId:   t.sport_id,
      sportName: t.sport?.name ?? null,
      category:  t.category ?? null,
      year:      t.year,
      status:    t.status,
      createdAt: t.created_at,
      slots:     ((slotsResult.data ?? []) as any[]).map(shapeSlot),
    };
  }),

  // Returns all tournaments for the admin brackets page list.
  getAll: publicProcedure.query(async () => {
    const result = await db()
      .from("tournaments")
      .select("id, name, sport_id, category, year, status, created_at, sport:sport_id(name)")
      .order("created_at", { ascending: false });

    if (result.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error.message });
    return ((result.data ?? []) as any[]).map((t) => ({
      id:        t.id,
      name:      t.name,
      sportId:   t.sport_id,
      sportName: t.sport?.name ?? null,
      category:  t.category ?? null,
      year:      t.year,
      status:    t.status,
      createdAt: t.created_at,
    }));
  }),

  // Returns one tournament with full bracket for the admin detail view.
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }): Promise<TournamentWithBracket | null> => {
      const tResult = await db()
        .from("tournaments")
        .select("id, name, sport_id, category, year, status, created_at, sport:sport_id(name)")
        .eq("id", input.id)
        .maybeSingle();

      if (tResult.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tResult.error.message });
      if (!tResult.data) return null;

      const t = tResult.data as any;
      const slotsResult = await db()
        .from("bracket_matches")
        .select(`
          id, round_key, slot_order, round_label, status,
          home_team_id, home_score,
          away_team_id, away_score,
          winner_id,
          home_team:home_team_id(id, name, org),
          away_team:away_team_id(id, name, org)
        `)
        .eq("tournament_id", t.id)
        .order("slot_order", { ascending: true });

      if (slotsResult.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: slotsResult.error.message });

      return {
        id:        t.id,
        name:      t.name,
        sportId:   t.sport_id,
        sportName: t.sport?.name ?? null,
        category:  t.category ?? null,
        year:      t.year,
        status:    t.status,
        createdAt: t.created_at,
        slots:     ((slotsResult.data ?? []) as any[]).map(shapeSlot),
      };
    }),

  // ── ADMIN ───────────────────────────────────────────────────────────────────

  // Creates a tournament + auto-generates the 7 fixed DE bracket slots.
  create: adminProcedure
    .input(z.object({
      sport_id: z.string().uuid(),
      category: z.enum(["Men","Women","Men Singles","Men Doubles","Women Singles","Women Doubles","Mixed Doubles"]).nullable().optional(),
      name: z.string().trim().min(1).max(100).default("Tournament"),
      year: z.number().int().min(2020).max(2100).default(2026),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Insert tournament
      const tResult = await db()
        .from("tournaments")
        .insert({
          sport_id:   input.sport_id,
          category:   input.category ?? null,
          name:       input.name,
          year:       input.year,
          status:     "upcoming",
          created_by: ctx.user.id,
        })
        .select()
        .single();

      if (tResult.error) throw new TRPCError({ code: "BAD_REQUEST", message: tResult.error.message });
      const tournament = tResult.data as any;

      // 2. Auto-create the 7 bracket slots — all pending, no teams assigned yet.
      const slots = SLOT_TEMPLATES.map((t) => ({
        tournament_id: tournament.id,
        round_key:     t.round_key,
        slot_order:    t.slot_order,
        round_label:   t.round_label,
        status:        "pending",
      }));

      const slotsResult = await db().from("bracket_matches").insert(slots);
      if (slotsResult.error) throw new TRPCError({ code: "BAD_REQUEST", message: slotsResult.error.message });

      return { id: tournament.id };
    }),

  // Activates or deactivates a tournament (upcoming → active → completed).
  updateStatus: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(["upcoming", "active", "completed"]),
    }))
    .mutation(async ({ input }) => {
      const result = await db()
        .from("tournaments")
        .update({ status: input.status })
        .eq("id", input.id)
        .select()
        .single();

      if (result.error) throw new TRPCError({ code: "BAD_REQUEST", message: result.error.message });
      return result.data;
    }),

  // Assigns teams to the WB R1 slots (slot 1 + slot 2). This seeds the bracket.
  // Exactly 4 distinct team IDs must be provided (they map to COS/CSS/CCAD/SOM).
  setFirstRound: adminProcedure
    .input(z.object({
      tournamentId: z.string().uuid(),
      // Match 1
      wb_r1_1_home: z.string().uuid(),
      wb_r1_1_away: z.string().uuid(),
      // Match 2
      wb_r1_2_home: z.string().uuid(),
      wb_r1_2_away: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      const allIds = [input.wb_r1_1_home, input.wb_r1_1_away, input.wb_r1_2_home, input.wb_r1_2_away];
      if (new Set(allIds).size !== 4) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "All four bracket positions must have distinct teams." });
      }

      // Fetch the existing slots to get their IDs
      const slotsResult = await db()
        .from("bracket_matches")
        .select("id, round_key")
        .eq("tournament_id", input.tournamentId)
        .in("round_key", ["wb_r1_1", "wb_r1_2"]);

      if (slotsResult.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: slotsResult.error.message });

      const slots = (slotsResult.data ?? []) as Array<{ id: string; round_key: string }>;
      const slot1 = slots.find((s) => s.round_key === "wb_r1_1");
      const slot2 = slots.find((s) => s.round_key === "wb_r1_2");

      if (!slot1 || !slot2) throw new TRPCError({ code: "NOT_FOUND", message: "Bracket slots not found." });

      await Promise.all([
        db().from("bracket_matches").update({ home_team_id: input.wb_r1_1_home, away_team_id: input.wb_r1_1_away, status: "active" }).eq("id", slot1.id),
        db().from("bracket_matches").update({ home_team_id: input.wb_r1_2_home, away_team_id: input.wb_r1_2_away, status: "active" }).eq("id", slot2.id),
      ]);

      return { success: true };
    }),

  // Records a result for a bracket slot and auto-advances teams to the next slots.
  // This is the core advancement engine for the DE bracket.
  updateResult: adminProcedure
    .input(z.object({
      slotId:     z.string().uuid(),
      homeScore:  z.number().int().min(0),
      awayScore:  z.number().int().min(0),
      // Admin explicitly declares winner (avoids tie ambiguity in some sports).
      winnerId:   z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      // 1. Fetch the slot being updated
      const slotResult = await db()
        .from("bracket_matches")
        .select("id, tournament_id, round_key, home_team_id, away_team_id")
        .eq("id", input.slotId)
        .single();

      if (slotResult.error) throw new TRPCError({ code: "NOT_FOUND", message: "Bracket slot not found." });
      const slot = slotResult.data as any;

      // Verify winner is one of the two teams
      if (input.winnerId !== slot.home_team_id && input.winnerId !== slot.away_team_id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Winner must be one of the two teams in this match." });
      }

      const loserId = input.winnerId === slot.home_team_id ? slot.away_team_id : slot.home_team_id;

      // 2. Update this slot with the result
      const updateResult = await db()
        .from("bracket_matches")
        .update({ home_score: input.homeScore, away_score: input.awayScore, winner_id: input.winnerId, status: "completed" })
        .eq("id", input.slotId);

      if (updateResult.error) throw new TRPCError({ code: "BAD_REQUEST", message: updateResult.error.message });

      // 3. Fetch all slots for this tournament to find the advancement targets
      const allSlotsResult = await db()
        .from("bracket_matches")
        .select("id, round_key")
        .eq("tournament_id", slot.tournament_id);

      if (allSlotsResult.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: allSlotsResult.error.message });

      const allSlots = (allSlotsResult.data ?? []) as Array<{ id: string; round_key: string }>;
      const slotMap = new Map(allSlots.map((s) => [s.round_key, s.id]));

      // 4. Apply advancement rules based on the completed slot's round_key
      const advancements: Array<{ slotId: string; field: "home_team_id" | "away_team_id"; teamId: string }> = [];
      let markComplete = false;

      switch (slot.round_key) {
        case "wb_r1_1":
          advancements.push({ slotId: slotMap.get("wb_finals")!, field: "home_team_id", teamId: input.winnerId });
          advancements.push({ slotId: slotMap.get("lb_r1")!,       field: "home_team_id", teamId: loserId });
          break;
        case "wb_r1_2":
          advancements.push({ slotId: slotMap.get("wb_finals")!, field: "away_team_id", teamId: input.winnerId });
          advancements.push({ slotId: slotMap.get("lb_r1")!,       field: "away_team_id", teamId: loserId });
          break;
        case "wb_finals":
          advancements.push({ slotId: slotMap.get("grand_final")!, field: "home_team_id", teamId: input.winnerId });
          advancements.push({ slotId: slotMap.get("lb_finals")!,   field: "away_team_id", teamId: loserId });
          break;
        case "lb_r1":
          advancements.push({ slotId: slotMap.get("lb_finals")!, field: "home_team_id", teamId: input.winnerId });
          // Loser is eliminated — no advancement for loserId
          break;
        case "lb_finals":
          advancements.push({ slotId: slotMap.get("grand_final")!, field: "away_team_id", teamId: input.winnerId });
          // Loser is eliminated
          break;
        case "grand_final": {
          // Check who won:
          // home_team_id came from WB side — if WB side wins, tournament is over.
          // If away side (LB side) wins, we need a GF reset (both players have 1 loss).
          const wbSideTeamId = slot.home_team_id;
          if (input.winnerId === wbSideTeamId) {
            // WB side won — tournament complete, no reset needed
            markComplete = true;
          } else {
            // LB side won — activate the GF reset slot
            // GF reset: home = previous GF winner (loser from WB side's perspective = home team who lost)
            //           away = LB finalist who just won
            const gfResetId = slotMap.get("gf_reset");
            if (gfResetId) {
              advancements.push({ slotId: gfResetId, field: "home_team_id", teamId: loserId   }); // WB side (lost this GF)
              advancements.push({ slotId: gfResetId, field: "away_team_id", teamId: input.winnerId }); // LB side (won this GF)
              await db().from("bracket_matches").update({ status: "active" }).eq("id", gfResetId);
            }
          }
          break;
        }
        case "gf_reset":
          // Whoever wins the reset is the champion — tournament complete
          markComplete = true;
          break;
      }

      // 5. Apply all team advancement updates
      await Promise.all(
        advancements
          .filter((a) => a.slotId) // guard against missing slot keys
          .map((a) =>
            db().from("bracket_matches").update({ [a.field]: a.teamId, status: "active" }).eq("id", a.slotId)
          )
      );

      // 6. Mark tournament complete if the final match was decided
      if (markComplete) {
        await db().from("tournaments").update({ status: "completed" }).eq("id", slot.tournament_id);
      }

      return { success: true, advanced: advancements.length, markComplete };
    }),

  // Deletes a tournament and all its bracket_matches (CASCADE handles the slots).
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const result = await db().from("tournaments").delete().eq("id", input.id).select().single();
      if (result.error) throw new TRPCError({ code: "BAD_REQUEST", message: result.error.message });
      return result.data;
    }),
});
