import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Search, Filter, ArrowUpDown, Flame, Star, AlertCircle } from 'lucide-react';
import { QUADRANTS } from '../utils/priority';

export default function TaskListView({ 
  tasks, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onSendWA, 
  isSendingWA 
}) {
  const [search, setSearch] = useState('');
  const [filterQuadrant, setFilterQuadrant] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'dueDate' | 'urgency' | 'importance'

  // Filter & Search Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.category && task.category.toLowerCase().includes(search.toLowerCase())) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

    const matchesQuadrant = filterQuadrant === 'ALL' || task.quadrant === filterQuadrant;
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;

    return matchesSearch && matchesQuadrant && matchesStatus;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'score') {
      return b.priorityScore - a.priorityScore;
    }
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'urgency') {
      return b.urgency - a.urgency;
    }
    if (sortBy === 'importance') {
      return b.importance - a.importance;
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      
      {/* Controls: Search, Filter, Sort */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kegiatan, proyek, atau kategori..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quadrant Filter */}
          <select
            value={filterQuadrant}
            onChange={(e) => setFilterQuadrant(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Kuadran</option>
            <option value="Q1">Q1: Mendesak & Penting</option>
            <option value="Q2">Q2: Penting (Jadwalkan)</option>
            <option value="Q3">Q3: Mendesak (Delegasikan)</option>
            <option value="Q4">Q4: Eliminasi</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Selesai</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-indigo-300 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="score">⚡ Skor Prioritas Tertinggi</option>
            <option value="dueDate">⏰ Deadline Terdekat</option>
            <option value="urgency">🔥 Urgensi Tertinggi</option>
            <option value="importance">⭐ Kepentingan Tertinggi</option>
          </select>

        </div>

      </div>

      {/* Task Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Menampilkan <strong>{sortedTasks.length}</strong> kegiatan</span>
        <span>Diurutkan berdasarkan <strong>{sortBy === 'score' ? 'Smart Priority Score' : sortBy}</strong></span>
      </div>

      {/* Task Grid / Cards */}
      {sortedTasks.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">Tidak ada kegiatan yang sesuai filter</h4>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onSendWA={onSendWA}
              isSendingWA={isSendingWA}
            />
          ))}
        </div>
      )}

    </div>
  );
}
