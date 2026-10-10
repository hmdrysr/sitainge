/* Offline cache for the page's own static files only. It never touches contributions. */
const CACHE = 'sitainge-site-v9';
const FILES = ['./vendor/beercss/beer.min.css', './vendor/noto-sans/noto-sans.css', './beer-theme.css', './tokens.css', './vendor/noto-sans/noto-sans-latin-400-normal.woff2', './vendor/noto-sans/noto-sans-latin-700-normal.woff2', './vendor/noto-sans/noto-sans-latin-ext-400-normal.woff2', './vendor/noto-sans/noto-sans-latin-ext-700-normal.woff2', './', './index.html', './contribute.html', './site.css', './site.js', './shell.js', './ui-icons.js', './dadi/js/icons.js', './dadi/data/icons.json', './data/facts.json', './data/map.json', './data/videos.json', './data/media.json', './style.css', './items.js', './core.js', './zip.js', './app.js', './config.js', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => Promise.all(FILES.map((f) => c.add(f).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then((r) => {
    const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))));
});
