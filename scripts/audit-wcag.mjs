/* GP8b — Audit kontras WCAG dark+light (jalankan saat app hidup + adb forward tcp:9222).
   Pemakaian: node scripts/audit-wcag.mjs [theme]
   Menghitung kontras di dalam halaman via computed style (background compositing) untuk
   setiap elemen berisi teks, plus sampling piksel canvas untuk emoji/avatar.
   Threshold: teks normal >=4.5:1, teks besar/ikon >=3:1. */
import { connect, sleep } from './cdp-helper.mjs';
import { createRequire } from 'node:module';

const _req = createRequire(import.meta.url);
const PNG_PATH = '/tmp/opencode/node_modules/pngjs';

const THEME = process.argv[2] || 'dark';
const SCREENS = process.argv[3]; /* optional: comma list like "beranda,profil" */

const { ws, evalJS } = await connect();
await sleep(800);

let id = 10000; const pend = new Map();
const prev = ws.onmessage;
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); return; } if (prev) prev(ev); };
const rawSend = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

/* set theme via localStorage + reload */
await evalJS(`localStorage.setItem('rapi.theme','${THEME}'); 1`);
await evalJS(`location.reload(); 1`);
await sleep(2600);

const NAV = `(async()=>{const qa=(s)=>[...document.querySelectorAll(s)];
  const back=document.querySelector('.sub-back'); if(back){back.click(); await new Promise(r=>setTimeout(r,300));}
  return 'ok';})()`;

const CONTRAST_ENGINE = `(function(){
  function lum(rgb){ var c=[rgb.r,rgb.g,rgb.b].map(function(v){v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);}); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; }
  function ratio(f,b){ var L1=lum(f),L2=lum(b); if(L1<L2){var t=L1;L1=L2;L2=t;} return (L1+0.05)/(L2+0.05); }
  function parse(c){ if(!c)return null; if(c==='transparent')return {r:0,g:0,b:0,a:0};
    var m=c.match(/rgba?\\(([\\d. ]+)[, ]+([\\d. ]+)[, ]+([\\d. ]+)(?:[, ]+([\\d.]+))?\\)/);
    if(!m)return null; return {r:+m[1],g:+m[2],b:+m[3],a:m[4]===undefined?1:+m[4]}; }
  function blend(fg,bg){ var a=fg.a; return {r:Math.round(fg.r*a+bg.r*(1-a)),g:Math.round(fg.g*a+bg.g*(1-a)),b:Math.round(fg.b*a+bg.b*(1-a)),a:1}; }
  function bgOf(el){
    var cur=el, acc=null, needPix=false;
    while(cur){
      var cs=getComputedStyle(cur);
      var col=parse(cs.backgroundColor);
      var img=cs.backgroundImage;
      if(img==='none' && col && col.a>=0.99){ return {bg:col, needPix:false}; }
      if(col && col.a>0 && col.a<0.99){ acc=acc? blend(col,acc) : col; }
      if(img!=='none'){
        var base=parse(cs.backgroundColor);
        if(base && base.a>=0.99) return {bg:base, needPix:false};
        /* gradient over transparent: needs real pixel sampling */
        needPix=true;
        acc=acc||null;
        break;
      }
      cur=cur.parentElement;
    }
    /* also flag if the only bg found was semi-transparent layered over nothing opaque */
    if(acc && acc.a<0.99){ needPix=true; }
    if(!acc) acc={r:255,g:255,b:255,a:1};
    return {bg:{r:acc.r,g:acc.g,b:acc.b}, needPix:needPix};
  }
  function lgray(c){ return Math.round(0.2126*c.r+0.7152*c.g+0.0722*c.b); }
  var out=[]; var seen=0;
  function walk(el){
    seen++;
    var children=el.children;
    if(children.length===0 && el.textContent && el.textContent.trim()){
      var rect=el.getBoundingClientRect();
      var cs=getComputedStyle(el);
      if(rect.width<=0||rect.height<=0) return;            /* not rendered */
      if(cs.visibility==='hidden'||cs.display==='none') return;
      var fgp=parse(cs.color); if(!fgp) return;
      var fg={r:fgp.r,g:fgp.g,b:fgp.b};
      var rinfo=bgOf(el);
      var bg=rinfo.bg;
      /* If the element is the balance/gradient card itself, resolve via pixels later */
      var r=ratio(fg,bg);
      var fs=parseFloat(cs.fontSize); var fw=parseInt(cs.fontWeight)||400;
      var large=(fs>=24)||(fs>=18.66&&fw>=600);
      var thr=large?3:4.5;
      if(r<thr){
        var cls=(typeof el.className==='string'?el.className:'').slice(0,40)||el.tagName;
        var txt=el.textContent.replace(/\s+/g,' ').trim().slice(0,40);
        out.push({tag:el.tagName,cls:cls,txt:txt,ratio:+r.toFixed(2),fs:fs,thr:thr,fg:cs.color,bg:'rgb('+bg.r+','+bg.g+','+bg.b+')',needPix:rinfo.needPix,x:Math.round(rect.x),y:Math.round(rect.y),w:Math.round(rect.width),h:Math.round(rect.height)});
      }
    }
    for(var i=0;i<el.children.length;i++) walk(el.children[i]);
  }
  walk(document.documentElement);
  return JSON.stringify({theme:document.documentElement.getAttribute('data-theme'),seen:seen,fail:out});
})()`;

