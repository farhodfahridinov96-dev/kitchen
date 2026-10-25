/* Офлайн-копия приложения. Сеть в приоритете: при связи всегда берётся свежая версия, без связи — сохранённая. */
const V = 'kitchen-aa2587445e';
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "fonts/onest.css", "fonts/onest-cyrillic-400-normal.woff2", "fonts/onest-cyrillic-500-normal.woff2", "fonts/onest-cyrillic-600-normal.woff2", "fonts/onest-cyrillic-700-normal.woff2", "fonts/onest-latin-400-normal.woff2", "fonts/onest-latin-500-normal.woff2", "fonts/onest-latin-600-normal.woff2", "fonts/onest-latin-700-normal.woff2", "fb-auth.js"];
const key = u => { const x = new URL(u); return x.origin + x.pathname; };
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(p => fetch(p, { cache: 'reload' }).then(r => { if (!r.ok) throw new Error(p); return c.put(key(new URL(p, self.registration.scope)), r); })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (u.pathname.endsWith('/data.json')) return;   // расписание всегда из сети; копия хранится самой страницей
  e.respondWith((async () => {
    try {
      const res = await fetch(r.url, { cache: 'no-cache' });
      if (res.ok) { const c = await caches.open(V); c.put(key(r.url), res.clone()); }
      return res;
    } catch (err) {
      const c = await caches.open(V);
      return (await c.match(key(r.url))) || (r.mode === 'navigate' ? await c.match(key(new URL('./', self.registration.scope))) : undefined) || Response.error();
    }
  })());
});
