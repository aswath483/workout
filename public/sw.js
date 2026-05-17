const CACHE = 'workout-v1';
const PRECACHE = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // Cache-first for immutable Next.js static chunks
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(request).then(
        (hit) => hit ?? fetch(request).then((res) => {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Network-first for pages (falls back to cache when offline)
  e.respondWith(
    fetch(request)
      .then((res) => {
        caches.open(CACHE).then((c) => c.put(request, res.clone()));
        return res;
      })
      .catch(() => caches.match(request))
  );
});
