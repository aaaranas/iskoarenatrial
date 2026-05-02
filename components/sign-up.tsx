"use client";

<<<<<<< HEAD
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
=======
import React, { useState } from 'react';
import { LogoIcon } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
>>>>>>> c02196d (fix: added userview but still needs tweaking for teamspage. improved mediapage functionality)
} from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";

// Role labels — matches team agreement (college_admin or user). Note: "user"
// is mapped to NULL in the DB (admin_role enum has no "user" value), handled
// server-side in the signup tRPC procedure.
type RoleChoice = "user" | "college_admin";

interface SignupPageProps {
  isOpen: boolean;
  onClose: () => void;
<<<<<<< HEAD
  // Callback signature mirrors the original from _legacy (Promise<{success,message}>).
  // Parent (LandingPage) wires this to the auth.signup tRPC mutation.
  onSubmit: (
    fullName: string,
    email: string,
    password: string,
    role: RoleChoice
  ) => Promise<{ success: boolean; message: string }>;
  // Switches to LoginModal — for the "Already registered? Log in" footer link.
=======
  onSubmit: (fullName: string, email: string, password: string, role: string) => Promise<{ success: boolean; message: string }>;
>>>>>>> c02196d (fix: added userview but still needs tweaking for teamspage. improved mediapage functionality)
  onToggleLogin: () => void;
}

