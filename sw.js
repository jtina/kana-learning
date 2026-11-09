// Kana Pocket service worker — makes the app work offline.
//
// Built to survive bad networks such as plane / hotel Wi-Fi before you sign in, which either
// hang requests forever or answer every request with their own "sign in" page.
const VERSION = 'kanapocket-v7';
const FONTS = 'kanapocket-fonts-v2'; // kept across app updates
const SHELL = [
  './', 'index.html', 'app.js', 'kana-data.js', 'phrases-data.js', 'vocab-data.js', 'vendor/htm-preact.js',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];
const NET_TIMEOUT = 8000;   // give up on a background refresh after this long
const FONT_TIMEOUT = 4000;  // don't let an unsaved font hold up the app

// fetch() that gives up after `ms` instead of hanging
function fetchWithTimeout(req, ms) {
  const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), ms);
  return fetch(req, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}

// Only save responses that really are our files — never a Wi-Fi sign-in page served in their place.
async function isGenuine(res, url) {
  if (!res || !res.ok || res.redirected || res.type !== 'basic') return false;
  const path = new URL(url).pathname, isPage = path.endsWith('/') || path.endsWith('.html');
  const isHtml = /text\/html/.test(res.headers.get('content-type') || '');
  if (!isPage) return !isHtml; // a script or image that comes back as a web page is a sign-in page
  return isHtml && (await res.clone().text()).includes('Kana Pocket');
}
function isGenuineFont(res, url) {
  if (!res) return false;
  if (res.type === 'opaque') return true;
  if (!res.ok || res.redirected) return false;
  const type = res.headers.get('content-type') || '';
  return new URL(url).hostname === 'fonts.googleapis.com' ? /text\/css/.test(type) : /font|octet-stream/.test(type);
}

self.addEventListener('install', e => {
  // Download every file and check it before saving. If anything looks wrong (e.g. a sign-in page),
  // the install fails and the previous working version stays in place.
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    const got = await Promise.all(SHELL.map(async f => {
      const res = await fetchWithTimeout(new Request(f, { cache: 'reload' }), 30000);
      if (!(await isGenuine(res, res.url || new URL(f, location).href))) throw new Error('bad response for ' + f);
      return [f, res];
    }));
    await Promise.all(got.map(([f, res]) => cache.put(f, res)));
    await self.skipWaiting();
  })());
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

  e.respondWith((async () => {
    // Fonts: saved copy first (they never change for a given URL). An unsaved font gets a few
    // seconds, then the app carries on with the device's built-in Japanese font.
    if (isFont) {
      const cache = await caches.open(FONTS);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetchWithTimeout(req, FONT_TIMEOUT);
        if (isGenuineFont(res, req.url)) { cache.put(req, res.clone()); return res; }
      } catch (err) {}
      return url.hostname === 'fonts.googleapis.com'
        ? new Response('/* fonts unavailable offline */', { headers: { 'content-type': 'text/css' } })
        : Response.error();
    }

    // App files: answer instantly from the saved copy (works offline and on weak signal), and
    // refresh the saved copy in the background so updates show up the next time the app opens.
    const cache = await caches.open(VERSION);
    const network = fetchWithTimeout(req, NET_TIMEOUT).then(async res => {
      if (await isGenuine(res, req.url)) await cache.put(req, res.clone());
      return res;
    });
    e.waitUntil(network.then(() => {}, () => {}));
    const hit = await cache.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' && await cache.match('index.html'));
    if (hit) return hit;
    try { return await network; } catch (err) { return Response.error(); }
  })());
});
