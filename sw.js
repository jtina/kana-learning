// Kana Pocket service worker — makes the app work offline.
const VERSION = 'kanapocket-v6';
const FONTS = 'kanapocket-fonts'; // kept across app updates
const SHELL = [
  './', 'index.html', 'app.js', 'kana-data.js', 'phrases-data.js', 'vocab-data.js', 'vendor/htm-preact.js',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !isFont) return;

  // Fonts: cache first (they never change for a given URL).
  e.respondWith((async () => {
    if (isFont) {
      const cache = await caches.open(FONTS);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    }
    const cache = await caches.open(VERSION);
    // App files: answer instantly from the saved copy (works offline and on weak signal),
    // and refresh the saved copy in the background so updates show up next time the app opens.
    const network = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
    e.waitUntil(network.then(() => {}, () => {}));
    const hit = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' && await cache.match('index.html'));
    if (hit) return hit;
    try { return await network; } catch (err) { return Response.error(); }
  })());
});
