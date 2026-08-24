'use client';

import { useEffect, useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import supabase from '../lib/supabase';
import { hitungXpEarned, levelFromXp, levelProgress, titleForLevel } from '../lib/xp';
import { nextStreak } from '../lib/streak';
import { badgeStats, evaluateBadges, mergeBadgeDefs } from '../lib/badges';
import { CHALLENGE_DEFS, challengeProgress, challengeEligibility, challengeProgressLabel, weekStartOf, daysBetween } from '../lib/challenge';
import { drawProfileCard } from '../lib/profileCard';
import { addDays, generateDue, occurrenceOnOrAfter } from '../lib/recurring';
import {
  canPayInstallmentEarly,
  debtPayload,
  generateDueInstallments,
  mapDebt,
  netWorth,
  payFlex,
  payOneInstallment,
  settleWithoutPayment,
  splitPrincipal,
  totalsByDirection,
} from '../lib/debts';
import { buildRecap } from '../lib/recap';
import { buildAdvice } from '../lib/advice';
import { buildScore, previousMonthEnd } from '../lib/score';
import { buildSimulation } from '../lib/simulate';
import { buildBudgetRecommendation } from '../lib/recommend';
import { CURRENCIES, isStale, loadCachedFx, makeMoneyFormatter, refreshFxCache } from '../lib/fx';
import { LANGS, getLang, setLang, t } from '../lib/i18n';
import { csvToTransactions, dupKeyOf, transactionsToCsv } from '../lib/csv';
import { exportPdf } from '../lib/reportPdf';
import { fireTestPing, reminderPermissionState, requestReminderPermission, syncReminders } from '../lib/reminders';
import LevelUpModal from './LevelUpModal';

const dateFormatterCache = {};
function dateFmt() {
  const locale = getLang() === 'en' ? 'en-US' : 'id-ID';
  return dateFormatterCache[locale] ?? (dateFormatterCache[locale] = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }));
}
const today = new Date().toISOString().slice(0, 10);

const initialData = { users: [], transactions: {}, goals: {}, achievements: {}, budgets: {}, badges: {}, badgeDefs: [], categories: {}, recurrings: {}, wallets: {}, challenges: {}, debts: {}, hasWallets: false, hasDebts: false, activeUserId: null };
/* Seed kategori default (is_default) — dipakai saat user belum punya baris di tabel categories.
   Lainnya bertipe 'both' supaya muncul di dropdown pemasukan & pengeluaran. */
const DEFAULT_CATEGORIES = [
  ['Makan & Minum', '🍜', 'expense'],
  ['Transportasi', '🛵', 'expense'],
  ['Belanja', '🛍️', 'expense'],
  ['Tagihan', '🧾', 'expense'],
  ['Hiburan', '🎮', 'expense'],
  ['Gaji', '💼', 'income'],
  ['Bonus', '🎉', 'income'],
  ['Usaha', '🏪', 'income'],
  ['Investasi', '📈', 'income'],
  ['Lainnya', '✨', 'both'],
];
/* DP9b #11 — sistem ikon UI konsisten: SVG inline stroke=currentColor
   (~1.9px) menggantikan emoji fungsional. Emoji KONTEN USER (kategori,
   dompet, tantangan, badge) tetap emoji karena merepresentasikan data. */
const NAV_TABS = [['beranda', 'nav.beranda'], ['transaksi', 'nav.transaksi'], ['analisis', 'nav.analisis'], ['target', 'nav.target'], ['profil', 'nav.profil']];
const ICON_PATHS = {
  /* nav */
  beranda: <><path d="M4 11.2 12 4.5l8 6.7" /><path d="M6.2 10.6V19h11.6v-8.4" /></>,
  transaksi: <><path d="M7 7.2h13m0 0-3.1-3.1M20 7.2l-3.1 3.1" /><path d="M17 16.8H4m0 0 3.1-3.1M4 16.8l3.1 3.1" /></>,
  analisis: <><path d="M5 20v-7" /><path d="M12 20V5" /><path d="M19 20v-5" /></>,
  target: <><circle cx="12" cy="12" r="7.4" /><circle cx="12" cy="12" r="3.1" /></>,
  profil: <><circle cx="12" cy="8.3" r="3.6" /><path d="M5 19.4c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" /></>,
  /* menu profil */
  card: <><rect x="3.2" y="5.2" width="17.6" height="13.6" rx="3" /><circle cx="8.4" cy="10.8" r="1.8" /><path d="M5.9 15.9c.5-1.4 1.4-2.1 2.5-2.1s2 .7 2.5 2.1" /><path d="M13.8 10h4.4" /><path d="M13.8 13.2h2.9" /></>,
  key: <><circle cx="7.5" cy="15.5" r="3.6" /><path d="m10.3 12.7 8.9-8.9" /><path d="m16 7.2 2.6 2.6" /><path d="m13.4 9.8 2.6 2.6" /></>,
  sliders: <><path d="M4 7h8.3" /><circle cx="15" cy="7" r="2.2" /><path d="M19.2 7H20" /><path d="M4 12h2.8" /><circle cx="9.5" cy="12" r="2.2" /><path d="M13.2 12H20" /><path d="M4 17h10.3" /><circle cx="17" cy="17" r="2.2" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>,
  repeat: <><path d="m17 2.5 3.5 3.5L17 9.5" /><path d="M20.5 6H8a4.5 4.5 0 0 0-4.5 4.5V12" /><path d="M7 21.5 3.5 18 7 14.5" /><path d="M3.5 18H16a4.5 4.5 0 0 0 4.5-4.5V12" /></>,
  wallet: <><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></>,
  box: <><path d="m21 8.5-9-5.5-9 5.5v7l9 5.5 9-5.5z" /><path d="m3 8.5 9 5 9-5" /><path d="M12 13.5V21" /></>,
  bell: <><path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13.5 6 9.5Z" /><path d="M10 18.5a2.2 2.2 0 0 0 4 0" /></>,
  alert: <><path d="M12 3.8 2.5 20h19L12 3.8Z" /><path d="M12 9.5v4.5" /><path d="M12 17h.01" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h4" /></>,
  /* pengaturan */
  exchange: <><path d="M4 17h13" /><path d="m14 20 3-3-3-3" /><path d="M20 7H7" /><path d="m10 4L7 7l3 3" /></>,
  type: <><path d="M4 7V5h16v2" /><path d="M12 5v14" /><path d="M9 19h6" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><path d="M12 3.5c2.7 2.3 4 5.1 4 8.5s-1.3 6.2-4 8.5c-2.7-2.3-4-5.1-4-8.5s1.3-6.2 4-8.5Z" /></>,
  moon: <><path d="M20.5 14A8.6 8.6 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /></>,
  /* aksi & status */
  pencil: <><path d="m15 5 4 4L8 20l-5 1 1-5L15 5Z" /><path d="m13.5 6.5 4 4" /></>,
  arrowDown: <><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></>,
  arrowUp: <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 5H5v2a3 3 0 0 0 3 3" /><path d="M16 5h3v2a3 3 0 0 1-3 3" /><path d="M12 13v4" /><path d="M8.5 20h7" /><path d="M10 17h4" /></>,
  bulb: <><path d="M9.5 18v-1.8c0-1-.5-1.9-1.3-2.7a6 6 0 1 1 7.6 0c-.8.8-1.3 1.7-1.3 2.7V18" /><path d="M9.5 18h5" /><path d="M10.5 21h3" /></>,
  sparkle: <><path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9Z" /><path d="m19 15.5.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9Z" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="m4 4 16 16" /><path d="M10.6 5.9a9 9 0 0 1 1.4-.4c6 0 9.5 6.5 9.5 6.5a17.4 17.4 0 0 1-3 3.7" /><path d="M6.6 6.6A16 16 0 0 0 2.5 12s3.5 6.5 9.5 6.5a9 9 0 0 0 4-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  xCircle: <><circle cx="12" cy="12" r="8.5" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  checkCircle: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.2 2.4 2.4 4.8-5" /></>,
  chevronLeft: <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  chevronRight: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  chevronDown: <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />,
};
function Icon({ name, size = 24 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON_PATHS[name]}</svg>;
}
/* F3 — fallback alokasi kategori (mirror sql/f3_allocation_type.sql).
   Dipakai saat row DB belum punya kolom allocation_type (pra-migrasi) atau
   kategori tak dikenal; default aman 'kebutuhan' agar tak ada yang terklasifikasi
   salah secara diam-diam ke keinginan. */
const DEFAULT_ALLOCATIONS = {
  'Makan & Minum': 'kebutuhan',
  Transportasi: 'kebutuhan',
  Tagihan: 'kebutuhan',
  Belanja: 'keinginan',
  Hiburan: 'keinginan',
  Lainnya: 'keinginan',
};
const ALLOCATIONS = ['kebutuhan', 'keinginan', 'tabungan'];
function allocationOf(category) {
  return category?.allocationType ?? DEFAULT_ALLOCATIONS[category?.name] ?? 'kebutuhan';
}
/* F4c — batas & pilihan ikon dompet (v1 emoji-only, konsisten kategori) */
const MAX_WALLETS = 8;
const WALLET_EMOJIS = ['👛', '🏦', '💳', '🪙', '💸', '📱', '🧧', '🎒', '💼', '🫙', '🎁', '⚡'];
/* Restrukturisasi Profil: baris menu utama (sub-halaman pengingat kondisional & danger ditangani terpisah di JSX) */
const PROFILE_MENU_ROWS = [
  ['kartu', 'card', 'prof.menu.kartu'],
  ['akun', 'key', 'prof.menu.akun'],
  ['pengaturan', 'sliders', 'prof.menu.pengaturan'],
  ['kategori', 'grid', 'cat.title'],
  ['rutin', 'repeat', 'recM.title'],
  ['dompet', 'wallet', 'prof.menu.dompet'],
  ['data', 'box', 'data.title'],
];
const MASKED_AMOUNT = 'Rp ••••••';

function mapTransaction(row) {
  return { id: row.id, type: row.type, title: row.title, amount: Number(row.amount), category: row.category, date: row.date, xp_earned: row.xp_earned ?? 0, walletId: row.wallet_id ?? null };
}

function mapCategory(row) {
  return { id: row.id, name: row.name, emoji: row.emoji, type: row.type, isDefault: Boolean(row.is_default), allocationType: row.allocation_type ?? null };
}

/* F4 — dompet: mirror sql/f4_wallets.sql. Nama seed harus identik dengan SQL
   supaya guard client & backfill DB tidak membuat dua dompet berbeda makna. */
const DEFAULT_WALLET_NAME = 'Dompet Utama';

function mapWallet(row) {
  return { id: row.id, name: row.name, emoji: row.emoji, isDefault: Boolean(row.is_default) };
}

function mapRecurring(row) {
  return { id: row.id, type: row.type, title: row.title, amount: Number(row.amount), category: row.category, frequency: row.frequency, dayOfPeriod: row.day_of_period, nextRunDate: row.next_run_date, walletId: row.wallet_id ?? null };
}

/* F8 — patch hasil mesin cicilan → payload kolom tabel debts */
function debtPatchPayload(patch) {
  return {
    remaining: patch.remaining,
    installments_paid: patch.installmentsPaid,
    ...(patch.nextRunDate !== undefined ? { next_run_date: patch.nextRunDate } : {}),
    status: patch.status,
    ...(patch.paidAt ? { paid_at: patch.paidAt } : {}),
  };
}

async function loadData(userId) {
  const [probe, trx, goal, ach, bud, defs, owned, cats, recs, wallets, chl, debtRows] = await Promise.all([
    /* F4 probe kolom wallet_id (pra-migrasi → error → hasWallets false). Head-only:
       limit(1) tanpa konsumsi data, cukup untuk tahu keberadaan kolom. */
    supabase.from('transactions').select('wallet_id').eq('user_id', userId).limit(1),
    supabase.from('transactions').select('*').eq('user_id', userId),
    supabase.from('goals').select('*').eq('user_id', userId).eq('is_active', true).maybeSingle(),
    supabase.from('achievements').select('*').eq('user_id', userId),
    supabase.from('budgets').select('*').eq('user_id', userId),
    supabase.from('badge_defs').select('*'),
    supabase.from('user_badges').select('badge_code').eq('user_id', userId),
    supabase.from('categories').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('recurring_transactions').select('*').eq('user_id', userId).eq('is_active', true).order('next_run_date'),
    supabase.from('wallets').select('*').eq('user_id', userId).order('created_at'),
    /* F5 — pra-migrasi tabel challenges → error → array kosong (fitur off). */
    supabase.from('challenges').select('*').eq('user_id', userId),
    /* F8 — pra-migrasi tabel debts → error → hasDebts false (fitur off). */
    supabase.from('debts').select('*').eq('user_id', userId).order('created_at'),
  ]);
  const hasWallets = !probe.error;
  const hasDebts = !debtRows.error;
  return {
    transactions: (trx.data ?? []).map(mapTransaction),
    goal: goal.data ? { name: goal.data.name, amount: Number(goal.data.amount) } : null,
    achievements: (ach.data ?? []).map((row) => ({ id: row.id, name: row.goal_name, amount: Number(row.goal_amount), completedAt: row.completed_at })),
    budgets: Object.fromEntries((bud.data ?? []).map((row) => [row.category, Number(row.monthly_limit)])),
    badgeDefs: mergeBadgeDefs(defs.data ?? []),
    badges: (owned.data ?? []).map((row) => row.badge_code),
    categories: (cats.data ?? []).map(mapCategory),
    recurrings: (recs.data ?? []).map(mapRecurring),
    hasWallets,
    wallets: hasWallets ? (wallets.data ?? []).map(mapWallet) : [],
    challenges: (chl.data ?? []).map((row) => ({ id: row.id, code: row.code, weekStart: row.week_start, status: row.status, completedAt: row.completed_at })),
    hasDebts,
    debts: hasDebts ? (debtRows.data ?? []).map(mapDebt) : [],
  };
}

export default function Home() {
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);
  const [autoGenerated, setAutoGenerated] = useState(0);
  const [fontScale, setFontScale] = useState(() => (typeof window !== 'undefined' && window.localStorage.getItem('rapi.fontScale')) || '1');
  const [lang, setLangState] = useState(() => (typeof window !== 'undefined' && window.localStorage.getItem('rapi.lang')) || 'id');
  const [theme, setTheme] = useState(() => (typeof window !== 'undefined' && window.localStorage.getItem('rapi.theme')) || 'system');
  setLang(lang);
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale);
    return () => {};
  }, [fontScale]);
  /* Tema: 'system' mengikuti prefers-color-scheme (atribut data-theme dibersihkan),
     'light'/'dark' menulis [data-theme] di <html> — CSS brutal sudah siap dua-duanya. */
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      if (theme === 'system') root.removeAttribute('data-theme');
      else root.dataset.theme = theme;
      /* Ikon status bar kontras dengan tema efektif (terang teks saat gelap) */
      if (Capacitor.isNativePlatform()) {
        const darkNow = theme === 'dark' || (theme === 'system' && mq.matches);
        StatusBar.setStyle({ style: darkNow ? Style.Dark : Style.Light }).catch(() => {});
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
  /* Sinkronkan atribut <html lang> & tab title dengan bahasa aktif (aksesibilitas + PWA) */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('meta.title');
    return () => {};
  }, [lang]);
  function changeLanguage(next) {
    setLangState(next);
    try { window.localStorage.setItem('rapi.lang', next); } catch {}
  }
  function changeFontScale(value) {
    setFontScale(value);
    try { window.localStorage.setItem('rapi.fontScale', value); } catch {}
  }
  function changeTheme(next) {
    setTheme(next);
    try { window.localStorage.setItem('rapi.theme', next); } catch {}
  }

  async function enterApp(authUser, fallbackName) {
    let profile = (await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle()).data;
    if (!profile) {
      const username = fallbackName || authUser.email.replace(/@rapi\.local$/, '');
      const auth_email = authUser.email ?? `${username.toLowerCase()}@rapi.local`;
      profile = (await supabase.from('profiles').insert({ id: authUser.id, username, auth_email }).select().single()).data
        ?? { id: authUser.id, username, auth_email, xp: 0, level: 1 };
    }
    const snapshot = await loadData(authUser.id);
    let categories = snapshot.categories;
    if (!categories.length) {
      const { data: seeded, error } = await supabase.from('categories')
        .upsert(
          DEFAULT_CATEGORIES.map(([name, emoji, type]) => ({ user_id: authUser.id, name, emoji, type, is_default: true })),
          { onConflict: 'user_id,name' },
        )
        .select();
      if (!error && seeded?.length) categories = seeded.map(mapCategory);
    }
    let recurrings = snapshot.recurrings;
    /* F4 — guard client: kolom wallet sudah ada tapi user belum punya baris dompet
       (mis. daftar akun baru setelah migrasi jalan). Seed "Dompet Utama" lokal. */
    let wallets = snapshot.wallets;
    if (snapshot.hasWallets && !wallets.length) {
      const { data: seededWallet, error: walletErr } = await supabase
        .from('wallets')
        .insert({ user_id: authUser.id, name: DEFAULT_WALLET_NAME, emoji: '👛', is_default: true })
        .select();
      if (!walletErr && seededWallet?.length) wallets = seededWallet.map(mapWallet);
    }
    let autoCount = 0;
    try {
      const { rows, updates, generated } = generateDue(recurrings, today);
      if (rows.length) {
        /* F4 — stamping dompet: ikut rule-nya; fallback dompet default.
           Payload eksplisit (bukan spread) agar field internal ruleId tidak
           terkirim ke PostgREST. Pra-migrasi: tanpa wallet_id sama sekali. */
        const defaultWalletId = (wallets.find((item) => item.isDefault) ?? wallets[0])?.id ?? null;
        const payload = rows.map((row) => {
          const rule = recurrings.find((item) => item.id === row.ruleId);
          return {
            user_id: authUser.id,
            type: row.type,
            title: row.title,
            amount: row.amount,
            category: row.category,
            date: row.date,
            xp_earned: 0,
            ...(snapshot.hasWallets ? { wallet_id: rule?.walletId ?? defaultWalletId } : {}),
          };
        });
        const { error } = await supabase.from('transactions').insert(payload);
        if (!error) {
          autoCount = generated;
          await Promise.all(updates.map((item) => supabase.from('recurring_transactions').update({ next_run_date: item.nextRunDate }).eq('id', item.id)));
          recurrings = recurrings.map((rule) => {
            const update = updates.find((item) => item.id === rule.id);
            return update ? { ...rule, nextRunDate: update.nextRunDate } : rule;
          });
        }
      }
    } catch {}
    /* F8 — catch-up cicilan berjadwal (jalan setelah recurring). Transaksi
       auto-generate memakai xp_earned 0 sesuai konvensi N6b (anti-farming);
       patch sisa/jumlah angsuran/kursor ditulis balik ke tabel debts. */
    let debts = snapshot.debts;
    if (snapshot.hasDebts && debts.length) {
      try {
        const due = generateDueInstallments(debts, today);
        if (due.rows.length) {
          const defaultDebtWalletId = (wallets.find((item) => item.isDefault) ?? wallets[0])?.id ?? null;
          const payload = due.rows.map((row) => {
            const debtRule = debts.find((item) => item.id === row.debtId);
            return {
              user_id: authUser.id,
              type: row.type,
              title: row.title,
              amount: row.amount,
              category: row.category,
              date: row.date,
              xp_earned: 0,
              ...(snapshot.hasWallets ? { wallet_id: debtRule?.walletId ?? defaultDebtWalletId } : {}),
              debt_id: row.debtId,
            };
          });
          const { error } = await supabase.from('transactions').insert(payload);
          if (!error) {
            autoCount += due.generated;
            await Promise.all(due.updates.map((item) => supabase.from('debts').update(debtPatchPayload(item.patch)).eq('id', item.id)));
            debts = debts.map((debt) => {
              const update = due.updates.find((item) => item.id === debt.id);
              return update ? { ...debt, ...update.patch } : debt;
            });
          }
        }
      } catch {}
    }
    setAutoGenerated(autoCount);
    if (typeof window !== 'undefined' && window.localStorage.getItem('rapi.reminder.enabled') === '1') {
      const reminderHour = Number(window.localStorage.getItem('rapi.reminder.hour')) || 20;
      await syncReminders({ enabled: true, hour: reminderHour, recurrings, lang });
    }
    const account = { id: authUser.id, username: profile.username, authEmail: profile.auth_email ?? null, xp: profile.xp ?? 0, level: profile.level ?? 1, streakCurrent: profile.streak_current ?? 0, streakLongest: profile.streak_longest ?? 0 };
    setData((current) => ({
      ...current,
      users: current.users.some((user) => user.id === authUser.id)
        ? current.users.map((user) => (user.id === authUser.id ? account : user))
        : [...current.users, account],
      transactions: { ...current.transactions, [authUser.id]: snapshot.transactions },
      goals: { ...current.goals, [authUser.id]: snapshot.goal },
      achievements: { ...current.achievements, [authUser.id]: snapshot.achievements },
      budgets: { ...current.budgets, [authUser.id]: snapshot.budgets },
      badges: { ...current.badges, [authUser.id]: snapshot.badges },
      badgeDefs: snapshot.badgeDefs,
      categories: { ...current.categories, [authUser.id]: categories },
      recurrings: { ...current.recurrings, [authUser.id]: recurrings },
      wallets: { ...current.wallets, [authUser.id]: wallets },
      challenges: { ...current.challenges, [authUser.id]: snapshot.challenges },
      debts: { ...current.debts, [authUser.id]: debts },
      hasWallets: snapshot.hasWallets,
      hasDebts: snapshot.hasDebts,
      activeUserId: authUser.id,
    }));
    setReady(true);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await enterApp(session.user);
      else setReady(true);
    });
  }, []);

  const activeUser = data.users.find((user) => user.id === data.activeUserId) ?? null;
  if (!ready) return <div className="loading"><span className="loading-dot" />{t('common.loading')}</div>;

  return activeUser
    ? <Dashboard user={activeUser} data={data} setData={setData} autoGenerated={autoGenerated} fontScale={fontScale} onChangeFontScale={changeFontScale} onChangeLang={changeLanguage} lang={lang} theme={theme} onChangeTheme={changeTheme} />
    : <Auth onEnter={enterApp} />;
}

