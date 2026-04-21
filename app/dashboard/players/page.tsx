"use client";
import React, { useState, useMemo } from "react";
import { Check, X, Clock } from "lucide-react";

interface Player {
  id: string;
  name: string;
  studentId: string;
  college: string;
  sport: string;
  position: string;
  jersey: number;
  verificationStatus: 'unverified' | 'verified' | 'rejected';
  verifiedAt?: string | null;
  createdAt: string;
}

const MOCK_PLAYERS: Player[] = [
  { id: "1", name: "Juan Santos", studentId: "2024-001234", college: "COS Scions", sport: "Basketball Men", position: "Point Guard", jersey: 7, verificationStatus: "verified", verifiedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "2", name: "Maria Garcia", studentId: "2024-001235", college: "COS Scions", sport: "Basketball Men", position: "Small Forward", jersey: 10, verificationStatus: "unverified", createdAt: new Date().toISOString() },
  { id: "3", name: "Carlos Reyes", studentId: "2024-001236", college: "SOM Tycoons", sport: "Basketball Men", position: "Center", jersey: 5, verificationStatus: "verified", verifiedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "4", name: "Ana Cruz", studentId: "2024-001237", college: "CSS Stallions", sport: "Volleyball Women", position: "Setter", jersey: 3, verificationStatus: "rejected", createdAt: new Date().toISOString() },
  { id: "5", name: "Miguel Torres", studentId: "2024-001238", college: "CCAD Phoenix", sport: "Volleyball Women", position: "Libero", jersey: 12, verificationStatus: "unverified", createdAt: new Date().toISOString() },
];

interface VerificationModalProps {
  player: Player;
  onClose: () => void;
  onVerify: (playerId: string, status: 'verified' | 'rejected') => void;
}

function VerificationModal({ player, onClose, onVerify }: VerificationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-black text-white tracking-tight mb-6">Verify Student ID</h2>
        
        <div className="space-y-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Student Name</p>
            <p className="text-white font-semibold text-lg">{player.name}</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Student ID</p>
            <p className="text-white font-mono text-lg tracking-widest">{player.studentId}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">College/Org</p>
              <p className="text-white font-semibold truncate">{player.college}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Sport</p>
              <p className="text-white font-semibold truncate">{player.sport}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/10 text-white/50 text-sm font-semibold hover:border-white/30 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onVerify(player.id, 'rejected');
              onClose();
            }}
            className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-all border border-red-500/30"
          >
            Reject
          </button>
          <button
            onClick={() => {
              onVerify(player.id, 'verified');
              onClose();
            }}
            className="flex-1 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-semibold transition-all border border-emerald-500/30"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerRow({ player, onVerify }: { player: Player; onVerify: (p: Player) => void }) {
  const statusConfig = {
    verified: { icon: Check, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", label: "Verified" },
    unverified: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", label: "Pending" },
    rejected: { icon: X, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", label: "Rejected" },
  };

  const status = statusConfig[player.verificationStatus];
  const Icon = status.icon;

  return (
    <tr className="hover:bg-[#1A1A1A]/40 transition-colors border-b border-gray-800">
      <td className="py-6 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#A91D3A] rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-[#A91D3A]/20">
          {player.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-white">{player.name}</p>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider font-mono">{player.studentId}</p>
        </div>
      </td>
      <td className="text-white/60 text-sm">{player.college}</td>
      <td className="text-white/60 text-sm truncate">{player.sport}</td>
      <td className="text-center">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border ${status.bg} ${status.border} ${status.color} uppercase tracking-widest`}>
          <Icon className="w-3 h-3" /> {status.label}
        </span>
      </td>
      <td className="text-right">
        <button
          onClick={() => onVerify(player)}
          className="text-white/30 hover:text-[#A91D3A] transition-colors p-2 text-sm font-semibold underline"
          title="Review verification"
        >
          Review
        </button>
      </td>
    </tr>
  );
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'unverified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch = 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || player.verificationStatus === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [players, searchQuery, filterStatus]);

  const verificationStats = useMemo(() => {
    return {
      total: players.length,
      verified: players.filter(p => p.verificationStatus === 'verified').length,
      unverified: players.filter(p => p.verificationStatus === 'unverified').length,
      rejected: players.filter(p => p.verificationStatus === 'rejected').length,
    };
  }, [players]);

  const handleVerify = (playerId: string, status: 'verified' | 'rejected') => {
    setPlayers(players.map((p) =>
      p.id === playerId
        ? { ...p, verificationStatus: status, verifiedAt: new Date().toISOString() }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      {selectedPlayer && (
        <VerificationModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onVerify={handleVerify}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 -mx-8 -mt-8 mb-8 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5 px-8 py-5">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-4">
          <h1 className="text-2xl font-black text-white tracking-tight">Player Verification</h1>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#A91D3A]/60 transition-all w-80"
            />
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Total Players</p>
            <p className="text-4xl font-black text-white">{verificationStats.total}</p>
          </div>
          <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-2xl p-6">
            <p className="text-emerald-400 text-[10px] uppercase tracking-widest font-bold mb-2">Verified</p>
            <p className="text-4xl font-black text-emerald-400">{verificationStats.verified}</p>
          </div>
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-6">
            <p className="text-yellow-400 text-[10px] uppercase tracking-widest font-bold mb-2">Pending</p>
            <p className="text-4xl font-black text-yellow-400">{verificationStats.unverified}</p>
          </div>
          <div className="bg-red-400/10 border border-red-400/30 rounded-2xl p-6">
            <p className="text-red-400 text-[10px] uppercase tracking-widest font-bold mb-2">Rejected</p>
            <p className="text-4xl font-black text-red-400">{verificationStats.rejected}</p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Filter by Status</span>
          {(['all', 'verified', 'unverified', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all duration-200 ${
                filterStatus === status
                  ? "bg-[#A91D3A] border-[#A91D3A] text-white shadow-[0_0_12px_rgba(169,29,58,0.5)]"
                  : "bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Players Table */}
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-800">
                <th className="pb-4">Player Name</th>
                <th className="pb-4">College/Org</th>
                <th className="pb-4">Sport</th>
                <th className="pb-4 text-center">Status</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    onVerify={(p) => setSelectedPlayer(p)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-white/30 text-sm">
                    No players match your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
