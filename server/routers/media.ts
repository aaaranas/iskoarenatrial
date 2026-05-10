import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabaseAdmin as supabase } from "@/lib/supabase/server";
import { TRPCError } from "@trpc/server";

export const mediaRouter = router({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("media")
      .select(`
        id, title, type, url, file_name, images, caption, tag, size, created_at,
        sport:sport_id ( id, name ),
        match:match_id ( id )
      `)
      .order("created_at", { ascending: false });

    if (error)
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

    return (data ?? []).map((item: any) => ({
      id:        item.id,
      title:     item.title,
      type:      item.type as "image" | "video",
      url:       item.url,
      fileName:  item.file_name,
      images:    (item.images as any[] ?? []).map((img: any) => ({ url: img.url, fileName: img.fileName ?? img.file_name ?? "" })),
      caption:   item.caption     ?? null,
      tag:       item.tag         ?? null,
      size:      item.size        ?? null,
      sport:     item.sport?.name ?? null,
      sportId:   item.sport?.id   ?? null,
      matchId:   item.match?.id   ?? null,
      createdAt: item.created_at,
    }));
  }),

  create: adminProcedure
    .input(z.object({
      title:    z.string().min(1),
      type:     z.enum(["image", "video"]),
      url:      z.string().url(),
      fileName: z.string(),
      sportId:  z.string().nullable().optional(),
      matchId:  z.string().nullable().optional(),
      tag:      z.string().nullable().optional(),
      size:     z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("media")
        .insert({
          title:     input.title,
          type:      input.type,
          url:       input.url,
          file_name: input.fileName,
          sport_id:  input.sportId || null,
          match_id:  input.matchId || null,
          tag:       input.tag     ?? null,
          size:      input.size    ?? null,
        })
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),

  update: adminProcedure
    .input(z.object({
      id:      z.string().uuid(),
      title:   z.string().min(1).optional(),
      sportId: z.string().nullable().optional(),
      tag:     z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const patch: Record<string, unknown> = {};
      if (input.title   !== undefined) patch.title    = input.title;
      if (input.tag     !== undefined) patch.tag      = input.tag;
      if (input.sportId !== undefined) patch.sport_id = input.sportId || null;

      const { data, error } = await supabase
        .from("media")
        .update(patch)
        .eq("id", input.id)
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),

  delete: adminProcedure
    .input(z.object({
      id:       z.string().uuid(),
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove([input.fileName]);

      if (storageError)
        console.warn("Storage delete warning:", storageError.message);

      const { data, error } = await supabase
        .from("media")
        .delete()
        .eq("id", input.id)
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),
});