function BottomNav({ active, onChange, onAdd }) {
  const item = ([id, label]) => <button key={id} type="button" className={`bottom-nav-item ${active === id ? 'active' : ''}`} aria-current={active === id ? 'page' : undefined} onClick={() => onChange(id)}><span className="nav-ico"><Icon name={id} size={23} /></span><small>{t(label)}</small></button>;
  return <nav className="bottom-nav dp-nav" aria-label={t('nav.aria')}>
    {NAV_TABS.slice(0, 2).map(item)}
    <div className="nav-fab-slot">
      <button type="button" className="nav-fab" aria-label={t('nav.fabAria')} onClick={onAdd}>+</button>
    </div>
    {NAV_TABS.slice(2).map(item)}
  </nav>;
}

function Auth({ onEnter }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    const cleanName = username.trim();
    if (cleanName.length < 3) return setMessage(t('err.nameShort'));
    if (password.length < 6) return setMessage(t('err.passShort'));

    const email = `${cleanName.toLowerCase()}@rapi.local`;
    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const { data: authData, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (/already registered|already exists/i.test(error.message)) setMessage(t('err.nameTaken'));
          else if (error.code === 'weak_password' || /weak password|at least \d+ characters/i.test(error.message)) setMessage(t('err.passWeak'));
          else if (error.code === 'over_request_rate_limit' || /rate limit/i.test(error.message)) setMessage(t('err.rateLimit'));
          else setMessage(t('err.registerFailed', { msg: error.message }));
          return;
        }
        if (!authData.session) return setMessage(t('ok.accountCreated'));
        onEnter(authData.user, cleanName);
        return;
      }

      /* F7 — login resolve email dari profil via RPC security definer
         (RLS memblokir select langsung pada state belum-login).
         Username boleh berubah, auth_email tidak. Fallback derived
         untuk akun sebelum migrasi / username tak ditemukan. */
      const { data: resolvedEmail } = await supabase.rpc('resolve_login_email', { p_username: cleanName });
      const loginEmail = resolvedEmail ?? email;
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error || !authData.user) return setMessage(t('err.badCreds'));
      onEnter(authData.user);
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(next) {
    setMode(next); setMessage(''); setUsername(''); setPassword('');
  }

  return <main className="auth-page clay-auth brutal-auth dp-auth">
    <section className="auth-intro">
      <a className="brand dark brutal-brand" href="#top"><span>r</span> rapi</a>
      <div className="intro-copy">
        <p className="kicker">{t('auth.kicker')}</p>
        <h1>{t('auth.tagline1')}<br /><em>{t('auth.tagline2')}</em></h1>
        <p>{t('auth.desc')}</p>
      </div>
      <div className="feature-note"><span>✦</span><div><strong>{t('auth.privacyTitle')}</strong><small>{t('auth.privacyNote')}</small></div></div>
    </section>
    <section className="auth-panel" id="top">
      <div className="form-wrap clay-card brutal-card dp-card">
        <p className="welcome">{t(mode === 'login' ? 'welcome.login' : 'welcome.register')}</p>
        <h2>{t(mode === 'login' ? 'auth.titleLogin' : 'auth.titleRegister')}</h2>
        <p className="form-description">{t(mode === 'login' ? 'auth.descLogin' : 'auth.descRegister')}</p>
        <form onSubmit={submit}>
          <label>{t('label.username')}<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('ph.username')} autoComplete="username" /></label>
          <label>{t('label.password')}<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('ph.password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          {message && <p className="form-message" role="alert">{message}</p>}
          <button className="primary-button clay-button brutal-button dp-button" type="submit" disabled={isSubmitting}>{isSubmitting ? t('btn.processing') : t(mode === 'login' ? 'btn.login' : 'btn.register')}{!isSubmitting && <span>→</span>}</button>
        </form>
        <p className="switch-form">{t(mode === 'login' ? 'switch.toRegister' : 'switch.toLogin')} <button className="brutal-switch" onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}>{t(mode === 'login' ? 'btn.register' : 'btn.login')}</button></p>
        <p className="privacy">{t('privacy.demo')}</p>
      </div>
    </section>
  </main>;
}

