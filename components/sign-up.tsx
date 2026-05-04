"use client";

// Public signup modal — restored from _legacy and restyled to match the new
// LoginModal (ia-card / ia-maroon / ia-gold tokens, Bebas wordmark).
// Original structure (firstname/lastname/email/role/password) preserved from
// the teammate's version; only colors, copy, fonts, and role labels updated.
//
// SECURITY CAVEAT — v1 self-grant:
// Whatever role the user picks is stored as-is. There's NO server-side
// verification that someone choosing "college_admin" should actually be one.
// Listed in IskoArenaBugs1.0.md as a known gap; harden before production.

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";

// Role labels — matches team agreement (college_admin or user). Note: "user"
// is mapped to NULL in the DB (admin_role enum has no "user" value), handled
// server-side in the signup tRPC procedure.
type RoleChoice = "user" | "college_admin";

interface SignupPageProps {
  isOpen: boolean;
  onClose: () => void;
  // Callback signature mirrors the original from _legacy (Promise<{success,message}>).
  // Parent (LandingPage) wires this to the auth.signup tRPC mutation.
  onSubmit: (
    fullName: string,
    email: string,
    password: string,
    role: RoleChoice
  ) => Promise<{ success: boolean; message: string }>;
  // Switches to LoginModal — for the "Already registered? Log in" footer link.
  onToggleLogin: () => void;
}

export default function SignupPage({
  isOpen,
  onClose,
  onSubmit,
  onToggleLogin,
}: SignupPageProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleChoice>("user");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);

    const fullName = `${firstName} ${lastName}`.trim();
    try {
      const result = await onSubmit(fullName, email, password, role);
      setStatus({ text: result.message, success: result.success });
      if (result.success) {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setRole("user");
      }
    } catch {
      setStatus({ text: "Signup failed unexpectedly.", success: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Backdrop — matches LoginModal (z-200 sits above Nav z-100). Click outside to close.
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-[fadeInUp_0.2s_ease]"
      onClick={onClose}
    >
      {/* Modal card — slightly wider than LoginModal (460px) to fit role select comfortably */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[460px] max-w-[92vw] rounded-[18px] border border-ia-maroon/40 bg-ia-card px-9 py-10"
      >
        {/* Close button — top-right corner */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close signup"
          className="absolute right-3.5 top-3.5 text-white/50 transition-colors hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header: logo + IskoArena wordmark + CREATE ACCOUNT eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="IskoArena"
            width={42}
            height={42}
            // Silences Next's width/height-modified warning (see Hero for details)
            style={{ width: "auto", height: "auto" }}
            className="object-contain"
          />
          <div>
            <div className="font-bebas text-2xl tracking-[2px] leading-none text-[#f0f0f0]">
              IskoArena
            </div>
            <div className="mt-0.5 text-[11px] font-semibold tracking-[2px] text-ia-gold">
              CREATE ACCOUNT
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Status banner — green on success, red on failure */}
          {status && (
            <div
              className={`mb-5 rounded-md border p-3 text-[11px] font-bold uppercase tracking-widest ${
                status.success
                  ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-400"
                  : "border-red-400/20 bg-red-400/5 text-red-400"
              }`}
            >
              {status.text}
            </div>
          )}

          {/* First + Last name — side by side on a 2-col grid */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-[11px] font-bold tracking-[1.5px] text-white/60">
                FIRSTNAME
              </Label>
              <Input
                type="text"
                required
                placeholder="Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-ia-bg px-3.5 text-sm text-[#f0f0f0] outline-none placeholder:text-white/25 focus:border-ia-maroon/60"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-[11px] font-bold tracking-[1.5px] text-white/60">
                LASTNAME
              </Label>
              <Input
                type="text"
                required
                placeholder="Dela Cruz"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-ia-bg px-3.5 text-sm text-[#f0f0f0] outline-none placeholder:text-white/25 focus:border-ia-maroon/60"
              />
            </div>
          </div>

          {/* Email */}
          <Label className="mb-1.5 block text-[11px] font-bold tracking-[1.5px] text-white/60">
            EMAIL
          </Label>
          <Input
            type="email"
            required
            placeholder="you@up.edu.ph"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 h-10 w-full rounded-lg border border-white/10 bg-ia-bg px-3.5 text-sm text-[#f0f0f0] outline-none placeholder:text-white/25 focus:border-ia-maroon/60"
          />

          {/* Role — Select dropdown. position="popper" + z-[210] sits above the modal (z-200) */}
          <Label className="mb-1.5 block text-[11px] font-bold tracking-[1.5px] text-white/60">
            ROLE
          </Label>
          <Select value={role} onValueChange={(v) => setRole(v as RoleChoice)}>
            <SelectTrigger className="mb-4 h-10 w-full rounded-lg border border-white/10 bg-ia-bg px-3.5 text-sm text-[#f0f0f0] outline-none focus:border-ia-maroon/60 focus:ring-0">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={5}
              className="z-[210] min-w-[var(--radix-select-trigger-width)] border-white/10 bg-ia-card text-[#f0f0f0]"
            >
              <SelectItem
                value="user"
                className="cursor-pointer text-[12px] font-semibold focus:bg-ia-maroon/30 focus:text-[#f0f0f0]"
              >
                General User
              </SelectItem>
              <SelectItem
                value="college_admin"
                className="cursor-pointer text-[12px] font-semibold focus:bg-ia-maroon/30 focus:text-[#f0f0f0]"
              >
                College Admin
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Password */}
          <Label className="mb-1.5 block text-[11px] font-bold tracking-[1.5px] text-white/60">
            PASSWORD
          </Label>
          <Input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 h-10 w-full rounded-lg border border-white/10 bg-ia-bg px-3.5 text-sm text-[#f0f0f0] outline-none placeholder:text-white/25 focus:border-ia-maroon/60"
          />

          {/* Submit — UP maroon with subtle shadow glow, mirrors LoginModal */}
          <Button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ia-maroon py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_8px_24px_rgba(128,0,0,0.35)] transition-colors hover:bg-[#5C0D0F] disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account →</>}
          </Button>
        </form>

        {/* Footer — switches to LoginModal */}
        <p className="mt-5 text-center text-[12px] text-white/45">
          Already registered?{" "}
          <button
            type="button"
            onClick={onToggleLogin}
            className="font-semibold text-ia-gold transition-colors hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
