const CACHE_NAME = 'ai-subtitle-generator-v1';
// Add all assets that are needed for the app to work offline
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html'
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If a response is found in the cache, return it
        if (response) {
          return response;
        }

        // If the request is not in the cache, fetch it from the network
        return fetch(event.request)
            .then(networkResponse => {
                // We don't cache API calls or other dynamic content, only static assets if needed.
                // This basic service worker focuses on the app shell.
                return networkResponse;
            })
            .catch(() => {
                // If the network request fails and it's a navigation request, return the offline page.
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
            });
      })
  );
});
