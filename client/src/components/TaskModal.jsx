import React, { useState, useEffect } from 'react';
import { X, Flame, Star, Clock, Bell, Sparkles, AlertCircle } from 'lucide-react';
import { QUADRANTS, getQuadrantKey, calculateDynamicScore } from '../utils/priority';

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialTask = null,
  prefillQuadrant = null
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Proyek');
  const [urgency, setUrgency] = useState(3);       // 1 - 5
  const [importance, setImportance] = useState(3); // 1 - 5
  const [dueDate, setDueDate] = useState('');
  const [waReminderEnabled, setWaReminderEnabled] = useState(true);
  const [status, setStatus] = useState('todo');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setCategory(initialTask.category || 'Proyek');
      setUrgency(initialTask.urgency || 3);
      setImportance(initialTask.importance || 3);
      setDueDate(initialTask.dueDate ? initialTask.dueDate.slice(0, 16) : '');
      setWaReminderEnabled(initialTask.waReminderEnabled ?? true);
      setStatus(initialTask.status || 'todo');
    } else {
      // Default reset
      setTitle('');
      setDescription('');
      setCategory('Proyek');
      setDueDate('');
      setWaReminderEnabled(true);
      setStatus('todo');

      // If user clicked "+ Tambah ke Kuadran X"
      if (prefillQuadrant === 'Q1') {
        setUrgency(5);
        setImportance(5);
      } else if (prefillQuadrant === 'Q2') {
        setUrgency(2);
        setImportance(5);
      } else if (prefillQuadrant === 'Q3') {
        setUrgency(4);
        setImportance(2);
      } else if (prefillQuadrant === 'Q4') {
        setUrgency(1);
        setImportance(1);
      } else {
        setUrgency(3);
        setImportance(3);
      }
    }
    setError('');
  }, [initialTask, prefillQuadrant, isOpen]);

  if (!isOpen) return null;

  // Real-time Preview Quadrant & Score
  const currentQKey = getQuadrantKey(urgency, importance);
  const currentQData = QUADRANTS[currentQKey];
  const dynamicScore = calculateDynamicScore(urgency, importance, dueDate, status);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul kegiatan/proyek tidak boleh kosong!');
      return;
    }

    onSave({
      ...(initialTask ? { id: initialTask.id } : {}),
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      urgency: Number(urgency),
      importance: Number(importance),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      waReminderEnabled,
      status
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h3 className="text-base font-bold text-white">
              {initialTask ? 'Edit Kegiatan / Proyek' : 'Tambah Kegiatan Baru'}
            </h3>
            <p className="text-xs text-slate-400">
              Tentukan tingkat urgensi & dampaknya untuk penempatan prioritas otomatis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Judul Kegiatan / Proyek <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Selesaikan Skripsi Bab 4, Siapkan Pitch Deck Klien, dll."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kategori / Proyek
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Kerja, Kuliah, Pribadi, dll."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Status Pelaksanaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="todo">Belum Dikerjakan (To Do)</option>
                <option value="in_progress">Sedang Dikerjakan (In Progress)</option>
                <option value="done">Selesai (Completed)</option>
              </select>
            </div>
          </div>

          {/* Sliders Urgency & Importance with Live Quadrant Preview */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
            
            {/* Live Quadrant Preview Pill */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-400">Analisis Penempatan:</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${currentQData.tagBg}`}>
                  {currentQData.name.split(':')[0]} ({currentQData.badge})
                </span>
                <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  Skor: {dynamicScore}
                </span>
              </div>
            </div>

            {/* Urgency Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  Tingkat Urgensi (Batas Waktu / Tenggat)
                </span>
                <span className="font-bold text-red-400">{urgency} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={urgency}
                onChange={(e) => setUrgency(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>1: Sangat Santai / Kapan Saja</span>
                <span>3: Sedang</span>
                <span>5: Kritis / Harus Hari Ini</span>
              </div>
            </div>

            {/* Importance Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  Tingkat Kepentingan (Dampak Jangka Panjang)
                </span>
                <span className="font-bold text-amber-400">{importance} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={importance}
                onChange={(e) => setImportance(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>1: Dampak Kecil / Rutinitas</span>
                <span>3: Cukup Berdampak</span>
                <span>5: Berdampak Sangat Besar</span>
              </div>
            </div>

          </div>

          {/* Deadline Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tenggat Waktu (Deadline)
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Sistem akan otomatis menaikkan skor prioritas jika mendekati tenggat waktu.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deskripsi & Catatan
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail kegiatan, link referensi, atau instruksi langkah kerja..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* WhatsApp Reminder Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <input
              type="checkbox"
              id="waReminder"
              checked={waReminderEnabled}
              onChange={(e) => setWaReminderEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500"
            />
            <label htmlFor="waReminder" className="text-xs text-slate-300 cursor-pointer">
              <span className="font-semibold text-emerald-400">Kirim Pengingat Otomatis ke WhatsApp</span>
              <span className="block text-[10px] text-slate-400">
                Pesan akan dikirim otomatis saat mendekati deadline dan dirangkum dalam Daily Digest.
              </span>
            </label>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              {initialTask ? 'Simpan Perubahan' : 'Buat Kegiatan'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
