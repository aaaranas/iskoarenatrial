"use client";
import React, { useState, useMemo, useEffect } from "react";
import { AnalyticsCard } from "../teams/AnalyticsCard";
import { CollegeTable } from "../teams/CollegeTable";
 
export interface College {
  name: string;
  established: string;
  activeTeams: number;
  sports: string[];
  status: "Active" | "Pending" | "Inactive";
}
 
const MOCK_COLLEGES: College[] = [
  { name: "College of Engineering", established: "1910", activeTeams: 42, sports: ["Basketball", "Esports"], status: "Active" },
  { name: "Arts & Sciences", established: "1908", activeTeams: 35, sports: ["Volleyball", "Debate"], status: "Active" },
  { name: "Business School", established: "1922", activeTeams: 28, sports: ["Basketball", "Football"], status: "Pending" },
  { name: "College of Medicine", established: "1915", activeTeams: 12, sports: ["Badminton", "Tennis"], status: "Active" },
];
 
const ALL_SPORTS = Array.from(
  new Set(MOCK_COLLEGES.flatMap((c) => c.sports))
).sort();
 
const PAGE_SIZE = 2;
 
// ── Skeleton components ───────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-800">
      <td className="py-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="w-40 h-3 rounded bg-white/5 animate-pulse" />
            <div className="w-20 h-2 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      </td>
      <td><div className="w-8 h-3 rounded bg-white/5 animate-pulse" /></td>
      <td>
        <div className="flex gap-2">
          <div className="w-16 h-5 rounded bg-white/5 animate-pulse" />
          <div className="w-16 h-5 rounded bg-white/5 animate-pulse" />
        </div>
      </td>
      <td><div className="w-14 h-3 rounded bg-white/5 animate-pulse" /></td>
    </tr>
  );
}
 
