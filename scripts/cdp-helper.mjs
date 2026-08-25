export async function connect() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const list = await (await fetch('http://localhost:9222/json/list')).json();
      const page = list.find((t) => t.type === 'page');
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      let id = 0; const pend = new Map();
      ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
      await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
      const send = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
      await send('Runtime.enable');
      const evalJS = async (expr) => {
        const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
        if (r.result?.exceptionDetails) return null;
        return r.result?.result?.value;
      };
      /* sanity ping */
      const ping = await evalJS('1+1');
      if (ping === 2) return { ws, evalJS };
      ws.close();
    } catch {}
    await new Promise((r) => setTimeout(r, 700));
  }
  throw new Error('CDP connect gagal 3x');
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
