const cron = require('node-cron');
const { readDb, writeDb } = require('../db');
const { 
  formatTaskMessage, 
  formatDailyDigestMessage, 
  sendWhatsAppMessage 
} = require('./whatsapp');

let lastDigestDate = null;

/**
 * Cek tenggat waktu tugas yang mendekati deadline
 */
async function checkDeadlines() {
  const db = readDb();
  const settings = db.settings.whatsapp;
  if (!settings.enabled || !settings.phoneNumber) {
    return;
  }

  const now = new Date();
  const hoursThreshold = settings.deadlineReminderHoursBefore || 3;
  const targetThresholdMs = hoursThreshold * 3600 * 1000;

  let updated = false;

  for (const task of db.tasks) {
    if (task.status === 'done' || !task.waReminderEnabled || !task.dueDate) {
      continue;
    }

    const dueTime = new Date(task.dueDate).getTime();
    const timeDiff = dueTime - now.getTime();

    // Jika deadline mendekati (antara 0 hingga threshold jam) dan belum pernah dinotifikasi dalam 12 jam terakhir
    if (timeDiff > 0 && timeDiff <= targetThresholdMs) {
      const lastNotified = task.lastNotifiedAt ? new Date(task.lastNotifiedAt).getTime() : 0;
      const twelveHoursMs = 12 * 3600 * 1000;

      if (now.getTime() - lastNotified > twelveHoursMs) {
        console.log(`[SCHEDULER] Mengirim notifikasi deadline mendekati untuk task: "${task.title}"`);
        try {
          const message = formatTaskMessage(task, `DEADLINE MENDEKATI (${Math.ceil(timeDiff / (3600 * 1000))} JAM LAGI)`);
          await sendWhatsAppMessage({
            provider: settings.provider,
            phoneNumber: settings.phoneNumber,
            apiKey: settings.apiKey,
            message
          });

          task.lastNotifiedAt = now.toISOString();
          updated = true;
        } catch (err) {
          console.error(`[SCHEDULER] Gagal mengirim WA reminder untuk task ${task.id}:`, err.message);
        }
      }
    }
  }

  if (updated) {
    writeDb(db);
  }
}

/**
 * Kirim ringkasan harian (Daily Digest)
 */
async function sendDailyDigest(force = false) {
  const db = readDb();
  const settings = db.settings.whatsapp;
  if (!force && (!settings.enabled || !settings.dailyDigestEnabled || !settings.phoneNumber)) {
    return { success: false, reason: 'Pengaturan WhatsApp atau Daily Digest belum aktif.' };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (!force && lastDigestDate === todayStr) {
    return { success: false, reason: 'Daily digest hari ini sudah dikirim.' };
  }

  // Filter tugas Q1 dan Q2 yang belum selesai
  const activeTasks = db.tasks.filter(t => t.status !== 'done');
  const q1Tasks = activeTasks.filter(t => t.urgency >= 3 && t.importance >= 3);
  const q2Tasks = activeTasks.filter(t => t.urgency < 3 && t.importance >= 3);

  const message = formatDailyDigestMessage(q1Tasks, q2Tasks);

  console.log(`[SCHEDULER] Mengirim Daily Digest ke WhatsApp ${settings.phoneNumber}...`);
  try {
    const result = await sendWhatsAppMessage({
      provider: settings.provider,
      phoneNumber: settings.phoneNumber,
      apiKey: settings.apiKey,
      message
    });

    lastDigestDate = todayStr;
    return { success: true, result };
  } catch (err) {
    console.error(`[SCHEDULER] Gagal mengirim Daily Digest:`, err.message);
    throw err;
  }
}

/**
 * Inisialisasi cron scheduler
 */
function initScheduler() {
  console.log('🕒 Scheduler otomatis berjalan:');
  console.log('  - Pengecekan deadline: Setiap 10 menit');
  console.log('  - Pengecekan Daily Digest: Setiap menit memeriksa waktu konfigurasi');

  // Cek deadline setiap 10 menit: */10 * * * *
  cron.schedule('*/10 * * * *', () => {
    checkDeadlines().catch(err => console.error('[SCHEDULER] Error checkDeadlines:', err.message));
  });

  // Cek waktu Daily Digest setiap menit
  cron.schedule('* * * * *', () => {
    const db = readDb();
    const settings = db.settings.whatsapp;
    if (!settings.enabled || !settings.dailyDigestEnabled) return;

    const [targetHour, targetMinute] = (settings.dailyDigestTime || '07:30').split(':').map(Number);
    const now = new Date();
    
    // Periksa jam lokal
    if (now.getHours() === targetHour && now.getMinutes() === targetMinute) {
      sendDailyDigest().catch(err => console.error('[SCHEDULER] Error auto daily digest:', err.message));
    }
  });
}

module.exports = {
  initScheduler,
  checkDeadlines,
  sendDailyDigest
};
