/* Gerbang overflow multi-viewport — jalankan saat app hidup + adb forward tcp:9222.
   Pemakaian: node scripts/check-overflow.mjs
   Scan 5 tab utama + SEMUA sub-halaman menu Profil, pada 340/360/384/411dp.
   Exit code 1 bila ada kombinasi yang meluap. */
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
ws.close();
console.log(JSON.stringify(results, null, 1));
console.error(`failures=${failures}`);
process.exit(failures ? 1 : 0);