export default function SignupPage({ isOpen, onClose, onSubmit, onToggleLogin }: SignupPageProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [role,      setRole]      = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [status,    setStatus]    = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);
<<<<<<< HEAD

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

                <form
                    onSubmit={handleSubmit}
                    className="bg-zinc-950 m-auto h-fit w-full rounded-xl border border-zinc-800 p-0.5 shadow-2xl"
                >
                    <div className="p-8 pb-6">
                        <div className="mb-8">
                            <LogoIcon />
                            <h1 className="mb-1 mt-4 text-xl font-black uppercase tracking-[0.15em] text-white">Initialize Account</h1>
                        </div>

                        {status && (
                            <div className={`mb-6 p-3 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${
                                status.success ? "text-green-400 bg-green-400/5 border-green-400/20" : "text-red-400 bg-red-400/5 border-red-400/20"
                            }`}>
                                {status.text}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">Firstname</Label>
                                    <Input
                                        type="text" required placeholder="Juan"
                                        value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                        className="bg-zinc-900/40 border-zinc-800 text-white h-10 text-[11px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">Lastname</Label>
                                    <Input
                                        type="text" required placeholder="Dela Cruz"
                                        value={lastName} onChange={(e) => setLastName(e.target.value)}
                                        className="bg-zinc-900/40 border-zinc-800 text-white h-10 text-[11px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">Email Address</Label>
                                <Input
                                    type="email" required placeholder="personnel@up.edu.ph"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-900/40 border-zinc-800 text-white h-10 text-[11px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">Intended Role</Label>
                                <Select
                                    defaultValue="user"
                                    onValueChange={(val) => setRole(val)}
                                >
                                    <SelectTrigger className="bg-zinc-900/40 border-zinc-800 text-white text-[13px] h-10">
                                        <SelectValue placeholder="SELECT ROLE" />
                                    </SelectTrigger>
                                    <SelectContent
                                        position="popper"
                                        sideOffset={5}
                                        className="z-[110] bg-zinc-950 border-zinc-800 text-white min-w-[var(--radix-select-trigger-width)]"
                                    >
                                        <SelectItem value="user" className="text-[10px] font-bold uppercase tracking-widest focus:bg-[#C5A059] focus:text-black cursor-pointer">
                                            Viewer / User
                                        </SelectItem>
                                        <SelectItem value="moderator" className="text-[10px] font-bold uppercase tracking-widest focus:bg-[#C5A059] focus:text-black cursor-pointer">
                                            Field Moderator
                                        </SelectItem>
                                        <SelectItem value="college_admin" className="text-[10px] font-bold uppercase tracking-widest focus:bg-[#C5A059] focus:text-black cursor-pointer">
                                            College Admin
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">Password</Label>
                                <Input
                                    type="password" required
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="bg-zinc-900/40 border-zinc-800 text-white h-10 text-[11px] tracking-widest font-bold"
                                />
                            </div>

                            <Button
                                type="submit" disabled={isLoading}
                                className="w-full bg-[#C5A059] text-black font-black uppercase tracking-[0.3em] text-[12px] hover:bg-[#D4B475] h-12 transition-all mt-4"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-zinc-900/20 rounded-b-xl border-t border-zinc-800/50 p-4">
                        <p className="text-zinc-600 text-center text-[12px]">
                            Already Registered?
                            <button
                                type="button"
                                className="ml-2 text-white hover:text-[#C5A059] transition-colors"
                                onClick={onToggleLogin}
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </form>
            </section>
        </div>
    );
}
=======
    const fullName = `${firstName} ${lastName}`.trim();
    try {
      const result = await onSubmit(fullName, email, password, role);
      setStatus({ text: result.message, success: result.success });
      if (result.success) { setFirstName(""); setLastName(""); setEmail(""); setPassword(""); }
    } catch {
      setStatus({ text: "Initialization failed.", success: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <section className="relative w-full max-w-md animate-in fade-in zoom-in duration-300">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors z-[110]">
          <X className="h-5 w-5" />
        </button>
        <form onSubmit={handleSubmit} className="bg-zinc-950 m-auto h-fit w-full rounded-xl border border-zinc-800 p-0.5 shadow-2xl">
          <div className="p-8 pb-6">
            <div className="mb-8">
              <LogoIcon />
              <h1 className="mb-1 mt-4 text-xl font-black uppercase tracking-[0.15em] text-white">Create Account</h1>
            </div>
            {status && (
              <div className={`mb-6 p-3 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${
                status.success ? "text-green-400 bg-green-400/5 border-green-400/20" : "text-red-400 bg-red-400/5 border-red-400/20"
              }`}>{status.text}</div>
            )}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">Firstname</Label>
                  <Input type="text" required placeholder="Juan" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-zinc-900/40 border-zinc-800 text-white h-10 text-[11px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">Lastname</Label>
                  <Input type="text" required placeholder="Dela Cruz" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-zinc-900/40 border-zinc-800 text-white h-10 text-[11px]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">Email Address</Label>
                <Input type="email" required placeholder="juan@up.edu.ph" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-zinc-900/40 border-zinc-800 text-white h-10 text-[11px]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">Role</Label>
                <Select defaultValue="user" onValueChange={(val) => setRole(val)}>
                  <SelectTrigger className="bg-zinc-900/40 border-zinc-800 text-white text-[13px] h-10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={5} className="z-[110] bg-zinc-950 border-zinc-800 text-white min-w-[var(--radix-select-trigger-width)]">
                    <SelectItem value="user" className="text-[10px] font-bold uppercase tracking-widest focus:bg-[#C5A059] focus:text-black cursor-pointer">Viewer</SelectItem>
                    <SelectItem value="admin" className="text-[10px] font-bold uppercase tracking-widest focus:bg-[#C5A059] focus:text-black cursor-pointer">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">Password</Label>
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-zinc-900/40 border-zinc-800 text-white h-10 text-[11px] tracking-widest font-bold" />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-[#C5A059] text-black font-black uppercase tracking-[0.3em] text-[12px] hover:bg-[#D4B475] h-12 transition-all mt-4">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
              </Button>
            </div>
          </div>
          <div className="bg-zinc-900/20 rounded-b-xl border-t border-zinc-800/50 p-4">
            <p className="text-zinc-600 text-center text-[12px]">
              Already registered?
              <button type="button" className="ml-2 text-white hover:text-[#C5A059] transition-colors" onClick={onToggleLogin}>Sign In</button>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
>>>>>>> c02196d (fix: added userview but still needs tweaking for teamspage. improved mediapage functionality)
