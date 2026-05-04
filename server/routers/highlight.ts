import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabaseAdmin as supabase } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";

export const highlightRouter = router({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("highlights")
      .select(`
        id, label, color, cover_url, created_at,
        highlight_slides ( id, emoji, text, image_url, media_id, slide_order )
      `)
      .order("created_at", { ascending: false });

    if (error)
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

    return (data ?? []).map((h: any) => ({
      id:        h.id,
      label:     h.label,
      color:     h.color,
      coverUrl:  h.cover_url  ?? null,
      createdAt: h.created_at,
      slides: ((h.highlight_slides ?? []) as any[])
        .sort((a, b) => a.slide_order - b.slide_order)
        .map((s: any) => ({
          id:       s.id,
          emoji:    s.emoji     ?? null,
          text:     s.text      ?? null,
          imageUrl: s.image_url ?? null,
          mediaId:  s.media_id  ?? null,
          order:    s.slide_order,
        })),
    }));
  }),

  create: adminProcedure
    .input(z.object({
      label:    z.string().min(1),
      color:    z.string().default("from-[#A91D3A] to-[#741029]"),
      coverUrl: z.string().nullable().optional(),
      slides:   z.array(z.object({
        emoji:    z.string().nullable().optional(),
        text:     z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
        mediaId:  z.string().nullable().optional(),
        order:    z.number().default(0),
      })).min(1),
    }))
    .mutation(async ({ input }) => {
      const { data: hl, error: hlErr } = await supabase
        .from("highlights")
        .insert({ label: input.label, color: input.color, cover_url: input.coverUrl ?? null })
        .select()
        .single();

      if (hlErr)
        throw new TRPCError({ code: "BAD_REQUEST", message: hlErr.message });

      const { error: slidesErr } = await supabase
        .from("highlight_slides")
        .insert(input.slides.map((s, i) => ({
          highlight_id: hl.id,
          emoji:        s.emoji    ?? null,
          text:         s.text     ?? null,
          image_url:    s.imageUrl ?? null,
          media_id:     s.mediaId  ?? null,
          slide_order:  s.order ?? i,
        })));

      if (slidesErr)
        throw new TRPCError({ code: "BAD_REQUEST", message: slidesErr.message });

      return hl;
    }),

  createFromMedia: adminProcedure
    .input(z.object({
      mediaId: z.string(),
      label:   z.string().min(1),
      color:   z.string().default("from-[#A91D3A] to-[#741029]"),
      text:    z.string().nullable().optional(),
      emoji:   z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const { data: mediaItem, error: mediaErr } = await supabase
        .from("media")
        .select("id, url, title")
        .eq("id", input.mediaId)
        .single();

      if (mediaErr || !mediaItem)
        throw new TRPCError({ code: "NOT_FOUND", message: "Media item not found." });

      const { data: hl, error: hlErr } = await supabase
        .from("highlights")
        .insert({ label: input.label, color: input.color, cover_url: mediaItem.url })
        .select()
        .single();

      if (hlErr)
        throw new TRPCError({ code: "BAD_REQUEST", message: hlErr.message });

      const { error: slideErr } = await supabase
        .from("highlight_slides")
        .insert({
          highlight_id: hl.id,
          emoji:        input.emoji ?? null,
          text:         input.text  ?? mediaItem.title,
          image_url:    mediaItem.url,
          media_id:     input.mediaId,
          slide_order:  0,
        });

      if (slideErr)
        throw new TRPCError({ code: "BAD_REQUEST", message: slideErr.message });

      return hl;
    }),

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
});