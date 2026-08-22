import { Capacitor } from '@capacitor/core';

/* Wrapper @capacitor/local-notifications untuk smart reminder.
   Semua fungsi no-op aman di web (return null/false) — guard native di satu tempat.
   Strategi penjadwalan: cancel-all lalu pasang ulang semuanya setiap ada perubahan
   (toggle, ganti jam, resync due tiap buka app). Sederhana & bebas duplikat. */

const CHANNEL_ID = 'reminders';
const DAILY_STREAK_ID = 1001;
const TEST_PING_ID = 9001;
let pluginPromise = null;

function getPlugin() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!pluginPromise) pluginPromise = import('@capacitor/local-notifications').then((mod) => mod.LocalNotifications);
  return pluginPromise;
}

/* UUID rule -> number id untuk plugin */
function hashId(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export async function reminderPermissionState() {
  const plugin = getPlugin();
  if (!plugin) return 'unsupported';
  try {
    const { display } = await (await plugin).checkPermissions();
    return display;
  } catch {
    return 'unsupported';
  }
}

export async function requestReminderPermission() {
  const plugin = getPlugin();
  if (!plugin) return 'unsupported';
  try {
    const { display } = await (await plugin).requestPermissions();
    return display;
  } catch {
    return 'denied';
  }
}

export async function syncReminders({ enabled, hour = 20, recurrings = [] }) {
  const pending = getPlugin();
  if (!pending) return false;
  try {
    const LocalNotifications = await pending;
    await LocalNotifications.createChannel({ id: CHANNEL_ID, name: 'Pengingat rapi', importance: 4, visibility: 1 });
    await LocalNotifications.cancelAll();
    if (!enabled) return true;
    const notifications = [
      {
        id: DAILY_STREAK_ID,
        title: 'rapi 🔥',
        body: 'Streak-mu bakal putus nih! Catat transaksi hari ini bestie ✨',
        schedule: { on: { hour, minute: 0 }, allowWhileIdle: true },
        channelId: CHANNEL_ID,
      },
    ];
    for (const rule of recurrings) {
      if (rule.isActive === false) continue;
      const at = new Date(`${rule.nextRunDate}T08:00:00`);
      /* Lewati kalau momen 08:00 sudah lewat — jangan tembak instan saat user buka app */
      if (!(at.getTime() > Date.now())) continue;
      notifications.push({
        id: hashId(rule.id),
        title: `${rule.title} jatuh tempo`,
        body: `Transaksi rutin ${rule.title} terjadwal hari ini. Cek yuk!`,
        schedule: { at, allowWhileIdle: true },
        channelId: CHANNEL_ID,
      });
    }
    if (notifications.length) await LocalNotifications.schedule({ notifications });
    return true;
  } catch {
    return false;
  }
}

export async function fireTestPing() {
  const pending = getPlugin();
  if (!pending) return false;
  try {
    const LocalNotifications = await pending;
    await LocalNotifications.schedule({
      notifications: [{
        id: TEST_PING_ID,
        title: 'Tes pengingat rapi 📳',
        body: 'Mantap, notifikasinya jalan! Sampai jumpa di jam terjadwal.',
        schedule: { at: new Date(Date.now() + 15000), allowWhileIdle: true },
        channelId: CHANNEL_ID,
      }],
    });
    return true;
  } catch {
    return false;
  }
}