function Dashboard({ user, data, setData, autoGenerated = 0, fontScale = '1', onChangeFontScale, onChangeLang, lang = 'id', theme = 'system', onChangeTheme }) {
  const [tab, setTab] = useState('beranda');
  const [showForm, setShowForm] = useState(false);
  const [budgetSheet, setBudgetSheet] = useState(null);
  const [goalSheet, setGoalSheet] = useState(false);
  const [categorySheet, setCategorySheet] = useState(false);
  const [recurringSheet, setRecurringSheet] = useState(false);
  const [walletSheet, setWalletSheet] = useState(null);
  const [challengeSheetOpen, setChallengeSheetOpen] = useState(false); /* F4c: {} = buat baru, objek dompet = edit */
  const [extraMonthly, setExtraMonthly] = useState(0); /* F6: what-if nabung ekstra per bulan */
  const [filter, setFilter] = useState('all');
  const [levelUp, setLevelUp] = useState(null);
  const [toast, setToast] = useState('');
  const showReminderCard = Capacitor.isNativePlatform();
  const [reminderEnabled, setReminderEnabled] = useState(() => typeof window !== 'undefined' && window.localStorage.getItem('rapi.reminder.enabled') === '1');
  const [reminderHour, setReminderHour] = useState(() => Number(typeof window !== 'undefined' && window.localStorage.getItem('rapi.reminder.hour')) || 20);
  const [reminderMsg, setReminderMsg] = useState('');
  const [hideBalance, setHideBalance] = useState(() => typeof window !== 'undefined' && window.localStorage.getItem('rapi.balance.hidden') === '1');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortMode, setSortMode] = useState('newest');
  /* F4b — lensa dompet: Beranda (saldo/stat/insight) mengikuti dompet aktif;
     tab Transaksi punya filter dompet sendiri; keduanya 'all' default. */
  const [activeWalletId, setActiveWalletId] = useState(() => (typeof window !== 'undefined' && window.localStorage.getItem('rapi.wallet.active')) || 'all');
  const [txWalletFilter, setTxWalletFilter] = useState('all');
  const [recapPeriod, setRecapPeriod] = useState('week');
  const [pdfRange, setPdfRange] = useState('this');
  const [pdfCustom, setPdfCustom] = useState({ start: '', end: '' });
  const [importSheetOpen, setImportSheetOpen] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  /* F8 — hutang & piutang: view layar penuh + 2 sheet (form tambah/edit, detail+bayar) */
  const [debtsOpen, setDebtsOpen] = useState(false);
  const [debtFormSheet, setDebtFormSheet] = useState(null); /* {} = baru, objek debt = edit */
  const [debtDetailId, setDebtDetailId] = useState(null);
  const [importBusy, setImportBusy] = useState(false);
  const [fxCode, setFxCode] = useState(() => (typeof window !== 'undefined' && window.localStorage.getItem('rapi.currency')) || 'IDR');
  const [fxData, setFxData] = useState(() => loadCachedFx());
  const [fxStatus, setFxStatus] = useState(() => (loadCachedFx() ? 'ready' : 'idle'));
  const [profileView, setProfileView] = useState(null);
  /* F7 — ganti username: sinkron state akun lokal setelah kedua store (auth+profiles) beres */
  const renameAccount = (clean) => setData((current) => ({
    ...current,
    users: current.users.map((item) => (item.id === user.id ? { ...item, username: clean } : item)),
  }));
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cache = loadCachedFx();
      if (!isStale(cache)) return;
      if (!cache) setFxStatus('loading');
      const fresh = await refreshFxCache(cache);
      if (cancelled) return;
      if (fresh) {
        setFxData(fresh);
        setFxStatus('ready');
      } else {
        setFxStatus(loadCachedFx() ? 'stale' : 'unavailable');
      }
    })();
    return () => { cancelled = true; };
  }, []);
  function changeCurrency(code) {
    setFxCode(code);
    try { window.localStorage.setItem('rapi.currency', code); } catch {}
    if (code !== 'IDR' && (!fxData || isStale(fxData))) {
      setFxStatus('loading');
      refreshFxCache(fxData).then((fresh) => {
        if (fresh) {
          setFxData(fresh);
          setFxStatus('ready');
        } else {
          setFxStatus(loadCachedFx() ? 'stale' : 'unavailable');
        }
      });
    }
  }
  const money = useMemo(() => makeMoneyFormatter(fxCode, fxData?.rates), [fxCode, fxData]);
  function toggleHideBalance() {
    setHideBalance((current) => {
      const next = !current;
      try { window.localStorage.setItem('rapi.balance.hidden', next ? '1' : '0'); } catch {}
      return next;
    });
  }
  useEffect(() => {
    if (!autoGenerated) return;
    setToast(t('toast.autoLogged', { n: autoGenerated }));
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [autoGenerated]);
  /* Sub-halaman Profil: reset saat pindah tab utama (bukan saat masuk profil
     dari kartu skor/teaser yang menyetel view sekaligus) + scroll tiap ganti view */
  useEffect(() => {
    if (tab !== 'profil') setProfileView(null);
    return () => {};
  }, [tab]);
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {};
  }, [profileView]);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const subscription = CapacitorApp.addListener('backButton', () => {
      if (levelUp) setLevelUp(null);
      else if (showForm) setShowForm(false);
      else if (budgetSheet) setBudgetSheet(null);
      else if (goalSheet) setGoalSheet(false);
      else if (categorySheet) setCategorySheet(false);
      else if (recurringSheet) setRecurringSheet(false);
      else if (walletSheet) setWalletSheet(null);
      else if (challengeSheetOpen) setChallengeSheetOpen(false);
      else if (importSheetOpen) { setImportSheetOpen(false); setImportPreview(null); }
      else if (debtFormSheet) setDebtFormSheet(null);
      else if (debtDetailId) setDebtDetailId(null);
      else if (debtsOpen) setDebtsOpen(false);
      else if (profileView) setProfileView(null);
      else if (tab !== 'beranda') setTab('beranda');
      else CapacitorApp.exitApp();
    });
    return () => subscription.remove();
  }, [tab, showForm, budgetSheet, goalSheet, categorySheet, recurringSheet, walletSheet, challengeSheetOpen, importSheetOpen, levelUp, profileView, debtsOpen, debtFormSheet, debtDetailId]);
  /* F4 — dompet: daftar untuk UI dan resolusi wallet_id saat menulis.
     Pra-migrasi hasWallets=false → field wallet_id tidak pernah dikirim.
     Pasca-migrasi SQL seed/guard enterApp menjamin ada dompet default.
     DIDEKLARASI DI ATAS MEMO TRANSAKSI (dipakai txScoped/lensed). */
  const wallets = data.wallets?.[user.id] ?? [];
  const hasWallets = Boolean(data.hasWallets);
  const defaultWallet = useMemo(() => wallets.find((item) => item.isDefault) ?? wallets[0] ?? null, [wallets]);
  const activeWalletKey = activeWalletId !== 'all' && wallets.some((item) => item.id === activeWalletId)
    ? activeWalletId
    : 'all';
  function changeActiveWallet(id) {
    setActiveWalletId(id);
    try { window.localStorage.setItem('rapi.wallet.active', id); } catch {}
  }
  function writeWalletId() {
    if (!hasWallets) return null;
    /* Transaksi baru mengikuti dompet aktif; mode "Semua" → dompet default. */
    if (activeWalletKey !== 'all') return activeWalletKey;
    return defaultWallet?.id ?? null;
  }
  function walletNameOf(tx) {
    if (!hasWallets) return '';
    return wallets.find((item) => item.id === tx.walletId)?.name ?? '';
  }
  const transactions = data.transactions[user.id] ?? [];
  const sortedTransactions = useMemo(() => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)), [transactions]);
  /* F4b — scope tab Transaksi: filter dompet independen (chip) sebelum filter lain */
  const txScopedTransactions = useMemo(
    () => (txWalletFilter === 'all' || !hasWallets ? sortedTransactions : sortedTransactions.filter((item) => item.walletId === txWalletFilter)),
    [sortedTransactions, txWalletFilter, hasWallets],
  );
  const visibleTransactions = useMemo(() => {
    const byType = filter === 'all' ? txScopedTransactions : txScopedTransactions.filter((item) => item.type === filter);
    const byCategory = categoryFilter ? byType.filter((item) => item.category === categoryFilter) : byType;
    return sortMode === 'amount' ? [...byCategory].sort((a, b) => b.amount - a.amount) : byCategory;
  }, [txScopedTransactions, filter, categoryFilter, sortMode]);
  /* Lensa Beranda: saldo/stat/insight mengikuti dompet aktif ('all' = gabungan).
     Goal tetap GLOBAL → totalBalance dihitung terpisah dari semua dompet. */
  const lensedTransactions = useMemo(
    () => (activeWalletKey === 'all' || !hasWallets ? transactions : transactions.filter((item) => item.walletId === activeWalletKey)),
    [transactions, activeWalletKey, hasWallets],
  );
  const income = lensedTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = lensedTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expense;
  const totalBalance = useMemo(() => {
    const inc = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const exp = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    return inc - exp;
  }, [transactions]);
  /* F8 — hutang & piutang: neraca global (semua dompet) di atas saldo murni.
     Kekayaan Bersih = Saldo + Piutang aktif − Hutang aktif; Saldo TIDAK berubah. */
  const debts = data.debts?.[user.id] ?? [];
  const hasDebts = Boolean(data.hasDebts);
  const debtTotals = useMemo(() => totalsByDirection(debts), [debts]);
  const netWorthValue = useMemo(() => netWorth(totalBalance, debts), [totalBalance, debts]);
  const goal = data.goals?.[user.id] ?? null;
  const achievements = data.achievements?.[user.id] ?? [];
  /* Goal GLOBAL: progres dari saldo gabungan semua dompet, bukan lensa aktif */
  const goalReached = Boolean(goal && totalBalance >= goal.amount);
  const budgets = data.budgets?.[user.id] ?? {};
  const categories = data.categories?.[user.id] ?? [];
  const recurrings = data.recurrings?.[user.id] ?? [];
  const expenseCategories = useMemo(() => categories.filter((item) => item.type !== 'income').map((item) => item.name), [categories]);
  const incomeCategories = useMemo(() => categories.filter((item) => item.type !== 'expense').map((item) => item.name), [categories]);
  const emojiMap = useMemo(() => Object.fromEntries(categories.map((item) => [item.name, item.emoji])), [categories]);
  const categoryChips = useMemo(() => {
    const counts = {};
    for (const item of transactions) if (item.category) counts[item.category] = (counts[item.category] ?? 0) + 1;
    return [...categories].sort((a, b) => ((counts[b.name] ?? 0) - (counts[a.name] ?? 0)) || a.name.localeCompare(b.name, 'id'));
  }, [categories, transactions]);
  const monthKey = today.slice(0, 7);
  /* monthExpenses = GLOBAL (dipakai budget & engines); monthExpensesLens = untuk insight */
  const monthExpenses = transactions.filter((item) => item.type === 'expense' && item.date.startsWith(monthKey));
  const monthExpensesLens = lensedTransactions.filter((item) => item.type === 'expense' && item.date.startsWith(monthKey));
  const budgetEntries = Object.entries(budgets);
  const spendingFor = (category) => monthExpenses.filter((item) => item.category === category).reduce((sum, item) => sum + item.amount, 0);
  const lensSpendingFor = (category) => monthExpensesLens.filter((item) => item.category === category).reduce((sum, item) => sum + item.amount, 0);
  const categorySummary = expenseCategories.map((category) => ({ category, amount: lensSpendingFor(category) })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
  const topSpending = categorySummary[0];
  const chartMax = topSpending?.amount || 1;
  /* F5 — tantangan mingguan: GLOBAL lintas dompet (prinsip F4). Progress murni
     dihitung dari transaksi; DB hanya menyimpan pilihan & penyelesaian. */
  const weekStart = weekStartOf(today);
  const myChallenges = data.challenges?.[user.id] ?? [];
  const activeChallengeRow = myChallenges.find((row) => row.status === 'active' && row.weekStart === weekStart) ?? null;
  const completedThisWeek = myChallenges.filter((row) => row.status === 'completed' && row.weekStart === weekStart);
  const challengesWon = myChallenges.filter((row) => row.status === 'completed').length;
  const wantsByCategory = useMemo(() => new Set(categories.filter((item) => allocationOf(item) === 'keinginan').map((item) => item.name)), [categories]);
  const challengeLive = useMemo(() => {
    if (!activeChallengeRow) return null;
    return { ...activeChallengeRow, progress: challengeProgress(activeChallengeRow.code, { transactions, wantsByCategory, today, weekStart }) };
  }, [activeChallengeRow, transactions, wantsByCategory, today, weekStart]);
  /* F6 — simulasi nabung: global lintas dompet (totalBalance gabungan + transaksi penuh) */
  const simulation = useMemo(
    () => buildSimulation({ transactions, totalBalance, goal, extraMonthly, today }),
    [transactions, totalBalance, goal, extraMonthly],
  );
  const badgeViews = evaluateBadges(
    mergeBadgeDefs(data.badgeDefs),
    badgeStats({ transactions, achievements, streakCurrent: user.streakCurrent, level: user.level, challengesWon }),
    new Set(data.badges?.[user.id] ?? []),
    lang,
  );
  const unlockedBadges = badgeViews.filter((badge) => badge.unlocked).length;
  const topCardTier = ['legendary', 'epic', 'rare', 'common'].find((tier) => badgeViews.some((badge) => badge.unlocked && badge.rarity === tier)) ?? 'common';
  const canShareCard = typeof navigator !== 'undefined' && Boolean(navigator.canShare);
  const profInfo = levelProgress(user.xp ?? 0, lang);
  const recap = useMemo(() => buildRecap({ transactions, period: recapPeriod, streak: user.streakCurrent ?? 0, money, lang }), [transactions, recapPeriod, user.streakCurrent, money, lang]);
  /* F1 — saran finansial: engine rule-based deterministik (lib/advice.js). */
  const advice = useMemo(() => buildAdvice({
    transactions, budgets, goal, recurrings, lang, money, today,
    emojiOf: (name) => emojiMap[name] ?? '✨',
  }), [transactions, budgets, goal, recurrings, lang, money, emojiMap]);
  /* F2 — skor kesehatan finansial: snapshot kini + historis (recompute, tanpa tabel baru) */
  const health = useMemo(() => {
    const now = buildScore({ transactions, budgets, recurrings, today });
    const before = buildScore({ transactions, budgets, recurrings, today: previousMonthEnd(today) });
    const delta = now.score != null && before.score != null ? now.score - before.score : null;
    return { now, before, delta };
  }, [transactions, budgets, recurrings]);
  /* F3 — rekomendasi 50/30/20 dari alokasi kategori */
  const allocationMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.name, allocationOf(c)])), [categories]);
  const reco = useMemo(() => buildBudgetRecommendation({ transactions, categories, allocationMap, today }), [transactions, allocationMap, today]);

  useEffect(() => {
    const owned = new Set(data.badges?.[user.id] ?? []);
    const fresh = badgeViews.filter((badge) => badge.unlocked && !owned.has(badge.code));
    if (!fresh.length) return;
    supabase.from('user_badges').insert(fresh.map((badge) => ({ user_id: user.id, badge_code: badge.code }))).then(({ error }) => {
      if (error) return;
      setData((current) => ({ ...current, badges: { ...current.badges, [user.id]: [...(current.badges[user.id] ?? []), ...fresh.map((badge) => badge.code)] } }));
    });
  }, [badgeViews]);

  /* F5 — reward tantangan: XP bonus + status completed (sekali). Persist xp ke
     profiles di sini dan di addTransaction — sebelumnya xp hanya state lokal. */
  async function grantChallengeReward(row) {
    const def = CHALLENGE_DEFS.find((item) => item.code === row.code);
    const bonusXp = def?.xp ?? 10;
    const previousLevel = user.level ?? 1;
    const totalXp = (user.xp ?? 0) + bonusXp;
    const newLevel = levelFromXp(totalXp);
    const { error } = await supabase.from('challenges').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', row.id).eq('status', 'active');
    if (error) return false;
    /* Persist xp + level (level ikut — dipakai badge level_6 & kartu profil). */
    supabase.from('profiles').update({ xp: totalXp, level: newLevel }).eq('id', user.id).then(() => {}, () => {});
    setData((current) => ({
      ...current,
      challenges: { ...current.challenges, [user.id]: current.challenges[user.id].map((item) => (item.id === row.id ? { ...item, status: 'completed', completedAt: new Date().toISOString() } : item)) },
      users: current.users.map((item) => (item.id === user.id ? { ...item, xp: totalXp, level: newLevel } : item)),
    }));
    setToast(t('ch.toastDone', { name: t(`ch.name.${row.code}`), xp: bonusXp }));
    if (newLevel > previousLevel) setLevelUp({ level: newLevel, xpEarned: bonusXp });
    return true;
  }

  /* Minggu berganti tanpa selesai → expire; tapi kalau target ternyata sudah
     tercapai di minggunya (verdict retroaktif per akhir minggu tsb), tetap
     dibayar penuh. */
  useEffect(() => {
    const staleActive = myChallenges.filter((row) => row.status === 'active' && row.weekStart < weekStart);
    if (!staleActive.length) return;
    let cancelled = false;
    (async () => {
      for (const row of staleActive) {
        if (cancelled) return;
        /* Minggu sudah tuntas → verdict final di hari terakhir minggu tsb. */
        const verdict = challengeProgress(row.code, { transactions, wantsByCategory, today: addDays(row.weekStart, 6), weekStart: row.weekStart });
        if (verdict.done) {
          await grantChallengeReward(row);
        } else {
          const { error } = await supabase.from('challenges').update({ status: 'expired' }).eq('id', row.id).eq('status', 'active');
          if (!error && !cancelled) {
            setData((current) => ({ ...current, challenges: { ...current.challenges, [user.id]: current.challenges[user.id].map((item) => (item.id === row.id ? { ...item, status: 'expired' } : item)) } }));
          }
        }
      }
    })();
    return () => { cancelled = true; };
  }, [myChallenges, transactions]);

  /* Penyelesaian live: cek tiap transaksi/progress berubah. */
  useEffect(() => {
    if (!challengeLive || !challengeLive.progress.done || challengeLive.status !== 'active') return;
    grantChallengeReward(challengeLive);
  }, [challengeLive]);

  /* F5 — aktifkan tantangan minggu ini (maks 1 aktif, dijaga UI + cek di sini). */
  async function activateChallenge(code) {
    if (activeChallengeRow || myChallenges.some((row) => row.weekStart === weekStart && row.status === 'completed')) return false;
    const { data: insertedRow, error } = await supabase
      .from('challenges')
      .insert({ user_id: user.id, code, week_start: weekStart })
      .select()
      .single();
    if (error || !insertedRow) return false;
    setData((current) => ({ ...current, challenges: { ...current.challenges, [user.id]: [...(current.challenges[user.id] ?? []), { id: insertedRow.id, code: insertedRow.code, weekStart: insertedRow.week_start, status: insertedRow.status, completedAt: null }] } }));
    setToast(t('ch.toastActive', { name: t(`ch.name.${code}`) }));
    return true;
  }
  /* F8 — inti pencatatan transaksi dipakai bersama: form biasa (addTransaction)
     dan pembayaran hutang/piutang manual (XP berjalan normal sesuai keputusan
     desain; auto-generate catch-up tetap xp_earned 0). */
  async function commitTransaction(transaction, opts = {}) {
    const xpEarned = hitungXpEarned(transaction, transactions, budgets);
    const previousLevel = user.level ?? 1;
    const totalXp = (user.xp ?? 0) + xpEarned;
    const newLevel = levelFromXp(totalXp);
    const walletId = transaction.walletId || writeWalletId();
    /* F5 fix — persist xp + level ke profiles (sebelumnya hanya state lokal). */
    supabase.from('profiles').update({ xp: totalXp, level: newLevel }).eq('id', user.id).then(() => {}, () => {});
    const { data: inserted, error } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, type: transaction.type, title: transaction.title, amount: transaction.amount, category: transaction.category, date: transaction.date, xp_earned: xpEarned, ...(walletId ? { wallet_id: walletId } : {}), ...(transaction.debtId && hasDebts ? { debt_id: transaction.debtId } : {}) })
      .select()
      .single();
    if (error || !inserted) return false;
    let streakInfo = null;
    try {
      const { data: prof } = await supabase.from('profiles').select('streak_current, streak_longest, last_activity_date').eq('id', user.id).single();
      streakInfo = nextStreak(prof?.last_activity_date, prof?.streak_current, prof?.streak_longest);
      await supabase.from('profiles').update({ streak_current: streakInfo.streakCurrent, streak_longest: streakInfo.streakLongest, last_activity_date: streakInfo.today }).eq('id', user.id);
    } catch {
      streakInfo = null;
    }
    setData((current) => ({
      ...current,
      transactions: { ...current.transactions, [user.id]: [mapTransaction(inserted), ...(current.transactions[user.id] ?? [])] },
      users: current.users.map((item) => (item.id === user.id ? { ...item, xp: totalXp, level: newLevel, ...(streakInfo ? { streakCurrent: streakInfo.streakCurrent, streakLongest: streakInfo.streakLongest } : {}) } : item)),
    }));
    if (!opts.keepFormOpen) setShowForm(false);
    if (newLevel > previousLevel) setLevelUp({ level: newLevel, xpEarned });
    return true;
  }
  async function addTransaction(transaction) {
    return commitTransaction(transaction);
  }
  /* F8 — aksi hutang/piutang: tulis DB dulu, lalu cermin ke state lokal.
     Pembayaran manual membuat transaksi via commitTransaction (XP normal). */
  function patchDebtLocal(id, patch) {
    setData((current) => ({
      ...current,
      debts: { ...current.debts, [user.id]: (current.debts[user.id] ?? []).map((item) => (item.id === id ? { ...item, ...patch } : item)) },
    }));
  }
  async function saveDebt(form) {
    if (!hasDebts) return false;
    if (form.id) {
      const { error } = await supabase.from('debts').update(debtPayload(form)).eq('id', form.id);
      if (error) return false;
      patchDebtLocal(form.id, form);
      setToast(t('debts.toastSaved'));
      return true;
    }
    const payload = debtPayload({ ...form, remaining: form.principal });
    const { data: inserted, error } = await supabase.from('debts').insert({ ...payload, user_id: user.id }).select().single();
    if (error || !inserted) return false;
    setData((current) => ({ ...current, debts: { ...current.debts, [user.id]: [...(current.debts[user.id] ?? []), mapDebt(inserted)] } }));
    setToast(t('debts.toastSaved'));
    return true;
  }
  async function removeDebt(id) {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (error) return;
    setData((current) => ({ ...current, debts: { ...current.debts, [user.id]: (current.debts[user.id] ?? []).filter((item) => item.id !== id) } }));
    setDebtDetailId((currentId) => (currentId === id ? null : currentId));
    setToast(t('debts.toastDeleted'));
  }
  async function payDebtInstallment(debtItem) {
    const result = payOneInstallment(debtItem, today);
    if (!result) return false;
    const ok = await commitTransaction(result.transaction, { keepFormOpen: true });
    if (!ok) return false;
    await supabase.from('debts').update(debtPatchPayload(result.patch)).eq('id', debtItem.id);
    patchDebtLocal(debtItem.id, result.patch);
    setDebtDetailId(null);
    setToast(t(result.patch.status === 'paid' ? 'debts.toastPaid' : 'debts.toastPaidPart'));
    return true;
  }
  async function payDebtFlex(debtItem, amount) {
    const result = payFlex(debtItem, amount);
    if (!result) return false;
    const ok = await commitTransaction({ ...result.transaction, date: today }, { keepFormOpen: true });
    if (!ok) return false;
    await supabase.from('debts').update(debtPatchPayload(result.patch)).eq('id', debtItem.id);
    patchDebtLocal(debtItem.id, result.patch);
    setDebtDetailId(null);
    setToast(t(result.patch.status === 'paid' ? 'debts.toastPaid' : 'debts.toastPaidPart'));
    return true;
  }
  async function settleDebt(debtItem, status) {
    const patch = settleWithoutPayment(debtItem, status);
    if (!patch) return false;
    const { error } = await supabase.from('debts').update(debtPatchPayload(patch)).eq('id', debtItem.id);
    if (error) return false;
    patchDebtLocal(debtItem.id, patch);
    setDebtDetailId(null);
    setToast(t(status === 'written_off' ? 'debts.toastWrittenOff' : 'debts.toastMarkedPaid'));
    return true;
  }
  async function removeTransaction(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) return;
    setData((current) => ({ ...current, transactions: { ...current.transactions, [user.id]: (current.transactions[user.id] ?? []).filter((item) => item.id !== id) } }));
  }
  function pdfRangeDates() {
    if (pdfRange === 'this') return { start: `${today.slice(0, 7)}-01`, end: today };
    if (pdfRange === 'last') {
      const [y, m] = today.split('-').map(Number);
      const py = m === 1 ? y - 1 : y;
      const pm = m === 1 ? 12 : m - 1;
      return { start: `${py}-${String(pm).padStart(2, '0')}-01`, end: `${py}-${String(pm).padStart(2, '0')}-${new Date(py, pm, 0).getDate()}` };
    }
    if (!pdfCustom.start || !pdfCustom.end || pdfCustom.start > pdfCustom.end) return null;
    return { start: pdfCustom.start, end: pdfCustom.end };
  }
  async function handleExportPdf() {
    const range = pdfRangeDates();
    if (!range) { setToast(t('toast.customRange')); return; }
    const scoped = transactions.filter((tx) => tx.date >= range.start && tx.date <= range.end);
    if (!scoped.length) { setToast(t('toast.rangeEmpty')); return; }
    const label = pdfRange === 'this' ? t('pdf.thisMonth') : pdfRange === 'last' ? t('pdf.lastMonth') : `${range.start} ${t('pdf.to')} ${range.end}`;
    try {
      await exportPdf({ transactions: scoped, rangeLabel: label, fileName: `rapi-laporan-${range.start}`, lang, walletNameOf });
      setToast(t('toast.pdfDone'));
    } catch { setToast(t('toast.pdfFail')); }
  }
  function handleExportCsv() {
    if (!transactions.length) { setToast(t('toast.noExportData')); return; }
    const blob = new Blob([transactionsToCsv(transactions, walletNameOf)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapi-transaksi.csv';
    link.click();
    URL.revokeObjectURL(url);
    setToast(t('toast.csvDone'));
  }
  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setToast(t('toast.fileTooBig')); return; }
    let text;
    try { text = await file.text(); } catch { setToast(t('toast.fileUnreadable')); return; }
    setImportPreview({ fileName: file.name, result: csvToTransactions(text, new Set(transactions.map(dupKeyOf)), lang) });
  }
  async function confirmImport() {
    const rows = importPreview?.result?.valid ?? [];
    if (!rows.length || importBusy) return;
    setImportBusy(true);
    try {
      const known = new Set(categories.map((item) => item.name));
      const newNames = new Map();
      for (const row of rows) if (!known.has(row.category) && !newNames.has(row.category)) newNames.set(row.category, row.type);
      let createdCategories = [];
      if (newNames.size) {
        const payload = [...newNames.entries()].map(([name, type]) => ({ user_id: user.id, name, emoji: '📦', type }));
        const { data: seeded } = await supabase.from('categories').upsert(payload, { onConflict: 'user_id,name' }).select();
        if (seeded) createdCategories = seeded.map(mapCategory);
      }
      const inserted = [];
      const importWalletId = writeWalletId();
      const nameToWallet = new Map(hasWallets ? wallets.map((item) => [item.name.toLowerCase(), item.id]) : []);
      for (let i = 0; i < rows.length; i += 200) {
        /* F4: baris dengan kolom dompet dicocokkan nama (case-insensitive);
           tak cocok/kosong → dompet aktif/default. */
        const chunk = rows.slice(i, i + 200).map((row) => ({ user_id: user.id, type: row.type, title: row.title, amount: row.amount, category: row.category, date: row.date, xp_earned: 0, ...(() => { const resolved = row.wallet ? nameToWallet.get(row.wallet.toLowerCase()) : null; const wid = resolved ?? importWalletId; return wid ? { wallet_id: wid } : {}; })() }));
        const { data, error } = await supabase.from('transactions').insert(chunk).select();
        if (error) throw error;
        inserted.push(...data.map(mapTransaction));
      }
      setData((current) => ({
        ...current,
        categories: { ...current.categories, [user.id]: [...(current.categories[user.id] ?? []), ...createdCategories] },
        transactions: { ...current.transactions, [user.id]: [...inserted, ...(current.transactions[user.id] ?? [])] },
      }));
      setImportSheetOpen(false);
      setImportPreview(null);
      setToast(t('toast.imported', { n: inserted.length }));
    } catch {
      setToast(t('toast.importPartial'));
    } finally {
      setImportBusy(false);
    }
  }
  async function logout() {
    await supabase.auth.signOut();
    setData((current) => ({ ...current, activeUserId: null }));
  }
  async function buildCardBlob() {
    const canvas = await drawProfileCard({ username: user.username, level: user.level ?? 1, levelTitle: titleForLevel(user.level ?? 1, lang), streak: user.streakCurrent ?? 0, badgesUnlocked: unlockedBadges, badgesTotal: badgeViews.length, tier: topCardTier, lang });
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  }
  async function downloadProfileCard() {
    const blob = await buildCardBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapi-kartu-${user.username}.png`;
    link.click();
    URL.revokeObjectURL(url);
  }
  async function shareProfileCard() {
    const blob = await buildCardBlob();
    const file = new File([blob], `rapi-kartu-${user.username}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: t('share.navTitle') }); } catch {}
    } else {
      await downloadProfileCard();
    }
  }
  async function saveGoal(name, amount) {
    const existing = await supabase.from('goals').select('id').eq('user_id', user.id).eq('is_active', true).maybeSingle();
    if (existing.data) await supabase.from('goals').update({ name: name.trim(), amount }).eq('id', existing.data.id);
    else await supabase.from('goals').insert({ user_id: user.id, name: name.trim(), amount });
    setData((current) => ({ ...current, goals: { ...current.goals, [user.id]: { name: name.trim(), amount } } }));
    return true;
  }
  async function saveBudget(category, amount) {
    const { error } = await supabase.from('budgets').upsert({ user_id: user.id, category, monthly_limit: amount });
    if (error) return false;
    setData((current) => ({ ...current, budgets: { ...current.budgets, [user.id]: { ...(current.budgets?.[user.id] ?? {}), [category]: amount } } }));
    return true;
  }
  async function saveCategory({ name, emoji, type, allocation }) {
    const cleanName = name.trim();
    const cleanEmoji = Array.from(emoji.trim())[0] ?? '';
    if (!cleanEmoji) return false;
    /* allocation_type tidak dikirim saat insert (aman pra-migrasi kolom);
       pilihan non-default disetel lewat patch terpisah yang tahan gagal. */
    const { data: row, error } = await supabase.from('categories')
      .upsert({ user_id: user.id, name: cleanName, emoji: cleanEmoji, type }, { onConflict: 'user_id,name' })
      .select()
      .single();
    if (error || !row) return false;
    if (allocation && allocation !== 'kebutuhan') await patchAllocation(row.id, allocation);
    setData((current) => ({
      ...current,
      categories: { ...current.categories, [user.id]: [...(current.categories[user.id] ?? []).filter((item) => item.name !== cleanName), mapCategory({ ...row, allocation_type: allocation ?? row.allocation_type })] },
    }));
    return true;
  }
  async function patchAllocation(id, next) {
    const { error } = await supabase.from('categories').update({ allocation_type: next }).eq('id', id);
    if (error) {
      setToast(t('alloc.migNeeded'));
      return false;
    }
    setData((current) => ({
      ...current,
      categories: { ...current.categories, [user.id]: (current.categories[user.id] ?? []).map((item) => (item.id === id ? { ...item, allocationType: next } : item)) },
    }));
    return true;
  }
  function cycleAllocation(item) {
    if (item.type === 'income') return;
    const current = allocationOf(item);
    const next = ALLOCATIONS[(ALLOCATIONS.indexOf(current) + 1) % ALLOCATIONS.length];
    patchAllocation(item.id, next);
  }
  async function removeCategory(id) {
    const target = (data.categories?.[user.id] ?? []).find((item) => item.id === id);
    if (!target || target.isDefault) return false;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return false;
    setData((current) => ({ ...current, categories: { ...current.categories, [user.id]: (current.categories[user.id] ?? []).filter((item) => item.id !== id) } }));
    return true;
  }
  async function addRecurring(payload) {
    const tomorrow = addDays(today, 1);
    const nextRun = occurrenceOnOrAfter({ frequency: payload.frequency, dayOfPeriod: payload.dayOfPeriod }, payload.startDate > tomorrow ? payload.startDate : tomorrow);
    const walletId = payload.walletId || writeWalletId();
    const { data: row, error } = await supabase.from('recurring_transactions')
      .insert({ user_id: user.id, type: payload.type, title: payload.title, amount: payload.amount, category: payload.category, frequency: payload.frequency, day_of_period: payload.dayOfPeriod, next_run_date: nextRun, ...(hasWallets && walletId ? { wallet_id: walletId } : {}) })
      .select()
      .single();
    if (error || !row) return false;
    setData((current) => ({ ...current, recurrings: { ...current.recurrings, [user.id]: [...(current.recurrings?.[user.id] ?? []), mapRecurring(row)] } }));
    return true;
  }
  async function removeRecurring(id) {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
    if (error) return false;
    setData((current) => ({ ...current, recurrings: { ...current.recurrings, [user.id]: (current.recurrings[user.id] ?? []).filter((item) => item.id !== id) } }));
    return true;
  }
  /* F4c — CRUD dompet. Default (Dompet Utama) tidak bisa dihapus (v1 tanpa
     ubah-default); dompet lain hanya jika kosong transaksi/rutin — DB juga
     melindungi lewat ON DELETE RESTRICT. */
  async function saveWallet({ id, name, emoji }) {
    const cleanName = name.trim();
    const cleanEmoji = Array.from(emoji.trim())[0] ?? '';
    if (!cleanName || !cleanEmoji) return false;
    const currentWallets = data.wallets?.[user.id] ?? [];
    if (!id && currentWallets.length >= MAX_WALLETS) return false;
    if (id) {
      const { data: row, error } = await supabase.from('wallets').update({ name: cleanName, emoji: cleanEmoji }).eq('id', id).select().single();
      if (error || !row) return false;
      setData((current) => ({ ...current, wallets: { ...current.wallets, [user.id]: (current.wallets[user.id] ?? []).map((item) => (item.id === id ? mapWallet(row) : item)) } }));
      return true;
    }
    const { data: row, error } = await supabase.from('wallets').insert({ user_id: user.id, name: cleanName, emoji: cleanEmoji }).select().single();
    if (error || !row) return false;
    setData((current) => ({ ...current, wallets: { ...current.wallets, [user.id]: [...(current.wallets[user.id] ?? []), mapWallet(row)] } }));
    return true;
  }
  async function removeWallet(id) {
    const target = (data.wallets?.[user.id] ?? []).find((item) => item.id === id);
    if (!target || target.isDefault) { setToast(t('wallet.toastLast')); return false; }
    if ((data.wallets?.[user.id] ?? []).length <= 1) { setToast(t('wallet.toastLast')); return false; }
    const used = transactions.some((item) => item.walletId === id) || recurrings.some((rule) => rule.walletId === id);
    if (used) { setToast(t('wallet.toastUsed')); return false; }
    const { error } = await supabase.from('wallets').delete().eq('id', id);
    if (error) { setToast(t('wallet.toastUsed')); return false; }
    setData((current) => ({ ...current, wallets: { ...current.wallets, [user.id]: (current.wallets[user.id] ?? []).filter((item) => item.id !== id) } }));
    /* Lensa yang menunjuk dompet terhapus direset agar tidak menampilkan angka kosong diam-diam */
    if (activeWalletKey === id) changeActiveWallet('all');
    if (txWalletFilter === id) setTxWalletFilter('all');
    setToast(t('wallet.toastDeleted'));
    return true;
  }
  function setReminderPref(key, value) {
    try { window.localStorage.setItem(key, value); } catch {}
  }
  async function toggleReminders(next) {
    setReminderMsg('');
    try {
      if (!next) {
        setReminderEnabled(false);
        setReminderPref('rapi.reminder.enabled', '0');
        syncReminders({ enabled: false });
        return;
      }
      let state = await reminderPermissionState();
      if (state !== 'granted') state = await requestReminderPermission();
      if (state !== 'granted') return setReminderMsg(t('rem.permDenied'));
      setReminderEnabled(true);
      setReminderPref('rapi.reminder.enabled', '1');
      const ok = await syncReminders({ enabled: true, hour: reminderHour, recurrings, lang });
      if (!ok) return setReminderMsg(t('rem.scheduleFail'));
      await fireTestPing(lang);
      setReminderMsg(t('rem.active'));
    } catch {
      setReminderMsg(t('rem.scheduleFail'));
    }
  }
  async function changeReminderHour(value) {
    const hour = Number(value);
    setReminderHour(hour);
    setReminderPref('rapi.reminder.hour', String(hour));
    if (reminderEnabled) await syncReminders({ enabled: true, hour, recurrings, lang });
  }
  /* Notifikasi terjadwal di-generate ulang saat ganti bahasa agar teksnya ikut bahasa baru */
  useEffect(() => {
    if (reminderEnabled && Capacitor.isNativePlatform()) syncReminders({ enabled: true, hour: reminderHour, recurrings, lang });
    return () => {};
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps
  async function claimGoal() {
    if (!goalReached || !window.confirm(t('confirm.claimGoal', { name: goal.name }))) return;
    await supabase.from('achievements').insert({ user_id: user.id, goal_name: goal.name, goal_amount: goal.amount, completed_at: today });
    await supabase.from('goals').update({ is_active: false }).eq('user_id', user.id).eq('is_active', true);
    setData((current) => ({ ...current, goals: { ...current.goals, [user.id]: null }, achievements: { ...current.achievements, [user.id]: [...(current.achievements?.[user.id] ?? []), { ...goal, id: crypto.randomUUID(), completedAt: today }] } }));
  }
  async function deleteAccount() {
    if (!window.confirm(t('confirm.deleteAccount', { name: user.username }))) return;
    await supabase.from('profiles').delete().eq('id', user.id);
    await supabase.auth.signOut();
    setData((current) => {
      const nextTransactions = { ...current.transactions };
      delete nextTransactions[user.id];
      const nextGoals = { ...current.goals }; delete nextGoals[user.id];
      const nextAchievements = { ...current.achievements }; delete nextAchievements[user.id];
      const nextBudgets = { ...current.budgets }; delete nextBudgets[user.id];
      return { users: current.users.filter((item) => item.id !== user.id), transactions: nextTransactions, goals: nextGoals, achievements: nextAchievements, budgets: nextBudgets, activeUserId: null };
    });
  }

  /* Sub-halaman Profil (pola menu Settings): full-replace di dalam tab,
     header kembali + judul + slot aksi kanan. Konten dipindah dari section lama. */
  function ProfileSubPage({ view, onBack }) {
    const meta = {
      kartu: ['card', 'prof.menu.kartu'],
      akun: ['key', 'prof.menu.akun'],
      pengaturan: ['sliders', 'prof.menu.pengaturan'],
      kategori: ['grid', 'cat.title'],
      rutin: ['repeat', 'recM.title'],
      dompet: ['wallet', 'prof.menu.dompet'],
      data: ['box', 'data.title'],
      pengingat: ['bell', 'rem.title'],
      danger: ['alert', 'danger.title'],
    }[view] ?? ['file', ''];
    const addAction = view === 'kategori' ? () => setCategorySheet(true) : view === 'rutin' ? () => setRecurringSheet(true) : view === 'dompet' ? () => setWalletSheet({}) : null;
    return <div className="profil-stack profile-sub">
      <header className="sub-header">
        <button type="button" className="sub-back" aria-label={t('prof.back')} onClick={onBack}><Icon name="chevronLeft" size={22} /></button>
        <span className="sub-icon" aria-hidden="true"><Icon name={meta[0]} size={22} /></span>
        <h2>{t(meta[1])}</h2>
        {addAction && <button type="button" className="clay-button brutal-button sub-action dp-button" onClick={addAction}>{view === 'kategori' ? t('cat.add') : view === 'dompet' ? t('wallet.add') : t('recM.add')}</button>}
      </header>
      {view === 'kartu' && <article className="share-card clay-card brutal-card brutal-share dp-card"><p className="kicker">{t('share.kicker')}</p><div className="share-id"><span className="avatar big" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</span><div><strong>{user.username}</strong><small>{t('prof.lvTitle', { lvl: profInfo.level, title: titleForLevel(user.level ?? 1, lang) })}</small></div><b className={`share-tier tier-${topCardTier}`}>{topCardTier}</b></div><ul className="share-stats"><li>🔥<span>{t('pc.statsStreak', { n: user.streakCurrent ?? 0 })}</span></li><li>🏅<span>{t('pc.statsBadge', { a: unlockedBadges, b: badgeViews.length })}</span></li></ul><p className="share-note">{t('share.note')}</p><div className="card-actions"><button className="card-button clay-button brutal-button dp-button" onClick={downloadProfileCard}>{t('share.download')}</button>{canShareCard && <button className="card-button ghost-button clay-button brutal-button brutal-ghost dp-button" onClick={shareProfileCard}>{t('share.shareBtn')}</button>}</div></article>}
      {view === 'pengaturan' && <article className="brutal-card settings-card dp-card">
        <div className="setting-row" role="group" aria-label={t('settings.currency')}>
          <p className="setting-label"><span className="row-icon" aria-hidden="true"><Icon name="exchange" size={18} /></span>{t('settings.currency')}</p>
          <select className="setting-select" value={fxCode} onChange={(e) => changeCurrency(e.target.value)} aria-label={t('settings.currencyAria')}>
            {CURRENCIES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
          <p className="fx-note">{fxStatus === 'loading' ? t('fx.loading') : fxStatus === 'unavailable' ? t('fx.unavailable') : fxData?.date ? `${t('fx.asOf', { date: fxData.date })}${fxStatus === 'stale' ? t('fx.staleSuffix') : ''}` : t('fx.noteIdr')}</p>
        </div>
        <div className="setting-row" role="group" aria-label={t('settings.fontSize')}>
          <p className="setting-label"><span className="row-icon" aria-hidden="true"><Icon name="type" size={18} /></span>{t('settings.fontSize')}</p>
          <div className="setting-seg">
            {[['1', 'font.normal'], ['1.15', 'font.big'], ['1.3', 'font.super']].map(([value, key]) => (
              <button key={value} type="button" className={fontScale === value ? 'active' : ''} aria-pressed={fontScale === value} onClick={() => onChangeFontScale(value)}>{t(key)}</button>
            ))}
          </div>
        </div>
        <div className="setting-row" role="group" aria-label={t('settings.language')}>
          <p className="setting-label"><span className="row-icon" aria-hidden="true"><Icon name="globe" size={18} /></span>{t('settings.language')}</p>
          <div className="setting-seg">
            {LANGS.map(([value, label]) => (
              <button key={value} type="button" className={lang === value ? 'active' : ''} aria-pressed={lang === value} onClick={() => onChangeLang(value)}>{label}</button>
            ))}
          </div>
        </div>
        <div className="setting-row" role="group" aria-label={t('settings.theme')}>
          <p className="setting-label"><span className="row-icon" aria-hidden="true"><Icon name="moon" size={18} /></span>{t('settings.theme')}</p>
          <div className="setting-seg">
            {[['system', 'theme.system'], ['light', 'theme.light'], ['dark', 'theme.dark']].map(([value, key]) => (
              <button key={value} type="button" className={theme === value ? 'active' : ''} aria-pressed={theme === value} onClick={() => onChangeTheme(value)}>{t(key)}</button>
            ))}
          </div>
        </div>
      </article>}
      {view === 'kategori' && <article className="category-manage-card brutal-card dp-card">
        <CategoryRows label={t('form.income')} items={categories.filter((item) => item.type !== 'expense')} onDelete={removeCategory} onCycleAllocation={cycleAllocation} />
        <CategoryRows label={t('form.expense')} items={categories.filter((item) => item.type !== 'income')} onDelete={removeCategory} onCycleAllocation={cycleAllocation} />
        <p className="alloc-note muted">{t('alloc.note')}</p>
      </article>}
      {view === 'rutin' && <article className="brutal-card recurring-manage-card dp-card">
        {recurrings.length ? recurrings.map((rule) => <div className="recurring-row" key={rule.id}>
          <span className="category-emoji">{emojiMap[rule.category] ?? '🔁'}</span>
          <div className="recurring-info">
            <strong>{rule.title}</strong>
            <small>{money.format(rule.amount)} · {rule.frequency === 'monthly' ? t('rec.everyMonthDay', { d: rule.dayOfPeriod }) : t('rec.everyWeekday', { day: rule.dayOfPeriod ? t(`wdF.${rule.dayOfPeriod}`) : '' })}</small>
            <small className="muted">{t('rec.next')} {dateFmt().format(new Date(`${rule.nextRunDate}T00:00:00`))}</small>
          </div>
          <button type="button" aria-label={t('tx.deleteAria', { title: rule.title })} onClick={() => removeRecurring(rule.id)}>×</button>
        </div>) : <p className="recurring-empty">{t('recM.empty')}</p>}
      </article>}
      {view === 'dompet' && <article className="brutal-card recurring-manage-card dp-card">
        {wallets.map((item) => <div className="recurring-row" key={item.id}>
          <span className="category-emoji">{item.emoji}</span>
          <div className="recurring-info">
            <strong>{item.name}</strong>
            <small className="muted">{item.isDefault ? t('wallet.defaultBadge') : t('wallet.txCount', { n: transactions.filter((tx) => tx.walletId === item.id).length })}</small>
          </div>
          <button type="button" aria-label={t('wallet.editAria', { name: item.name })} onClick={() => setWalletSheet(item)}><Icon name="pencil" size={16} /></button>
          {!item.isDefault && <button type="button" aria-label={t('tx.deleteAria', { title: item.name })} onClick={() => removeWallet(item.id)}>×</button>}
        </div>)}
        {wallets.length >= MAX_WALLETS ? <p className="recurring-empty">{t('wallet.limit')}</p> : <p className="recurring-empty muted">{t('wallet.hint')}</p>}
      </article>}
      {view === 'data' && <article className="brutal-card data-card dp-card">
        <p className="data-note">{t('data.note')}</p>
        <label className="data-label">{t('data.pdfRange')}</label>
        <div className="sort-toggle pdf-range" role="group" aria-label={t('data.pdfRange')}>{[['this', 'pdf.thisMonth'], ['last', 'pdf.lastMonth'], ['custom', 'pdf.custom']].map(([value, key]) => <button key={value} type="button" className={pdfRange === value ? 'active' : ''} onClick={() => setPdfRange(value)}>{t(key)}</button>)}</div>
        {pdfRange === 'custom' && <div className="pdf-custom"><input type="date" value={pdfCustom.start} max={today} onChange={(e) => setPdfCustom((cur) => ({ ...cur, start: e.target.value }))} aria-label={t('data.startAria')} /><span>{t('pdf.to')}</span><input type="date" value={pdfCustom.end} max={today} onChange={(e) => setPdfCustom((cur) => ({ ...cur, end: e.target.value }))} aria-label={t('data.endAria')} /></div>}
        <div className="data-actions">
          <button className="clay-button brutal-button" onClick={handleExportPdf}>{t('data.exportPdf')}</button>
          <button className="clay-button brutal-button brutal-ghost" onClick={handleExportCsv}>{t('data.exportCsv')}</button>
          <button className="clay-button brutal-button brutal-ghost" onClick={() => { setImportPreview(null); setImportSheetOpen(true); }}>{t('data.importCsv')}</button>
        </div>
      </article>}
      {view === 'pengingat' && showReminderCard && <article className="brutal-card reminder-card dp-card">
        <div className="reminder-row">
          <div><strong>{t('rem.enable')}</strong><p>{t('rem.desc')}</p></div>
          <button type="button" role="switch" aria-checked={reminderEnabled} aria-label={t('rem.enable')} className={`reminder-toggle ${reminderEnabled ? 'on' : ''}`} onClick={() => toggleReminders(!reminderEnabled)}><i /></button>
        </div>
        {reminderEnabled && <>
          <label className="reminder-hour">{t('rem.hour')}<select value={reminderHour} onChange={(e) => changeReminderHour(e.target.value)}>{[18, 19, 20, 21].map((h) => <option key={h} value={h}>{`${h}:00`}</option>)}</select></label>
          <button type="button" className="clay-button brutal-button brutal-ghost reminder-test" onClick={() => fireTestPing(lang)}>{t('rem.test')}</button>
        </>}
        {reminderMsg && <p className="form-message">{reminderMsg}</p>}
      </article>}
      {view === 'akun' && <article className="brutal-card recurring-manage-card dp-card">
        <AccountSettings user={user} notify={setToast} onRenamed={renameAccount} />
      </article>}
      {view === 'danger' && <section className="danger-zone clay-danger brutal-danger dp-danger"><div><strong>{t('danger.title')}</strong><p>{t('danger.desc')}</p></div><button className="danger-button clay-button brutal-button brutal-danger-btn dp-button" onClick={deleteAccount}>{t('danger.title')}</button></section>}
    </div>;
  }

  return <main className="dashboard-page dp-page">
    <div className="dashboard app-frame" id="dashboard">
      {debtsOpen ? <DebtsPage debts={debts} hasDebts={hasDebts} money={money} emojiMap={emojiMap} onBack={() => setDebtsOpen(false)} onAdd={() => setDebtFormSheet({})} onEdit={(item) => { setDebtFormSheet(item); }} onOpenDetail={setDebtDetailId} onPayInstallment={payDebtInstallment} onPayFlex={(item, amount) => payDebtFlex(item, amount)} onSettle={settleDebt} onDelete={removeDebt} debtDetailId={debtDetailId} onCloseDetail={() => setDebtDetailId(null)} /> : <>
      {tab === 'beranda' && <>
      <header className="mobile-header"><a className="brand dark brutal-brand" href="#dashboard"><span>r</span> rapi</a></header>
      {hasWallets && wallets.length > 1 && <WalletSwitcher wallets={wallets} active={activeWalletKey} onChange={changeActiveWallet} />}
      <section className="dashboard-heading clay-heading brutal-heading dp-heading">
        <div><p className="kicker">{t('home.kicker')}</p><h1>{t('home.greeting', { name: user.username })} <span aria-hidden="true">👋</span></h1></div>
        <button className="clay-button brutal-button dp-button" onClick={() => setShowForm(true)}><span>+</span> {t('btn.addTx')}</button>
      </section>
      <section className="summary-grid">
        <BalanceCard balance={balance} hidden={hideBalance} money={money} onToggleHidden={toggleHideBalance} xp={user.xp ?? 0} streak={user.streakCurrent ?? 0} lang={lang} showNet={hasDebts} netWorth={netWorthValue} onOpenDebts={() => { setDebtsOpen(true); window.scrollTo(0, 0); }} />
        <StatCard label={t('stat.income')} amount={income} icon="arrowDown" variant="income" hidden={hideBalance} money={money} />
        <StatCard label={t('stat.expense')} amount={expense} icon="arrowUp" variant="expense" hidden={hideBalance} money={money} />
      </section>
      </>}
      {tab === 'analisis' && <>
      {/* IA baru: Recap Cerita jadi headline tab Analisis (dipindah dari Beranda) */}
      <section className="recap-section brutal-section">
        <div className="section-header"><div><p className="kicker">{t('recap.kicker')}</p><h2>{t('recap.title')}</h2></div><div className="sort-toggle recap-toggle" role="group" aria-label={t('recap.toggleAria')}><button type="button" className={recapPeriod === 'week' ? 'active' : ''} onClick={() => setRecapPeriod('week')}>{t('recap.week')}</button><button type="button" className={recapPeriod === 'month' ? 'active' : ''} onClick={() => setRecapPeriod('month')}>{t('recap.month')}</button></div></div>
        {recap.isEmpty ? <article className="brutal-card recap-card dp-card recap-empty">{t('recap.empty')}</article> : <article className="brutal-card recap-card dp-card">
          {recap.lines.map((line, i) => <p key={i}><Highlighted text={line} /></p>)}
          <div className="recap-stats">
            <div><small>{t('recap.statIn')}</small><b className="in">{money.formatShort(recap.stats.income)}</b></div>
            <div><small>{t('recap.statOut')}</small><b className="out">{money.formatShort(recap.stats.expense)}</b></div>
            <div><small>{t('recap.statDays')}</small><b>{t('recap.daysVal', { n: recap.stats.activeDays })}</b></div>
          </div>
        </article>}
      </section>
      <section className="advice-section brutal-section">
        <div className="section-header"><div><h2>{t('an.title')}</h2><p>{t('an.sub')}</p></div></div>
        <article className="brutal-card advice-page">
          <p className="advice-sub">{t('adv.sub')}</p>
          {health.now.score != null && <ScorePanel health={health} />}
          <SimulationPanel sim={simulation} extra={extraMonthly} onExtra={setExtraMonthly} money={money} lang={lang} goalName={goal?.name ?? null} multiWallet={hasWallets && wallets.length > 1} todayStr={today} />
          {reco.enoughData ? <AllocSection reco={reco} money={money} /> : <div className="advice-empty"><strong>{t('alloc.empty.title')}</strong><p>{t('alloc.empty.msg')}</p></div>}
          {!advice.items.length ? <div className="advice-empty"><strong>{t('adv.empty.title')}</strong><p>{t('adv.empty.msg')}</p></div> : <>
            {(() => {
              const action = advice.items.filter((item) => item.severity === 'tinggi');
              const reminder = advice.items.filter((item) => item.severity !== 'tinggi');
              return <>
                {action.length > 0 && <section className="advice-group"><p className="kicker">{t('adv.groupAction')}</p>{action.map((item) => <AdviceItem key={item.id} item={item} />)}</section>}
                {reminder.length > 0 && <section className="advice-group"><p className="kicker">{t('adv.groupReminder')}</p>{reminder.map((item) => <AdviceItem key={item.id} item={item} />)}</section>}
              </>;
            })()}
            <p className="advice-disclaimer">{t('adv.disclaimer')}</p>
          </>}
        </article>
      </section>
      </>}
      {tab === 'target' && <>
      <section className="playful-grid tab-target">
        <article className={`goal-card clay-card clay-goal brutal-card brutal-goal dp-card ${goalReached ? 'goal-reached' : ''}`}><div><p className="kicker">{goalReached ? t('goal.kickerDone') : t('goal.kicker')}</p><h2>{goal ? goal.name : t('goal.noGoal')}</h2>{goal ? <><div className="goal-progress"><span style={{ width: `${Math.min(100, Math.max(0, totalBalance / goal.amount * 100))}%` }} /></div><p className="goal-caption"><strong>{money.format(Math.max(0, totalBalance))}</strong> {t('goal.of')} {money.format(goal.amount)}</p>{!goalReached && <button type="button" className="goal-sim-link dp-link" onClick={() => { setTab('analisis'); }}>{t('sim.openFromGoal')}</button>}</> : <p className="goal-caption">{t('goal.captionEmpty')}</p>}</div>{goalReached ? <button className="claim-goal clay-button brutal-button brutal-success dp-button" onClick={claimGoal}>{t('btn.claimBadge')}</button> : <button className="goal-button clay-button brutal-button dp-button" onClick={() => setGoalSheet(true)}>{t(goal ? 'btn.editGoal' : 'btn.newGoal')}</button>}</article>
        <article className="badge-card clay-card clay-badge brutal-card brutal-badge dp-card"><div className="badge-heading"><div><p className="kicker">{t('badge.kicker')}</p><h2>{t('badge.heading')}</h2></div><span>{unlockedBadges}/{badgeViews.length}</span></div><div className="badges">{badgeViews.map((badge) => <div className={`badge tier-${badge.rarity} ${badge.unlocked ? 'unlocked' : 'locked'} dp-item`} key={badge.code}><span>{badge.icon}</span><div><strong>{badge.title}</strong><small>{badge.unlocked ? badge.note : `${Math.min(badge.current, badge.target)}/${badge.target} · ${badge.note}`}</small>{!badge.unlocked && <i className="badge-progress"><em style={{ width: `${badge.progress * 100}%` }} /></i>}</div><b className="badge-tier">{badge.rarity}</b></div>)}</div></article>
      </section>
      {/* IA baru: Tantangan Minggu Ini jadi keluarga gamifikasi Target (dipindah dari Beranda) */}
      <section className="challenge-section brutal-section">
        <div className="section-header"><div><p className="kicker">{t('ch.kicker')}</p><h2>{t('ch.title')}</h2></div></div>
        {completedThisWeek.map((row) => <article className="brutal-card challenge-card dp-card challenge-done" key={row.id}>
          <span className="challenge-emoji">{CHALLENGE_DEFS.find((item) => item.code === row.code)?.icon ?? '🏅'}</span>
          <div className="challenge-body">
            <strong>{t(`ch.name.${row.code}`)}</strong>
            <small>{t('ch.doneNote', { xp: CHALLENGE_DEFS.find((item) => item.code === row.code)?.xp ?? 0 })}</small>
          </div>
          <b className="challenge-chip"><Icon name="trophy" size={14} /> {t('ch.doneChip')}</b>
        </article>)}
        {challengeLive && !completedThisWeek.length && <article className={`brutal-card challenge-card dp-card ${challengeLive.progress.failed ? 'challenge-failed' : ''}`}>
          <span className="challenge-emoji">{CHALLENGE_DEFS.find((item) => item.code === challengeLive.code)?.icon ?? '🎯'}</span>
          <div className="challenge-body">
            <strong>{t(`ch.name.${challengeLive.code}`)}</strong>
            <small>{t(`ch.rule.${challengeLive.code}`)}</small>
            {!challengeLive.progress.failed && <>
              <div className="budget-bar challenge-bar"><span style={{ width: `${challengeLive.progress.percent}%` }} /></div>
              <em>{challengeProgressLabel(challengeLive.code, challengeLive.progress, lang)} · {daysBetween(today, addDays(weekStart, 6)) > 0 ? t('ch.daysLeft', { n: daysBetween(today, addDays(weekStart, 6)) }) : t('ch.lastDay')}</em>
            </>}
            {challengeLive.progress.failed && <em>{t('ch.failedNote')}</em>}
          </div>
          <b className="challenge-chip">+{CHALLENGE_DEFS.find((item) => item.code === challengeLive.code)?.xp ?? 0} XP</b>
        </article>}
        {!challengeLive && !completedThisWeek.length && <article className="brutal-card challenge-empty">
          <div>
            <strong>{t('ch.pickTitle')}</strong>
            <p>{t('ch.pickSub')}</p>
          </div>
          <button className="clay-button brutal-button" onClick={() => setChallengeSheetOpen(true)}>{t('ch.pick')}</button>
        </article>}
      </section>
      </>}
      {tab === 'beranda' && <>
      <section className="insight-section clay-insight brutal-section"><div className="section-header"><div><h2>{t('insight.title')}</h2><p>{t('insight.sub')}</p></div></div><div className="insight-grid"><article className="insight-card clay-card brutal-card dp-card"><span className="insight-ico"><Icon name="bulb" size={26} /></span><div><p className="kicker">{topSpending ? t('insight.topKicker') : t('insight.title')}</p><strong>{topSpending ? `${emojiMap[topSpending.category] ?? '✨'} ${topSpending.category}` : t('insight.none')}</strong>{topSpending && <span className="insight-amount">{money.format(topSpending.amount)}</span>}<p className="insight-caption">{topSpending ? t('insight.captionTop') : t('insight.captionEmpty')}</p></div></article><article className="chart-card clay-card brutal-card dp-card"><div className="chart-title"><strong>{t('chart.title')}</strong><span>{t('chart.period')}</span></div>{categorySummary.length ? <div className="chart-bars">{categorySummary.map((item) => <div className="chart-row" key={item.category}><span>{emojiMap[item.category] ?? '✨'}</span><div><div><strong>{item.category}</strong><b>{money.format(item.amount)}</b></div><i><em style={{ width: `${item.amount / chartMax * 100}%` }} /></i></div></div>)}</div> : <p className="chart-empty">{t('chart.empty')}</p>}</article></div></section>
      <section className="budget-section clay-budget brutal-section"><div className="section-header"><div><h2>{t('budget.title')}</h2><p>{t('budget.sub')}{hasWallets && wallets.length > 1 ? ` · ${t('budget.scopeAll')}` : ''}</p></div><button className="budget-add clay-button brutal-button dp-button" onClick={() => setBudgetSheet({})}>{t('budget.add')}</button></div>{budgetEntries.length ? <div className="budget-grid">{budgetEntries.map(([category, limit]) => { const spent = spendingFor(category); const ratio = spent / limit; const state = ratio >= 1 ? 'over' : ratio >= .8 ? 'near' : 'safe'; return <article className="budget-item clay-card brutal-card dp-card" key={category}><div><span>{emojiMap[category] ?? '✨'}</span><strong>{category}</strong><button onClick={() => setBudgetSheet({ category })} aria-label={t('budget.editAria', { category })}>⋯</button></div><div className="budget-bar"><span className={state} style={{ width: `${Math.min(100, ratio * 100)}%` }} /></div><p><b>{money.format(spent)}</b> / {money.format(limit)} <em>{state === 'over' ? t('budget.over') : state === 'near' ? t('budget.near') : t('budget.safe')}</em></p></article>; })}</div> : <div className="budget-empty brutal-empty dp-card"><span className="empty-ico"><Icon name="sparkle" size={28} /></span><div><strong>{t('budget.emptyT')}</strong><p>{t('budget.emptyD')}</p></div><button className="clay-button brutal-button dp-button" onClick={() => setBudgetSheet({})}>{t('budget.createBtn')}</button></div>}</section>
      </>}
      {tab === 'transaksi' && <>
      <section className="transactions-section clay-transactions brutal-section">
        <div className="section-header"><div><h2>{t('tx.title')}</h2><p>{t('tx.count', { n: transactions.length })}</p></div><div className="filters brutal-filters dp-pills">{['all', 'income', 'expense'].map((id) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{t(`filter.${id}`)}</button>)}</div></div>
        <div className="list-toolbar">
          {hasWallets && wallets.length > 1 && <div className="wallet-switcher tx-scope" role="group" aria-label={t('wallet.switchAria')}>
            <button type="button" className={txWalletFilter === 'all' ? 'active' : ''} aria-pressed={txWalletFilter === 'all'} onClick={() => setTxWalletFilter('all')}>Σ {t('wallet.all')}</button>
            {wallets.map((item) => <button key={item.id} type="button" className={txWalletFilter === item.id ? 'active' : ''} aria-pressed={txWalletFilter === item.id} onClick={() => setTxWalletFilter(item.id)}>{item.emoji}</button>)}
          </div>}
          <div className="category-filters" role="group" aria-label={t('tx.filterAria')}>
            {categoryChips.map((item) => <button key={item.id} type="button" className={categoryFilter === item.name ? 'active' : ''} aria-pressed={categoryFilter === item.name} onClick={() => setCategoryFilter(categoryFilter === item.name ? '' : item.name)}>{item.emoji} {item.name}</button>)}
          </div>
          <div className="sort-toggle dp-seg" role="group" aria-label={t('tx.sortAria')}>
            <button type="button" className={sortMode === 'newest' ? 'active' : ''} onClick={() => setSortMode('newest')}>{t('sort.newest')}</button>
            <button type="button" className={sortMode === 'amount' ? 'active' : ''} onClick={() => setSortMode('amount')}>{t('sort.biggest')}</button>
          </div>
        </div>
        <div className="transaction-list">
          {visibleTransactions.length ? visibleTransactions.map((item) => <Transaction key={item.id} item={item} emojiMap={emojiMap} money={money} onDelete={removeTransaction} />) : <EmptyState filter={filter} filtered={filter !== 'all' || Boolean(categoryFilter)} onAdd={() => setShowForm(true)} />}
        </div>
      </section>
      </>}
      {tab === 'profil' && (profileView ? <ProfileSubPage view={profileView} onBack={() => setProfileView(null)} /> : <section className="profil-stack">
      <div className="profile-head"><span className="avatar big">{user.username.slice(0, 1).toUpperCase()}</span><div><strong>{user.username}</strong><small>{t('prof.lvTitle', { lvl: profInfo.level, title: titleForLevel(user.level ?? 1, lang) })}</small></div></div>
      <nav className="profile-menu brutal-card dp-card" aria-label={t('prof.menu.aria')}>
        {PROFILE_MENU_ROWS.map(([id, icon, labelKey]) => <button key={id} type="button" className="profile-menu-row dp-item" onClick={() => setProfileView(id)}><span className="row-icon" aria-hidden="true"><Icon name={icon} size={20} /></span><span className="row-label">{t(labelKey)}</span><span className="row-chevron" aria-hidden="true">›</span></button>)}
        {showReminderCard && <button type="button" className="profile-menu-row dp-item" onClick={() => setProfileView('pengingat')}><span className="row-icon" aria-hidden="true"><Icon name="bell" size={20} /></span><span className="row-label">{t('rem.title')}</span><span className="row-chevron" aria-hidden="true">›</span></button>}
        <button type="button" className="profile-menu-row danger dp-item" onClick={() => setProfileView('danger')}><span className="row-icon" aria-hidden="true"><Icon name="alert" size={20} /></span><span className="row-label">{t('danger.title')}</span><span className="row-chevron" aria-hidden="true">›</span></button>
      </nav>
      <button className="logout-full clay-button brutal-button brutal-ghost dp-button" onClick={logout}>{t('auth.logout')}</button>
      </section>)}
      </>}
    </div>
    {toast && <div className="brutal-toast" role="status">{toast}</div>}
    <BottomNav active={tab} onChange={setTab} onAdd={() => setShowForm(true)} />
    {showForm && <TransactionForm expenseOptions={expenseCategories} incomeOptions={incomeCategories} wallets={wallets} hasWallets={hasWallets} defaultWalletId={defaultWallet?.id ?? null} onClose={() => setShowForm(false)} onSubmit={addTransaction} />}
    {budgetSheet && <BudgetSheet options={expenseCategories} initialCategory={budgetSheet.category ?? ''} currentLimit={budgetSheet.category ? budgets[budgetSheet.category] : ''} onClose={() => setBudgetSheet(null)} onSubmit={saveBudget} />}
    {goalSheet && <GoalSheet goal={goal} onClose={() => setGoalSheet(false)} onSubmit={saveGoal} />}
    {categorySheet && <CategorySheet existingNames={categories.map((item) => item.name)} onClose={() => setCategorySheet(false)} onSubmit={saveCategory} />}
    {recurringSheet && <RecurringSheet categories={categories} wallets={wallets} hasWallets={hasWallets} defaultWalletId={defaultWallet?.id ?? null} onClose={() => setRecurringSheet(false)} onSubmit={addRecurring} />}
    {walletSheet && <WalletSheet existingNames={(data.wallets?.[user.id] ?? []).map((item) => item.name)} initial={walletSheet.id ? walletSheet : null} onClose={() => setWalletSheet(null)} onSubmit={saveWallet} />}
    {challengeSheetOpen && <ChallengeSheet activeCode={activeChallengeRow?.code ?? null} completedCodes={completedThisWeek.map((row) => row.code)} transactions={transactions} today={today} weekStart={weekStart} onClose={() => setChallengeSheetOpen(false)} onActivate={activateChallenge} />}
    {importSheetOpen && <ImportSheet preview={importPreview} busy={importBusy} money={money} onClose={() => { setImportSheetOpen(false); setImportPreview(null); }} onFile={handleImportFile} onReset={() => setImportPreview(null)} onConfirm={confirmImport} />}
    {debtFormSheet && <DebtFormSheet initial={debtFormSheet.id ? debtFormSheet : null} expenseOptions={expenseCategories} incomeOptions={incomeCategories} wallets={wallets} hasWallets={hasWallets} defaultWalletId={defaultWallet?.id ?? null} onClose={() => setDebtFormSheet(null)} onSubmit={saveDebt} />}
    {levelUp && <LevelUpModal {...levelUp} title={titleForLevel(levelUp.level, lang)} onClose={() => setLevelUp(null)} />}
  </main>;
}

function BalanceCard({ balance, hidden = false, onToggleHidden, xp, streak = 0, money, lang = 'id', showNet = false, netWorth = 0, onOpenDebts }) {
  const info = levelProgress(xp, lang);
  return <article className="balance-card clay-card brutal-card dp-card"><div><div className="balance-label-row"><p>{t('balance.label')}</p><button type="button" className="eye-toggle" aria-pressed={hidden} aria-label={hidden ? t('balance.ariaShow') : t('balance.ariaHide')} onClick={onToggleHidden}><Icon name={hidden ? 'eyeOff' : 'eye'} size={20} /></button></div><strong>{hidden ? MASKED_AMOUNT : money.format(balance)}</strong><small>{balance >= 0 ? t('balance.ok') : t('balance.neg')}</small>{showNet && <button type="button" className="net-worth-row" aria-label={t('debts.openAria')} onClick={onOpenDebts}><span>{t('debts.netWorth')}</span><b>{hidden ? MASKED_AMOUNT : money.format(netWorth)}</b><Icon name="chevronRight" size={14} /></button>}<div className="level-strip"><div className="level-chip"><b>Lv {info.level}</b><span>{info.title}</span></div><div className="level-bar" role="progressbar" aria-valuenow={info.percent} aria-valuemin={0} aria-valuemax={100} aria-label={t('xp.progressAria', { lvl: info.level + 1 })}><span style={{ width: `${info.percent}%` }} /></div><small>{t('xp.toNext', { a: info.xpIntoLevel, b: info.xpForNextLevel, lvl: info.level + 1 })}</small><div className={`streak-chip ${streak > 0 ? 'active' : 'idle'}`}>{streak > 0 ? t('streak.active', { n: streak }) : t('streak.start')}</div></div></div><div className="balance-mark">Rp</div></article>;
}
function StatCard({ label, amount, icon, variant, hidden = false, money }) { return <article className={`stat-card clay-card brutal-card dp-card ${variant}`}><span className={`stat-icon ${variant}`}><Icon name={icon} size={22} /></span><div><p>{label}</p><strong>{hidden ? MASKED_AMOUNT : money.format(amount)}</strong><small>{variant === 'income' ? t('stat.incomeSub') : t('stat.expenseSub')}</small></div></article>; }

/* F4b — switcher dompet Beranda: chip scroll-snap ala toolbar kategori.
   Muncul hanya saat >1 dompet; pilihan "Semua" = gabungan seluruh dompet. */
function WalletSwitcher({ wallets = [], active, onChange }) {
  return <div className="wallet-switcher" role="group" aria-label={t('wallet.switchAria')}>
    <button type="button" className={active === 'all' ? 'active' : ''} aria-pressed={active === 'all'} onClick={() => onChange('all')}>Σ {t('wallet.all')}</button>
    {wallets.map((item) => <button key={item.id} type="button" className={active === item.id ? 'active' : ''} aria-pressed={active === item.id} onClick={() => onChange(item.id)}>{item.emoji} {item.name}</button>)}
  </div>;
}

function Transaction({ item, emojiMap = {}, onDelete , money }) {
  const income = item.type === 'income';
  return <article className="transaction clay-card brutal-card brutal-row dp-item"><span className={`transaction-icon ${income ? 'income' : 'expense'}`}>{emojiMap[item.category] || '✨'}</span><div className="transaction-info"><strong>{item.title}</strong><span>{item.category} <i>•</i> {dateFmt().format(new Date(`${item.date}T00:00:00`))}</span></div><strong className={income ? 'amount income-text' : 'amount expense-text'}>{income ? '+' : '−'} {money.format(item.amount)}</strong><button className="delete-transaction" aria-label={t('tx.deleteAria', { title: item.title })} onClick={() => onDelete(item.id)}>×</button></article>;
}

function EmptyState({ filter, filtered = false, onAdd }) { return <div className="empty brutal-empty-state dp-card"><span>⌁</span><h3>{filtered ? t('empty.filtered') : filter === 'all' ? t('empty.all') : t('empty.type')}</h3><p>{filtered ? t('empty.filteredHint') : t('empty.hint')}</p>{filter === 'all' && !filtered && <button className="empty-button clay-button brutal-button dp-button" onClick={onAdd}>{t('btn.addTx')}</button>}</div>; }

function TransactionForm({ expenseOptions = [], incomeOptions = [], wallets = [], hasWallets = false, defaultWalletId = null, onClose, onSubmit }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(today);
  const [walletId, setWalletId] = useState(defaultWalletId);
  const [message, setMessage] = useState('');
  const categories = type === 'income' ? incomeOptions : expenseOptions;
  async function submit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!title.trim() || !category || !date || !Number.isFinite(numericAmount) || numericAmount <= 0) return setMessage(t('err.completeTx'));
    const saved = await onSubmit({ title: title.trim(), amount: numericAmount, category, date, type, walletId });
    if (!saved) setMessage(t('err.saveTx'));
  }
  /* F4d — pilih dompet saat ada lebih dari satu; satu dompet → otomatis. */
  const showWalletPicker = hasWallets && wallets.length > 1;
  return <div className="modal-backdrop clay-modal brutal-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}><section className="modal clay-card brutal-sheet dp-sheet" role="dialog" aria-modal="true" aria-labelledby="form-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={onClose} aria-label={t('common.close')}>×</button><p className="kicker">{t('form.tx.kicker')}</p><h2 id="form-title">{t('form.tx.title')}</h2><form onSubmit={submit}><div className="type-switch dp-typeswitch"><button type="button" className={type === 'expense' ? 'selected expense' : ''} onClick={() => { setType('expense'); setCategory(''); }}>{t('form.expense')}</button><button type="button" className={type === 'income' ? 'selected income' : ''} onClick={() => { setType('income'); setCategory(''); }}>{t('form.income')}</button></div><label>{t('label.name')}<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === 'income' ? t('form.tx.phIncome') : t('form.tx.phExpense')} /></label><label>{t('label.amount')}<input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder={t('form.tx.phAmount')} /></label><div className="form-pair"><label>{t('label.category')}<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">{t('opt.pickCategory')}</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>{t('label.date')}<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></div>{showWalletPicker && <label>{t('form.wallet.select')}<select value={walletId ?? ''} onChange={(e) => setWalletId(e.target.value)}><option value="">{t('wallet.all')}</option>{wallets.map((item) => <option key={item.id} value={item.id}>{`${item.emoji} ${item.name}`}</option>)}</select></label>}{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="ghost-button clay-button brutal-button brutal-ghost" type="button" onClick={onClose}>{t('common.cancel')}</button><button className="primary-button clay-button brutal-button dp-button" type="submit">{t('btn.saveTx')} <span>→</span></button></div></form></section></div>;
}

