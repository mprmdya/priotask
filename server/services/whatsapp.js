const axios = require('axios');
const { readDb, writeDb } = require('../db');

/**
 * Format teks untuk WhatsApp
 */
function formatTaskMessage(task, alertType = 'PENGINGAT TUGAS') {
  const urgencyStars = '🔥'.repeat(task.urgency) + '⚪'.repeat(Math.max(0, 5 - task.urgency));
  const importanceStars = '⭐'.repeat(task.importance) + '⚪'.repeat(Math.max(0, 5 - task.importance));
  
  const dueDateStr = task.dueDate 
    ? new Date(task.dueDate).toLocaleString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) + ' WIB'
    : 'Tidak ada deadline spesifik';

  let quadrantLabel = '';
  if (task.urgency >= 3 && task.importance >= 3) {
    quadrantLabel = '🚨 Kuadran 1: LAKUKAN SEGERA (Do First)';
  } else if (task.urgency < 3 && task.importance >= 3) {
    quadrantLabel = '📅 Kuadran 2: JADWALKAN (Schedule)';
  } else if (task.urgency >= 3 && task.importance < 3) {
    quadrantLabel = '⚡ Kuadran 3: DELEGASIKAN / CEPATKAN (Delegate)';
  } else {
    quadrantLabel = '🗑️ Kuadran 4: ELIMINASI (Eliminate)';
  }

  return `🔔 *[PRIORITASK - ${alertType}]*

📌 *Judul:* ${task.title}
🏷️ *Kategori:* ${task.category || 'Umum'}
📊 *Prioritas:* ${quadrantLabel}

⚡ *Urgensi:* ${urgencyStars} (${task.urgency}/5)
⭐ *Kepentingan:* ${importanceStars} (${task.importance}/5)
⏰ *Tenggat Waktu:* ${dueDateStr}

📝 *Catatan:*
${task.description || '-'}

_Tetap fokus dan selesaikan yang paling berdampak terlebih dahulu! 🚀_`;
}

function formatDailyDigestMessage(q1Tasks, q2Tasks) {
  const dateStr = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  let message = `🌅 *[PRIORITASK - RINGKASAN HARIAN]*\n📅 ${dateStr}\n\n`;
  message += `Selamat pagi! Berikut adalah fokus kegiatan prioritas tinggi untuk kamu hari ini:\n\n`;

  message += `🚨 *KUADRAN 1: MENDESAK & PENTING (Wajib Fokus)*\n`;
  if (q1Tasks.length === 0) {
    message += `_Tidak ada tugas mendesak di Kuadran 1. Mantap!_ 👍\n`;
  } else {
    q1Tasks.forEach((t, i) => {
      const due = t.dueDate ? new Date(t.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Hari ini';
      message += `${i + 1}. *${t.title}* (⏰ ${due})\n`;
    });
  }

  message += `\n📅 *KUADRAN 2: RENCANA STRATEGIS (Penting Jangka Panjang)*\n`;
  if (q2Tasks.length === 0) {
    message += `_Belum ada tugas terjadwal di Kuadran 2._\n`;
  } else {
    q2Tasks.forEach((t, i) => {
      message += `${i + 1}. ${t.title}\n`;
    });
  }

  message += `\n💪 _"Prioritas bukan hanya tentang menyelesaikan banyak hal, tapi menyelesaikan hal yang benar."_`;
  return message;
}

/**
 * Dispatch pengiriman pesan ke WhatsApp berdasarkan provider
 */
async function sendWhatsAppMessage({ provider, phoneNumber, apiKey, message }) {
  if (!phoneNumber) {
    throw new Error('Nomor WhatsApp belum diisi di Pengaturan.');
  }

  // Bersihkan nomor telepon: hilangkan simbol +, spasi, dash
  let cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }

  // JIKA SIMULASI / MOCK
  if (provider === 'mock' || !apiKey) {
    console.log(`[WA SIMULATOR] Mengirim pesan ke ${cleanPhone}:`);
    console.log(message);
    logNotification({
      target: cleanPhone,
      provider: 'mock',
      message,
      status: 'success (simulated)',
      timestamp: new Date().toISOString()
    });
    return { success: true, simulated: true, message: 'Terkirim via Simulasi (API Key belum diisi).' };
  }

  try {
    if (provider === 'callmebot') {
      // CallMeBot API format:
      // GET https://api.callmebot.com/whatsapp.php?phone=[phone]&text=[text]&apikey=[apikey]
      const encodedText = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${apiKey}`;
      
      const response = await axios.get(url, { timeout: 15000 });
      
      logNotification({
        target: cleanPhone,
        provider: 'callmebot',
        message,
        status: response.status === 200 ? 'success' : 'failed',
        timestamp: new Date().toISOString()
      });

      return { success: true, data: response.data };
    } 
    
    if (provider === 'fonnte') {
      // Fonnte API format:
      // POST https://api.fonnte.com/send
      // Header: Authorization: TOKEN
      // Body: target, message
      const response = await axios.post(
        'https://api.fonnte.com/send',
        {
          target: cleanPhone,
          message: message,
          countryCode: '62'
        },
        {
          headers: {
            Authorization: apiKey
          },
          timeout: 15000
        }
      );

      logNotification({
        target: cleanPhone,
        provider: 'fonnte',
        message,
        status: response.data.status ? 'success' : 'failed',
        timestamp: new Date().toISOString()
      });

      return { success: true, data: response.data };
    }

    throw new Error(`Provider "${provider}" tidak didukung.`);
  } catch (err) {
    console.error('Error saat mengirim pesan WhatsApp:', err.message);
    logNotification({
      target: cleanPhone,
      provider: provider || 'unknown',
      message,
      status: 'error: ' + (err.response?.data?.message || err.message),
      timestamp: new Date().toISOString()
    });
    throw err;
  }
}

function logNotification(entry) {
  const db = readDb();
  if (!db.notificationHistory) db.notificationHistory = [];
  db.notificationHistory.unshift(entry);
  // Simpan maksimal 50 riwayat terakhir
  if (db.notificationHistory.length > 50) {
    db.notificationHistory = db.notificationHistory.slice(0, 50);
  }
  writeDb(db);
}

module.exports = {
  formatTaskMessage,
  formatDailyDigestMessage,
  sendWhatsAppMessage,
  logNotification
};
