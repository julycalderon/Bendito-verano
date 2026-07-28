// Bendito Verano — service worker (habilita "Instalar app" y modo offline básico)
const CACHE = 'bv-cache-v1';

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const net = await fetch(e.request);
      if (net && net.status === 200 && new URL(e.request.url).origin === self.location.origin) {
        cache.put(e.request, net.clone());
      }
      return net;
    } catch (err) {
      const hit = await cache.match(e.request);
      if (hit) return hit;
      const home = await cache.match('./');
      return home || Response.error();
    }
  })());
});
