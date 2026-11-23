const API_BASE = '/api';

export async function fetchTasks() {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error('Gagal memuat tugas');
  return res.json();
}

export async function createTask(taskData) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal membuat tugas');
  }
  return res.json();
}

export async function updateTask(id, updateData) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal memperbarui tugas');
  }
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Gagal menghapus tugas');
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Gagal memuat pengaturan');
  return res.json();
}

export async function saveSettings(settingsData) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Gagal menyimpan pengaturan');
  }
  return res.json();
}

export async function testWhatsAppNotification(payload) {
  const res = await fetch(`${API_BASE}/notifications/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengirim notifikasi tes WhatsApp');
  return data;
}

export async function sendDailyDigestNow() {
  const res = await fetch(`${API_BASE}/notifications/send-digest`, {
    method: 'POST'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengirim daily digest');
  return data;
}

export async function sendTaskNotificationNow(taskId) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/notify`, {
    method: 'POST'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal mengirim notif WhatsApp tugas');
  return data;
}

export async function fetchNotificationHistory() {
  const res = await fetch(`${API_BASE}/notifications/history`);
  if (!res.ok) throw new Error('Gagal memuat riwayat');
  return res.json();
}
