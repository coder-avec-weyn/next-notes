// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "pwa-offline-v1";

// Following resources will be pre-cached
const precacheResources = [
  "/",
  "/dashboard/notes",
  "/manifest.json",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/icons/maskable-icon.png",
];

// Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener("install", function (event) {
  console.log("[PWA] Service Worker installation");
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log("[PWA] Cached resources during install");
      return cache.addAll(precacheResources);
    }),
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", function (event) {
  console.log("[PWA] Service Worker activation");
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE) {
            console.log("[PWA] Removing old cache", key);
            return caches.delete(key);
          }
        }),
      );
    }),
  );
  // Claim any clients immediately, so the page will be under SW control without reloading
  return self.clients.claim();
});

// Fetch event handler - respond with cache first, then network
self.addEventListener("fetch", function (event) {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(function (cachedResponse) {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(function (response) {
            // Check if we received a valid response
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }

            // Clone the response as it's a stream and can only be consumed once
            const responseToCache = response.clone();

            // Cache the fetched resource
            caches.open(CACHE).then(function (cache) {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(function () {
            // If both cache and network fail, show a generic fallback
            return caches.match("/");
          });
      }),
    );
  }
});

// Handle messages from clients
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
