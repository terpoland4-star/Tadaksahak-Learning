// Service Worker pour Tadaksahak Learning
const CACHE_NAME = 'tadaksahak-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/js/core/store.js',
  '/js/core/event-bus.js',
  '/js/core/utils.js',
  '/js/services/i18n.js',
  '/js/services/theme.js',
  '/js/services/router.js',
  '/js/services/api.js',
  '/i18n/fr.json',
  '/i18n/en.json',
  '/i18n/ar.json',
  '/data/mots.json',
  '/data/livres.json',
  '/data/quiz.json',
  '/assets/images/idaksahak_round.png'
];

// Installation
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Mise en cache des assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('Service Worker: Installation terminée');
        return self.skipWaiting();
      })
  );
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression du cache obsolète', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation terminée');
      return self.clients.claim();
    })
  );
});

// Stratégie : Network First avec fallback cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non GET
  if (event.request.method !== 'GET') return;
  
  // Ignorer les requêtes API externes (DeepSeek, Leaflet, etc.)
  if (event.request.url.includes('deepseek.com') || 
      event.request.url.includes('unpkg.com') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('googletagmanager.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse si valide
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback sur le cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si c'est une page HTML, retourner la page d'accueil
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/');
            }
            return new Response('Ressource non disponible hors-ligne', { status: 503 });
          });
      })
  );
});

// Écoute des messages du client
self.addEventListener('message', (event) => {
  if (event.data === 'checkUpdate') {
    self.skipWaiting();
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage('update_available');
      });
    });
  }
});
