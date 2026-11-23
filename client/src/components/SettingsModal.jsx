import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  ShieldCheck,
  History,
  Copy,
  ExternalLink
} from 'lucide-react';
import { saveSettings, testWhatsAppNotification, fetchNotificationHistory } from '../api/client';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsUpdated 
}) {
  const [provider, setProvider] = useState('callmebot');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState(true);
  const [dailyDigestTime, setDailyDigestTime] = useState('07:30');
  const [deadlineReminderHoursBefore, setDeadlineReminderHoursBefore] = useState(3);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'history'

  useEffect(() => {
    if (settings?.whatsapp) {
      setProvider(settings.whatsapp.provider || 'callmebot');
      setPhoneNumber(settings.whatsapp.phoneNumber || '');
      setApiKey(settings.whatsapp.apiKey || '');
      setEnabled(settings.whatsapp.enabled ?? true);
      setDailyDigestEnabled(settings.whatsapp.dailyDigestEnabled ?? true);
      setDailyDigestTime(settings.whatsapp.dailyDigestTime || '07:30');
      setDeadlineReminderHoursBefore(settings.whatsapp.deadlineReminderHoursBefore || 3);
    }
  }, [settings, isOpen]);

  // Load notification history
  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchNotificationHistory()
        .then(data => setHistoryList(data.history || []))
        .catch(err => console.error(err));
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        whatsapp: {
          provider,
          phoneNumber: phoneNumber.trim(),
          apiKey: apiKey.trim(),
          enabled,
          dailyDigestEnabled,
          dailyDigestTime,
          deadlineReminderHoursBefore: Number(deadlineReminderHoursBefore)
        }
      };
      const res = await saveSettings(payload);
      onSettingsUpdated(res.settings);
      setTestResult({ type: 'success', message: 'Pengaturan WhatsApp berhasil disimpan!' });
    } catch (err) {
      setTestResult({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!phoneNumber) {
      setTestResult({ type: 'error', message: 'Nomor WhatsApp wajib diisi terlebih dahulu.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testWhatsAppNotification({
        provider,
        phoneNumber: phoneNumber.trim(),
        apiKey: apiKey.trim()
      });
      setTestResult({ 
        type: 'success', 
        message: res.message || 'Pesan berhasil dikirim! Silakan periksa WhatsApp kamu.' 
      });
    } catch (err) {
      setTestResult({ 
        type: 'error', 
        message: err.message || 'Gagal mengirim pesan WhatsApp. Pastikan API key dan nomor benar.' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Integrasi Pengingat WhatsApp</h3>
              <p className="text-xs text-slate-400">Atur notifikasi otomatis tugas ke nomor WhatsApp kamu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-900/80">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Konfigurasi Gateway
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Pesan Terkirim</span>
          </button>
        </div>

        {activeTab === 'config' ? (
          <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {/* Feedback Alert */}
            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {testResult.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Provider Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pilih Gateway WhatsApp
              </label>
              <div className="grid grid-cols-2 gap-2">
                
                {/* CallMeBot Option */}
                <button
                  type="button"
                  onClick={() => setProvider('callmebot')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    provider === 'callmebot'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>CallMeBot</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      100% Gratis
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Cocok untuk nomor pribadi. Tanpa server WA sendiri.
                  </p>
                </button>

                {/* Fonnte Option */}
                <button
                  type="button"
                  onClick={() => setProvider('fonnte')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    provider === 'fonnte'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>Fonnte</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                      Indonesia
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Gateway lokal populer via token akun fonnte.com.
                  </p>
                </button>

              </div>
            </div>

            {/* Step by Step Tutorial Box */}
            {provider === 'callmebot' && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Cara Mendapatkan API Key CallMeBot (Gratis & 30 Detik):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>
                    Simpan nomor bot CallMeBot: <code className="text-indigo-300 font-mono">+34 644 44 44 44</code> atau klik link di website resmi <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">callmebot.com <ExternalLink className="w-2.5 h-2.5" /></a>
                  </li>
                  <li>
                    Kirim pesan WhatsApp bertuliskan: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">I allow callmebot to send me messages</code>
                  </li>
                  <li>
                    Bot akan langsung membalas dengan <strong>API Key</strong> berupa angka unik (contoh: <code>123456</code>).
                  </li>
                  <li>
                    Masukkan nomor HP dan API Key tersebut ke form di bawah ini!
                  </li>
                </ol>
              </div>
            )}

            {provider === 'fonnte' && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Cara Menggunakan Fonnte:</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Daftar gratis di <a href="https://fonnte.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">fonnte.com <ExternalLink className="w-2.5 h-2.5" /></a>, scan QR WhatsApp kamu di dashboard Fonnte, lalu salin <strong>API Token</strong> ke kolom di bawah.
                </p>
              </div>
            )}

            {/* Phone Number Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nomor WhatsApp Kamu <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 628123456789 atau 08123456789"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Gunakan format kode negara (628xxx) atau 08xxx (otomatis disesuaikan).
              </p>
            </div>

            {/* API Key / Token Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {provider === 'callmebot' ? 'CallMeBot API Key' : 'Fonnte API Token'}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'callmebot' ? 'Contoh: 1234567' : 'Token dari dashboard Fonnte'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                *Jika kolom ini dikosongkan, sistem berjalan dalam <strong>Mode Simulasi</strong> (mencatat pesan di Riwayat Log).
              </p>
            </div>

            {/* Scheduler Preferences */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Jadwal Pengingat Otomatis</span>
              </h4>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-300">Ringkasan Pagi (Daily Digest)</span>
                  <p className="text-[10px] text-slate-500">Kirim daftar tugas Q1 & Q2 ke WA setiap pagi</p>
                </div>
                <input
                  type="checkbox"
                  checked={dailyDigestEnabled}
                  onChange={(e) => setDailyDigestEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                />
              </div>

              {dailyDigestEnabled && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400">Jam Kirim Setiap Hari:</span>
                  <input
                    type="time"
                    value={dailyDigestTime}
                    onChange={(e) => setDailyDigestTime(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                  <span className="text-xs text-slate-500">WIB</span>
                </div>
              )}

              <div className="border-t border-slate-800/60 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-300">Peringatan Deadline</span>
                  <p className="text-[10px] text-slate-500">Kirim notif sebelum tenggat waktu berakhir</p>
                </div>
                <select
                  value={deadlineReminderHoursBefore}
                  onChange={(e) => setDeadlineReminderHoursBefore(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="1">1 jam sebelumnya</option>
                  <option value="3">3 jam sebelumnya</option>
                  <option value="6">6 jam sebelumnya</option>
                  <option value="24">1 hari (24 jam) sebelumnya</option>
                </select>
              </div>

            </div>

            {/* Test Button & Save Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleTestWhatsApp}
                disabled={isTesting}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Mengirim...' : 'Tes Kirim Pesan ke WA'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </div>

          </form>
        ) : (
          <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-300">Log Pengiriman Notifikasi Terakhir</h4>
            {historyList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Belum ada notifikasi yang terkirim atau dicatat.
              </div>
            ) : (
              <div className="space-y-2">
                {historyList.map((entry, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Ke: {entry.target} ({entry.provider})</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        entry.status.includes('success') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    <pre className="text-[11px] text-slate-400 font-sans whitespace-pre-wrap bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      {entry.message}
                    </pre>
                    <div className="text-[10px] text-slate-500 text-right">
                      {new Date(entry.timestamp).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
