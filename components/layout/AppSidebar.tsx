"use client"
import React, { useState, useRef } from "react"
import Image from 'next/image';
import {
  LayoutDashboard, BarChart3, Image as ImageIcon,
  Users, Sword, Bell, X, Camera, Loader2, Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

type ProfileData = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
};

// ─── Profile Edit Modal ───────────────────────────────────────────────────────

function ProfileModal({ profile, onClose, onSaved }: {
  profile: ProfileData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name,          setName]          = useState(profile.full_name);
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!name.trim()) return setError("Name is required.");
    setError(null);
    setSaving(true);
    try {
      let newAvatarUrl = profile.avatar_url;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const fileName = `avatars/${profile.id}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("media")
          .upload(fileName, avatarFile, { upsert: true });
        if (upErr) throw new Error(upErr.message);
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
        newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      }

      const { error: dbErr } = await supabase
        .from("profiles")
        .upsert({
          id:         profile.id,
          email:      profile.email,
          full_name:  name.trim(),
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (dbErr) throw new Error(dbErr.message);

      toast.success("Profile updated successfully.");
      onSaved();
      onClose();
    } catch (e: any) {
      const msg = e.message ?? "Failed to save.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={onClose}>
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
          <div>
            <h3 className="text-white font-semibold text-sm">Edit Profile</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Update your display name and photo</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all">
            <X size={13} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-500 cursor-pointer transition-all group"
              onClick={() => fileRef.current?.click()}>
              {avatarPreview
                ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-400 select-none">
                    {initials}
                  </div>}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
              Click photo to change
            </button>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.12em] mb-1.5">
              Display Name
            </label>
            <input
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
            />
          </div>

          {/* Email — read-only identifier */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.12em] mb-1.5">
              Email / Username
            </label>
            <div className="w-full px-3 py-2.5 bg-zinc-900/40 border border-zinc-800 rounded-xl text-sm text-zinc-500 cursor-default select-all">
              {profile.email}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-all disabled:opacity-40">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex-1 py-2.5 bg-[#A91D3A] hover:bg-[#c4223f] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving
                ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                : <><Check size={13} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App Sidebar ──────────────────────────────────────────────────────────────

interface AppSidebarProps {
  onLogout: () => void;
  adminName: string;
  onProfileSaved?: () => void;
}

const allNavItems = [
  { label: "Dashboard",    icon: LayoutDashboard, url: "/dashboard"              },
  { label: "Matches",      icon: Sword,           url: "/dashboard/matches"      },
  { label: "Leaderboards", icon: BarChart3,       url: "/dashboard/leaderboards" },
  { label: "Media",        icon: ImageIcon,       url: "/dashboard/media"        },
  { label: "Teams",        icon: Users,           url: "/dashboard/teams"        },
];

export function AppSidebar({ onLogout, adminName, onProfileSaved }: AppSidebarProps) {
  const pathname = usePathname();
  const [showProfile,   setShowProfile]   = useState(false);
  const [clientProfile, setClientProfile] = useState<ProfileData | null>(null);

  const loadProfile = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: row } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setClientProfile({
      id:         user.id,
      full_name:  (row as any)?.full_name  || (user.user_metadata as any)?.full_name || "",
      email:      (row as any)?.email      || user.email || "",
      avatar_url: (row as any)?.avatar_url ?? null,
    });
  }, []);

  React.useEffect(() => { loadProfile(); }, [loadProfile]);

  const displayName = clientProfile?.full_name || adminName;
  const initials    = displayName.trim().split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <>
      {showProfile && clientProfile && (
        <ProfileModal
          profile={clientProfile}
          onClose={() => setShowProfile(false)}
          onSaved={() => { loadProfile(); onProfileSaved?.(); setShowProfile(false); }}
        />
      )}

      <header className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-800 bg-[#121212] z-50 flex items-center px-7">
        {/* Logo */}
        <div className="flex items-center gap-4 pr-6">
          <div className="p-1.5 rounded-full border border-white/10 bg-white/5 shadow-sm">
            <Image src="/logo.png" width={32} height={32} alt="Logo" className="rounded-full" />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">IskoArena</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-8 px-4">
          {allNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.url}
              className={cn(
                "transition-colors text-xs font-semibold uppercase tracking-wider py-1.5",
                pathname === item.url
                  ? "text-[#FF3300]"
                  : "text-zinc-400 hover:text-white"
              )}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User area */}
        <div className="flex items-center gap-4 pl-4 border-l border-zinc-800/50 h-8">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Bell className="size-4.5" />
          </button>

          {/* Profile button */}
          <button
            onClick={() => clientProfile && setShowProfile(true)}
            title="Edit profile"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="relative flex size-8 items-center justify-center rounded-full bg-zinc-800 border border-zinc-600 overflow-hidden group-hover:border-zinc-400 transition-colors shadow-inner">
              {clientProfile?.avatar_url
                ? <Image src={clientProfile.avatar_url} alt={displayName} fill className="object-cover" />
                : <span className="text-[11px] font-bold text-zinc-300 select-none">{initials}</span>}
            </div>
            <span className="hidden lg:block text-xs text-zinc-400 group-hover:text-white transition-colors max-w-[120px] truncate">
              {displayName}
            </span>
          </button>

          <button
            onClick={onLogout}
            className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
            Log out
          </button>
        </div>
      </header>
    </>
  );
}
