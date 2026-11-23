/**
 * Utilitas untuk Menghitung & Memberi Metadata Kuadran Eisenhower dan Prioritas
 */

export const QUADRANTS = {
  Q1: {
    id: 'Q1',
    name: 'Kuadran 1: Lakukan Segera (Do First)',
    badge: 'Mendesak & Penting',
    color: 'from-rose-500/20 to-red-600/10 border-red-500/40 text-red-400',
    headerBg: 'bg-red-500/10 text-red-300 border-red-500/30',
    accentColor: 'border-l-4 border-l-red-500',
    description: 'Tugas kritis, krisis, atau deadline dekat yang berdampak langsung. Prioritaskan sekarang!',
    tagBg: 'bg-red-500/20 text-red-300 border-red-500/30',
    iconColor: 'text-red-400'
  },
  Q2: {
    id: 'Q2',
    name: 'Kuadran 2: Jadwalkan (Schedule)',
    badge: 'Penting, Belum Mendesak',
    color: 'from-amber-500/20 to-yellow-600/10 border-amber-500/40 text-amber-400',
    headerBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    accentColor: 'border-l-4 border-l-amber-500',
    description: 'Proyek strategis, perencanaan masa depan, & pengembangan diri. Luangkan waktu rutin agar tidak jadi krisis.',
    tagBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    iconColor: 'text-amber-400'
  },
  Q3: {
    id: 'Q3',
    name: 'Kuadran 3: Delegasikan / Cepatkan (Delegate)',
    badge: 'Mendesak, Kurang Penting',
    color: 'from-blue-500/20 to-cyan-600/10 border-blue-500/40 text-blue-400',
    headerBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    accentColor: 'border-l-4 border-l-blue-500',
    description: 'Interupsi mendadak atau tugas rutin yang kurang berdampak besar. Selesaikan cepat atau delegasikan.',
    tagBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  Q4: {
    id: 'Q4',
    name: 'Kuadran 4: Eliminasi (Eliminate)',
    badge: 'Tidak Mendesak & Kurang Penting',
    color: 'from-slate-600/20 to-gray-700/10 border-slate-600/40 text-slate-400',
    headerBg: 'bg-slate-700/20 text-slate-300 border-slate-600/30',
    accentColor: 'border-l-4 border-l-slate-500',
    description: 'Distraksi, scrolling tanpa tujuan, atau aktivitas buang waktu. Batasi atau hapus!',
    tagBg: 'bg-slate-700/30 text-slate-400 border-slate-600/30',
    iconColor: 'text-slate-400'
  }
};

/**
 * Tentukan kuadran berdasarkan urgency & importance
 */
export function getQuadrantKey(urgency, importance) {
  if (urgency >= 3 && importance >= 3) return 'Q1';
  if (urgency < 3 && importance >= 3) return 'Q2';
  if (urgency >= 3 && importance < 3) return 'Q3';
  return 'Q4';
}

/**
 * Hitung Score dinamis (0-100)
 */
export function calculateDynamicScore(urgency, importance, dueDate, status) {
  if (status === 'done') return 0;
  
  let score = (importance * 12) + (urgency * 8);

  if (dueDate) {
    const diffHours = (new Date(dueDate).getTime() - Date.now()) / (3600 * 1000);
    if (diffHours < 0) {
      score += 15; // Terlambat
    } else if (diffHours <= 24) {
      score += 10; // < 24 jam
    } else if (diffHours <= 72) {
      score += 5; // < 3 hari
    }
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Format tanggal dalam bahasa Indonesia yang manusiawi
 */
export function formatRelativeDueDate(dueDateStr) {
  if (!dueDateStr) return { text: 'Tidak ada deadline', status: 'normal' };

  const target = new Date(dueDateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (3600 * 1000));
  const diffDays = Math.round(diffMs / (24 * 3600 * 1000));

  const timeFormatted = target.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const dateFormatted = target.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  if (diffMs < 0) {
    const overdueHours = Math.abs(diffHours);
    if (overdueHours < 24) {
      return { text: `Terlambat ${overdueHours} jam lalu!`, status: 'overdue' };
    }
    return { text: `Terlambat ${Math.abs(diffDays)} hari! (${dateFormatted})`, status: 'overdue' };
  }

  if (diffHours <= 1) {
    return { text: `🚨 Deadline < 1 jam (${timeFormatted})`, status: 'critical' };
  }
  if (diffHours <= 24) {
    return { text: `⏳ Sisa ${diffHours} jam (${timeFormatted})`, status: 'urgent' };
  }
  if (diffDays === 1) {
    return { text: `Besok, ${timeFormatted}`, status: 'warning' };
  }
  if (diffDays <= 3) {
    return { text: `${diffDays} hari lagi (${dateFormatted})`, status: 'upcoming' };
  }

  return { text: `${dateFormatted}, ${timeFormatted}`, status: 'normal' };
}
