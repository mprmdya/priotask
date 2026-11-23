import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import KanbanBoard from './components/KanbanBoard';
import TaskListView from './components/TaskListView';
import TaskModal from './components/TaskModal';
import SettingsModal from './components/SettingsModal';
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  fetchSettings, 
  syncDataToServer,
  sendDailyDigestNow, 
  sendTaskNotificationNow 
} from './api/client';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const STORAGE_TASKS_KEY = 'priotask_local_tasks_v1';
const STORAGE_SETTINGS_KEY = 'priotask_local_settings_v1';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('matrix');

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [prefillQuadrant, setPrefillQuadrant] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Loading actions
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const [sendingWAId, setSendingWAId] = useState(null);

  // Toast alert
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Helper untuk hitung summary dari tasks
  const computeSummary = (taskList) => {
    return {
      total: taskList.length,
      q1Count: taskList.filter(t => t.quadrant === 'Q1' && t.status !== 'done').length,
      q2Count: taskList.filter(t => t.quadrant === 'Q2' && t.status !== 'done').length,
      q3Count: taskList.filter(t => t.quadrant === 'Q3' && t.status !== 'done').length,
      q4Count: taskList.filter(t => t.quadrant === 'Q4' && t.status !== 'done').length,
      completedCount: taskList.filter(t => t.status === 'done').length,
      overdueCount: taskList.filter(t => t.deadlineStatus === 'overdue').length
    };
  };

  // Load initial data (LocalStorage First -> Server Sync)
  const loadData = async () => {
    try {
      // 1. Baca dari localStorage terlebih dahulu (agar tidak ada data yang hilang saat refresh)
      const localTasksRaw = localStorage.getItem(STORAGE_TASKS_KEY);
      const localSettingsRaw = localStorage.getItem(STORAGE_SETTINGS_KEY);
      let localTasks = null;
      let localSettings = null;

      if (localTasksRaw) {
        try {
          localTasks = JSON.parse(localTasksRaw);
          if (Array.isArray(localTasks) && localTasks.length > 0) {
            setTasks(localTasks);
            setSummary(computeSummary(localTasks));
            setLoading(false); // Langsung render agar instan!
          }
        } catch (e) {}
      }

      if (localSettingsRaw) {
        try {
          localSettings = JSON.parse(localSettingsRaw);
          setSettings(localSettings);
        } catch (e) {}
      }

      // 2. Ambil dari server API
      const [tasksRes, settingsRes] = await Promise.all([
        fetchTasks().catch(() => null),
        fetchSettings().catch(() => null)
      ]);

      const serverTasks = tasksRes?.tasks || [];
      const serverSettings = settingsRes?.settings || null;

      // Jika ada data lokal, sinkronkan ke serverless backend agar cron WA tetap punya data terbaru
      if (localTasks && localTasks.length > 0) {
        await syncDataToServer({
          tasks: localTasks,
          settings: localSettings || serverSettings
        }).catch(() => {});
      } else if (serverTasks.length > 0) {
        setTasks(serverTasks);
        setSummary(tasksRes.summary);
        localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(serverTasks));
      }

      if (serverSettings && !localSettings) {
        setSettings(serverSettings);
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(serverSettings));
      }
    } catch (err) {
      console.error('Error memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers dengan persistensi ganda (LocalStorage + Server)
  const handleSaveTask = async (taskData) => {
    try {
      let savedTask = null;
      if (taskData.id) {
        const res = await updateTask(taskData.id, taskData);
        savedTask = res.task;
        showToast('Tugas berhasil diperbarui!');
      } else {
        const res = await createTask(taskData);
        savedTask = res.task;
        showToast('Tugas baru berhasil ditambahkan!');
      }

      // Update state & LocalStorage seketika
      setTasks(prevTasks => {
        let next;
        if (taskData.id) {
          next = prevTasks.map(t => t.id === taskData.id ? { ...t, ...savedTask } : t);
        } else {
          next = [savedTask, ...prevTasks];
        }
        localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(next));
        setSummary(computeSummary(next));
        return next;
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kegiatan ini?')) return;
    try {
      await deleteTask(id);
      setTasks(prevTasks => {
        const next = prevTasks.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(next));
        setSummary(computeSummary(next));
        return next;
      });
      showToast('Tugas berhasil dihapus.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleStatus = async (id, nextStatus) => {
    try {
      const res = await updateTask(id, { status: nextStatus });
      setTasks(prevTasks => {
        const next = prevTasks.map(t => t.id === id ? { ...t, ...res.task, status: nextStatus } : t);
        localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(next));
        setSummary(computeSummary(next));
        return next;
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSendDigest = async () => {
    setIsSendingDigest(true);
    try {
      await sendDailyDigestNow();
      showToast('Ringkasan tugas harian berhasil dikirim ke WhatsApp!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSendingDigest(false);
    }
  };

  const handleSendTaskWA = async (taskId) => {
    setSendingWAId(taskId);
    try {
      await sendTaskNotificationNow(taskId);
      showToast('Detail pengingat tugas berhasil dikirim ke WhatsApp!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSendingWAId(null);
    }
  };

  const handleAddTaskToQuadrant = (quadrantKey) => {
    setEditingTask(null);
    setPrefillQuadrant(quadrantKey);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification Pop-up */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-medium animate-slide-up backdrop-blur-md ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' 
            : 'bg-red-950/90 border-red-500/40 text-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        settings={settings}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenNewTask={() => {
          setEditingTask(null);
          setPrefillQuadrant(null);
          setIsTaskModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onSendDigest={handleSendDigest}
        isSendingDigest={isSendingDigest}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Statistics Banner */}
        <StatsOverview summary={summary} tasks={tasks} />

        {/* View Content */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs">Memuat data prioritas kegiatan...</p>
          </div>
        ) : (
          <>
            {currentView === 'matrix' && (
              <EisenhowerMatrix
                tasks={tasks}
                onAddTaskToQuadrant={handleAddTaskToQuadrant}
                onEdit={(task) => {
                  setEditingTask(task);
                  setPrefillQuadrant(null);
                  setIsTaskModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onToggleStatus={handleToggleStatus}
                onSendWA={handleSendTaskWA}
                isSendingWA={Boolean(sendingWAId)}
              />
            )}

            {currentView === 'kanban' && (
              <KanbanBoard
                tasks={tasks}
                onAddTask={() => {
                  setEditingTask(null);
                  setPrefillQuadrant(null);
                  setIsTaskModalOpen(true);
                }}
                onEdit={(task) => {
                  setEditingTask(task);
                  setPrefillQuadrant(null);
                  setIsTaskModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onToggleStatus={handleToggleStatus}
                onSendWA={handleSendTaskWA}
                isSendingWA={Boolean(sendingWAId)}
              />
            )}

            {currentView === 'list' && (
              <TaskListView
                tasks={tasks}
                onEdit={(task) => {
                  setEditingTask(task);
                  setPrefillQuadrant(null);
                  setIsTaskModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onToggleStatus={handleToggleStatus}
                onSendWA={handleSendTaskWA}
                isSendingWA={Boolean(sendingWAId)}
              />
            )}
          </>
        )}

      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>
          Prioritask © {new Date().getFullYear()} — Prioritas Berdasarkan Matriks Eisenhower & Dynamic Urgency Boost
        </p>
      </footer>

      {/* Task Add/Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        prefillQuadrant={prefillQuadrant}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsUpdated={(newSettings) => {
          setSettings(newSettings);
          localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));
        }}
      />

    </div>
  );
}