function BudgetSheet({ options = [], initialCategory = '', currentLimit = '', onClose, onSubmit }) {
  const [category, setCategory] = useState(initialCategory);
  const [amount, setAmount] = useState(currentLimit ? String(currentLimit) : '');
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!category || !options.includes(category)) return setMessage(t('err.pickCategory'));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setMessage(t('err.badLimit'));
    if (!(await onSubmit(category, numericAmount))) return setMessage(t('err.saveBudget'));
    onClose();
  }
  return <div className="modal-backdrop clay-modal brutal-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}><section className="modal clay-card brutal-sheet dp-sheet" role="dialog" aria-modal="true" aria-labelledby="budget-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={onClose} aria-label={t('common.close')}>×</button><p className="kicker">{t('form.budget.kicker')}</p><h2 id="budget-title">{t(initialCategory ? 'form.budget.edit' : 'form.budget.new')}</h2><form onSubmit={submit}><label>{t('label.category')}<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">{t('opt.pickCategory')}</option>{options.map((item) => <option key={item}>{item}</option>)}</select></label><label>{t('form.budget.limitLabel')}<input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder={t('form.budget.ph')} /></label>{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="ghost-button clay-button brutal-button brutal-ghost" type="button" onClick={onClose}>{t('common.cancel')}</button><button className="primary-button clay-button brutal-button dp-button" type="submit">{t('btn.saveBudget')} <span>→</span></button></div></form></section></div>;
}

