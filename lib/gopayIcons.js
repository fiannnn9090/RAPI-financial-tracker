/* GP1 — GoPay-Inspired icon layer (fondasi, BELUM dipakai page.js).
   Sumber:
   - @iconify-icons/flat-color-icons  → ikon "chrome" UI (nav, menu, aksi)  [48×48]
   - @iconify-icons/fluent-emoji-flat → ilustrasi kategori/emosi penuh warna [32×32]
   Keduanya paket npm lokal (bundled saat build — pola sama dengan @dicebear/core,
   TANPA fetch CDN di runtime). Tiap ikon = { width, height, body } (SVG string).
   GpIcon/<GpIcon> merender body via dangerouslySetInnerHTML mempertahankan warna
   asli ilustrasi; viewBox mengikuti data sumber, size = dimensi maksimum dengan
   rasio aspek dipertahankan.

   Pemetaan dua-set demi konsistensi visual (mirror GoPay: navigasi/aksi bersih,
   kategori/emosi ilustratif). */

import fHome from '@iconify-icons/flat-color-icons/home';
import fTodoList from '@iconify-icons/flat-color-icons/todo-list';
import fBarChart from '@iconify-icons/flat-color-icons/bar-chart';
import fBusinessman from '@iconify-icons/flat-color-icons/businessman';
import fKey from '@iconify-icons/flat-color-icons/key';
import fSettings from '@iconify-icons/flat-color-icons/settings';
import fGrid from '@iconify-icons/flat-color-icons/grid';
import fDataSheet from '@iconify-icons/flat-color-icons/data-sheet';
import fAlarmClock from '@iconify-icons/flat-color-icons/alarm-clock';
import fHighPriority from '@iconify-icons/flat-color-icons/high-priority';
import fCurrencyExchange from '@iconify-icons/flat-color-icons/currency-exchange';
import fGlobe from '@iconify-icons/flat-color-icons/globe';
import fIdea from '@iconify-icons/flat-color-icons/idea';
import fOk from '@iconify-icons/flat-color-icons/ok';
import fCancel from '@iconify-icons/flat-color-icons/cancel';
import fPaid from '@iconify-icons/flat-color-icons/paid';
import fCheckmark from '@iconify-icons/flat-color-icons/checkmark';
import fRefresh from '@iconify-icons/flat-color-icons/refresh';
import fImport from '@iconify-icons/flat-color-icons/import';
import fExport from '@iconify-icons/flat-color-icons/export';
import fDownload from '@iconify-icons/flat-color-icons/download';
import fShare from '@iconify-icons/flat-color-icons/share';
import fLeft from '@iconify-icons/flat-color-icons/left';
import fRight from '@iconify-icons/flat-color-icons/right';
import fDown from '@iconify-icons/flat-color-icons/down';
import fUp from '@iconify-icons/flat-color-icons/up';
import fPlus from '@iconify-icons/flat-color-icons/plus';
import fPackage from '@iconify-icons/flat-color-icons/package';
import fDocument from '@iconify-icons/flat-color-icons/document';
import fSafe from '@iconify-icons/flat-color-icons/safe';
import fMoneyTransfer from '@iconify-icons/flat-color-icons/money-transfer';
import fShop from '@iconify-icons/flat-color-icons/shop';
import fBusinessContact from '@iconify-icons/flat-color-icons/business-contact';
import fSynchronize from '@iconify-icons/flat-color-icons/synchronize';

import eBullseye from '@iconify-icons/fluent-emoji-flat/bullseye';
import eIdentificationCard from '@iconify-icons/fluent-emoji-flat/identification-card';
import eBustInSilhouette from '@iconify-icons/fluent-emoji-flat/bust-in-silhouette';
import ePurse from '@iconify-icons/fluent-emoji-flat/purse';
import eMoneyBag from '@iconify-icons/fluent-emoji-flat/money-bag';
import eBell from '@iconify-icons/fluent-emoji-flat/bell';
import ePencil from '@iconify-icons/fluent-emoji-flat/pencil';
import eTrophy from '@iconify-icons/fluent-emoji-flat/trophy';
import eSparkles from '@iconify-icons/fluent-emoji-flat/sparkles';
import eCoin from '@iconify-icons/fluent-emoji-flat/coin';
import eCrescentMoon from '@iconify-icons/fluent-emoji-flat/crescent-moon';
import eInputLatinUppercase from '@iconify-icons/fluent-emoji-flat/input-latin-uppercase';
import eEye from '@iconify-icons/fluent-emoji-flat/eye';
import eSteamingBowl from '@iconify-icons/fluent-emoji-flat/steaming-bowl';
import eMotorScooter from '@iconify-icons/fluent-emoji-flat/motor-scooter';
import eShoppingBags from '@iconify-icons/fluent-emoji-flat/shopping-bags';
import eReceipt from '@iconify-icons/fluent-emoji-flat/receipt';
import eVideoGame from '@iconify-icons/fluent-emoji-flat/video-game';
import eBriefcase from '@iconify-icons/fluent-emoji-flat/briefcase';
import eWrappedGift from '@iconify-icons/fluent-emoji-flat/wrapped-gift';
import eConvenienceStore from '@iconify-icons/fluent-emoji-flat/convenience-store';
import eChartIncreasing from '@iconify-icons/fluent-emoji-flat/chart-increasing';

