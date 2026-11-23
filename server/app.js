const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { readDb, writeDb, loadFromMongoIfAvailable } = require('./db');
const { sendWhatsAppMessage, formatTaskMessage } = require('./services/whatsapp');
const { sendDailyDigest, checkDeadlines } = require('./services/scheduler');

const app = express();

app.use(cors());
app.use(express.json());

// Middleware untuk memastikan data termutakhir dari MongoDB jika tersedia
app.use(async (req, res, next) => {
  if (process.env.MONGODB_URI) {
    try {
      await loadFromMongoIfAvailable();
    } catch (e) {}
  }
  next();
});

// Helper untuk kalkulasi skor prioritas pintar
function computeTaskPriority(task) {
  let score = (task.importance * 12) + (task.urgency * 8);

  let quadrant = 'Q4';
  if (task.urgency >= 3 && task.importance >= 3) {
    quadrant = 'Q1';
  } else if (task.urgency < 3 && task.importance >= 3) {
    quadrant = 'Q2';
  } else if (task.urgency >= 3 && task.importance < 3) {
    quadrant = 'Q3';
  } else {
    quadrant = 'Q4';
  }

  let deadlineStatus = 'none';
  if (task.dueDate && task.status !== 'done') {
    const now = Date.now();
    const due = new Date(task.dueDate).getTime();
    const diffHours = (due - now) / (3600 * 1000);

    if (diffHours < 0) {
      deadlineStatus = 'overdue';
      score += 15;
    } else if (diffHours <= 24) {
      deadlineStatus = 'due_soon';
      score += 10;
    } else if (diffHours <= 72) {
      deadlineStatus = 'due_3days';
      score += 5;
    }
  }

  score = Math.min(100, Math.max(0, score));

  return {
    ...task,
    priorityScore: score,
    quadrant,
    deadlineStatus
  };
}

// 1. Health check & Cron Trigger Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/cron/check', async (req, res) => {
  try {
    await checkDeadlines();
    res.json({ success: true, message: 'Deadline check executed successfully', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/cron/digest', async (req, res) => {
  try {
    const result = await sendDailyDigest(true);
    res.json({ success: true, result, message: 'Daily digest sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get all tasks
app.get('/api/tasks', (req, res) => {
  const db = readDb();
  const tasksWithPriority = db.tasks.map(computeTaskPriority);
  tasksWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);
  
  res.json({
    tasks: tasksWithPriority,
    summary: {
      total: tasksWithPriority.length,
      q1Count: tasksWithPriority.filter(t => t.quadrant === 'Q1' && t.status !== 'done').length,
      q2Count: tasksWithPriority.filter(t => t.quadrant === 'Q2' && t.status !== 'done').length,
      q3Count: tasksWithPriority.filter(t => t.quadrant === 'Q3' && t.status !== 'done').length,
      q4Count: tasksWithPriority.filter(t => t.quadrant === 'Q4' && t.status !== 'done').length,
      completedCount: tasksWithPriority.filter(t => t.status === 'done').length,
      overdueCount: tasksWithPriority.filter(t => t.deadlineStatus === 'overdue').length
    }
  });
});

// 3. Create task
app.post('/api/tasks', (req, res) => {
  const { title, description, category, urgency, importance, dueDate, waReminderEnabled, status } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Judul tugas wajib diisi.' });
  }

  const db = readDb();
  const newTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    category: category ? category.trim() : 'Umum',
    urgency: Number(urgency) || 3,
    importance: Number(importance) || 3,
    status: status || 'todo',
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    waReminderEnabled: Boolean(waReminderEnabled),
    lastNotifiedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.tasks.unshift(newTask);
  writeDb(db);

  const computed = computeTaskPriority(newTask);
  res.status(201).json({ task: computed, message: 'Tugas berhasil ditambahkan!' });
});

// 4. Update task
app.put('/api/tasks/:id', (req, res) => {
  const db = readDb();
  const index = db.tasks.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
  }

  const existing = db.tasks[index];
  const updated = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.tasks[index] = updated;
  writeDb(db);

  res.json({ task: computeTaskPriority(updated), message: 'Tugas berhasil diperbarui!' });
});

// 5. Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const db = readDb();
  const index = db.tasks.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
  }

  const deleted = db.tasks.splice(index, 1)[0];
  writeDb(db);

  res.json({ success: true, deleted, message: 'Tugas berhasil dihapus.' });
});

// 6. Get settings
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json({ settings: db.settings });
});

// 7. Update settings
app.post('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = {
    ...db.settings,
    whatsapp: {
      ...db.settings.whatsapp,
      ...(req.body.whatsapp || {})
    }
  };
  writeDb(db);

  res.json({ settings: db.settings, message: 'Pengaturan WhatsApp berhasil disimpan!' });
});

// 8. Test kirim WhatsApp
app.post('/api/notifications/test', async (req, res) => {
  const { provider, phoneNumber, apiKey } = req.body;

  const testMessage = `🤖 *[PRIORITASK - TES NOTIFIKASI]*\n\n` +
    `Halo! Jika kamu membaca pesan ini, berarti konfigurasi pengingat WhatsApp di sistem *Prioritas Tugas* sudah BERHASIL terhubung dengan sempurna! 🚀\n\n` +
    `⏰ Waktu Tes: ${new Date().toLocaleString('id-ID')} WIB\n\n` +
    `_Kamu akan menerima pengingat otomatis untuk tugas-tugas prioritasmu!_ ✨`;

  try {
    const result = await sendWhatsAppMessage({
      provider: provider || 'callmebot',
      phoneNumber,
      apiKey,
      message: testMessage
    });

    res.json({ success: true, result, message: 'Pesan tes berhasil dikirim ke WhatsApp!' });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.response?.data?.message || err.message || 'Gagal mengirim pesan WhatsApp.' 
    });
  }
});

// 9. Manual trigger send Daily Digest
app.post('/api/notifications/send-digest', async (req, res) => {
  try {
    const result = await sendDailyDigest(true);
    res.json({ success: true, result, message: 'Daily Digest berhasil dikirim ke WhatsApp!' });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.response?.data?.message || err.message || 'Gagal mengirim Daily Digest.' 
    });
  }
});

// 10. Manual send notification for a single task
app.post('/api/tasks/:id/notify', async (req, res) => {
  const db = readDb();
  const task = db.tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
  }

  const settings = db.settings.whatsapp;
  if (!settings.phoneNumber) {
    return res.status(400).json({ error: 'Nomor WhatsApp belum dikonfigurasi di Pengaturan.' });
  }

  try {
    const message = formatTaskMessage(task, 'PENGINGAT PRIBADI');
    const result = await sendWhatsAppMessage({
      provider: settings.provider,
      phoneNumber: settings.phoneNumber,
      apiKey: settings.apiKey,
      message
    });

    task.lastNotifiedAt = new Date().toISOString();
    writeDb(db);

    res.json({ success: true, result, message: `Pengingat tugas "${task.title}" berhasil dikirim ke WhatsApp!` });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.response?.data?.message || err.message || 'Gagal mengirim pesan tugas.' 
    });
  }
});

// 11. Get notification history
app.get('/api/notifications/history', (req, res) => {
  const db = readDb();
  res.json({ history: db.notificationHistory || [] });
});

module.exports = app;