function GoalSheet({ goal, onClose, onSubmit }) {
  const [name, setName] = useState(goal?.name ?? '');
  const [amount, setAmount] = useState(goal?.amount ? String(goal.amount) : '');
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!name.trim()) return setMessage(t('err.goalName'));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setMessage(t('err.badGoalAmount'));
    if (!(await onSubmit(name.trim(), numericAmount))) return setMessage(t('err.saveGoal'));
    onClose();
  }
  return <div className="modal-backdrop clay-modal brutal-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}><section className="modal clay-card brutal-sheet dp-sheet" role="dialog" aria-modal="true" aria-labelledby="goal-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={onClose} aria-label={t('common.close')}>×</button><p className="kicker">{t('goal.kicker')}</p><h2 id="goal-title">{t(goal ? 'form.goal.edit' : 'form.goal.new')}</h2><form onSubmit={submit}><label>{t('form.goal.name')}<input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('form.goal.ph')} /></label><label>{t('form.goal.amount')}<input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder={t('form.goal.phAmount')} /></label>{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="ghost-button clay-button brutal-button brutal-ghost" type="button" onClick={onClose}>{t('common.cancel')}</button><button className="primary-button clay-button brutal-button dp-button" type="submit">{t('btn.saveGoal')} <span>→</span></button></div></form></section></div>;
}

