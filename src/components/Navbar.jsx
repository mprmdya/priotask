import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  Send, 
  Sliders, 
  Calendar,
  CheckCircle,
  BellRing
} from 'lucide-react';

export default function Navbar({ 
  onOpenNewTask, 
  onOpenSettings, 
  onSendDigest, 
  isSendingDigest,
  settings,
  currentView,
  setCurrentView
}) {
  const isWaActive = settings?.whatsapp?.enabled && settings?.whatsapp?.phoneNumber;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Judul */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Prioritask</h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  Smart Matrix
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Prioritas Urgensi & Dampak + Pengingat WhatsApp
              </p>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <button
              onClick={() => setCurrentView('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'matrix' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Matriks Eisenhower
            </button>
            <button
              onClick={() => setCurrentView('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'kanban' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'list' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daftar Prioritas
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Trigger WhatsApp Digest */}
            <button
              onClick={onSendDigest}
              disabled={isSendingDigest}
              title="Kirim ringkasan tugas prioritas sekarang ke WhatsApp"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingDigest ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">Kirim Digest WA</span>
            </button>

            {/* WA Settings Modal Trigger */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                isWaActive
                  ? 'bg-slate-800/80 text-emerald-400 border-emerald-500/30 hover:bg-slate-800'
                  : 'bg-slate-800/80 text-amber-300 border-amber-500/30 hover:bg-slate-800 animate-pulse'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isWaActive ? 'WA Terhubung' : 'Setup WA'}
              </span>
            </button>

            {/* Tambah Tugas Baru */}
            <button
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/25 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tugas Baru</span>
            </button>

          </div>

        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80">
          <button
            onClick={() => setCurrentView('matrix')}
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              currentView === 'matrix' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Matriks (2x2)
          </button>
          <button
            onClick={() => setCurrentView('kanban')}
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              currentView === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setCurrentView('list')}
            className={`px-3 py-1 text-xs font-medium rounded-lg ${
              currentView === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Daftar Skor
          </button>
        </div>

      </div>
    </header>
  );
}
