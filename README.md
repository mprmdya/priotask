# 🎯 Prioritask — Sistem Manajemen Prioritas Kegiatan & Pengingat WhatsApp

Aplikasi web modern untuk mengelola prioritas kegiatan, tugas, dan proyek berdasarkan **Matriks Eisenhower (Urgensi vs Dampak/Kepentingan)** dengan **Smart Dynamic Priority Score** dan integrasi **Pengingat Otomatis ke WhatsApp (WA)**.

---

## 🌟 Fitur Utama

1. **Sistem Penentuan Prioritas Otomatis (Matriks Eisenhower 4 Kuadran):**
   - 🚨 **Kuadran 1: Lakukan Segera (Do First):** Mendesak & Berdampak Besar.
   - 📅 **Kuadran 2: Jadwalkan (Schedule):** Tidak Mendesak tapi Berdampak Besar (Fokus strategis).
   - ⚡ **Kuadran 3: Delegasikan / Cepatkan (Delegate):** Mendesak tapi Dampak Rendah.
   - 🗑️ **Kuadran 4: Eliminasi (Eliminate):** Tidak Mendesak & Tidak Berdampak (Distraksi).

2. **Smart Dynamic Priority Score (0 - 100):**
   - Dihitung secara otomatis dari Urgensi ($1 - 5$) dan Kepentingan ($1 - 5$).
   - Dilengkapi **Dynamic Deadline Boost**: Skor otomatis naik seiring mendekatnya tenggat waktu ($< 3$ hari, $< 24$ jam, atau lewat deadline).

3. **3 Tampilan Interaktif:**
   - 🗂️ **Eisenhower Matrix View (2x2 Grid):** Tampilan visual untuk memetakan beban kerja.
   - 📋 **Kanban Board:** Kolom *Belum Dikerjakan*, *Sedang Berjalan*, dan *Selesai*.
   - 📊 **Daftar Prioritas:** Disortir otomatis berdasarkan skor prioritas tertinggi, filter kuadran, status, dan pencarian cepat.

4. **Integrasi Notifikasi WhatsApp (WA):**
   - **CallMeBot API:** 100% Gratis & legal untuk nomor pribadi (tanpa sewa server WA).
   - **Fonnte API:** Gateway lokal populer di Indonesia (via token API).
   - **Mode Simulasi:** Melihat riwayat pengingat langsung di dasbor web sebelum memasang API key.
   - **Daily Morning Digest:** Mengirim rangkuman tugas prioritas (Kuadran 1 & 2) ke WA setiap pagi (jam bisa disesuaikan).
   - **Deadline Alert:** Mengirim peringatan otomatis saat tenggat waktu mendekat.
   - **Tombol Kirim Instan:** Mengirim detail tugas spesifik ke WA dengan 1 kali klik.

---

## 🚀 Cara Menjalankan Secara Lokal

Pastikan komputer sudah terinstall **Node.js** (v18+).

### 1. Jalankan Mode Development (Frontend + Backend bersamaan):
```bash
npm run dev
```
- Frontend terbuka di: `http://localhost:3000`
- Backend API berjalan di: `http://localhost:5000`

### 2. Jalankan Mode Production (Single Server):
```bash
npm run build
npm start
```
Buka browser di: `http://localhost:5000`

---

## 📱 Panduan Mengaktifkan Pengingat WhatsApp

Buka aplikasi web, lalu klik tombol **"Setup WA"** di pojok kanan atas:

### Opsi A: CallMeBot (Direkomendasikan — 100% Gratis)
1. Simpan nomor CallMeBot di kontak WhatsApp Anda: `+34 644 44 44 44` (atau cek nomor aktif di [callmebot.com](https://www.callmebot.com/blog/free-api-whatsapp-messages/)).
2. Kirim pesan WhatsApp berikut ke nomor tersebut:
   ```text
   I allow callmebot to send me messages
   ```
3. Bot akan langsung membalas dengan **API Key** berupa kode angka.
4. Di aplikasi web, pilih provider **CallMeBot**, masukkan nomor HP Anda (format: `628123456789`) dan API Key tersebut.
5. Klik **"Tes Kirim Pesan ke WA"**. Notifikasi akan langsung masuk ke WhatsApp Anda!

### Opsi B: Fonnte (Gateway Indonesia)
1. Daftar gratis di [fonnte.com](https://fonnte.com).
2. Scan QR WhatsApp Anda di dashboard Fonnte.
3. Salin token API Fonnte ke pengaturan web dan simpan.

---

## 🌐 Panduan Deployment (Online di Cloud)

Aplikasi ini sudah dirancang **Production-Ready** dalam 1 single process:

### Opsi 1: Deploy ke Render (Gratis)
1. Push project ini ke repository GitHub Anda:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit prioritask"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```
2. Buka [render.com](https://render.com) > Pilih **New Web Service** > Sambungkan repositori GitHub Anda.
3. Atur konfigurasi:
   - **Build Command:** `npm install && cd client && npm install && npm run build`
   - **Start Command:** `npm start`
4. Klik **Deploy**! Web Anda akan aktif dan scheduler WhatsApp akan berjalan terus di background 24/7.

### Opsi 2: Deploy ke Railway / Koyeb
- Cukup hubungkan repositori GitHub, Railway/Koyeb akan otomatis mendeteksi `Dockerfile` dan mendeploy aplikasi tanpa konfigurasi tambahan.

### Opsi 3: Deploy ke VPS (Ubuntu / Debian)
```bash
git clone <repo_url>
cd web-tugas
npm install
cd client && npm install && npm run build
cd ..
# Jalankan dengan PM2 agar berjalan di background:
npm install -g pm2
pm2 start server/index.js --name "prioritask"
pm2 save
pm2 startup
```

---

## 📁 Struktur Folder
```text
web-tugas/
├── client/                     # Frontend (React 19 + Vite 8 + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Komponen UI (Navbar, Matrix, Kanban, Cards, Modal)
│   │   ├── utils/              # Logika kalkulasi skor & kuadran
│   │   └── api/                # Komunikasi HTTP ke Backend
│   └── vite.config.js
├── server/                     # Backend (Node.js + Express)
│   ├── index.js                # API routes & static server
│   ├── db.js                   # JSON Database storage
│   ├── data/store.json         # Data kegiatan & pengaturan tersimpan
│   └── services/
│       ├── whatsapp.js         # Engine pengiriman WA (CallMeBot & Fonnte)
│       └── scheduler.js        # Cron job pengingat otomatis & Daily Digest
├── Dockerfile                  # Containerization siap deploy
├── render.yaml                 # Konfigurasi deploy Render
└── package.json                # Skrip manajemen proyek
```