const results = {};
const PNG = _req(PNG_PATH).PNG;

function medianColor(png, x, y, w, h) {
  /* sample interior-ish pixels; return median rgb as bg estimate */
  const data = png.data; const rs=[],gs=[],bs=[];
  const x1=Math.max(0,x), y1=Math.max(0,y), x2=Math.min(png.width,x+w), y2=Math.min(png.height,y+h);
  for (let yy=y1; yy<y2; yy+=2) {
    for (let xx=x1; xx<x2; xx+=2) {
      const i=(yy*png.width+xx)*4;
      const a=data[i+3]/255;
      if(a<0.5) continue;
      rs.push(data[i]);gs.push(data[i+1]);bs.push(data[i+2]);
    }
  }
  if(!rs.length) return null;
  rs.sort((a,b)=>a-b); gs.sort((a,b)=>a-b); bs.sort((a,b)=>a-b);
  const m=v=>v[Math.floor(v.length/2)];
  return {r:m(rs),g:m(gs),b:m(bs)};
}
function wratio(f,b){ const L=f=>{const c=[f.r,f.g,f.b].map(v=>{v/=255;return v<=0.03928? v/12.92: Math.pow((v+0.055)/1.055,2.4)});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];}; let a=L(f),c=L(b); if(a<c){const t=a;a=c;c=t;} return (a+0.05)/(c+0.05); }

for (const width of [360, 411]) {
  await rawSend('Emulation.setDeviceMetricsOverride', { width, height:800, deviceScaleFactor:0, mobile:true });
  await sleep(500);
  const tabs = [[0,'beranda'],[1,'analisis'],[2,'target'],[3,'profil']];
  for (const [ti, name] of tabs) {
    await evalJS(`(async()=>{const qa=(s)=>[...document.querySelectorAll(s)];const back=document.querySelector('.sub-back'); if(back){back.click();await new Promise(r=>setTimeout(r,300));}qa('.bottom-nav-item')[${ti}]&&qa('.bottom-nav-item')[${ti}].click();await new Promise(r=>setTimeout(r,450));})()`);
    const key = `${THEME}/${width}/${name}`;
    const res = JSON.parse(await evalJS(CONTRAST_ENGINE));
    /* resolve gradient (needPix) failures via real screenshot pixels */
    const need = res.fail.filter(f=>f.needPix && f.w>0 && f.h>0);
    if (need.length) {
      await evalJS(`window.scrollTo(0,0); 1`);
      await sleep(150);
      const shot = await rawSend('Page.captureScreenshot', { format:'png' });
      const png = PNG.sync.read(Buffer.from(shot.result.data, 'base64'));
      /* screenshot is full page; scroll position matters — capture is viewport.
         Recompute bx,by relative to viewport already captured at scrollY=top after nav */
      for (const f of need) {
        const med = medianColor(png, f.x, f.y, f.w, f.h);
        if (med) {
          const fg = f.fg.match(/rgba?\(([\d. ]+),[\s]*([\d. ]+),[\s]*([\d. ]+)/);
          const ratio = wratio({r:+fg[1],g:+fg[2],b:+fg[3]}, med);
          f.ratioPix = +ratio.toFixed(2);
          f.pixBg = 'rgb('+med.r+','+med.g+','+med.b+')';
          f.passPix = ratio >= f.thr;
        }
      }
    }
    results[key] = res;
  }
  await rawSend('Emulation.clearDeviceMetricsOverride');
}

ws.close();
console.log(JSON.stringify(results, null, 1));
