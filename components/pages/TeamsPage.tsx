"use client";
import React, { useState, useEffect } from "react";
import { College } from "../teams/CollegeTable";
import { CollegeCard } from "../teams/CollegeCard";
import { CollegeProfilePage } from "../teams/CollegeProfilePage";
import { supabase } from "@/lib/supabase/client";

const EMPTY_FORM = {
  name: "",
  established: "",
  activeTeams: "",
  sports: "",
  status: "Active" as College["status"],
};

function AddCollegeModal({
  colleges,
  onClose,
  onAdd,
}: {
  colleges: College[];
  onClose: () => void;
  onAdd: (c: College) => Promise<void>; // ✅ changed to Promise<void>
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});

  const isDuplicate = (name: string) =>
    colleges.some(
      (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()
    );

  const validate = () => {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.name.trim()) e.name = "Required.";
    else if (isDuplicate(form.name))
      e.name = `"${form.name.trim()}" already exists.`;
    if (!form.established.trim()) e.established = "Required.";
    else if (!/^\d{4}$/.test(form.established.trim()))
      e.established = "Enter a valid 4-digit year.";
    if (!form.activeTeams.trim()) e.activeTeams = "Required.";
    else if (isNaN(Number(form.activeTeams)) || Number(form.activeTeams) < 0)
      e.activeTeams = "Invalid number.";
    if (!form.sports.trim()) e.sports = "Required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ✅ now async, awaits onAdd before closing
  const handleSubmit = async () => {
    if (!validate()) return;
    await onAdd({
      name: form.name.trim(),
      established: form.established.trim(),
      activeTeams: Number(form.activeTeams),
      sports: form.sports.split(",").map((s) => s.trim()).filter(Boolean),
      status: form.status,
    });
    onClose();
  };

  const inputCls = (err?: string) =>
    `w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-all ${
      err ? "border-[#A91D3A]" : "border-white/8 focus:border-[#A91D3A]/50"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#111]">
          <div>
            <h2 className="text-base font-bold text-white">Add New College</h2>
            <p className="text-[#444] text-xs mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-[#444] hover:text-white text-sm">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#444] mb-1.5">College Name</label>
            <input type="text" value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: undefined })); }} placeholder="e.g. College of Law" className={inputCls(errors.name)} />
            {errors.name && <p className="mt-1.5 text-[11px] text-[#A91D3A]">✕ {errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#444] mb-1.5">Year Established</label>
              <input type="text" value={form.established} onChange={(e) => { setForm((f) => ({ ...f, established: e.target.value })); setErrors((er) => ({ ...er, established: undefined })); }} placeholder="e.g. 1945" className={inputCls(errors.established)} />
              {errors.established && <p className="mt-1.5 text-[11px] text-[#A91D3A]">✕ {errors.established}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#444] mb-1.5">Active Teams</label>
              <input type="number" min={0} value={form.activeTeams} onChange={(e) => { setForm((f) => ({ ...f, activeTeams: e.target.value })); setErrors((er) => ({ ...er, activeTeams: undefined })); }} placeholder="e.g. 20" className={inputCls(errors.activeTeams)} />
              {errors.activeTeams && <p className="mt-1.5 text-[11px] text-[#A91D3A]">✕ {errors.activeTeams}</p>}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#444] mb-1.5">Sports (comma-separated)</label>
            <input type="text" value={form.sports} onChange={(e) => { setForm((f) => ({ ...f, sports: e.target.value })); setErrors((er) => ({ ...er, sports: undefined })); }} placeholder="e.g. Basketball, Tennis" className={inputCls(errors.sports)} />
            {errors.sports && <p className="mt-1.5 text-[11px] text-[#A91D3A]">✕ {errors.sports}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#444] mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as College["status"] }))} className={inputCls()} style={{ backgroundColor: "#0a0a0a", color: "white" }}>
              <option value="Active" style={{ backgroundColor: "#0a0a0a" }}>Active</option>
              <option value="Pending" style={{ backgroundColor: "#0a0a0a" }}>Pending</option>
              <option value="Inactive" style={{ backgroundColor: "#0a0a0a" }}>Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-[#111]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1a1a1a] text-[#444] text-sm font-semibold hover:border-[#333] hover:text-white transition-all">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-[#A91D3A] hover:bg-[#c4223f] text-white text-sm font-semibold transition-all">Add College</button>
        </div>
      </div>
    </div>
  );
}

function DeleteCollegeModal({ college, onClose, onConfirm }: { college: College; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#A91D3A]/10 border border-[#A91D3A]/20 flex items-center justify-center text-xl mx-auto mb-4">🗑</div>
          <h2 className="text-base font-bold text-white mb-1">Delete College</h2>
          <p className="text-[#444] text-sm leading-relaxed">
            Are you sure you want to remove <span className="text-white font-semibold">{college.name}</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1a1a1a] text-[#444] text-sm font-semibold hover:border-[#333] hover:text-white transition-all">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-[#A91D3A] hover:bg-[#c4223f] text-white text-sm font-semibold transition-all">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<College | null>(null);
  const [profileCollege, setProfileCollege] = useState<College | null>(null);

  // ✅ Fetch from Supabase teams table
  useEffect(() => {
    async function loadColleges() {
      const { data, error } = await (supabase as any)
        .from("teams")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error fetching:", error);
      } else {
        console.log("✅ Fetched data:", data);
        setColleges(
          data.map((t: any) => ({
            name: t.college,
            established: t.established ?? "N/A",
            activeTeams: t.active_teams ?? 0,
            sports: t.sports ?? [],
            status: t.status ?? "Active",
          }))
        );
      }
      setIsLoading(false);
    }
    loadColleges();
  }, []);

  // ✅ Add college — saves to Supabase so it persists
  const handleAddCollege = async (college: College) => {
    console.log("📤 Attempting to insert:", college);

    const { data, error } = await (supabase as any)
      .from("teams")
      .insert({
        college: college.name,
        name: college.name,
        established: college.established,
        active_teams: college.activeTeams,
        sports: college.sports,
        status: college.status,
        org: "",
      })
      .select();

    console.log("📥 Insert result — data:", data, "error:", error);

    if (error) {
      console.error("❌ Error adding college:", error.message, error.details, error.hint);
      return;
    }

    console.log("✅ Successfully added!");
    setColleges((prev) => [...prev, college]);
  };

  // ✅ Delete college — removes from Supabase permanently
  const handleDeleteCollege = async (collegeName: string) => {
    const { error } = await (supabase as any)
      .from("teams")
      .delete()
      .eq("college", collegeName);

    if (error) {
      console.error("❌ Error deleting:", error);
      return;
    }

    setColleges((prev) => prev.filter((c) => c.name !== collegeName));
  };

  const filtered = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.sports.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (profileCollege) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <CollegeProfilePage college={profileCollege} onBack={() => setProfileCollege(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {showModal && (
        <AddCollegeModal
          colleges={colleges}
          onClose={() => setShowModal(false)}
          onAdd={handleAddCollege}
        />
      )}
      {deleteTarget && (
        <DeleteCollegeModal
          college={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteCollege(deleteTarget.name)}
        />
      )}

      {/* Hero */}
      <div className="px-10 pt-14 pb-12 text-center border-b border-[#0f0f0f]">
        <h1 className="text-white text-6xl uppercase leading-none tracking-wide mb-3" style={{ fontFamily: "'Anton', sans-serif" }}>
          Participating <span className="text-[#A91D3A]">Colleges</span>
        </h1>
        <p className="text-[#444] text-sm max-w-sm mx-auto mb-9 leading-relaxed">
          Discover the colleges and universities competing in this season's league.
        </p>
        <div className="max-w-md mx-auto relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools by name or sport..."
            className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-full py-3.5 pl-11 pr-5 text-sm text-white placeholder:text-[#333] outline-none focus:border-[#A91D3A]/40 transition-all"
          />
        </div>
      </div>

      {/* Grid section */}
      <div className="px-10 py-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-bold text-[#333] uppercase tracking-widest">
            {isLoading ? "Loading..." : `${filtered.length} College${filtered.length !== 1 ? "s" : ""}`}
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#A91D3A] hover:bg-[#c4223f] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
          >
            + Add College
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#111] rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-[#111]" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-[#111] rounded-full w-3/4 mx-auto" />
                  <div className="h-2 bg-[#111] rounded-full w-1/2 mx-auto" />
                  <div className="h-8 bg-[#111] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#333] text-sm">No colleges match "{search}"</p>
            <button onClick={() => setSearch("")} className="mt-3 text-[#A91D3A] text-xs hover:underline">Clear search</button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filtered.map((college) => (
              <div key={college.name} className="relative group">
                <CollegeCard college={college} onViewProfile={setProfileCollege} />
                <button
                  onClick={() => setDeleteTarget(college)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-[#A91D3A] border border-white/10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}