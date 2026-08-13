const CACHE_NAME = 'qrforge-v1';
const STATIC_CACHE = 'qrforge-static-v1';
const DYNAMIC_CACHE = 'qrforge-dynamic-v1';

// Cache URLs
const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/public/favicon.svg',
  '/public/icons.svg',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Clearing old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content or fetch from network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle QR code image requests
  if (url.pathname.includes('/qr-')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(networkResponse => {
            // Cache the QR code for offline use
            if (networkResponse.ok) {
              const cacheCopy = networkResponse.clone();
              caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(event.request, cacheCopy);
              });
            }
            return networkResponse;
          });
        })
    );
    return;
  }

  // Handle static assets
  if (url.pathname.startsWith('/src/') || url.pathname.startsWith('/public/') || url.pathname === '/') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(networkResponse => {
            // Cache successful responses
            if (networkResponse.ok) {
              const cacheCopy = networkResponse.clone();
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(event.request, cacheCopy);
              });
            }
            return networkResponse;
          });
        })
    );
    return;
  }

  // Handle other requests with network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Cache successful responses
        if (networkResponse.ok) {
          const cacheCopy = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});

// Handle background sync for offline QR code generation
self.addEventListener('sync', (event) => {
  if (event.tag === 'qr-generation') {
    event.waitUntil(
      // Sync QR code generation data when back online
      console.log('Service Worker: Syncing QR code generation data')
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('QRForge', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});