function CategoryRows({ label, items, onDelete, onCycleAllocation }) {
  return <div className="category-group">
    <small>{label}</small>
    {items.map((item) => <div className="category-row" key={item.id}>
      <span className="category-emoji">{item.emoji}</span>
      <strong>{item.name}</strong>
      {item.type !== 'income' && <button type="button" className={`alloc-chip ${allocationOf(item)}`} aria-label={t('alloc.chipAria', { name: item.name })} onClick={() => onCycleAllocation(item)}>{t(`alloc.${allocationOf(item)}`)}</button>}
      {item.isDefault && <em>{t('cat.defaultChip')}</em>}
      {!item.isDefault && <button type="button" aria-label={t('cat.deleteAria', { name: item.name })} onClick={() => onDelete(item.id)}>×</button>}
    </div>)}
  </div>;
}

function CategorySheet({ existingNames = [], onClose, onSubmit }) {
  const [type, setType] = useState('expense');
  const [emoji, setEmoji] = useState('');
  const [name, setName] = useState('');
  const [allocation, setAllocation] = useState('kebutuhan');
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmoji = Array.from(emoji.trim())[0] ?? '';
    if (!cleanName) return setMessage(t('err.catName'));
    if (existingNames.some((item) => item.toLowerCase() === cleanName.toLowerCase())) return setMessage(t('err.catDup'));
    if (!cleanEmoji) return setMessage(t('err.pickEmoji'));
    if (!(await onSubmit({ name: cleanName, emoji: cleanEmoji, type, allocation: type === 'income' ? null : allocation }))) return setMessage(t('err.saveCat'));
    onClose();
  }
  return <div className="modal-backdrop clay-modal brutal-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}><section className="modal clay-card brutal-sheet dp-sheet" role="dialog" aria-modal="true" aria-labelledby="category-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={onClose} aria-label={t('common.close')}>×</button><p className="kicker">{t('form.cat.kicker')}</p><h2 id="category-title">{t('form.cat.title')}</h2><form onSubmit={submit}><div className="type-switch dp-typeswitch"><button type="button" className={type === 'expense' ? 'selected expense' : ''} onClick={() => setType('expense')}>{t('form.expense')}</button><button type="button" className={type === 'income' ? 'selected income' : ''} onClick={() => setType('income')}>{t('form.income')}</button><button type="button" className={type === 'both' ? 'selected both' : ''} onClick={() => setType('both')}>{t('form.both')}</button></div><label>{t('form.cat.name')}<input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder={t('form.cat.ph')} /></label><label>{t('form.cat.emoji')}<div className="emoji-field"><span>{Array.from(emoji.trim())[0] || '❓'}</span><input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={8} placeholder="📦" /></div></label>{type !== 'income' && <div className="settings-field alloc-field" role="group" aria-label={t('alloc.label')}><span>{t('alloc.label')}</span><div className="sort-toggle alloc-switch">{ALLOCATIONS.map((a) => <button key={a} type="button" className={allocation === a ? 'active' : ''} aria-pressed={allocation === a} onClick={() => setAllocation(a)}>{t(`alloc.${a}`)}</button>)}</div></div>}{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="ghost-button clay-button brutal-button brutal-ghost" type="button" onClick={onClose}>{t('common.cancel')}</button><button className="primary-button clay-button brutal-button dp-button" type="submit">{t('btn.saveCat')} <span>→</span></button></div></form></section></div>;
}

function RecurringSheet({ categories = [], wallets = [], hasWallets = false, defaultWalletId = null, onClose, onSubmit }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [dayOfPeriod, setDayOfPeriod] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [walletId, setWalletId] = useState(defaultWalletId);
  const [message, setMessage] = useState('');
  const options = categories.filter((item) => item.type === type || item.type === 'both');
  async function submit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!title.trim()) return setMessage(t('err.recName'));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setMessage(t('err.badAmount'));
    if (!category) return setMessage(t('err.pickCategory'));
    if (!dayOfPeriod) return setMessage(frequency === 'monthly' ? t('err.pickBillDate') : t('err.pickBillDay'));
    if (!startDate) return setMessage(t('err.pickStart'));
    if (!(await onSubmit({ type, title: title.trim(), amount: numericAmount, category, frequency, dayOfPeriod: Number(dayOfPeriod), startDate, walletId }))) return setMessage(t('err.saveRec'));
    onClose();
  }
  return <div className="modal-backdrop clay-modal brutal-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}><section className="modal clay-card brutal-sheet dp-sheet" role="dialog" aria-modal="true" aria-labelledby="recurring-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={onClose} aria-label={t('common.close')}>×</button><p className="kicker">{t('form.rec.kicker')}</p><h2 id="recurring-title">{t('form.rec.title')}</h2><form onSubmit={submit}><div className="type-switch dp-typeswitch"><button type="button" className={type === 'expense' ? 'selected expense' : ''} onClick={() => { setType('expense'); setCategory(''); }}>{t('form.expense')}</button><button type="button" className={type === 'income' ? 'selected income' : ''} onClick={() => { setType('income'); setCategory(''); }}>{t('form.income')}</button></div><label>{t('form.rec.name')}<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={30} placeholder={t('form.rec.ph')} /></label><label>{t('label.amount')}<input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder={t('form.rec.phAmount')} /></label><div className="form-pair"><label>{t('form.rec.freq')}<select value={frequency} onChange={(e) => { setFrequency(e.target.value); setDayOfPeriod(''); }}><option value="monthly">{t('rec.monthly')}</option><option value="weekly">{t('rec.weekly')}</option></select></label><label>{t('label.category')}<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">{t('opt.pickCategory')}</option>{options.map((item) => <option key={item.name}>{item.name}</option>)}</select></label></div>{frequency === 'monthly' ? <label>{t('form.rec.billDate')}<select value={dayOfPeriod} onChange={(e) => setDayOfPeriod(e.target.value)}><option value="">{t('rec.pickDay')}</option>{Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{t('rec.dayN', { d })}</option>)}</select></label> : <label>{t('form.rec.billDay')}<div className="weekday-chips">{[1, 2, 3, 4, 5, 6, 7].map((d) => <button type="button" key={d} className={String(dayOfPeriod) === String(d) ? 'selected' : ''} onClick={() => setDayOfPeriod(String(d))}>{t(`wd.${d}`)}</button>)}</div></label>}<label>{t('form.rec.startDate')}<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>{hasWallets && wallets.length > 1 && <label>{t('form.wallet.select')}<select value={walletId ?? ''} onChange={(e) => setWalletId(e.target.value)}><option value="">{t('wallet.all')}</option>{wallets.map((item) => <option key={item.id} value={item.id}>{`${item.emoji} ${item.name}`}</option>)}</select></label>}{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="ghost-button clay-button brutal-button brutal-ghost" type="button" onClick={onClose}>{t('common.cancel')}</button><button className="primary-button clay-button brutal-button dp-button" type="submit">{t('btn.saveRec')} <span>→</span></button></div></form></section></div>;
}

