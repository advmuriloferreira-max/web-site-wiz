const CACHE_NAME = 'murilo-ferreira-advocacia-v9-' + Date.now();
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

// Fetch event - handle requests normally
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-HTTP requests and API calls
  if (!request.url.startsWith('http') || request.url.includes('/rest/v1/')) {
    return;
  }
  
  // Never cache HTML pages - always fetch fresh
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
  }
});

// Activate event - clean up ALL old caches and take control
self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ALL caches to force fresh start
          return caches.delete(cacheName);
        })
      );
    })
  );
});