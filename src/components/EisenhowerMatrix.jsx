import React from 'react';
import { QUADRANTS } from '../utils/priority';
import TaskCard from './TaskCard';
import { Plus, Flame, Calendar, Share2, Trash2 } from 'lucide-react';

const quadrantIcons = {
  Q1: Flame,
  Q2: Calendar,
  Q3: Share2,
  Q4: Trash2,
};

export default function EisenhowerMatrix({ 
  tasks, 
  onAddTaskToQuadrant, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onSendWA, 
  isSendingWA 
}) {
  const getTasksByQuadrant = (quadrantKey) => {
    return tasks.filter(t => t.quadrant === quadrantKey);
  };

  return (
    <div className="space-y-4">
      {/* Visual Header Guide */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Matriks Keputusan Eisenhower</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Membagi kegiatan berdasarkan <strong>Urgensi</strong> (waktu & deadline) dan <strong>Dampak/Kepentingan</strong> (nilai jangka panjang).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Q1: Lakukan Segera
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Q2: Jadwalkan
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Q3: Delegasikan
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/30 border border-slate-600/30 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span> Q4: Eliminasi
          </span>
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {Object.entries(QUADRANTS).map(([qKey, qData]) => {
          const Icon = quadrantIcons[qKey];
          const quadrantTasks = getTasksByQuadrant(qKey);
          const activeTasks = quadrantTasks.filter(t => t.status !== 'done');
          const doneTasks = quadrantTasks.filter(t => t.status === 'done');

          return (
            <div 
              key={qKey}
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col bg-gradient-to-b ${qData.color} backdrop-blur shadow-sm`}
            >
              {/* Header Quadrant */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-start gap-2.5">
                  <div className={`p-2 rounded-xl ${qData.headerBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{qData.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${qData.tagBg}`}>
                        {activeTasks.length} aktif
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                      {qData.description}
                    </p>
                  </div>
                </div>

                {/* Quick Add to this quadrant */}
                <button
                  onClick={() => onAddTaskToQuadrant(qKey)}
                  title={`Tambah tugas ke ${qData.name}`}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
                {quadrantTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl text-center p-4">
                    <p className="text-xs text-slate-500">Belum ada tugas di kuadran ini.</p>
                    <button
                      onClick={() => onAddTaskToQuadrant(qKey)}
                      className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      + Tambah Tugas
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Active Tasks First */}
                    {activeTasks.map(task => (
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

                    {/* Done Tasks Collapsible/Subdued */}
                    {doneTasks.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[11px] font-medium text-slate-500 mb-2">
                          Selesai ({doneTasks.length})
                        </div>
                        <div className="space-y-2">
                          {doneTasks.map(task => (
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
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
