const CACHE_NAME = 'murilo-ferreira-advocacia-v12';
const urlsToCache = [
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle URL navigation for PWA
  if (event.data && event.data.type === 'NAVIGATE_URL') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        if (clients.length > 0) {
          // Focus existing client and navigate
          clients[0].focus();
          clients[0].postMessage({
            type: 'NAVIGATE_TO',
            url: event.data.url
          });
        } else {
          // Open new client
          self.clients.openWindow(event.data.url);
        }
      })
    );
  }
});

// Fetch event - network first strategy for fresh content
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-HTTP requests and API calls
  if (!request.url.startsWith('http') || request.url.includes('/rest/v1/')) {
    return;
  }
  
  // Network first for all requests to ensure fresh content
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Only use cache as fallback if network fails
        return caches.match(request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  // Take control of all pages
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});