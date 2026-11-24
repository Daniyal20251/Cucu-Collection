/* Cucu Collection service worker
   - HTML/JS/CSS: pehle network (hamesha fresh code), offline ho to cache
   - Images: cache-first
   - Cross-origin (API, fonts, CDN) ko haath nahi lagata */
const VERSION = 'cucu-v4';
const CACHE = VERSION + '-assets';
const PRECACHE = [
  './', './offline.html', './Store.css', './Store.js', './themeEngine.js',
  './pwa.js', './responsive.css', './Cucu.png', './icon-192.png', './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(PRECACHE.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isImage = req.destination === 'image';

  if (isImage) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  event.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() =>
      caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./offline.html') : Response.error()))
    )
  );
});
