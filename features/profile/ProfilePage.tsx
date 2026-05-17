"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Camera, Check, X, Pencil, Mail, Shield, Loader2, User } from "lucide-react";

const AVATARS_BUCKET = "avatars";

// ── Inline editable field ─────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  prefix,
  onSave,
  saving,
}: {
  label: string;
  value: string;
  prefix?: string;
  onSave: (v: string) => Promise<void>;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) { setEditing(false); setDraft(value); return; }
    await onSave(trimmed);
    setEditing(false);
  };

  const handleCancel = () => { setEditing(false); setDraft(value); };

  // M8: guard against double-dispatch while a save is in flight
  const handleKey = (e: React.KeyboardEvent) => {
    if (saving) return;
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className="group flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      {editing ? (
        <div className="flex items-center gap-2">
          {prefix && <span className="text-zinc-500 text-sm shrink-0">{prefix}</span>}
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            disabled={saving}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#A91D3A]/60 focus:ring-1 focus:ring-[#A91D3A]/30 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-[#A91D3A]/20 hover:bg-[#A91D3A]/40 text-[#A91D3A] transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors disabled:opacity-40"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-white font-medium">
            {prefix && <span className="text-zinc-500">{prefix}</span>}
            {value || <span className="text-zinc-600 italic">Not set</span>}
          </span>
          <button
            onClick={() => { setDraft(value); setEditing(true); }}
            className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-all"
          >
            <Pencil size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Avatar upload ─────────────────────────────────────────────────────────────

function AvatarUploader({
  userId,
  avatarUrl,
  displayName,
  onUploaded,
}: {
  userId: string;
  avatarUrl: string | null;
  displayName: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }

    setUploading(true);
    try {
      // M2: fixed path (no extension) so upsert always overwrites the same key
      // and old files never accumulate in storage
      const path = `${userId}/avatar`;

      const { error: upErr } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
      // Bust cache with a timestamp so the browser re-fetches
      onUploaded(`${publicUrl}?t=${Date.now()}`);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      e.target.value = "";
    }
  };

  const initials = displayName
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative group cursor-pointer" onClick={() => !uploading && fileRef.current?.click()}>
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-white/10 overflow-hidden bg-[#1A1A1A] flex items-center justify-center shadow-2xl ring-4 ring-black/40">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-black text-zinc-400">{initials}</span>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading
          ? <Loader2 size={20} className="text-white animate-spin" />
          : <Camera size={20} className="text-white" />
        }
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.profile.getMyProfile.useQuery();
  const updateMutation = trpc.profile.updateProfile.useMutation({
    onError: (err) => toast.error(err.message),
  });

  const [savingField, setSavingField] = useState<string | null>(null);

  // M3: only invalidate auth.getSession (consumed by TopBar/RoleProvider) when
  // avatar changes — name/handle edits don't affect anything the session provides
  const save = (field: string, value: string | null) => async () => {
    setSavingField(field);
    try {
      await updateMutation.mutateAsync({ [field]: value });
      utils.profile.getMyProfile.invalidate();
      if (field === "avatar_url") utils.auth.getSession.invalidate();
      toast.success("Saved");
    } finally {
      setSavingField(null);
    }
  };

  const handleAvatarUploaded = async (url: string) => {
    setSavingField("avatar_url");
    try {
      await updateMutation.mutateAsync({ avatar_url: url });
      toast.success("Profile picture updated");
    } finally {
      setSavingField(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 text-[#A91D3A] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <p className="text-zinc-500 text-sm">Could not load profile. Please refresh.</p>
      </div>
    );
  }

  const roleBadgeColor =
    profile.role === "admin" ? "bg-[#A91D3A]/20 text-[#A91D3A] border-[#A91D3A]/30"
    : "bg-white/5 text-zinc-400 border-white/10";

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16 space-y-6">

        {/* ── Header card ── */}
        <div className="relative rounded-3xl bg-[#0E0E0E] border border-white/5 overflow-hidden shadow-2xl">
          {/* Subtle accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#A91D3A]/60 to-transparent" />

          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <AvatarUploader
                userId={profile.id}
                avatarUrl={profile.avatar_url}
                displayName={profile.full_name}
                onUploaded={handleAvatarUploaded}
              />

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight truncate">
                  {profile.full_name}
                </h1>
                {profile.college_affiliation && (
                  <p className="text-sm text-zinc-500 font-medium">
                    @{profile.college_affiliation.toLowerCase().replace(/\s+/g, "_")}
                  </p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${roleBadgeColor}`}>
                    <Shield size={9} />
                    {profile.role}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-medium text-zinc-500 max-w-[200px] truncate">
                    <Mail size={9} />
                    {profile.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit fields card ── */}
        <div className="rounded-3xl bg-[#0E0E0E] border border-white/5 overflow-hidden shadow-xl">
          <div className="px-6 md:px-8 py-4 border-b border-white/5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <User size={12} />
              Edit Profile
            </h2>
          </div>

          <div className="px-6 md:px-8 py-6 space-y-6">
            <EditableField
              label="Display Name"
              value={profile.full_name}
              onSave={async (v) => { await save("full_name", v)(); }}
              saving={savingField === "full_name"}
            />

            <div className="h-px bg-white/5" />

            <EditableField
              label="Handle"
              value={profile.college_affiliation ?? ""}
              prefix="@"
              onSave={async (v) => { await save("college_affiliation", v)(); }}
              saving={savingField === "college_affiliation"}
            />

            <div className="h-px bg-white/5" />

            {/* Email — read-only */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Email</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500 font-medium">{profile.email}</span>
                <span className="text-[10px] text-zinc-700 border border-white/5 rounded px-1.5 py-0.5">read-only</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-700">
          Hover a field and click the pencil to edit · Enter to save · Esc to cancel
        </p>
      </div>
    </div>
  );
}
