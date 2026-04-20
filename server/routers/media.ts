import { router, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { TRPCError } from "@trpc/server";

export const mediaRouter = router({

  // ── READ: fetch all media items, newest first ────────────────────────────
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("media")
      .select(`
        id,
        title,
        type,
        url,
        file_name,
        tag,
        size,
        created_at,
        sport:sport_id ( id, name ),
        match:match_id ( id )
      `)
      .order("created_at", { ascending: false });

    if (error)
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

    return (data ?? []).map((item: any) => ({
      id:        item.id         as string,
      title:     item.title      as string,
      type:      item.type       as "image" | "video",
      url:       item.url        as string,
      fileName:  item.file_name  as string,
      tag:       item.tag        as string | null,
      size:      item.size       as string | null,
      sport:     item.sport?.name ?? null as string | null,
      sportId:   item.sport?.id  ?? null as string | null,
      matchId:   item.match?.id  ?? null as string | null,
      createdAt: item.created_at as string,
    }));
  }),

  // ── CREATE: upload file to Storage then insert DB row ───────────────────
  // The frontend uploads the file directly to Supabase Storage and passes
  // back the public URL. This procedure just inserts the metadata row.
  create: adminProcedure
    .input(z.object({
      title:    z.string().min(1),
      type:     z.enum(["image", "video"]),
      url:      z.string().url(),
      fileName: z.string(),
      sportId:  z.string().uuid().nullable().optional(),
      matchId:  z.string().uuid().nullable().optional(),
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
          sport_id:  input.sportId  ?? null,
          match_id:  input.matchId  ?? null,
          tag:       input.tag      ?? null,
          size:      input.size     ?? null,
        })
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),

  // ── UPDATE: edit title, sport, tag ──────────────────────────────────────
  update: adminProcedure
    .input(z.object({
      id:      z.string().uuid(),
      title:   z.string().min(1).optional(),
      sportId: z.string().uuid().nullable().optional(),
      tag:     z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...fields } = input;

      // Build only the fields that were actually passed
      const patch: Record<string, unknown> = {};
      if (fields.title   !== undefined) patch.title    = fields.title;
      if (fields.sportId !== undefined) patch.sport_id = fields.sportId;
      if (fields.tag     !== undefined) patch.tag      = fields.tag;

      const { data, error } = await supabase
        .from("media")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error)
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

      return data;
    }),

  // ── DELETE: remove Storage file then DB row ──────────────────────────────
  delete: adminProcedure
    .input(z.object({
      id:       z.string().uuid(),
      fileName: z.string(), // used to delete from Storage
    }))
    .mutation(async ({ input }) => {
      // 1. Delete from Storage bucket
      const { error: storageError } = await supabase.storage
        .from("media")
        .remove([input.fileName]);

      // Log storage error but don't block — DB row should still be removed
      if (storageError) {
        console.warn("Storage delete warning:", storageError.message);
      }

      // 2. Delete DB row
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