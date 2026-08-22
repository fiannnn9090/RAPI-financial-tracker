import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { tl } from './i18n';

/* Wrapper @capacitor/local-notifications untuk smart reminder.
   Semua fungsi no-op aman di web (return null/false) — guard native di satu tempat.
   Strategi penjadwalan: cancel-all lalu pasang ulang semuanya setiap ada perubahan
   (toggle, ganti jam, resync due tiap buka app). Sederhana & bebas duplikat. */

const CHANNEL_ID = 'reminders';
const DAILY_STREAK_ID = 1001;
const TEST_PING_ID = 9001;
function nativeReady() {
  return Capacitor.isNativePlatform();
}

/* UUID rule -> number id untuk plugin */
function hashId(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export async function reminderPermissionState() {
  if (!nativeReady()) return 'unsupported';
  try {
    const { display } = await LocalNotifications.checkPermissions();
    return display;
  } catch {
    return 'unsupported';
  }
}

export async function requestReminderPermission() {
  if (!nativeReady()) return 'unsupported';
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display;
  } catch {
    return 'denied';
  }
}

export async function syncReminders({ enabled, hour = 20, recurrings = [], lang = 'id' }) {
  if (!nativeReady()) return false;
  try {
    await LocalNotifications.createChannel({ id: CHANNEL_ID, name: tl(lang, 'ntf.channelName'), importance: 4, visibility: 1 });
    await LocalNotifications.cancelAll();
    if (!enabled) return true;
    const notifications = [
      {
        id: DAILY_STREAK_ID,
        title: tl(lang, 'ntf.streakTitle'),
        body: tl(lang, 'ntf.streakBody'),
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
        title: tl(lang, 'ntf.dueTitle', { title: rule.title }),
        body: tl(lang, 'ntf.dueBody', { title: rule.title }),
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

export async function fireTestPing(lang = 'id') {
  if (!nativeReady()) return false;
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: TEST_PING_ID,
        title: tl(lang, 'ntf.testTitle'),
        body: tl(lang, 'ntf.testBody'),
        schedule: { at: new Date(Date.now() + 15000), allowWhileIdle: true },
        channelId: CHANNEL_ID,
      }],
    });
    return true;
  } catch {
    return false;
  }
}
