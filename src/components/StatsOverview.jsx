import React from 'react';
import { 
  Flame, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function StatsOverview({ summary, tasks }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      
      {/* Total Active Tasks */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Total Tugas</span>
          <Layers className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{summary.total}</span>
          <span className="text-xs text-slate-500">tugas terdaftar</span>
        </div>
      </div>

      {/* Kuadran 1: Mendesak & Penting */}
      <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/30 backdrop-blur">
        <div className="flex items-center justify-between text-red-400 mb-1">
          <span className="text-xs font-semibold">Q1: Lakukan Segera</span>
          <Flame className="w-4 h-4 text-red-400 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-red-400">{summary.q1Count}</span>
          <span className="text-xs text-red-400/70">kritis / deadline</span>
        </div>
      </div>

      {/* Kuadran 2: Jadwalkan */}
      <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 backdrop-blur">
        <div className="flex items-center justify-between text-amber-400 mb-1">
          <span className="text-xs font-semibold">Q2: Strategis (Penting)</span>
          <Calendar className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">{summary.q2Count}</span>
          <span className="text-xs text-amber-400/70">fokus jangka panjang</span>
        </div>
      </div>

      {/* Overdue / Mendekati Deadline */}
      <div className="p-3.5 rounded-2xl bg-orange-950/20 border border-orange-500/30 backdrop-blur">
        <div className="flex items-center justify-between text-orange-400 mb-1">
          <span className="text-xs font-semibold">Overdue / Terlambat</span>
          <AlertTriangle className="w-4 h-4 text-orange-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-orange-400">{summary.overdueCount}</span>
          <span className="text-xs text-orange-400/70">lewat deadline</span>
        </div>
      </div>

      {/* Completed */}
      <div className="col-span-2 lg:col-span-1 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 backdrop-blur">
        <div className="flex items-center justify-between text-emerald-400 mb-1">
          <span className="text-xs font-semibold">Tugas Selesai</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400">{summary.completedCount}</span>
          <span className="text-xs text-emerald-400/70">terselesaikan</span>
        </div>
      </div>

    </div>
  );
}
