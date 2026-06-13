const CACHE_NAME = 'tadaksahak-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/themes.css',
  '/js/app.js',
  '/js/core/store.js',
  // ... autres fichiers critiques
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
