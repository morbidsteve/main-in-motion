// Main In Motion — Service Worker
const CACHE_NAME = 'main-in-motion-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/config.js',
  '/js/supabase-client.js',
  '/js/app.js',
  '/js/map.js',
  '/js/geolocation.js',
  '/js/directions.js',
  '/js/utils.js',
  '/js/layers/parking.js',
  '/js/layers/construction.js',
  '/js/layers/detours.js',
  '/js/layers/businesses.js',
  '/js/ui/bottom-sheet.js',
  '/js/ui/sidebar.js',
  '/js/ui/layer-toggle.js',
  '/js/ui/announcement.js',
  '/manifest.json'
];

const TILE_CACHE = 'map-tiles-v1';
const DATA_CACHE = 'api-data-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== TILE_CACHE && k !== DATA_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Map tiles — cache first, then network
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Supabase API — stale-while-revalidate
  if (url.hostname.includes('supabase.co') && event.request.method === 'GET') {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Static assets — cache first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
