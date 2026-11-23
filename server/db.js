const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Pastikan direktori data ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Data awal / Seed data agar aplikasi langsung kaya fitur & informatif saat pertama kali dibuka
const defaultData = {
  tasks: [
    {
      id: "task-1",
      title: "Selesaikan Laporan Proyek Akhir",
      description: "Menyusun bab 4 & bab 5 serta lampiran data analitik untuk diserahkan ke dosen/klien.",
      category: "Akademik / Kerja",
      urgency: 5,        // 1 - 5
      importance: 5,     // 1 - 5
      status: "in_progress", // "todo", "in_progress", "done"
      dueDate: new Date(Date.now() + 18 * 3600 * 1000).toISOString(), // 18 jam lagi (hari ini/besok)
      waReminderEnabled: true,
      lastNotifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "task-2",
      title: "Riset Arsitektur Sistem Baru & Belajar Cloud Deployment",
      description: "Eksplorasi strategi deployment microservices dan CI/CD pipeline.",
      category: "Pengembangan Diri",
      urgency: 2,
      importance: 5,
      status: "todo",
      dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), // 5 hari lagi
      waReminderEnabled: true,
      lastNotifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "task-3",
      title: "Balas Email & Konfirmasi Kehadiran Rapat Non-Urgent",
      description: "Menjawab pesan dari partner yang meminta update jadwal minggu depan.",
      category: "Administrasi",
      urgency: 4,
      importance: 2,
      status: "todo",
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // besok
      waReminderEnabled: false,
      lastNotifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "task-4",
      title: "Scroll Media Sosial & Browsing Tanpa Arah",
      description: "Aktivitas distraksi yang sering membuang waktu produktif kerja.",
      category: "Distraksi",
      urgency: 1,
      importance: 1,
      status: "todo",
      dueDate: null,
      waReminderEnabled: false,
      lastNotifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  settings: {
    whatsapp: {
      provider: "callmebot", // "callmebot" | "fonnte" | "mock"
      phoneNumber: "",       // e.g. 628123456789
      apiKey: "",            // CallMeBot apikey / Fonnte Token
      enabled: false,
      dailyDigestEnabled: true,
      dailyDigestTime: "07:30", // Format HH:mm WIB
      deadlineReminderHoursBefore: 3 // Ingatkan jika deadline sisa 3 jam
    },
    notificationHistory: []
  }
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return {
      tasks: data.tasks || [],
      settings: { ...defaultData.settings, ...(data.settings || {}) },
      notificationHistory: data.notificationHistory || []
    };
  } catch (err) {
    console.error("Gagal membaca database JSON, menggunakan fallback default:", err);
    return defaultData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Gagal menulis ke database JSON:", err);
    return false;
  }
}

module.exports = {
  readDb,
  writeDb
};
