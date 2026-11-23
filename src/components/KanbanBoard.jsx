import React from 'react';
import TaskCard from './TaskCard';
import { Plus, ListTodo, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function KanbanBoard({ 
  tasks, 
  onAddTask, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onSendWA, 
  isSendingWA 
}) {
  const columns = [
    {
      id: 'todo',
      title: 'Belum Dikerjakan (To Do)',
      icon: ListTodo,
      color: 'border-slate-800 bg-slate-900/40',
      badgeColor: 'bg-slate-800 text-slate-300',
      tasks: tasks.filter(t => t.status === 'todo')
    },
    {
      id: 'in_progress',
      title: 'Sedang Berjalan (In Progress)',
      icon: PlayCircle,
      color: 'border-indigo-900/40 bg-indigo-950/10',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      tasks: tasks.filter(t => t.status === 'in_progress')
    },
    {
      id: 'done',
      title: 'Selesai (Completed)',
      icon: CheckCircle2,
      color: 'border-emerald-900/40 bg-emerald-950/10',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      tasks: tasks.filter(t => t.status === 'done')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map(col => {
        const Icon = col.icon;
        return (
          <div 
            key={col.id} 
            className={`rounded-2xl border p-4 flex flex-col min-h-[600px] ${col.color}`}
          >
            {/* Header Kolom */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-white">{col.title}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                  {col.tasks.length}
                </span>
              </div>
              {col.id === 'todo' && (
                <button
                  onClick={onAddTask}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Tambah tugas ke To Do"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* List Tugas */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {col.tasks.length === 0 ? (
                <div className="h-40 flex items-center justify-center border border-dashed border-slate-800/80 rounded-xl text-center text-xs text-slate-500">
                  Tidak ada tugas di kolom ini.
                </div>
              ) : (
                col.tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onSendWA={onSendWA}
                    isSendingWA={isSendingWA}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
