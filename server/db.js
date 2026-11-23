const fs = require('fs');
const path = require('path');
const os = require('os');
const { MongoClient } = require('mongodb');

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? os.tmpdir() : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Pastikan direktori data ada (jika bukan Vercel)
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {}

const defaultData = {
  tasks: [
    {
      id: "task-1",
      title: "Selesaikan Laporan Proyek Akhir",
      description: "Menyusun bab 4 & bab 5 serta lampiran data analitik untuk diserahkan ke dosen/klien.",
      category: "Akademik / Kerja",
      urgency: 5,
      importance: 5,
      status: "in_progress",
      dueDate: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
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
      dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
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
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
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
      provider: "callmebot",
      phoneNumber: "",
      apiKey: "",
      enabled: false,
      dailyDigestEnabled: true,
      dailyDigestTime: "07:30",
      deadlineReminderHoursBefore: 3
    },
    notificationHistory: []
  }
};

let memoryStore = null;
let mongoClient = null;

async function getMongoCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(uri);
      await mongoClient.connect();
    }
    const db = mongoClient.db('priotask');
    return db.collection('app_state');
  } catch (err) {
    console.error('Koneksi MongoDB gagal, fallback ke penyimpanan lokal:', err.message);
    return null;
  }
}

// Sinkronisasi inisial
function readDbSync() {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      memoryStore = {
        tasks: data.tasks || [],
        settings: { ...defaultData.settings, ...(data.settings || {}) },
        notificationHistory: data.notificationHistory || []
      };
      return memoryStore;
    }
  } catch (err) {}
  
  memoryStore = JSON.parse(JSON.stringify(defaultData));
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (e) {}
  return memoryStore;
}

function writeDbSync(data) {
  memoryStore = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {}
  
  // Jika MongoDB URI ada, sinkronkan di background
  if (process.env.MONGODB_URI) {
    getMongoCollection()
      .then(col => {
        if (col) {
          col.updateOne({ _id: 'main_state' }, { $set: data }, { upsert: true }).catch(() => {});
        }
      })
      .catch(() => {});
  }
  return true;
}

async function loadFromMongoIfAvailable() {
  if (!process.env.MONGODB_URI) return readDbSync();
  try {
    const col = await getMongoCollection();
    if (col) {
      const doc = await col.findOne({ _id: 'main_state' });
      if (doc) {
        memoryStore = {
          tasks: doc.tasks || [],
          settings: { ...defaultData.settings, ...(doc.settings || {}) },
          notificationHistory: doc.notificationHistory || []
        };
        return memoryStore;
      }
    }
  } catch (e) {}
  return readDbSync();
}

module.exports = {
  readDb: readDbSync,
  writeDb: writeDbSync,
  loadFromMongoIfAvailable
};
