// QRForge Service Worker
// Offline capability, fast asset caching & notification handling

const isLocalhost = Boolean(
  self.location.hostname === 'localhost' ||
  self.location.hostname === '[::1]' ||
  self.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// If accidentally registered on localhost, self-destruct and purge caches immediately
if (isLocalhost) {
  self.addEventListener('install', () => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
  });
} else {
  const CACHE_VERSION = 'qrforge-v2';
  const STATIC_CACHE = `qrforge-static-${CACHE_VERSION}`;
  const DYNAMIC_CACHE = `qrforge-dynamic-${CACHE_VERSION}`;

  // Core production assets for offline initial shell
  const STATIC_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg',
    '/icons.svg'
  ];

  // Install event - precache core shell
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(STATIC_CACHE)
        .then((cache) => cache.addAll(STATIC_URLS))
        .then(() => self.skipWaiting())
        .catch((err) => {
          console.warn('[QRForge SW] Precache warning:', err);
          return self.skipWaiting();
        })
    );
  });

  // Activate event - clean up old caches & take control
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                return caches.delete(cacheName);
              }
            })
          );
        })
        .then(() => self.clients.claim())
    );
  });

  // Fetch event
  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-http requests and browser extensions
    if (!url.protocol.startsWith('http')) {
      return;
    }

    // 1. Navigation requests (HTML documents): NETWORK FIRST with cache fallback
    // Ensures deployed updates are immediately served when online, while supporting offline mode
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(async () => {
            const cachedPage = await caches.match(event.request);
            if (cachedPage) return cachedPage;
            return caches.match('/index.html') || caches.match('/');
          })
      );
      return;
    }

    // 2. Static hashed assets (/assets/...) & fonts: CACHE FIRST with network fallback
    if (
      url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')
    ) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          });
        })
      );
      return;
    }

    // 3. All other requests: NETWORK FIRST with dynamic cache fallback
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
  });

  // Background sync for offline generation
  self.addEventListener('sync', (event) => {
    if (event.tag === 'qr-generation') {
      event.waitUntil(Promise.resolve());
    }
  });

  // Push notifications
  self.addEventListener('push', (event) => {
    if (event.data) {
      const options = {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: { dateOfArrival: Date.now(), primaryKey: 1 }
      };

      event.waitUntil(self.registration.showNotification('QRForge', options));
    }
  });

  // Notification click handler
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
  });
}