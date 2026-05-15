"use client";

// ─── Profile Page ─────────────────────────────────────────────────────────────
// Route: /dashboard/profile
// Accessible to all authenticated users (admin + user) via the User icon in
// the TopBar. Lets users update their name, avatar, email, and password.
//
// Data flow:
//   trpc.profile.getProfile      → seeds all form fields
//   Avatar upload                → Supabase Storage "media" bucket (client-side)
//                                  → URL passed to trpc.profile.updateProfile
//                                  → utils.profile.getProfile.invalidate() so
//                                    TopBar AvatarBubble re-renders immediately
//   trpc.profile.updateProfile   → persists full_name + avatar_url to profiles
//   supabase.auth.updateUser()   → triggers Supabase's confirmation email flow
//                                  for email changes (client-session call, NOT
//                                  admin SDK — admin SDK bypasses confirmation)
//   trpc.profile.changePassword  → updates auth password via admin SDK

import React, { useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/providers/RoleProvider";
import { toast } from "sonner";
import {
  Camera, Check, Eye, EyeOff, Loader2,
  Mail, Lock, User, ShieldCheck, RefreshCw,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-6 md:p-7 space-y-5"
      style={{
        backgroundColor: "var(--surface-raised)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="flex items-center gap-2.5 pb-1 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <Icon className="size-4" style={{ color: "var(--accent-maroon)" }} />
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: "var(--text-tertiary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Text input ───────────────────────────────────────────────────────────────

function Input({ value, onChange, placeholder, type = "text", disabled = false, rightSlot }: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none pr-10"
        style={{
          backgroundColor: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
          border: `1px solid var(--border-default)`,
          color: disabled ? "var(--text-tertiary)" : "var(--text-primary)",
        }}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

// ─── Save button ─────────────────────────────────────────────────────────────

function SaveButton({ loading, disabled, label = "Save Changes", onClick }: {
  loading: boolean;
  disabled?: boolean;
  label?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
      style={{ backgroundColor: "var(--accent-maroon)" }}
    >
      {loading
        ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
        : <><Check className="size-3.5" /> {label}</>}
    </button>
  );
}

// ─── Avatar section ───────────────────────────────────────────────────────────

function AvatarPicker({ profileId, currentUrl, name, onUploaded }: {
  profileId: string;
  currentUrl: string | null;
  name: string;
  onUploaded: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);

  // Keep preview in sync if parent re-fetches
  useEffect(() => setPreview(currentUrl), [currentUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${profileId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, file, { upsert: true });

      if (upErr) throw new Error(upErr.message);

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
      // Cache-bust so the browser doesn't serve the old avatar from CDN cache
      const finalUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      // Notify parent — parent will call updateProfile which invalidates
      // trpc.profile.getProfile and causes TopBar AvatarBubble to re-render.
      onUploaded(finalUrl);
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
      setPreview(currentUrl); // revert preview on error
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative w-24 h-24 rounded-full overflow-hidden border-2 transition-all"
        style={{ borderColor: "var(--border-strong)", backgroundColor: "var(--surface-card)" }}
        title="Change photo"
      >
        {preview ? (
          <img src={preview} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="flex w-full h-full items-center justify-center text-2xl font-black select-none"
            style={{ color: "var(--text-tertiary)" }}>
            {initials(name)}
          </span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
          {uploading
            ? <Loader2 className="size-5 text-white animate-spin" />
            : <><Camera className="size-5 text-white" />
              <span className="text-[9px] text-white font-bold uppercase tracking-wider">Change</span></>}
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        Click photo to upload a new one (JPG, PNG, WebP)
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { isAdmin } = useRole();
  const utils = trpc.useUtils();

  // ── Fetch profile ─────────────────────────────────────────────────────────
  const { data: profile, isLoading } = trpc.profile.getProfile.useQuery();

  // ── Local form state ──────────────────────────────────────────────────────
  const [name,        setName]        = useState("");
  const [avatarUrl,   setAvatarUrl]   = useState<string | null>(null);
  const [email,       setEmail]       = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const searchParams = useSearchParams();
  const router       = useRouter();

  // ── Read confirmation result from URL params ──────────────────────────────
  // The /auth/confirm handler redirects here with ?emailChanged=1 on success
  // or ?emailError=1 on failure. Show a toast and strip the param from the URL
  // so a refresh doesn't re-trigger it.
  useEffect(() => {
    const changed = searchParams.get("emailChanged");
    const errored = searchParams.get("emailError");
    if (!changed && !errored) return;

    if (changed === "1") {
      toast.success("Email address updated successfully.");
      // Re-fetch so the email field shows the new address immediately
      utils.profile.getProfile.invalidate();
    }
    if (errored === "1") {
      toast.error("Email confirmation failed. The link may have expired — try again.");
    }

    // Clean the query param from the URL without adding a history entry
    router.replace("/dashboard/profile");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ intentionally empty — we only want this on first mount, not on every
  //   searchParams change (which would re-fire on the replace() above)

  // ── Seed form from fetched profile ───────────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name ?? "");
    setEmail(profile.email ?? "");
    setAvatarUrl(profile.avatar_url ?? null);
  }, [profile]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateProfile = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated.");
      // Invalidate both queries so TopBar AvatarBubble and session both
      // reflect the latest name + avatar without a full page reload.
      utils.profile.getProfile.invalidate();
      utils.auth.getSession.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // Email change — uses the client-session Supabase call (supabase.auth.updateUser),
  // NOT a server-side admin SDK call. Only the client-session call goes through
  // Supabase's email confirmation flow: it sends a verification link to the new
  // address and the change doesn't take effect until the user clicks it.
  // The admin SDK (used previously) bypasses confirmation entirely, which is why
  // no email was sent and the change was instant.
  const [emailSaving, setEmailSaving] = useState(false);

  const handleSaveEmail = async () => {
    if (email === profile?.email) return toast.info("That's already your current email.");
    if (!email.includes("@"))     return toast.error("Enter a valid email address.");
    setEmailSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast.success("Confirmation link sent — check your new inbox to complete the change.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update email.");
    } finally {
      setEmailSaving(false);
    }
  };

  const changePassword = trpc.profile.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully.");
      setNewPassword("");
      setConfirmPw("");
    },
    onError: (e) => toast.error(e.message),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    if (!name.trim()) return toast.error("Name cannot be empty.");
    updateProfile.mutate({ full_name: name.trim(), avatar_url: avatarUrl });
  };

  const handleSavePassword = () => {
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    if (newPassword !== confirmPw) return toast.error("Passwords do not match.");
    changePassword.mutate({ password: newPassword });
  };

  // ── Skeleton loader ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--surface-page)" }}>
        <Loader2 className="size-8 animate-spin" style={{ color: "var(--accent-maroon)" }} />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 md:px-8 py-10 pb-24" style={{ backgroundColor: "var(--surface-page)" }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Page header ── */}
        <div className="pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-0.5 w-5 rounded" style={{ backgroundColor: "var(--accent-maroon)" }} />
            <span className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: "var(--accent-maroon)" }}>
              {isAdmin ? "Admin Account" : "My Account"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-heading"
            style={{ color: "var(--text-primary)" }}>
            Profile Settings
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage your display name, photo, email, and password.
          </p>
        </div>

        {/* ── Role badge ── */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border"
            style={{
              color:           isAdmin ? "var(--accent-maroon)" : "var(--text-secondary)",
              borderColor:     isAdmin ? "var(--accent-maroon2)" : "var(--border-default)",
              backgroundColor: isAdmin ? "var(--accent-maroon1)" : "var(--surface-card)",
            }}
          >
            <ShieldCheck className="size-3" />
            {isAdmin ? "Admin" : "Viewer"}
          </span>
          {profile?.college_affiliation && (
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              · {profile.college_affiliation}
            </span>
          )}
        </div>

        {/* ── Section 1: Photo & Display Name ── */}
        <Section title="Photo & Display Name" icon={User}>
          <AvatarPicker
            profileId={profile?.id ?? ""}
            currentUrl={avatarUrl}
            name={name}
            onUploaded={(url) => setAvatarUrl(url)}
          />

          <Field label="Display Name">
            <Input
              value={name}
              onChange={setName}
              placeholder="Your full name"
            />
          </Field>

          <Field label="Member Since">
            <Input
              value={profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })
                : "—"}
              disabled
            />
          </Field>

          <div className="flex justify-end pt-1">
            <SaveButton
              loading={updateProfile.isPending}
              onClick={handleSaveProfile}
            />
          </div>
        </Section>

        {/* ── Section 2: Email ── */}
        <Section title="Email Address" icon={Mail}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Changing your email will send a confirmation link to the new address.
            The change takes effect after you click the link.
          </p>

          <Field label="Email Address">
            <Input
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              type="email"
            />
          </Field>

          <div className="flex justify-end pt-1">
            <SaveButton
              loading={emailSaving}
              disabled={email === profile?.email || !email.includes("@")}
              label="Update Email"
              onClick={handleSaveEmail}
            />
          </div>
        </Section>

        {/* ── Section 3: Password ── */}
        <Section title="Change Password" icon={Lock}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Pick a strong password of at least 6 characters. You'll stay logged in after the change.
          </p>

          <Field label="New Password">
            <Input
              value={newPassword}
              onChange={setNewPassword}
              placeholder="At least 6 characters"
              type={showPw ? "text" : "password"}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />
          </Field>

          <Field label="Confirm New Password">
            <Input
              value={confirmPw}
              onChange={setConfirmPw}
              placeholder="Repeat new password"
              type={showConfirm ? "text" : "password"}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />
          </Field>

          {/* Password match indicator */}
          {confirmPw.length > 0 && (
            <p className="text-[11px] font-semibold"
              style={{ color: newPassword === confirmPw ? "var(--accent-teal)" : "var(--accent-live)" }}>
              {newPassword === confirmPw ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <SaveButton
              loading={changePassword.isPending}
              disabled={!newPassword || newPassword !== confirmPw}
              label="Change Password"
              onClick={handleSavePassword}
            />
          </div>
        </Section>

        {/* ── Account metadata (subtle footer) ── */}
        {profile?.updated_at && (
          <p className="text-center text-[11px] pb-4" style={{ color: "var(--text-disabled)" }}>
            <RefreshCw className="inline size-3 mr-1" />
            Last updated {new Date(profile.updated_at).toLocaleString("en-US", {
              month: "short", day: "numeric", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        )}

      </div>
    </div>
  );
}