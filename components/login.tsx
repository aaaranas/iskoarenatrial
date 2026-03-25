"use client";

import React, { useState } from 'react';
import { LogoIcon } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2 } from "lucide-react";

interface LoginPageProps {
    isOpen: boolean;
    onClose: () => void;
    // Updated signature: email instead of username, and returns a Promise
    onSubmit: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    onToggleSignup: () => void;
}

export default function LoginPage({ isOpen, onClose, onSubmit, onToggleSignup }: LoginPageProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await onSubmit(email, password);
            if (!result.success) {
                setError(result.message || "Invalid credentials");
            }
        } catch (err) {
            setError("An unexpected authentication error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <section className="relative w-full max-w-sm animate-in fade-in zoom-in duration-300">
                
                <button 
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                <form
                    onSubmit={handleSubmit}
                    className="bg-zinc-950 m-auto h-fit w-full rounded-xl border border-zinc-800 p-0.5 shadow-2xl"
                >
                    <div className="p-8 pb-6">
                        <div className="mb-8 text-center">
                            <div className="flex justify-center"><LogoIcon /></div>
                            <h1 className="mb-1 mt-4 text-xl font-black uppercase tracking-[0.2em] text-white">Sign In</h1>
                        </div>

                        {/* Social Logins (Cinematic Style) */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Button type="button" variant="outline" className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-400 text-[14px] font-bold ">
                                <GoogleIcon />
                                <span>Google</span>
                            </Button>
                            <Button type="button" variant="outline" className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-400 text-[14px] font-bold ">
                                <MicrosoftIcon />
                                <span>Microsoft</span>
                            </Button>
                        </div>

                        <hr className="my-6 border-dashed border-zinc-800" />

                        {error && (
                            <div className="mb-6 p-3 text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/5 border border-red-400/20 rounded-sm animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">
                                    Email Address
                                </Label>
                                <Input
                                    type="email"
                                    required
                                    id="email"
                                    placeholder="personnel@up.edu.ph"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-900/40 border-zinc-800 text-white focus-visible:ring-[#C5A059]/30 h-10  text-[11px]   placeholder:text-zinc-800"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="pwd" className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1">
                                        Password
                                    </Label>
                                    <button
                                        type="button"
                                        className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 hover:text-[#C5A059] transition-colors"
                                    >
                                        Forgot?
                                    </button>
                                </div>
                                <Input
                                    type="password"
                                    required
                                    id="pwd"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-zinc-900/40 border-zinc-800 text-white focus-visible:ring-[#C5A059]/30 h-10"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-[#C5A059] text-black font-black   uppercase text-[11px] hover:bg-[#D4B475] h-12 transition-all mt-2 shadow-[0_0_20px_rgba(197,160,89,0.1)]"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                                ) : (
                                    "Log In"
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-zinc-900/20 rounded-b-xl border-t border-zinc-800/50 p-4">
                        <p className="text-zinc-600 text-center text-[12px] ">
                            No Account Yet?
                            <button
                                type="button"
                                className="ml-2 text-white hover:text-[#C5A059] transition-colors font-black"
                                onClick={onToggleSignup}
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </form>
            </section>
        </div>
    );
}

// Icons (Kept same as provided)
function GoogleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262" className="mr-2">
            <path fill="#4285f4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
            <path fill="#34a853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
            <path fill="#fbbc05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
            <path fill="#eb4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
        </svg>
    );
}

function MicrosoftIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256" className="mr-2">
            <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z"></path>
            <path fill="#80cc28" d="M256 121.666H134.335V0H256z"></path>
            <path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z"></path>
            <path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z"></path>
        </svg>
    );
}
