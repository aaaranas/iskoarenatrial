"use client";

import React, { useState } from 'react';
import { LogoIcon } from "@/components/Logo";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from "lucide-react";

// Role picker removed — public signup always creates a viewer (null role).
// Admins are promoted post-registration via trpc.auth.promoteToAdmin (admin-only).
interface SignupPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fullName: string, email: string, password: string, role: string) => Promise<{ success: boolean; message: string }>;
  onToggleLogin: () => void;
}

export default function SignupPage({ isOpen, onClose, onSubmit, onToggleLogin }: SignupPageProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status,    setStatus]    = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();
    try {
      // Always passes "user" — role is ignored by the server (hardcoded to null)
      const result = await onSubmit(fullName, email, password, "user");
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
