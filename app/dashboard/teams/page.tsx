"use client";
import React, { useState, useEffect, useRef } from "react";
import { College } from "@/components/teams/CollegeTable";
import { CollegeCard } from "@/components/teams/CollegeCard";
import { CollegeProfilePage } from "@/components/teams/CollegeProfilePage";
import { supabase } from "@/lib/supabase/client";
import { useRole } from "@/components/providers/role-provider";

const EMPTY_FORM = {
  name: "",
  established: "",
  activeTeams: "",
  sports: "",
  status: "Active" as College["status"],
};

function Dropdown({
  label, options, selected, onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count = selected.size;
  const isActive = count > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all min-w-[120px] justify-between ${
          isActive
            ? "bg-primary/8 border-primary/30 text-white"
            : "bg-card/80 border-border text-muted-foreground/80 hover:border-border/50 hover:text-muted-foreground/90"
        }`}
      >
        {isActive ? `${label} (${count})` : label}
        <svg className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+6px)] left-0 bg-card/80 border border-border rounded-xl overflow-hidden z-50 shadow-2xl"
          style={{ width: options.length > 6 ? "520px" : "180px" }}
        >
          <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-border">
            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">{label}</p>
            {selected.size > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); [...selected].forEach((o) => onToggle(o)); }}
                className="text-[8px] font-bold text-primary/60 hover:text-primary uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {options.length === 0 && <p className="px-3 py-3 text-[11px] text-muted-foreground/60">No options available</p>}
          <div className={options.length > 6 ? "grid grid-cols-3 gap-px p-2" : "flex flex-col"}>
            {options.map((opt) => {
              const isSelected = selected.has(opt);
              return (
                <div
                  key={opt}
                  onClick={() => onToggle(opt)}
                  className={`flex items-center gap-2 px-2.5 py-2 text-[11px] font-semibold cursor-pointer transition-colors rounded-lg ${
                    isSelected ? "text-primary bg-primary/5" : "text-muted-foreground/80 hover:bg-card/90 hover:text-white"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                    isSelected ? "bg-primary border-primary" : "border-border/50"
                  }`}>
                    {isSelected && (
                      <svg className="w-2 h-2" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AddCollegeModal({
  colleges,
  onClose,
  onAdd,
  onMerge, // ✅ new prop for merging
}: {
  colleges: College[];
  onClose: () => void;
  onAdd: (c: College) => Promise<void>;
  onMerge: (existing: College, newSports: string[]) => Promise<void>; // ✅ new prop
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [isDuplicateName, setIsDuplicateName] = useState(false);

  const validate = () => {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.name.trim()) e.name = "Required.";
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

  const handleSubmit = async () => {
    if (!validate()) return;

    const newSports = form.sports.split(",").map((s) => s.trim()).filter(Boolean);

    if (isDuplicateName) {
      // ✅ MERGE: find existing college and update its sports
      const existing = colleges.find(
        (c) => c.name.trim().toLowerCase() === form.name.trim().toLowerCase()
      );
      if (existing) {
        await onMerge(existing, newSports);
      }
    } else {
      // ✅ ADD: insert new college
      await onAdd({
        name: form.name.trim(),
        established: form.established.trim(),
        activeTeams: Number(form.activeTeams),
        sports: newSports,
        status: form.status,
      });
    }
    onClose();
  };

  const inputCls = (err?: string) =>
    `w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-all ${
      err ? "border-primary" : "border-white/8 focus:border-primary/50"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center px-6 py-5 border-b border-border/60">
          <div>
            <h2 className="text-base font-bold text-white">Add New College</h2>
            <p className="text-muted-foreground text-xs mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-muted-foreground hover:text-white text-sm">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">College Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                const val = e.target.value;
                setForm((f) => ({ ...f, name: val }));
                setErrors((er) => ({ ...er, name: undefined }));
                setIsDuplicateName(
                  colleges.some((c) => c.name.trim().toLowerCase() === val.trim().toLowerCase())
                );
              }}
              placeholder="e.g. College of Law"
              className={inputCls(errors.name)}
            />
            {errors.name && <p className="mt-1.5 text-[11px] text-primary">✕ {errors.name}</p>}
            {!errors.name && isDuplicateName && (
              <p className="mt-1.5 text-[11px] text-yellow-400 flex items-center gap-1.5">
                ⚠ This college already exists — new sports will be merged into it.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Year Established</label>
              <input
                type="text"
                value={form.established}
                onChange={(e) => { setForm((f) => ({ ...f, established: e.target.value })); setErrors((er) => ({ ...er, established: undefined })); }}
                placeholder="e.g. 1945"
                className={inputCls(errors.established)}
              />
              {errors.established && <p className="mt-1.5 text-[11px] text-primary">✕ {errors.established}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Active Teams</label>
              <input
                type="number"
                min={0}
                value={form.activeTeams}
                onChange={(e) => { setForm((f) => ({ ...f, activeTeams: e.target.value })); setErrors((er) => ({ ...er, activeTeams: undefined })); }}
                placeholder="e.g. 20"
                className={inputCls(errors.activeTeams)}
              />
              {errors.activeTeams && <p className="mt-1.5 text-[11px] text-primary">✕ {errors.activeTeams}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Sports (comma-separated)</label>
            <input
              type="text"
              value={form.sports}
              onChange={(e) => { setForm((f) => ({ ...f, sports: e.target.value })); setErrors((er) => ({ ...er, sports: undefined })); }}
              placeholder="e.g. Basketball, Tennis"
              className={inputCls(errors.sports)}
            />
            {errors.sports && <p className="mt-1.5 text-[11px] text-primary">✕ {errors.sports}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as College["status"] }))}
              className={inputCls()}
              style={{ backgroundColor: "#0a0a0a", color: "white" }}
            >
              <option value="Active" style={{ backgroundColor: "#0a0a0a" }}>Active</option>
              <option value="Pending" style={{ backgroundColor: "#0a0a0a" }}>Pending</option>
              <option value="Inactive" style={{ backgroundColor: "#0a0a0a" }}>Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-border/60">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:border-border/80 hover:text-white transition-all">Cancel</button>
          <button
            onClick={handleSubmit}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${
              isDuplicateName ? "bg-yellow-600 hover:bg-yellow-500" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isDuplicateName ? "Merge Sports" : "Add College"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteCollegeModal({ college, onClose, onConfirm }: { college: College; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl mx-auto mb-4">🗑</div>
          <h2 className="text-base font-bold text-white mb-1">Delete College</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Are you sure you want to remove <span className="text-white font-semibold">{college.name}</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:border-border/80 hover:text-white transition-all">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all">Delete</button>
        </div>
      </div>
    </div>
  );
}

const ALLOWED_SPORTS = [
  "Badminton","Basketball","Block Blast","Cheerdance","Chess","CODM","Cosplay",
  "Dancesports","Dota 2","Frisbee","MLBB","Mr. & Ms. Fitness","Petanque",
  "Pickleball","Pinoy Games","Rubiks Cube","Scrabble","Soccer","Softball",
  "Sudoku","Table Tennis","Tetris","Valorant","Volleyball",
];

type CSVRow = { college: string; sport: string; established: string; status: string; error?: string };

function ImportCSVModal({ colleges, onClose, onImport }: {
  colleges: College[];
  onClose: () => void;
  onImport: (rows: CSVRow[]) => Promise<void>;
}) {
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return;
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const parsed: CSVRow[] = lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
      const row: CSVRow = {
        college: obj["college"] || obj["name"] || "",
        sport: obj["sport"] || obj["sports"] || "",
        established: obj["established"] || "",
        status: obj["status"] || "Active",
      };
      const errors: string[] = [];
      if (!row.college) errors.push("Missing college");
      if (!row.sport) errors.push("Missing sport");
      else if (!ALLOWED_SPORTS.includes(row.sport)) errors.push(`Unknown sport: "${row.sport}"`);
      if (row.established && !/^\d{4}$/.test(row.established)) errors.push("Invalid year");
      if (errors.length) row.error = errors.join("; ");
      return row;
    });
    setRows(parsed);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target?.result as string);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  };

  const validRows = rows.filter((r) => !r.error);
  const errorRows = rows.filter((r) => r.error);

  const handleConfirm = async () => {
    if (!validRows.length) return;
    setIsImporting(true);
    await onImport(validRows);
    setIsImporting(false);
    onClose();
  };

  const downloadTemplate = () => {
    const csv = "college,sport,established,status\nCollege of Engineering,Basketball,1952,Active\nCollege of Science,Volleyball,1960,Active";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "colleges_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-border/60 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Import CSV</h2>
            <p className="text-muted-foreground text-xs mt-0.5">Upload a CSV file to bulk add colleges and sports.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadTemplate} className="text-[9px] font-bold text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors border border-border hover:border-primary/30 px-3 py-1.5 rounded-lg">
              ↓ Template
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-muted-foreground hover:text-white text-sm">✕</button>
          </div>
        </div>

        {/* Drop Zone */}
        {rows.length === 0 && (
          <div className="px-6 py-6 shrink-0">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                isDragging ? "border-primary/60 bg-primary/5" : "border-border hover:border-border/80 bg-card/80"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-lg">📂</div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Drop your CSV file here</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">or click to browse — .csv files only</p>
              </div>
              <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest font-bold">Required columns: college, sport, established, status</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {/* Preview */}
        {rows.length > 0 && (
          <>
            <div className="px-6 pt-4 pb-2 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{fileName}</span>
                <span className="text-[9px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">{validRows.length} valid</span>
                {errorRows.length > 0 && <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{errorRows.length} errors</span>}
              </div>
              <button onClick={() => { setRows([]); setFileName(""); }} className="text-[9px] text-muted-foreground/60 hover:text-white uppercase tracking-widest font-bold transition-colors">Change file</button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 pb-2">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border/60">
                    {["College","Sport","Est.","Status",""].map((h) => (
                      <th key={h} className="text-left py-2 pr-3 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-b border-border/40 ${row.error ? "bg-primary/3" : ""}`}>
                      <td className="py-2 pr-3 font-semibold text-white">{row.college || <span className="text-muted-foreground/60">—</span>}</td>
                      <td className="py-2 pr-3 text-muted-foreground/90">{row.sport || <span className="text-muted-foreground/60">—</span>}</td>
                      <td className="py-2 pr-3 text-muted-foreground/80">{row.established || <span className="text-muted-foreground/60">—</span>}</td>
                      <td className="py-2 pr-3 text-muted-foreground/80">{row.status}</td>
                      <td className="py-2">
                        {row.error
                          ? <span className="text-[9px] text-primary font-semibold">{row.error}</span>
                          : <span className="text-[9px] text-green-500 font-bold">✓</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border/60 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:border-border/80 hover:text-white transition-all">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!validRows.length || isImporting}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
          >
            {isImporting ? "Importing…" : `Import ${validRows.length} Row${validRows.length !== 1 ? "s" : ""}`}
          </button>
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<College | null>(null);
  const [profileCollege, setProfileCollege] = useState<College | null>(null);
  const [selectedSports, setSelectedSports] = useState<Set<string>>(new Set());
  const [selectedColleges, setSelectedColleges] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadColleges() {
      const { data, error } = await (supabase as any)
        .from("teams")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error fetching:", error);
      } else {
        setColleges(
          data.map((t: any) => ({
            id: t.id,
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

  // ✅ Add new college
  const handleAddCollege = async (college: College) => {
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
      .select()
      .single();

    if (error) {
      console.error("❌ Error adding:", error.message);
      return;
    }

    setColleges((prev) => [...prev, { ...college, id: data.id }]);
  };

  // ✅ Merge sports into existing college — UPDATE instead of INSERT
  const handleMergeCollege = async (existing: College, newSports: string[]) => {
    const mergedSports = [...new Set([...existing.sports, ...newSports])];
    const newActiveTeams = mergedSports.length;

    const { error } = await (supabase as any)
      .from("teams")
      .update({ sports: mergedSports, active_teams: newActiveTeams })
      .eq("college", existing.name);

    if (error) {
      console.error("❌ Error merging:", error.message);
      return;
    }

    const updatedCollege = { ...existing, sports: mergedSports, activeTeams: newActiveTeams };

    // Update colleges list
    setColleges((prev) =>
      prev.map((c) => c.name === existing.name ? updatedCollege : c)
    );

    // Sync profileCollege if it's the same college
    if (profileCollege?.name === existing.name) {
      setProfileCollege(updatedCollege);
    }
  };

  // ✅ Bulk import from CSV
  const handleImportCSV = async (rows: CSVRow[]) => {
    for (const row of rows) {
      const sports = row.sport.split(";").map((s) => s.trim()).filter(Boolean);
      const existing = colleges.find((c) => c.name.trim().toLowerCase() === row.college.trim().toLowerCase());
      if (existing) {
        const mergedSports = [...new Set([...existing.sports, ...sports])];
        const { error } = await (supabase as any).from("teams").update({ sports: mergedSports }).eq("college", existing.name);
        if (!error) setColleges((prev) => prev.map((c) => c.name === existing.name ? { ...c, sports: mergedSports } : c));
      } else {
        const newCollege: College = {
          name: row.college.trim(),
          established: row.established || "N/A",
          activeTeams: sports.length,
          sports,
          status: (row.status as College["status"]) || "Active",
        };
        const { data, error } = await (supabase as any).from("teams").insert([{
          college: newCollege.name,
          established: newCollege.established,
          active_teams: newCollege.activeTeams,
          sports: newCollege.sports,
          status: newCollege.status,
        }]).select().single();
        if (!error && data) setColleges((prev) => [...prev, { ...newCollege, id: data.id }]);
      }
    }
  };

  // ✅ Delete college
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

  const allSports = [
    "Badminton",
    "Basketball",
    "Block Blast",
    "Cheerdance",
    "Chess",
    "CODM",
    "Cosplay",
    "Dancesports",
    "Dota 2",
    "Frisbee",
    "MLBB",
    "Mr. & Ms. Fitness",
    "Petanque",
    "Pickleball",
    "Pinoy Games",
    "Rubiks Cube",
    "Scrabble",
    "Soccer",
    "Softball",
    "Sudoku",
    "Table Tennis",
    "Tetris",
    "Valorant",
    "Volleyball",
  ];
  const allCollegeNames = colleges.map((c) => c.name);

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) => { const next = new Set(prev); next.has(sport) ? next.delete(sport) : next.add(sport); return next; });
  };

  const toggleCollege = (name: string) => {
    setSelectedColleges((prev) => { const next = new Set(prev); next.has(name) ? next.delete(name) : next.add(name); return next; });
  };

  const removeFilter = (type: "sport" | "college", val: string) => {
    if (type === "sport") setSelectedSports((prev) => { const n = new Set(prev); n.delete(val); return n; });
    else setSelectedColleges((prev) => { const n = new Set(prev); n.delete(val); return n; });
  };

  const clearAll = () => { setSelectedSports(new Set()); setSelectedColleges(new Set()); };
  const hasFilters = selectedSports.size > 0 || selectedColleges.size > 0;

  const filtered = colleges.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.sports.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchSport = selectedSports.size === 0 || c.sports.some((s) => selectedSports.has(s));
    const matchCollege = selectedColleges.size === 0 || selectedColleges.has(c.name);
    return matchSearch && matchSport && matchCollege;
  });

  const activePills: { type: "sport" | "college"; val: string }[] = [
    ...[...selectedSports].map((s) => ({ type: "sport" as const, val: s })),
    ...[...selectedColleges].map((c) => ({ type: "college" as const, val: c })),
  ];

  if (profileCollege) {
    return (
      <div className="min-h-screen bg-background">
        <CollegeProfilePage college={profileCollege} onBack={() => setProfileCollege(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showImportModal && (
        <ImportCSVModal
          colleges={colleges}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportCSV}
        />
      )}
      {showModal && (
        <AddCollegeModal
          colleges={colleges}
          onClose={() => setShowModal(false)}
          onAdd={handleAddCollege}
          onMerge={handleMergeCollege}
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
      <div className="px-10 pt-14 pb-12 text-center border-b border-border/40">
        <h1 className="text-white text-6xl uppercase leading-none tracking-wide mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Participating <span className="text-primary">Colleges</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-9 leading-relaxed">
          Discover the colleges and universities competing in this season's league.
        </p>
        <div className="max-w-md mx-auto relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools by name or sport..."
            className="w-full bg-card/80 border border-border rounded-full py-3.5 pl-11 pr-5 text-sm text-white placeholder:text-muted-foreground/60 outline-none focus:border-primary/40 transition-all"
          />
        </div>
      </div>


      {/* Toolbar */}
      <div className="px-10 py-4 border-b border-border/40 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Filter by</span>
          <Dropdown label={selectedSports.size > 0 ? `Sport · ${selectedSports.size}` : "Sport"} options={allSports} selected={selectedSports} onToggle={toggleSport} />
          <Dropdown label={selectedColleges.size > 0 ? `College · ${selectedColleges.size}` : "College"} options={allCollegeNames} selected={selectedColleges} onToggle={toggleCollege} />
          {activePills.map(({ type, val }) => (
            <div key={`${type}-${val}`} className="flex items-center gap-1.5 bg-primary/10 border border-primary/25 rounded-full px-2.5 py-1">
              <span className="text-[9px] text-primary/60 font-bold uppercase tracking-wider">{type === "sport" ? "Sport" : "College"}:</span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{val}</span>
              <button onClick={() => removeFilter(type, val)} className="text-primary/50 hover:text-primary text-sm leading-none transition-colors ml-0.5">×</button>
            </div>
          ))}
          {hasFilters && (
            <button onClick={clearAll} className="text-[9px] text-muted-foreground/60 hover:text-muted-foreground/80 uppercase tracking-widest font-bold underline transition-colors">Clear all</button>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {!isLoading && (
            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </span>
          )}
          <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex items-center gap-1.5">
            + Add College
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="px-10 py-8">
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-6">
          {isLoading ? "Loading..." : `${filtered.length} College${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border/60 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-card" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-card rounded-full w-3/4 mx-auto" />
                  <div className="h-2 bg-card rounded-full w-1/2 mx-auto" />
                  <div className="h-8 bg-card rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white text-sm font-semibold mb-1">No colleges found</p>
            <p className="text-muted-foreground text-xs mb-4 max-w-xs leading-relaxed">
              {search ? `No results for "${search}".` : "No colleges match your current filters."} Try adjusting or clearing your filters.
            </p>
            <button
              onClick={() => { setSearch(""); clearAll(); }}
              className="text-[9px] font-bold text-primary border border-primary/30 hover:border-primary/60 px-4 py-2 rounded-lg uppercase tracking-widest transition-all"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filtered.map((college) => (
              <div key={college.id ?? college.name} className="relative group">
                <CollegeCard college={college} onViewProfile={setProfileCollege} />
                <button
                  onClick={() => setDeleteTarget(college)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-primary border border-white/10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
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