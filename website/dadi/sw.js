/* Dadi offline cache: the app's own files only. It never stores or sends contributions or sign-in tokens.
   Network first (so updates arrive), cache as the fallback (so it works offline). */
const CACHE = 'dadi-v8';
const FILES = ['./', './index.html', './style.css', './config.js', './manifest.webmanifest', './icon.svg', './icon-192.png', './data/seed.json', './data/glossary.json', '../data/videos.json', '../data/themes.json',
  './js/ipa-data.js', './js/synth.js', './js/native-tts.js', './js/espeak.js', './js/translate.js', './js/ai.js', './js/g2p.js', './js/audio.js', './js/keyboard.js', './js/fsrs.umd.js', './js/srs.js', './js/store.js', './js/data.js',
  './js/github.js', './js/submit.js', './js/icons.js', './js/learn.js', './js/chart.js', './data/icons.json', './js/app.js', '../core.js', '../items.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => Promise.all(FILES.map((f) => c.add(f).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k.startsWith('dadi-')).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))));
});
