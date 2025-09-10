// Service Worker for Offline Caching
const CACHE_NAME = "game-assets-v1";
const STATIC_CACHE_NAME = "static-assets-v1";
const DYNAMIC_CACHE_NAME = "dynamic-assets-v1";

// Critical assets to cache immediately
const CRITICAL_ASSETS = ["/static/images/countdown-timer/", "/static/images/ball/", "/static/images/anim/ball-middle/"];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
    console.log("[SW] Installing service worker...");

    event.waitUntil(
        caches
            .open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log("[SW] Caching critical assets");
                return cache.addAll(CRITICAL_ASSETS);
            })
            .then(() => {
                console.log("[SW] Critical assets cached successfully");
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error("[SW] Failed to cache critical assets:", error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    console.log("[SW] Activating service worker...");

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log("[SW] Deleting old cache:", cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log("[SW] Service worker activated");
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle image requests
    if (!request.url.includes("/static/images/")) {
        return;
    }

    console.log("[SW] Fetching:", request.url);

    event.respondWith(
        caches.match(request).then((response) => {
            // Return cached version if available
            if (response) {
                console.log("[SW] Serving from cache:", request.url);
                return response;
            }

            // Fetch from network
            return fetch(request)
                .then((networkResponse) => {
                    // Check if we received a valid response
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
                        return networkResponse;
                    }

                    // Clone the response
                    const responseToCache = networkResponse.clone();

                    // Cache the response
                    caches
                        .open(DYNAMIC_CACHE_NAME)
                        .then((cache) => {
                            console.log("[SW] Caching new asset:", request.url);
                            cache.put(request, responseToCache);
                        })
                        .catch((error) => {
                            console.error("[SW] Failed to cache asset:", error);
                        });

                    return networkResponse;
                })
                .catch((error) => {
                    console.error("[SW] Network fetch failed:", error);

                    // Return a fallback response for critical assets
                    if (CRITICAL_ASSETS.some((asset) => request.url.includes(asset))) {
                        console.log("[SW] Returning fallback for critical asset:", request.url);
                        return new Response("", {
                            status: 404,
                            statusText: "Not Found",
                        });
                    }

                    throw error;
                });
        })
    );
});

// Background sync for failed requests
self.addEventListener("sync", (event) => {
    if (event.tag === "background-sync") {
        console.log("[SW] Background sync triggered");
        event.waitUntil(doBackgroundSync());
    }
});

// Push notification for cache updates
self.addEventListener("push", (event) => {
    console.log("[SW] Push notification received");

    const options = {
        body: "Game assets updated",
        icon: "/static/images/favicon.ico",
        badge: "/static/images/favicon.ico",
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
        },
    };

    event.waitUntil(self.registration.showNotification("Game Assets Updated", options));
});

// Background sync function
async function doBackgroundSync() {
    try {
        console.log("[SW] Performing background sync...");

        // Sync any pending cache operations
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const requests = await cache.keys();

        for (const request of requests) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.put(request, response);
                    console.log("[SW] Background sync updated:", request.url);
                }
            } catch (error) {
                console.error("[SW] Background sync failed for:", request.url, error);
            }
        }

        console.log("[SW] Background sync completed");
    } catch (error) {
        console.error("[SW] Background sync error:", error);
    }
}

// Cache management functions
async function clearOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME);

    await Promise.all(oldCaches.map((name) => caches.delete(name)));

    console.log("[SW] Old caches cleared");
}

// Message handling for cache management
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }

    if (event.data && event.data.type === "CLEAR_CACHE") {
        event.waitUntil(clearOldCaches());
    }

    if (event.data && event.data.type === "GET_CACHE_INFO") {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                const cacheInfo = {};
                return Promise.all(
                    cacheNames.map(async (name) => {
                        const cache = await caches.open(name);
                        const keys = await cache.keys();
                        cacheInfo[name] = keys.length;
                    })
                ).then(() => {
                    event.ports[0].postMessage(cacheInfo);
                });
            })
        );
    }
});

console.log("[SW] Service worker script loaded");
