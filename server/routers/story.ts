import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { TRPCError } from "@trpc/server";

export const storyRouter = router({

  // ── READ: active stories only (not yet expired) ──────────────────────────
  getActive: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        id,
        type,
        emoji,
        text,
        image_url,
        media_id,
        expires_at,
        created_at,
        media:media_id ( id, url, title, type )
      `)
      .gt("expires_at", new Date().toISOString())   // only non-expired
      .order("created_at", { ascending: false });

    if (error)
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

    return (data ?? []).map((s: any) => ({
      id:        s.id         as string,
      type:      s.type       as "custom" | "shared",
      emoji:     s.emoji      as string | null,
      text:      s.text       as string | null,
      imageUrl:  s.image_url  as string | null,
      mediaId:   s.media_id   as string | null,
      expiresAt: s.expires_at as string,
      createdAt: s.created_at as string,
      // Flattened media fields for convenience
      mediaUrl:   s.media?.url   ?? null as string | null,
      mediaTitle: s.media?.title ?? null as string | null,
      mediaType:  s.media?.type  ?? null as string | null,
    }));
  }),

  // ── CREATE custom story (emoji + text + optional image) ──────────────────
  create: adminProcedure
    .input(z.object({
      emoji:    z.string().nullable().optional(),
      text:     z.string().nullable().optional(),
      imageUrl: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      if (!input.emoji && !input.text && !input.imageUrl)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Story needs at least an emoji, text, or image." });

      const { data, error } = await supabase
        .from("stories")
        .insert({
          type:      "custom",
          emoji:     input.emoji    ?? null,
          text:      input.text     ?? null,
          image_url: input.imageUrl ?? null,
          media_id:  null,
        })
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),

  // ── SHARE a post/reel to story ───────────────────────────────────────────
  createFromMedia: adminProcedure
    .input(z.object({
      mediaId: z.string().uuid(),
      emoji:   z.string().nullable().optional(),
      text:    z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      // Fetch media to get its URL
      const { data: media, error: mediaErr } = await supabase
        .from("media")
        .select("id, url, title")
        .eq("id", input.mediaId)
        .single();

      if (mediaErr || !media)
        throw new TRPCError({ code: "NOT_FOUND", message: "Media item not found." });

      const { data, error } = await supabase
        .from("stories")
        .insert({
          type:      "shared",
          emoji:     input.emoji ?? null,
          text:      input.text  ?? media.title,
          image_url: media.url,
          media_id:  input.mediaId,
        })
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),

  // ── ARCHIVE story → save to highlights before it expires ─────────────────
  archiveToHighlight: adminProcedure
    .input(z.object({
      storyId: z.string().uuid(),
      label:   z.string().min(1),
      color:   z.string().default("from-[#A91D3A] to-[#741029]"),
    }))
    .mutation(async ({ input }) => {
      // Fetch the story
      const { data: story, error: storyErr } = await supabase
        .from("stories")
        .select("*")
        .eq("id", input.storyId)
        .single();

      if (storyErr || !story)
        throw new TRPCError({ code: "NOT_FOUND", message: "Story not found." });

      // Create highlight
      const { data: hl, error: hlErr } = await supabase
        .from("highlights")
        .insert({
          label:    input.label,
          color:    input.color,
          cover_url: story.image_url ?? null,
          story_id:  story.id,
        })
        .select()
        .single();

      if (hlErr)
        throw new TRPCError({ code: "BAD_REQUEST", message: hlErr.message });

      // Create a slide from the story content
      const { error: slideErr } = await supabase
        .from("highlight_slides")
        .insert({
          highlight_id: hl.id,
          emoji:        story.emoji     ?? null,
          text:         story.text      ?? null,
          image_url:    story.image_url ?? null,
          media_id:     story.media_id  ?? null,
          slide_order:  0,
        });

      if (slideErr)
        throw new TRPCError({ code: "BAD_REQUEST", message: slideErr.message });

      return hl;
    }),

  // ── DELETE story manually ────────────────────────────────────────────────
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("stories")
        .delete()
        .eq("id", input.id)
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),
});