export const GP_ICONS = {
  /* nav */
  beranda: fHome,
  transaksi: fTodoList,
  analisis: fBarChart,
  target: eBullseye,
  profil: fBusinessman,
  /* menu profil */
  kartu: eIdentificationCard,
  avatar: eBustInSilhouette,
  akun: fKey,
  pengaturan: fSettings,
  kategori: fGrid,
  dompet: ePurse,
  data: fDataSheet,
  pengingat: eBell,
  danger: fHighPriority,
  /* pengaturan */
  currency: fCurrencyExchange,
  fontsize: eInputLatinUppercase,
  language: fGlobe,
  theme: eCrescentMoon,
  /* aksi & status */
  edit: ePencil,
  trophy: eTrophy,
  bulb: fIdea,
  sparkles: eSparkles,
  eye: eEye,
  check: fCheckmark,
  ok: fOk,
  cancel: fCancel,
  paid: fPaid,
  refresh: fRefresh,
  synchronize: fSynchronize,
  import: fImport,
  export: fExport,
  download: fDownload,
  share: fShare,
  alert: fHighPriority,
  chevronLeft: fLeft,
  chevronRight: fRight,
  chevronDown: fDown,
  arrowUp: fUp,
  arrowDown: fDown,
  plus: fPlus,
  package: fPackage,
  doc: fDocument,
  safe: fSafe,
  money: fMoneyTransfer,
  coin: eCoin,
  shop: fShop,
  businessContact: fBusinessContact,

  /* kategori transaksi — ilustrasi berwarna (fluent-emoji-flat) */
  makan: eSteamingBowl,
  transit: eMotorScooter,
  belanja: eShoppingBags,
  tagihan: eReceipt,
  hiburan: eVideoGame,
  gaji: eBriefcase,
  bonus: eWrappedGift,
  usaha: eConvenienceStore,
  investasi: eChartIncreasing,
  lainnya: eSparkles,
  dompetPurse: ePurse,
  debtIn: eMoneyBag,
};

/* Nama kategori default → kunci GP_ICONS (untuk <GpIcon name>). */
export const CATEGORY_GP_KEY = {
  'Makan & Minum': 'makan',
  Transportasi: 'transit',
  Belanja: 'belanja',
  Tagihan: 'tagihan',
  Hiburan: 'hiburan',
  Gaji: 'gaji',
  Bonus: 'bonus',
  Usaha: 'usaha',
  Investasi: 'investasi',
  Lainnya: 'lainnya',
};

export function gpKeyForCategory(name) {
  return CATEGORY_GP_KEY[name] ?? 'lainnya';
}

/* Kategori default → ilustrasi berwarna. Nama kunci = DEFAULT_CATEGORIES.
   Kategori kustom (DB) tidak punya pasangan → fallback 'Lainnya' (sparkles).
   Migrasi GP memakai gpIconForCategory() menggantikan emojiMap[name] mentah. */
export const CATEGORY_GP = {
  'Makan & Minum': eSteamingBowl,
  Transportasi: eMotorScooter,
  Belanja: eShoppingBags,
  Tagihan: eReceipt,
  Hiburan: eVideoGame,
  Gaji: eBriefcase,
  Bonus: eWrappedGift,
  Usaha: eConvenienceStore,
  Investasi: eChartIncreasing,
  Lainnya: eSparkles,
};

export function gpIconForCategory(name) {
  return CATEGORY_GP[name] ?? CATEGORY_GP['Lainnya'];
}

/* Ukur dimensi DOM menahan rasio aspek: size = dimensi maksimum. */
function gpDims(icon, size) {
  const { width: w, height: h } = icon;
  const scale = size / Math.max(w, h);
  return {
    width: Math.round(w * scale * 100) / 100,
    height: Math.round(h * scale * 100) / 100,
  };
}

/* String <svg> utuh — untuk konteks non-React (canvas/PDF/GpIcon). */
export function gpIconSvg(name, size = 32) {
  const icon = GP_ICONS[name] ?? GP_ICONS.sparkles;
  const dims = gpDims(icon, size);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.width} ${icon.height}" width="${dims.width}" height="${dims.height}" aria-hidden="true">${icon.body}</svg>`;
}

/* Komponen React — serupa <Icon name size> yang ada, tapi merender ilustrasi
   berwarna (bukan stroke monokrom). */
export function GpIcon({ name, size = 24, className = '', style }) {
  const icon = GP_ICONS[name] ?? GP_ICONS.sparkles;
  const dims = gpDims(icon, size);
  return (
    <svg
      className={`gp-icon ${className}`.trim()}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      width={dims.width}
      height={dims.height}
      style={style}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}