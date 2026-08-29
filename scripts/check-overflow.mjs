/* Gerbang overflow multi-viewport — jalankan saat app hidup + adb forward tcp:9222.
   Pemakaian: node scripts/check-overflow.mjs
   Scan, pada 340/360/384/411dp:
     - 5 tab utama + SEMUA sub-halaman menu Profil (state login)
     - halaman Auth (state login DAN register — layoutnya dibedakan)
   Exit code 1 bila ada kombinasi yang meluap.
   Catatan: untuk menampilkan halaman Auth tanpa mencabut sesi server, token
   supabase di localStorage dipertahankan sementara lalu dipulihkan di akhir. */
import { connect } from './cdp-helper.mjs';
import { sleep } from './cdp-helper.mjs';

const { ws, evalJS } = await connect();
await sleep(800);

let id = 10000; const pend = new Map();
const prev = ws.onmessage;
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); return; }
  if (prev) prev(ev);
};
const rawSend = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

const SCAN = `(function(){
  const vw=document.documentElement.clientWidth;
  const bad=[];
  document.querySelectorAll('body *').forEach((el)=>{
    const r=el.getBoundingClientRect();
    if(r.width>0 && r.right>vw+1){
      const cls=(typeof el.className==='string'?el.className:'').slice(0,44);
      bad.push({cls:cls||el.tagName,right:+r.right.toFixed(0),w:+r.width.toFixed(0)});
    }
  });
  bad.sort((a,b)=>b.right-a.right);
  return JSON.stringify({vw,docW:document.documentElement.scrollWidth,count:bad.length,top:bad.slice(0,6)});
})()`;

/* Buka halaman: tutup sub-halaman aktif, pindah tab, klik item menu profil ke-i. */
const NAV = (tabIdx, rowIdx) => `(async()=>{const qa=(s)=>[...document.querySelectorAll(s)];
  const back=document.querySelector('.sub-back'); if(back){back.click(); await new Promise(r=>setTimeout(r,300));}
  qa('.bottom-nav-item')[${tabIdx}] && qa('.bottom-nav-item')[${tabIdx}].click();
  await new Promise(r=>setTimeout(r,450));
  ${rowIdx === null ? '' : `const rows=qa('.profile-menu-row');
  if(rows[${rowIdx}]){rows[${rowIdx}].click(); await new Promise(r=>setTimeout(r,550));}`}
})()`;

const results = {};
let failures = 0;
for (const width of [340, 360, 384, 411]) {
  await rawSend('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 0, mobile: true });
  await sleep(500);
  for (const [tabIdx, name] of [[0, 'beranda'], [1, 'transaksi'], [2, 'analisis'], [3, 'target'], [4, 'profil']]) {
    await evalJS(NAV(tabIdx, null));
    const key = `${width}/${name}`;
    results[key] = JSON.parse(await evalJS(SCAN));
    if (results[key].docW > results[key].vw) failures += 1;
  }
  /* Sub-halaman Profil: jumlah baris menu dibaca runtime supaya tahan bertambah. */
  const nRows = JSON.parse(await evalJS(`document.querySelectorAll('.profile-menu-row').length`));
  for (let i = 0; i < nRows; i += 1) {
    await evalJS(`(async()=>{const qa=(s)=>[...document.querySelectorAll(s)];
      const back=document.querySelector('.sub-back'); if(back){back.click(); await new Promise(r=>setTimeout(r,300));}
      qa('.bottom-nav-item')[4].click(); await new Promise(r=>setTimeout(r,400));
      const rows=qa('.profile-menu-row'); if(rows[${i}]){rows[${i}].click();}
      await new Promise(r=>setTimeout(r,550));})()`);
    const key = `${width}/profil-sub-${i}`;
    results[key] = JSON.parse(await evalJS(SCAN));
    if (results[key].docW > results[key].vw) failures += 1;
  }
  await rawSend('Emulation.clearDeviceMetricsOverride');
}

/* =========================================================
   Fase AUTH — jangkau halaman login & register (layout beda).
   Untuk menampilkan halaman Auth tanpa memanggil signOut (yg
   mencabut sesi server), token supabase di localStorage DISIMPAN,
   sementara dihapus lalu reload → app tanpa sesi → menampilkan Auth.
   Setelah scan semua viewport, token di-PULIHKAN + reload agar app
   kembali login (tanpa perlu kredensial & tanpa revoke sesi).
   ========================================================= */
let authKey = null;
let savedAuth = null;
try {
  authKey = await evalJS(`(function(){for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/auth-token/.test(k))return k;}return null;})()`);
  if (authKey) {
    savedAuth = await evalJS(`localStorage.getItem('${authKey}')`);
    await evalJS(`localStorage.removeItem('${authKey}')`);
    await rawSend('Page.reload');
    await sleep(2600);
  }
} catch {}

if (authKey) {
  for (const width of [340, 360, 384, 411]) {
    await rawSend('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 0, mobile: true });
    await sleep(500);
    /* Mode default setelah reload = login. Pastikan tombol switch ada (halaman Auth). */
    const onAuth = await evalJS(`!!document.querySelector('.form-wrap')`);
    if (onAuth) {
      const keyLogin = `${width}/auth-login`;
      results[keyLogin] = JSON.parse(await evalJS(SCAN));
      if (results[keyLogin].docW > results[keyLogin].vw) failures += 1;
      /* Toggle ke register via tombol switch. */
      await evalJS(`(async()=>{const b=document.querySelector('.switch-form button');if(b)b.click();await new Promise(r=>setTimeout(r,450));})()`);
      const keyRegister = `${width}/auth-register`;
      results[keyRegister] = JSON.parse(await evalJS(SCAN));
      if (results[keyRegister].docW > results[keyRegister].vw) failures += 1;
    }
    await rawSend('Emulation.clearDeviceMetricsOverride');
  }
  /* Pulihkan sesi → app kembali login. */
  if (savedAuth !== null) {
    await evalJS(`localStorage.setItem('${authKey}', ${JSON.stringify(savedAuth)}); 1`);
    await rawSend('Page.reload');
    await sleep(2600);
  }
}

ws.close();
console.log(JSON.stringify(results, null, 1));
console.error(`failures=${failures}`);
process.exit(failures ? 1 : 0);