/* F4c — sheet buat/edit dompet: nama + ikon dari grid tetap (tanpa input bebas
   supaya hasil selalu satu emoji bersih). */
function WalletSheet({ existingNames = [], initial = null, onClose, onSubmit }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '');
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return setMessage(t('err.catName'));
    if (!emoji) return setMessage(t('err.pickEmoji'));
    const dup = existingNames.some((item) => item.toLowerCase() === cleanName.toLowerCase() && item !== (initial?.name ?? ''));
    if (dup) return setMessage(t('err.catDup'));
    if (!(await onSubmit({ id: initial?.id ?? null, name: cleanName, emoji }))) return setMessage(t('err.saveWallet'));
    onClose();
  }
  return <div className="modal-backdrop clay-modal brutal-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}><section className="modal clay-card brutal-sheet dp-sheet" role="dialog" aria-modal="true" aria-labelledby="wallet-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={onClose} aria-label={t('common.close')}>×</button><p className="kicker">{t('form.wallet.kicker')}</p><h2 id="wallet-title">{initial ? t('form.wallet.edit') : t('form.wallet.new')}</h2><form onSubmit={submit}><label>{t('form.wallet.name')}<input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder={t('form.wallet.ph')} /></label><div className="settings-field emoji-grid-field" role="radiogroup" aria-label={t('form.wallet.emoji')}><span>{t('form.wallet.emoji')}</span><div className="emoji-grid">{WALLET_EMOJIS.map((item) => <button key={item} type="button" className={emoji === item ? 'active' : ''} aria-pressed={emoji === item} aria-label={item} onClick={() => setEmoji(item)}>{item}</button>)}</div></div>{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="ghost-button clay-button brutal-button brutal-ghost" type="button" onClick={onClose}>{t('common.cancel')}</button><button className="primary-button clay-button brutal-button dp-button" type="submit">{t('btn.saveWallet')} <span>→</span></button></div></form></section></div>;
}

/* F8 — Halaman kelola hutang & piutang: layar penuh dari pintu masuk
   Kekayaan Bersih di BalanceCard. Segmented arah + daftar aktif + riwayat. */
function DebtsPage({ debts, hasDebts, money, emojiMap = {}, onBack, onAdd, onEdit, onOpenDetail, onPayInstallment, onPayFlex, onSettle, onDelete, debtDetailId, onCloseDetail }) {
  const [filter, setFilter] = useState('all');
  const [showPaid, setShowPaid] = useState(false);
  const activeItems = debts.filter((item) => item.status === 'active');
  const settledItems = debts.filter((item) => item.status !== 'active');
  const filtered = filter === 'all' ? activeItems : activeItems.filter((item) => item.direction === filter);
  const totals = totalsByDirection(debts);
  const detail = debts.find((item) => item.id === debtDetailId) ?? null;
  return <section className="profil-stack debts-page">
    <header className="sub-header">
      <button type="button" className="sub-back" aria-label={t('prof.back')} onClick={onBack}><Icon name="chevronLeft" size={22} /></button>
      <span className="sub-icon" aria-hidden="true"><Icon name="exchange" size={22} /></span>
      <h2>{t('debts.title')}</h2>
      {hasDebts && <button type="button" className="clay-button brutal-button sub-action dp-button" onClick={onAdd}>{t('debts.add')}</button>}
    </header>
    {!hasDebts ? <article className="brutal-card dp-card"><p className="recurring-empty">{t('debts.offNote')}</p></article> : <>
      <article className="brutal-card dp-card debts-overview">
        <div className={`debt-total ${totals.receivableCount ? 'in' : ''}`}>
          <small>{t('debts.dir.receivable')}</small>
          <strong>{money.format(totals.receivable)}</strong>
          <em>{t('debts.countN', { n: totals.receivableCount })}</em>
        </div>
        <div className={`debt-total ${totals.payableCount ? 'out' : ''}`}>
          <small>{t('debts.dir.payable')}</small>
          <strong>{money.format(totals.payable)}</strong>
          <em>{t('debts.countN', { n: totals.payableCount })}</em>
        </div>
      </article>
      <div className="sort-toggle debts-seg" role="group" aria-label={t('debts.filterAria')}>
        {[['all', 'debts.filterAll'], ['receivable', 'debts.dir.receivable'], ['payable', 'debts.dir.payable']].map(([value, key]) => (
          <button key={value} type="button" className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{t(key)}</button>
        ))}
      </div>
      <div className="debts-list">
        {filtered.length ? filtered.map((item) => <DebtRow key={item.id} debt={item} money={money} emojiMap={emojiMap} onOpen={() => onOpenDetail(item.id)} onPayInstallment={() => onPayInstallment(item)} />) : <p className="recurring-empty">{t('debts.empty')}</p>}
      </div>
      {settledItems.length > 0 && <>
        <button type="button" className="debts-paid-toggle dp-item" aria-expanded={showPaid} onClick={() => setShowPaid((cur) => !cur)}>
          <Icon name="chevronDown" size={16} /> {t('debts.paidGroup', { n: settledItems.length })}
        </button>
        {showPaid && <div className="debts-list">
          {settledItems.map((item) => <DebtRow key={item.id} debt={item} money={money} emojiMap={emojiMap} onOpen={() => onOpenDetail(item.id)} />)}
        </div>}
      </>}
    </>}
    {detail && <DebtDetailSheet debt={detail} money={money} today={today} onClose={onCloseDetail} onPayInstallment={() => onPayInstallment(detail)} onPayFlex={(amount) => onPayFlex(detail, amount)} onSettle={(status) => onSettle(detail, status)} onDelete={() => onDelete(detail.id)} onEdit={() => { onCloseDetail(); onEdit(detail); }} />}
  </section>;
}

/* F8 — baris kartu hutang/piutang: pihak, sisa, progres cicilan, tempo. */
function DebtRow({ debt, money, emojiMap = {}, onOpen, onPayInstallment }) {
  const receivable = debt.direction === 'receivable';
  const isPaid = debt.status !== 'active';
  const pct = debt.schedule === 'installment' && debt.installmentsTotal ? Math.min(100, Math.round(((debt.installmentsPaid || 0) / debt.installmentsTotal) * 100)) : null;
  return <article className={`debt-row clay-card brutal-card dp-card ${receivable ? 'in' : 'out'} ${isPaid ? 'settled' : ''}`} role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => { if (event.key === 'Enter') onOpen(); }}>
    <div className="debt-head">
      <span className="transaction-icon">{emojiMap[debt.category] ?? (receivable ? '📥' : '📤')}</span>
      <div className="debt-id"><strong>{debt.party}</strong><span>{debt.title}{debt.category ? ` · ${debt.category}` : ''}</span></div>
      {isPaid && <span className={`debt-status-chip ${debt.status}`}>{t(debt.status === 'paid' ? 'debts.badgePaid' : 'debts.badgeWrittenOff')}</span>}
    </div>
    <div className="debt-amounts">
      <strong>{money.format(debt.remaining)}</strong>
      <small>{t('debts.ofPrincipal', { total: money.format(debt.principal) })}</small>
    </div>
    {pct != null && !isPaid && <div className="debt-progress">
      <div className="level-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
      <small>{t('debts.progressOf', { a: debt.installmentsPaid ?? 0, b: debt.installmentsTotal })}</small>
    </div>}
    {!isPaid && debt.schedule === 'installment' && debt.nextRunDate && canPayInstallmentEarly(debt, today) && <div className="debt-foot">
      <small className="muted">{t('debts.nextRun')} {dateFmt().format(new Date(`${debt.nextRunDate}T00:00:00`))}</small>
      <button type="button" className="clay-button brutal-button dp-button debt-pay" onClick={(event) => { event.stopPropagation(); onPayInstallment(); }}>{t('debts.payInstallment')}</button>
    </div>}
  </article>;
}

/* F8 — sheet detail: bayar (cicilan tepat 1 / bebas ≤ sisa), tandai lunas,
   hapus sbg rugi, edit, hapus. Konfirmasi untuk aksi tanpa transaksi. */
function DebtDetailSheet({ debt, money, today, onClose, onPayInstallment, onPayFlex, onSettle, onDelete, onEdit }) {
  const [amount, setAmount] = useState('');
  const [confirming, setConfirming] = useState(null); /* 'paid' | 'written_off' | 'delete' | null */
  const early = canPayInstallmentEarly(debt, today);
  const residualFlex = debt.schedule === 'installment' && !early;
  const flexValue = Number(amount) || 0;
  const submitFlex = (event) => {
    event.preventDefault();
    if (flexValue > 0) onPayFlex(flexValue);
  };
  return <div className="modal-backdrop clay-modal brutal-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal clay-card brutal-sheet dp-sheet" role="dialog" aria-modal="true" aria-labelledby="debt-detail-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="close-modal" onClick={onClose} aria-label={t('common.close')}>×</button>
      <p className="kicker">{t(debt.direction === 'receivable' ? 'debts.dir.receivable' : 'debts.dir.payable')}</p>
      <h2 id="debt-detail-title">{debt.party}</h2>
      <p className="debt-detail-sub">{debt.title}{debt.note ? ` · ${debt.note}` : ''}</p>
      <div className="debt-detail-balance">
        <div><small>{t('debts.remaining')}</small><strong>{money.format(debt.remaining)}</strong></div>
        <div><small>{t('debts.principalLabel')}</small><strong>{money.format(debt.principal)}</strong></div>
      </div>
      {debt.schedule === 'installment' && <p className="debt-detail-note">{t('debts.progressLong', { a: debt.installmentsPaid ?? 0, b: debt.installmentsTotal })}{early && ` · ${t('debts.nextRun')} ${dateFmt().format(new Date(`${debt.nextRunDate}T00:00:00`))}`}</p>}
      {debt.status === 'active' && <>
        {debt.schedule === 'flex' && <form onSubmit={submitFlex}>
          <label>{t('debts.payAmount')}
            <input inputMode="numeric" autoFocus value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder={`${t('debts.payMax')} ${money.format(debt.remaining)}`} />
          </label>
          <div className="form-actions column">
            <button className="primary-button clay-button brutal-button dp-button" type="submit" disabled={!flexValue || flexValue > debt.remaining}>{t(debt.direction === 'receivable' ? 'debts.receiveBtn' : 'debts.payBtn')} <span>→</span></button>
            <button type="button" className="quick-full" onClick={() => setAmount(String(Math.round(debt.remaining)))}>{t('debts.payFull')}</button>
          </div>
        </form>}
        {debt.schedule === 'installment' && early && <div className="form-actions column">
          <button type="button" className="primary-button clay-button brutal-button dp-button" onClick={onPayInstallment}>{t('debts.payInstallment')} ({money.format(Math.min(debt.installmentAmount ?? 0, debt.remaining))}) <span>→</span></button>
        </div>}
        {residualFlex && <p className="debt-detail-note muted">{t('debts.residualNote')}</p>}
        {confirming === null && <div className="debt-manage">
          <button type="button" className="dp-item" onClick={() => setConfirming('paid')}>{t('debts.markPaid')}</button>
          {debt.direction === 'receivable' && <button type="button" className="dp-item" onClick={() => setConfirming('written_off')}>{t('debts.writeOff')}</button>}
          <button type="button" className="dp-item" onClick={onEdit}>{t('debts.edit')}</button>
          <button type="button" className="dp-item danger" onClick={() => setConfirming('delete')}>{t('debts.delete')}</button>
        </div>}
        {confirming && <div className="debt-confirm">
          <p>{t(confirming === 'paid' ? 'debts.confirmMarkPaid' : confirming === 'written_off' ? 'debts.confirmWriteOff' : 'debts.confirmDelete')}</p>
          <div className="form-actions">
            <button type="button" className="ghost-button clay-button brutal-button brutal-ghost" onClick={() => setConfirming(null)}>{t('common.cancel')}</button>
            <button type="button" className={`danger-button clay-button brutal-button brutal-danger-btn dp-button ${confirming !== 'delete' ? '' : ''}`} onClick={() => { if (confirming === 'delete') onDelete(); else onSettle(confirming); }}>{t('common.yesContinue')}</button>
          </div>
        </div>}
      </>}
    </section>
  </div>;
}

/* F8 — sheet form tambah/edit hutang & piutang.
   Cicilan: nominal per angsuran dihitung splitPrincipal (dibulatkan ke ribuan
   ke atas; angsuran terakhir otomatis lebih kecil via clamp mesin). */
function DebtFormSheet({ initial = null, expenseOptions = [], incomeOptions = [], wallets = [], hasWallets = false, defaultWalletId = null, onClose, onSubmit }) {
  const [direction, setDirection] = useState(initial?.direction ?? 'payable');
  const [party, setParty] = useState(initial?.party ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [principal, setPrincipal] = useState(initial?.principal ? String(initial.principal) : '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [schedule, setSchedule] = useState(initial?.schedule ?? 'flex');
  const [count, setCount] = useState(initial?.installmentsTotal ? String(initial.installmentsTotal) : '');
  const [frequency, setFrequency] = useState(initial?.frequency ?? 'monthly');
  const [dayOfPeriod, setDayOfPeriod] = useState(initial?.dayOfPeriod ? String(initial.dayOfPeriod) : '');
  const [startDate, setStartDate] = useState(initial?.nextRunDate ?? today);
  const [walletId, setWalletId] = useState(initial?.walletId ?? defaultWalletId);
  const [note, setNote] = useState(initial?.note ?? '');
  const [message, setMessage] = useState('');
  const options = direction === 'receivable' ? incomeOptions : expenseOptions;
  const principalNum = Number(principal) || 0;
  const countNum = Number(count) || 0;
  const perInstallment = schedule === 'installment' ? splitPrincipal(principalNum, countNum) : 0;
  function submit(event) {
    event.preventDefault();
    if (!party.trim()) return setMessage(t('debts.errParty'));
    if (!(principalNum > 0)) return setMessage(t('debts.errAmount'));
    if (schedule === 'installment') {
      if (!(countNum >= 1 && countNum <= 60)) return setMessage(t('debts.errCount'));
      if (!dayOfPeriod) return setMessage(t('debts.errDay'));
    }
    onSubmit({
      id: initial?.id ?? undefined,
      direction,
      party: party.trim(),
      title: title.trim() || party.trim(),
      principal: principalNum,
      remaining: initial?.remaining ?? principalNum,
      category: category || 'Lainnya',
      walletId: walletId || null,
      schedule,
      installmentAmount: schedule === 'installment' ? perInstallment : null,
      installmentsTotal: schedule === 'installment' ? countNum : null,
      installmentsPaid: initial?.installmentsPaid ?? 0,
      frequency: schedule === 'installment' ? frequency : null,
      dayOfPeriod: schedule === 'installment' ? Number(dayOfPeriod) : null,
      nextRunDate: schedule === 'installment' ? startDate : null,
      status: initial?.status ?? 'active',
      note: note.trim(),
    }).then((ok) => { if (ok) onClose(); });
  }
  return <div className="modal-backdrop clay-modal brutal-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal clay-card brutal-sheet dp-sheet" role="dialog" aria-modal="true" aria-labelledby="debt-form-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="close-modal" onClick={onClose} aria-label={t('common.close')}>×</button>
      <p className="kicker">{t('debts.kicker')}</p>
      <h2 id="debt-form-title">{initial ? t('debts.editTitle') : t('debts.addTitle')}</h2>
      <form onSubmit={submit}>
        <div className="type-switch dp-typeswitch" role="group" aria-label={t('debts.dirAria')}>
          <button type="button" className={direction === 'payable' ? 'selected expense' : ''} onClick={() => setDirection('payable')}>{t('debts.dir.payable')}</button>
          <button type="button" className={direction === 'receivable' ? 'selected income' : ''} onClick={() => setDirection('receivable')}>{t('debts.dir.receivable')}</button>
        </div>
        <label>{t('debts.party')}<input autoFocus value={party} onChange={(e) => setParty(e.target.value)} maxLength={30} placeholder={t('debts.partyPh')} /></label>
        <label>{t('label.name')}<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} placeholder={t('debts.titlePh')} /></label>
        <label>{t('debts.principalLabel')}<input inputMode="numeric" value={principal} onChange={(e) => setPrincipal(e.target.value.replace(/[^0-9]/g, ''))} placeholder={t('debts.principalPh')} /></label>
        <div className="form-pair">
          <label>{t('label.category')}
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{t('opt.pickCategory')}</option>
              {options.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          {hasWallets && wallets.length > 1 && <label>{t('form.wallet.select')}
            <select value={walletId ?? ''} onChange={(e) => setWalletId(e.target.value)}>
              <option value="">{t('wallet.all')}</option>
              {wallets.map((item) => <option key={item.id} value={item.id}>{`${item.emoji} ${item.name}`}</option>)}
            </select>
          </label>}
        </div>
        <div className="settings-field alloc-field" role="group" aria-label={t('debts.scheduleAria')}>
          <span>{t('debts.scheduleLabel')}</span>
          <div className="sort-toggle alloc-switch">
            {[['flex', 'debts.schedule.flex'], ['installment', 'debts.schedule.installment']].map(([value, key]) => (
              <button key={value} type="button" className={schedule === value ? 'active' : ''} aria-pressed={schedule === value} onClick={() => setSchedule(value)}>{t(key)}</button>
            ))}
          </div>
        </div>
        {schedule === 'installment' && <>
          <div className="form-pair">
            <label>{t('debts.countNLabel')}<input inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="12" /></label>
            <label>{t('form.rec.freq')}
              <select value={frequency} onChange={(e) => { setFrequency(e.target.value); setDayOfPeriod(''); }}>
                <option value="monthly">{t('rec.monthly')}</option>
                <option value="weekly">{t('rec.weekly')}</option>
              </select>
            </label>
          </div>
          <p className="debt-per-installment">{perInstallment > 0 ? t('debts.perInstallment', { amount: new Intl.NumberFormat('id-ID').format(perInstallment) }) : t('debts.perInstallmentHint')}</p>
          {frequency === 'monthly'
            ? <label>{t('form.rec.billDate')}
              <select value={dayOfPeriod} onChange={(e) => setDayOfPeriod(e.target.value)}>
                <option value="">{t('rec.pickDay')}</option>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{t('rec.dayN', { d })}</option>)}
              </select>
            </label>
            : <label>{t('form.rec.billDay')}
              <div className="weekday-chips">{[1, 2, 3, 4, 5, 6, 7].map((d) => <button type="button" key={d} className={String(dayOfPeriod) === String(d) ? 'selected' : ''} onClick={() => setDayOfPeriod(String(d))}>{t(`wd.${d}`)}</button>)}</div>
            </label>}
          <label>{t('debts.firstDue')}<input type="date" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} /></label>
        </>}
        <label>{t('debts.note')}<input value={note} onChange={(e) => setNote(e.target.value)} maxLength={80} placeholder={t('debts.notePh')} /></label>
        {message && <p className="form-message">{message}</p>}
        <div className="form-actions">
          <button className="ghost-button clay-button brutal-button brutal-ghost" type="button" onClick={onClose}>{t('common.cancel')}</button>
          <button className="primary-button clay-button brutal-button dp-button" type="submit">{initial ? t('btn.saveDebtEdit') : t('btn.saveDebt')} <span>→</span></button>
        </div>
      </form>
    </section>
  </div>;
}

