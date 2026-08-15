import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Service Worker Lifecycle Management
// On localhost / development: actively unregister any stale service workers and purge CacheStorage
// On production: register service worker for offline PWA capabilities
if ('serviceWorker' in navigator) {
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );

  if (import.meta.env.DEV || isLocalhost) {
    // Unregister any existing service worker on localhost
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((unregistered) => {
          if (unregistered) {
            console.log('[QRForge Dev] Stale ServiceWorker successfully unregistered.');
          }
        });
      }
    });

    // Clear stale CacheStorage caches on localhost
    if ('caches' in window) {
      window.caches.keys().then((cacheNames) => {
        for (const cacheName of cacheNames) {
          window.caches.delete(cacheName).then(() => {
            console.log('[QRForge Dev] Stale cache purged:', cacheName);
          });
        }
      });
    }
  } else {
    // Register PWA Service Worker in production
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);