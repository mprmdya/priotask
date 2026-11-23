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
  sendDailyDigestNow, 
  sendTaskNotificationNow 
} from './api/client';
import { CheckCircle, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('matrix'); // 'matrix' | 'kanban' | 'list'

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

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, settingsRes] = await Promise.all([
        fetchTasks(),
        fetchSettings()
      ]);
      setTasks(tasksRes.tasks || []);
      setSummary(tasksRes.summary || null);
      setSettings(settingsRes.settings || null);
    } catch (err) {
      console.error('Error memuat data:', err);
      showToast('Gagal memuat data dari server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        await updateTask(taskData.id, taskData);
        showToast('Tugas berhasil diperbarui!');
      } else {
        await createTask(taskData);
        showToast('Tugas baru berhasil ditambahkan!');
      }
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kegiatan ini?')) return;
    try {
      await deleteTask(id);
      showToast('Tugas berhasil dihapus.');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleStatus = async (id, nextStatus) => {
    try {
      await updateTask(id, { status: nextStatus });
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSendDigest = async () => {
    setIsSendingDigest(true);
    try {
      const res = await sendDailyDigestNow();
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
      const res = await sendTaskNotificationNow(taskId);
      showToast('Detail pengingat tugas berhasil dikirim ke WhatsApp!');
      await loadData();
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
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
      />

    </div>
  );
}