function TableSkeleton() {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-3xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="w-48 h-5 rounded bg-white/5 animate-pulse" />
        <div className="w-32 h-8 rounded-full bg-white/5 animate-pulse" />
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-800">
            <th className="pb-4">College Name</th>
            <th className="pb-4">Active Teams</th>
            <th className="pb-4">Primary Sports</th>
            <th className="pb-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
 
// ── Add Team Modal ────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", established: "", activeTeams: "", sports: "", status: "Active" as College["status"] };
 
function AddTeamModal({
  colleges,
  onClose,
  onAdd,
}: {
  colleges: College[];
  onClose: () => void;
  onAdd: (college: College) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
 
  const isDuplicate = (name: string) =>
    colleges.some((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase());
 
  const validate = () => {
    const newErrors: Partial<typeof EMPTY_FORM> = {};
 
    if (!form.name.trim()) {
      newErrors.name = "College name is required.";
    } else if (isDuplicate(form.name)) {
      newErrors.name = `"${form.name.trim()}" already exists. Duplicate entries are not allowed.`;
    }
 
    if (!form.established.trim()) {
      newErrors.established = "Year established is required.";
    } else if (!/^\d{4}$/.test(form.established.trim())) {
      newErrors.established = "Enter a valid 4-digit year.";
    }
 
    if (!form.activeTeams.trim()) {
      newErrors.activeTeams = "Active teams count is required.";
    } else if (isNaN(Number(form.activeTeams)) || Number(form.activeTeams) < 0) {
      newErrors.activeTeams = "Enter a valid number.";
    }
 
    if (!form.sports.trim()) {
      newErrors.sports = "At least one sport is required.";
    }
 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = () => {
    if (!validate()) return;
    onAdd({
      name: form.name.trim(),
      established: form.established.trim(),
      activeTeams: Number(form.activeTeams),
      sports: form.sports.split(",").map((s) => s.trim()).filter(Boolean),
      status: form.status,
    });
    onClose();
  };
 
  // Live duplicate check as user types
  const liveDuplicate = form.name.trim() && isDuplicate(form.name);
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white tracking-tight">Add New Team</h2>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>
 
        <div className="space-y-5">
          {/* College Name */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">
              College Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((er) => ({ ...er, name: undefined }));
              }}
              placeholder="e.g. College of Law"
              className={`w-full bg-white/5 border rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-all ${
                errors.name
                  ? "border-[#A91D3A] focus:border-[#A91D3A]"
                  : liveDuplicate
                  ? "border-yellow-500/60"
                  : "border-white/10 focus:border-[#A91D3A]/60"
              }`}
            />
            {/* Live duplicate warning before submit */}
            {!errors.name && liveDuplicate && (
              <p className="text-yellow-400 text-[11px] mt-1 flex items-center gap-1">
                ⚠ A college with this name already exists.
              </p>
            )}
            {/* Validation error after submit attempt */}
            {errors.name && (
              <p className="text-[#A91D3A] text-[11px] mt-1 flex items-center gap-1">
                ✕ {errors.name}
              </p>
            )}
          </div>
 
          {/* Year Established */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">
              Year Established
            </label>
            <input
              type="text"
              value={form.established}
              onChange={(e) => {
                setForm((f) => ({ ...f, established: e.target.value }));
                setErrors((er) => ({ ...er, established: undefined }));
              }}
              placeholder="e.g. 1945"
              className={`w-full bg-white/5 border rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-all ${
                errors.established ? "border-[#A91D3A]" : "border-white/10 focus:border-[#A91D3A]/60"
              }`}
            />
            {errors.established && (
              <p className="text-[#A91D3A] text-[11px] mt-1">✕ {errors.established}</p>
            )}
          </div>
 
          {/* Active Teams */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">
              Active Teams
            </label>
            <input
              type="number"
              min={0}
              value={form.activeTeams}
              onChange={(e) => {
                setForm((f) => ({ ...f, activeTeams: e.target.value }));
                setErrors((er) => ({ ...er, activeTeams: undefined }));
              }}
              placeholder="e.g. 20"
              className={`w-full bg-white/5 border rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-all ${
                errors.activeTeams ? "border-[#A91D3A]" : "border-white/10 focus:border-[#A91D3A]/60"
              }`}
            />
            {errors.activeTeams && (
              <p className="text-[#A91D3A] text-[11px] mt-1">✕ {errors.activeTeams}</p>
            )}
          </div>
 
          {/* Sports */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">
              Sports <span className="normal-case text-white/20">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.sports}
              onChange={(e) => {
                setForm((f) => ({ ...f, sports: e.target.value }));
                setErrors((er) => ({ ...er, sports: undefined }));
              }}
              placeholder="e.g. Basketball, Tennis"
              className={`w-full bg-white/5 border rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-all ${
                errors.sports ? "border-[#A91D3A]" : "border-white/10 focus:border-[#A91D3A]/60"
              }`}
            />
            {errors.sports && (
              <p className="text-[#A91D3A] text-[11px] mt-1">✕ {errors.sports}</p>
            )}
          </div>
 
          {/* Status */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-widest font-bold block mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as College["status"] }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-[#A91D3A]/60 transition-all"
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
 
        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/10 text-white/50 text-sm font-semibold hover:border-white/30 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-lg bg-[#A91D3A] hover:bg-[#c4223f] text-white text-sm font-semibold transition-all shadow-[0_0_16px_rgba(169,29,58,0.4)]"
          >
            Add Team
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
 
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setColleges(MOCK_COLLEGES);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
 
  const handleAddCollege = (college: College) => {
    setColleges((prev) => [...prev, college]);
  };
 
  const filteredColleges = useMemo(() => {
    setCurrentPage(1);
    return colleges.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.sports.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchesSport = selectedSport ? c.sports.includes(selectedSport) : true;
      return matchesSearch && matchesSport;
    });
  }, [search, selectedSport, colleges]);
 
  const totalPages = Math.ceil(filteredColleges.length / PAGE_SIZE);
  const paginatedColleges = filteredColleges.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
 
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      {showModal && (
        <AddTeamModal
          colleges={colleges}
          onClose={() => setShowModal(false)}
          onAdd={handleAddCollege}
        />
      )}
 
      {/* Sticky header */}
      <header className="sticky top-0 z-50 -mx-8 -mt-8 mb-8 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5 px-8 py-5">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-4">
          <h1 className="text-4xl font-black flex items-center gap-4 italic tracking-tight text-white">
            <div className="w-2 h-10 bg-[#A91D3A] rounded-full shadow-[0_0_20px_rgba(169,29,58,0.6)]" />
            TEAMS &amp; ORGANIZATIONS
          </h1>
 
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search colleges or sports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#A91D3A]/60 transition-all w-64 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              disabled={isLoading}
              onClick={() => setShowModal(true)}
              className="bg-[#A91D3A] hover:bg-[#c4223f] transition-colors text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-[0_0_16px_rgba(169,29,58,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Add Team
            </button>
          </div>
        </div>
      </header>
 
      <div className="max-w-[1600px] mx-auto space-y-8">
        <AnalyticsCard />
 
        {/* Sport Filter Chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Filter by Sport</span>
          <button
            onClick={() => setSelectedSport(null)}
            disabled={isLoading}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              selectedSport === null
                ? "bg-[#A91D3A] border-[#A91D3A] text-white shadow-[0_0_12px_rgba(169,29,58,0.5)]"
                : "bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
            }`}
          >
            All
          </button>
          {ALL_SPORTS.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(selectedSport === sport ? null : sport)}
              disabled={isLoading}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                selectedSport === sport
                  ? "bg-[#A91D3A] border-[#A91D3A] text-white shadow-[0_0_12px_rgba(169,29,58,0.5)]"
                  : "bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
 
        {/* Active filter indicator */}
        {!isLoading && selectedSport && (
          <div className="flex items-center gap-2 text-sm text-white/40">
            Showing colleges with
            <span className="text-[#A91D3A] font-semibold">{selectedSport}</span>
            <button
              onClick={() => setSelectedSport(null)}
              className="text-white/20 hover:text-white/60 transition-colors text-xs underline"
            >
              clear
            </button>
          </div>
        )}
 
        {/* Loading skeleton */}
        {isLoading && <TableSkeleton />}
 
        {/* Loaded content */}
        {!isLoading && (
          <>
            {filteredColleges.length > 0 ? (
              <>
                <CollegeTable colleges={paginatedColleges} />
 
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-white/30 text-xs">
                      Showing{" "}
                      <span className="text-white/60 font-semibold">
                        {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredColleges.length)}
                      </span>{" "}
                      of{" "}
                      <span className="text-white/60 font-semibold">{filteredColleges.length}</span> colleges
                    </p>
 
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/10 text-white/50 hover:border-white/30 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
 
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all duration-200 ${
                            page === currentPage
                              ? "bg-[#A91D3A] border-[#A91D3A] text-white shadow-[0_0_12px_rgba(169,29,58,0.5)]"
                              : "bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
 
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/10 text-white/50 hover:border-white/30 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-white/30 text-sm">
                {selectedSport && search
                  ? `No colleges match "${search}" with sport "${selectedSport}"`
                  : selectedSport
                  ? `No colleges offer "${selectedSport}"`
                  : `No colleges match "${search}"`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}