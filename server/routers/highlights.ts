import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { TRPCError } from "@trpc/server";

export const highlightRouter = router({

  // ── READ: fetch all highlights with their slides ─────────────────────────
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("highlights")
      .select(`
        id,
        label,
        color,
        cover_url,
        created_at,
        highlight_slides (
          id,
          emoji,
          text,
          image_url,
          media_id,
          slide_order
        )
      `)
      .order("created_at", { ascending: false });

    if (error)
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

    return (data ?? []).map((h: any) => ({
      id:        h.id         as string,
      label:     h.label      as string,
      color:     h.color      as string,
      coverUrl:  h.cover_url  as string | null,
      createdAt: h.created_at as string,
      slides: ((h.highlight_slides ?? []) as any[])
        .sort((a, b) => a.slide_order - b.slide_order)
        .map(s => ({
          id:       s.id        as string,
          emoji:    s.emoji     as string | null,
          text:     s.text      as string | null,
          imageUrl: s.image_url as string | null,
          mediaId:  s.media_id  as string | null,
          order:    s.slide_order as number,
        })),
    }));
  }),

  // ── CREATE highlight (manual) ────────────────────────────────────────────
  create: adminProcedure
    .input(z.object({
      label:    z.string().min(1),
      color:    z.string().default("from-[#A91D3A] to-[#741029]"),
      coverUrl: z.string().nullable().optional(),
      // Initial slides (at least one required for the story to make sense)
      slides: z.array(z.object({
        emoji:    z.string().nullable().optional(),
        text:     z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
        mediaId:  z.string().uuid().nullable().optional(),
        order:    z.number().default(0),
      })).min(1),
    }))
    .mutation(async ({ input }) => {
      // 1. Insert highlight
      const { data: hl, error: hlErr } = await supabase
        .from("highlights")
        .insert({ label: input.label, color: input.color, cover_url: input.coverUrl ?? null })
        .select()
        .single();

      if (hlErr)
        throw new TRPCError({ code: "BAD_REQUEST", message: hlErr.message });

      // 2. Insert slides
      const slidesPayload = input.slides.map((s, i) => ({
        highlight_id: hl.id,
        emoji:        s.emoji    ?? null,
        text:         s.text     ?? null,
        image_url:    s.imageUrl ?? null,
        media_id:     s.mediaId  ?? null,
        slide_order:  s.order ?? i,
      }));

      const { error: slidesErr } = await supabase
        .from("highlight_slides")
        .insert(slidesPayload);

      if (slidesErr)
        throw new TRPCError({ code: "BAD_REQUEST", message: slidesErr.message });

      return hl;
    }),

  // ── CREATE highlight FROM a media item (share to story) ─────────────────
  createFromMedia: adminProcedure
    .input(z.object({
      mediaId:  z.string().uuid(),
      label:    z.string().min(1),
      color:    z.string().default("from-[#A91D3A] to-[#741029]"),
      // Optional extra text the admin wants to overlay
      text:     z.string().nullable().optional(),
      emoji:    z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      // Fetch the media item to get its URL for the cover + slide
      const { data: mediaItem, error: mediaErr } = await supabase
        .from("media")
        .select("id, url, title")
        .eq("id", input.mediaId)
        .single();

      if (mediaErr || !mediaItem)
        throw new TRPCError({ code: "NOT_FOUND", message: "Media item not found." });

      // 1. Insert highlight using media URL as cover
      const { data: hl, error: hlErr } = await supabase
        .from("highlights")
        .insert({
          label:     input.label,
          color:     input.color,
          cover_url: mediaItem.url,
        })
        .select()
        .single();

      if (hlErr)
        throw new TRPCError({ code: "BAD_REQUEST", message: hlErr.message });

      // 2. Insert a single slide from the media
      const { error: slideErr } = await supabase
        .from("highlight_slides")
        .insert({
          highlight_id: hl.id,
          emoji:        input.emoji    ?? null,
          text:         input.text     ?? mediaItem.title,
          image_url:    mediaItem.url,
          media_id:     input.mediaId,
          slide_order:  0,
        });

      if (slideErr)
        throw new TRPCError({ code: "BAD_REQUEST", message: slideErr.message });

      return hl;
    }),

  // ── UPDATE highlight label / color ───────────────────────────────────────
  update: adminProcedure
    .input(z.object({
      id:       z.string().uuid(),
      label:    z.string().min(1).optional(),
      color:    z.string().optional(),
      coverUrl: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...fields } = input;
      const patch: Record<string, unknown> = {};
      if (fields.label    !== undefined) patch.label     = fields.label;
      if (fields.color    !== undefined) patch.color     = fields.color;
      if (fields.coverUrl !== undefined) patch.cover_url = fields.coverUrl;

      const { data, error } = await supabase
        .from("highlights")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),

  // ── DELETE highlight (cascades to slides) ────────────────────────────────
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("highlights")
        .delete()
        .eq("id", input.id)
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),

  // ── ADD slide to existing highlight ─────────────────────────────────────
  addSlide: adminProcedure
    .input(z.object({
      highlightId: z.string().uuid(),
      emoji:       z.string().nullable().optional(),
      text:        z.string().nullable().optional(),
      imageUrl:    z.string().nullable().optional(),
      mediaId:     z.string().uuid().nullable().optional(),
      order:       z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("highlight_slides")
        .insert({
          highlight_id: input.highlightId,
          emoji:        input.emoji    ?? null,
          text:         input.text     ?? null,
          image_url:    input.imageUrl ?? null,
          media_id:     input.mediaId  ?? null,
          slide_order:  input.order,
        })
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),

  // ── DELETE a single slide ────────────────────────────────────────────────
  deleteSlide: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("highlight_slides")
        .delete()
        .eq("id", input.id)
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),
});