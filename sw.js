/* My Gecko - offline support.
   Bump VERSION whenever index.html changes, so phones pick the new build up. */
const VERSION = 'gecko-17';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icon.svg', './icon-192.png', './icon-512.png',
  './icon-maskable-192.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './favicon-32.png', './favicon-48.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    /* one bad URL must not fail the whole install */
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* the page asks for the newest build when it is reopened */
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

const timeout = (p, ms) => new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error('slow')), ms);
  p.then(v => { clearTimeout(t); res(v); }, err => { clearTimeout(t); rej(err); });
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.endsWith('/version.json')) {
    e.respondWith(fetch(req, { cache: 'no-store' }).catch(() => new Response('{}', {
      headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  /* the page itself: newest build when there is signal, cached copy when there is not */
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await timeout(fetch(req, { cache: 'reload' }), 4000);
        const c = await caches.open(VERSION);
        c.put('./index.html', fresh.clone());
        return fresh;
      } catch (err) {
        const c = await caches.open(VERSION);
        return (await c.match('./index.html')) || (await c.match('./')) || Response.error();
      }
    })());
    return;
  }

  /* fonts and our own files: serve from the cache, refresh it in the background */
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;

  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    const hit = await c.match(req, { ignoreSearch: sameOrigin });
    const net = fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone());
      return r;
    }).catch(() => null);
    return hit || (await net) || Response.error();
  })());
});
