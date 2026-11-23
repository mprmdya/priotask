import React from 'react';
import { 
  Flame, 
  Star, 
  Clock, 
  Send, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Circle, 
  PlayCircle,
  Tag,
  Bell
} from 'lucide-react';
import { formatRelativeDueDate } from '../utils/priority';

export default function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onSendWA, 
  isSendingWA 
}) {
  const isDone = task.status === 'done';
  const isInProgress = task.status === 'in_progress';
  const dueInfo = formatRelativeDueDate(task.dueDate);

  // Status Badge
  let statusBadge = { label: 'To Do', color: 'bg-slate-700 text-slate-300' };
  if (isInProgress) {
    statusBadge = { label: 'Sedang Berjalan', color: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' };
  } else if (isDone) {
    statusBadge = { label: 'Selesai', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' };
  }

  // Due date badge color
  let dueColor = 'text-slate-400 bg-slate-800/80 border-slate-700/60';
  if (dueInfo.status === 'overdue') {
    dueColor = 'text-red-300 bg-red-950/50 border-red-500/40 animate-pulse font-semibold';
  } else if (dueInfo.status === 'critical' || dueInfo.status === 'urgent') {
    dueColor = 'text-amber-300 bg-amber-950/50 border-amber-500/40 font-semibold';
  }

  return (
    <div className={`group relative rounded-xl p-4 transition-all duration-200 border bg-slate-900/90 hover:bg-slate-800/90 hover:shadow-lg ${
      isDone ? 'opacity-60 border-slate-800' : 'border-slate-800/90 hover:border-slate-700'
    }`}>
      
      {/* Top Header: Category & Priority Score Pill */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
            {task.category || 'Umum'}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusBadge.color}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Priority Score Meter */}
        <div className="flex items-center gap-1.5">
          <div className="text-right">
            <span className="text-[11px] font-bold text-white tracking-wider">
              {task.priorityScore}
            </span>
            <span className="text-[9px] text-slate-400">/100</span>
          </div>
          <div className="w-10 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                task.priorityScore >= 75 ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                task.priorityScore >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-600' :
                task.priorityScore >= 30 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                'bg-slate-600'
              }`}
              style={{ width: `${task.priorityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Title & Status checkbox */}
      <div className="flex items-start gap-2.5 mb-2">
        <button
          onClick={() => {
            const nextStatus = isDone ? 'todo' : isInProgress ? 'done' : 'in_progress';
            onToggleStatus(task.id, nextStatus);
          }}
          className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors flex-shrink-0"
          title={`Status: ${task.status}. Klik untuk ubah.`}
        >
          {isDone ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : isInProgress ? (
            <PlayCircle className="w-5 h-5 text-indigo-400" />
          ) : (
            <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold tracking-tight leading-snug break-words ${
            isDone ? 'line-through text-slate-500' : 'text-slate-100 group-hover:text-white'
          }`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Ratings: Urgency (Flames) & Importance (Stars) */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 py-1.5 mb-2 border-t border-b border-slate-800/80">
        
        {/* Urgency */}
        <div className="flex items-center gap-1" title={`Urgensi: ${task.urgency}/5`}>
          <Flame className={`w-3.5 h-3.5 ${task.urgency >= 4 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="text-[11px] font-medium text-slate-300">U:{task.urgency}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <span key={lvl} className={`text-[10px] ${lvl <= task.urgency ? 'text-red-400' : 'text-slate-700'}`}>
                ●
              </span>
            ))}
          </div>
        </div>

        {/* Importance */}
        <div className="flex items-center gap-1" title={`Dampak/Kepentingan: ${task.importance}/5`}>
          <Star className={`w-3.5 h-3.5 ${task.importance >= 4 ? 'text-amber-400 fill-amber-400/30' : 'text-slate-400'}`} />
          <span className="text-[11px] font-medium text-slate-300">K:{task.importance}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <span key={lvl} className={`text-[10px] ${lvl <= task.importance ? 'text-amber-400' : 'text-slate-700'}`}>
                ●
              </span>
            ))}
          </div>
        </div>

        {/* WA Reminder Badge */}
        {task.waReminderEnabled && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400/90 ml-auto bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20" title="Pengingat WA Aktif">
            <Bell className="w-3 h-3 text-emerald-400" />
            <span>WA Auto</span>
          </span>
        )}
      </div>

      {/* Footer: Due date & Actions */}
      <div className="flex items-center justify-between pt-1">
        
        {/* Due date */}
        <div className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${dueColor}`}>
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-[140px] sm:max-w-[190px]">{dueInfo.text}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          
          {/* Kirim notifikasi WA untuk task ini */}
          <button
            onClick={() => onSendWA(task.id)}
            disabled={isSendingWA}
            title="Kirim detail tugas ini sekarang ke WhatsApp kamu"
            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(task)}
            title="Edit tugas"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(task.id)}
            title="Hapus tugas"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

    </div>
  );
}