/* F5 — pilih tantangan minggu ini. Yang tak memenuhi syarat disabled dengan
   alasan (riwayat kurang / weekend sudah bocor / minggu lewat). */
function ChallengeSheet({ activeCode = null, completedCodes = [], transactions = [], today, weekStart, onClose, onActivate }) {
  return <div className="modal-backdrop clay-modal brutal-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}><section className="modal clay-card brutal-sheet dp-sheet" role="dialog" aria-modal="true" aria-labelledby="challenge-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={onClose} aria-label={t('common.close')}>×</button><p className="kicker">{t('ch.kicker')}</p><h2 id="challenge-title">{t('ch.pickTitle')}</h2><div className="challenge-options">
    {CHALLENGE_DEFS.map((def) => {
      const doneBefore = completedCodes.includes(def.code);
      const elig = challengeEligibility(def.code, { transactions, today, weekStart });
      const disabled = Boolean(activeCode) || doneBefore || !elig.ok;
      const note = activeCode === def.code ? t('ch.alreadyActive') : doneBefore ? t('ch.doneChip') : !elig.ok ? t(elig.reason) : null;
      return <button key={def.code} type="button" className="challenge-option" disabled={disabled} onClick={() => { onActivate(def.code).then((ok) => { if (ok) onClose(); }); }}>
        <span className="category-emoji">{def.icon}</span>
        <div>
          <strong>{t(`ch.name.${def.code}`)}</strong>
          <small>{note ?? t(`ch.rule.${def.code}`)}</small>
        </div>
        <b className={`challenge-chip ${disabled ? 'muted' : ''}`}>+{def.xp} XP</b>
      </button>;
    })}
  </div><p className="import-hint"><Highlighted text={t('ch.onePerWeek')} /></p></section></div>;
}

function Highlighted({ text }) {
  const parts = String(text).split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))}</>;
}

function AdviceItem({ item }) {
  return <div className={`advice-item sev-${item.severity}`}>
    <span className="advice-item-icon" aria-hidden="true">{item.icon}</span>
    <div className="advice-item-body">
      <div className="advice-item-head"><strong>{item.title}</strong><span className="advice-sev">{t(`adv.sev.${item.severity}`)}</span></div>
      <p><Highlighted text={item.message} /></p>
      <small className="muted">{item.reason}</small>
    </div>
  </div>;
}

/* F2 — gauge semicircle 3 segmen keras (coral/gold/green) + jarum ink.
   Skor 0 = kiri, 100 = kanan; warna lewat token --br-* (adaptif dark). */
function Gauge({ score }) {
  const clamped = Math.max(0, Math.min(100, score));
  const lvl = clamped >= 80 ? 'high' : clamped >= 60 ? 'mid' : 'low';
  const R = 46;
  const CX = 60;
  const CY = 60;
  const pt = (rad) => [CX + R * Math.cos(rad), CY - R * Math.sin(rad)];
  const end = Math.PI - (clamped / 100) * Math.PI;
  const [ex, ey] = pt(end);
  const track = `M ${pt(Math.PI).map((n) => n.toFixed(2)).join(' ')} A ${R} ${R} 0 0 1 ${pt(0).map((n) => n.toFixed(2)).join(' ')}`;
  const value = `M ${pt(Math.PI).map((n) => n.toFixed(2)).join(' ')} A ${R} ${R} 0 ${clamped > 50 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  const tickAt = (pct, key) => {
    const a = Math.PI - (pct / 100) * Math.PI;
    return <line key={key} x1={(CX + (R + 4) * Math.cos(a)).toFixed(2)} y1={(CY - (R + 4) * Math.sin(a)).toFixed(2)} x2={(CX + (R + 10) * Math.cos(a)).toFixed(2)} y2={(CY - (R + 10) * Math.sin(a)).toFixed(2)} className="gauge-tick" />;
  };
  return <svg className="score-gauge" viewBox="0 0 120 72" aria-hidden="true">
    <path d={track} className="gauge-track" />
    {clamped > 0 && <path d={value} className={`gauge-value lvl-${lvl}`} />}
    {tickAt(60, 't60')}
    {tickAt(80, 't80')}
    {clamped > 0 && <circle cx={ex.toFixed(2)} cy={ey.toFixed(2)} r="6" className={`gauge-dot lvl-${lvl}`} />}
  </svg>;
}

function scoreDeltaView(delta, cls = '') {
  if (delta == null) return null;
  const label = delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : '—';
  return <small className={`score-delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''} ${cls}`}>{label} {t('adv.score.vsLast')}</small>;
}

/* F6 — panel simulasi nabung: slider what-if + proyeksi real-time.
   Semua angka dari buildSimulation (pure); panel cuma render & format. */
function SimulationPanel({ sim, extra, onExtra, money, lang, goalName, multiWallet, todayStr }) {
  const fmtShort = money.formatShort ?? money.format;
  if (!sim.enoughData) {
    return <section className="sim-section clay-budget brutal-section">
      <div className="section-header"><div><p className="kicker">{t('sim.kicker')}</p><h2>{t('sim.title')}</h2></div></div>
      <div className="advice-empty"><strong>{t('sim.thinTitle')}</strong><p>{t('sim.thin')}</p></div>
    </section>;
  }
  const etaLabel = (months) => {
    const [y, m] = todayStr.split('-').map(Number);
    return new Date(y, m - 1 + months, 1).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { month: 'long', year: 'numeric' });
  };
  return <section className="sim-section clay-budget brutal-section">
    <div className="section-header">
      <div><p className="kicker">{t('sim.kicker')}</p><h2>{t('sim.title')}</h2><p>{t('sim.sub')}</p></div>
      {multiWallet && <span className="sim-scope">{t('sim.scopeAll')}</span>}
    </div>
    <div className="sim-body clay-card brutal-card">
      <label className="sim-slider-row" htmlFor="sim-extra-range">
        <span>{t('sim.sliderLabel')}</span>
        <b>{money.format(extra)}<em>/bln</em></b>
      </label>
      <input
        id="sim-extra-range"
        type="range"
        min="0"
        max="2000000"
        step="50000"
        value={extra}
        style={{ '--fill': `${Math.round((extra / 2000000) * 100)}%` }}
        aria-label={t('sim.sliderLabel')}
        onChange={(event) => onExtra(Number(event.target.value))}
      />
      <div className="sim-scale"><span>0</span><span>+{fmtShort(1000000)}</span><span>+{fmtShort(2000000)}</span></div>

      {sim.reason === 'deficit'
        ? <p className="sim-deficit">{t('sim.deficit', { v: fmtShort(sim.baseMonthly) })}</p>
        : sim.reason === 'reached'
          ? <p className="sim-eta win">{goalName ? t('sim.reached', { goal: goalName }) : t('sim.reachedPlain')}</p>
          : <>
            {goalName && sim.monthsToGoal != null && <div className="sim-block">
              <p className="sim-eta">{extra > 0 ? t('sim.goalEtaExtra', { goal: goalName, eta: etaLabel(sim.monthsToGoal) }) : t('sim.goalEta', { goal: goalName, eta: etaLabel(sim.monthsToGoal) })}</p>
              <div className="sim-compare">
                <div className="sim-chip"><small>{t('sim.baseline')}</small><strong>{sim.baselineMonths != null ? t('sim.months', { n: sim.baselineMonths }) : t('sim.noBase', { v: fmtShort(sim.baseMonthly) })}</strong></div>
                {extra > 0 && <div className="sim-chip hot"><small>{t('sim.withExtra')}</small><strong>{t('sim.months', { n: sim.monthsToGoal })}</strong></div>}
                {sim.monthsSaved > 0 && <div className="sim-chip win">{t('sim.faster', { n: sim.monthsSaved })}</div>}
              </div>
            </div>}
            {!goalName && sim.monthly > 0 && <div className="sim-block">
              {sim.projections.map((p) => <p className="sim-proj" key={p.months}>{t(p.months === 6 ? 'sim.proj6' : 'sim.proj12', { v: fmtShort(p.balance) })}</p>)}
            </div>}
          </>}
      <p className="advice-disclaimer">{t('sim.disclaimer')}</p>
    </div>
  </section>;
}

/* F7 — kelola akun dari Pengaturan: ganti username & password.
   Username = identitas tampilan (profiles.username, unik case-insensitive
   saat dicek); login tetap memakai profiles.auth_email yang stabil, karena
   GoTrue menolak updateUser ke email @rapi.local (sql/f7_account.sql).
   Password diverifikasi ulang lewat signInWithPassword; hash-nya sepenuhnya
   dikelola Supabase Auth. */
function AccountSettings({ user, notify, onRenamed }) {
  const [name, setName] = useState('');
  const [newPass, setNewPass] = useState('');
  const [again, setAgain] = useState('');
  const [nameMsg, setNameMsg] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [busy, setBusy] = useState('');

  async function saveName(event) {
    event.preventDefault();
    if (busy) return;
    const clean = name.trim();
    setNameMsg('');
    if (clean.length < 3) return setNameMsg(t('err.nameShort'));
    if (clean.toLowerCase() === user.username.toLowerCase()) return setNameMsg(t('acct.same'));
    setBusy('name');
    try {
      /* Username = identitas tampilan; auth_email login tidak tersentuh
         (GoTrue menolak updateUser email @rapi.local — lihat sql/f7_account.sql). */
      const pattern = clean.replace(/[%_\\]/g, '\\$&');
      const { data: taken } = await supabase.from('profiles').select('id').ilike('username', pattern);
      if (taken?.some((row) => row.id !== user.id)) return setNameMsg(t('err.nameTaken'));
      const { error: profileError } = await supabase.from('profiles').update({ username: clean }).eq('id', user.id);
      if (profileError) return setNameMsg(t('acct.fail', { msg: profileError.message }));
      onRenamed(clean);
      setName('');
      notify(t('acct.nameDone'));
    } finally {
      setBusy('');
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (busy) return;
    setPassMsg('');
    if (newPass.length < 6) return setPassMsg(t('err.passShort'));
    if (newPass !== again) return setPassMsg(t('acct.mismatch'));
    setBusy('pass');
    try {
      /* Tidak ada re-verifikasi password lama: user ber-sesi aktif cukup
         updateUser (best practice Supabase). Krusial di sini karena auth_email
         palsu (@rapi.local) → tanpa jalur reset password sama sekali;
         mewajibkan password lama = lockout permanen kalau lupa. */
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) {
        if (error.code === 'weak_password' || /weak password|at least \d+ characters/i.test(error.message)) return setPassMsg(t('err.passWeak'));
        return setPassMsg(t('acct.fail', { msg: error.message }));
      }
      setNewPass('');
      setAgain('');
      notify(t('acct.passDone'));
    } finally {
      setBusy('');
    }
  }

  return <section className="account-settings">
    <form className="account-form" onSubmit={saveName}>
      <label>{t('label.username')}<input value={name} onChange={(e) => setName(e.target.value)} placeholder={user.username} autoComplete="username" /></label>
      {nameMsg && <p className="form-message">{nameMsg}</p>}
      <button type="submit" className="clay-button brutal-button" disabled={busy === 'name'}>{t('acct.nameSave')}</button>
    </form>
    <form className="account-form" onSubmit={savePassword}>
      <label>{t('acct.newPass')}<input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} autoComplete="new-password" /></label>
      <label>{t('acct.again')}<input type="password" value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" /></label>
      {passMsg && <p className="form-message">{passMsg}</p>}
      <button type="submit" className="clay-button brutal-button" disabled={busy === 'pass'}>{t('acct.passSave')}</button>
    </form>
  </section>;
}

/* F3 — pilih satu pesan ringkas: prioritas over keinginan → over kebutuhan →
   under tabungan → else bucket pertama yang pas. Deterministik. */
function allocMessage(buckets, fmt) {
  const byId = Object.fromEntries(buckets.map((b) => [b.id, b]));
  const order = [['keinginan', 'over'], ['kebutuhan', 'over'], ['tabungan', 'under']];
  for (const [id, status] of order) {
    if (byId[id]?.status === status) {
      const gap = fmt(Math.abs(byId[id].actual - byId[id].ideal));
      return { status, id, vars: { gap } };
    }
  }
  const pas = buckets.find((b) => b.status === 'pas');
  return pas ? { status: 'pas', id: pas.id, vars: {} } : null;
}

function AllocSection({ reco, money }) {
  const msg = allocMessage(reco.buckets, (n) => money.formatShort(n));
  const tabunganEmpty = reco.buckets.find((b) => b.id === 'tabungan')?.actual === 0;
  return <section className="alloc-section">
    <div className="alloc-head">
      <p className="kicker">{t('alloc.kicker')}</p>
      <h3>{t('alloc.title')}</h3>
      <small className="muted">{t('alloc.base', { amt: money.formatShort(reco.incomeBase) })}</small>
    </div>
    <div className="alloc-rows">
      {reco.buckets.map((b) => <div className={`alloc-row ${b.status}`} key={b.id}>
        <span className={`alloc-tag ${b.id}`}>{t(`alloc.${b.id}`)}</span>
        <i><em style={{ width: `${Math.min(100, Math.round((b.actual / (b.ideal || 1)) * 100))}%` }} /></i>
        <b>{money.formatShort(b.actual)}</b>
        <span className={`alloc-status ${b.status}`}>{t(`alloc.status.${b.status}`)}</span>
      </div>)}
    </div>
    {msg && <p className="alloc-msg"><Highlighted text={t(`alloc.msg.${msg.status}.${msg.id}`, msg.vars)} /></p>}
    {tabunganEmpty && <p className="alloc-hint">{t('alloc.hintTabungan')}</p>}
  </section>;
}

function ScorePanel({ health }) {  const h = health.now;
  return <section className="score-panel">
    <div className="score-panel-head">
      <span className="score-gauge-wrap big"><Gauge score={h.score} /></span>
      <div className="score-panel-meta">
        <p className="kicker">{t('adv.score.kicker')}</p>
        <span className="score-num-line"><b className="score-num">{h.score}</b><small className="score-of">{t('adv.score.label')}</small></span>
        <div className="score-chip-line">
          <span className={`score-chip ${h.level}`}>{t(`adv.score.${h.level}`)}</span>
          {scoreDeltaView(health.delta)}
        </div>
        {h.basis < 5 && <small className="muted">{t('adv.score.basis', { n: h.basis })}</small>}
      </div>
    </div>
    <div className="score-breakdown">
      <p className="kicker">{t('adv.score.breakdown')}</p>
      {h.components.map((c) => <div className="score-row" key={c.id}>
        <span>{t(`adv.score.comp.${c.id}`)}</span>
        <i><em style={{ width: `${Math.round((c.points / c.max) * 100)}%` }} /></i>
        <b>{c.points}/{c.max}</b>
      </div>)}
    </div>
  </section>;
}

function ImportSheet({ preview, busy, onClose, onFile, onReset, onConfirm, money }) {
  const result = preview?.result;
  const validCount = result?.valid.length ?? 0;
  const sample = result?.valid.slice(0, 5) ?? [];
  return <div className="modal-backdrop clay-modal brutal-backdrop dp-backdrop" role="presentation" onMouseDown={onClose}><section className="modal clay-card brutal-sheet dp-sheet" role="dialog" aria-modal="true" aria-labelledby="import-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={onClose} aria-label={t('common.close')}>×</button><p className="kicker">{t('import.kicker')}</p><h2 id="import-title">{t('import.title')}</h2>
    {!preview ? <>
      <p className="import-hint"><Highlighted text={t('import.hint')} /></p>
      <label className="import-drop">
        <input type="file" accept=".csv,text/csv" onChange={onFile} />
        <span className="import-drop-inner"><b>{t('import.pick')}</b><small>{t('import.max')}</small></span>
      </label>
    </> : !result.headerOk ? <>
      <div className="import-errors"><p><Icon name="xCircle" size={15} /> {result.invalid[0]?.reason}</p></div>
      <button className="clay-button brutal-button brutal-ghost import-confirm" onClick={onReset}>{t('import.retry')}</button>
    </> : <>
      <p className="import-filename">{preview.fileName}</p>
      <div className="import-summary">
        {validCount > 0 && <span className="ok"><Icon name="checkCircle" size={15} /> {t('import.ready', { n: validCount })}</span>}
        {result.duplicateCount > 0 && <span className="dup"><Icon name="repeat" size={15} /> {t('import.dups', { n: result.duplicateCount })}</span>}
        {result.invalid.length > 0 && <span className="bad"><Icon name="alert" size={15} /> {t('import.badRows', { n: result.invalid.length })}</span>}
        {!validCount && !result.invalid.length && <span className="dup">{t('import.empty')}</span>}
      </div>
      {result.invalid.length > 0 && <ul className="import-errors">{result.invalid.slice(0, 5).map((item) => <li key={item.row}><b>{t('import.row', { n: item.row })}</b> — {item.reason}</li>)}{result.invalid.length > 5 && <li className="muted">{t('import.moreErrors', { n: result.invalid.length - 5 })}</li>}</ul>}
      {sample.length > 0 && <table className="import-sample"><thead><tr><th>{t('label.date')}</th><th>{t('imp.thTitle')}</th><th>{t('label.amount')}</th></tr></thead><tbody>{sample.map((row, i) => <tr key={i}><td>{row.date}</td><td>{row.title}</td><td className={row.type === 'income' ? 'in' : 'out'}>{money.format(row.amount)}</td></tr>)}</tbody></table>}
      <button className="clay-button brutal-button primary-button import-confirm" disabled={busy || !validCount} onClick={onConfirm}>{busy ? t('import.busy') : t('import.confirm', { n: validCount })}</button>
    </>}
  </section></div>;
}
