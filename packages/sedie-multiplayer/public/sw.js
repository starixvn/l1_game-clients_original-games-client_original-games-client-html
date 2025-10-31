// Service Worker for Offline Caching
const CACHE_NAME = "game-assets-v1";
const STATIC_CACHE_NAME = "static-assets-v1";
const DYNAMIC_CACHE_NAME = "dynamic-assets-v1";

// Critical assets to cache immediately
const CRITICAL_ASSETS = ["/static/images/countdown-timer/", "/static/images/ball/", "/static/images/anim/ball-middle/"];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
    

    event.waitUntil(
        caches
            .open(STATIC_CACHE_NAME)
            .then((cache) => {
                
                return cache.addAll(CRITICAL_ASSETS);
            })
            .then(() => {
                
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error("[SW] Failed to cache critical assets:", error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                
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

    

    event.respondWith(
        caches.match(request).then((response) => {
            // Return cached version if available
            if (response) {
                
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
        
        event.waitUntil(doBackgroundSync());
    }
});

// Push notification for cache updates
self.addEventListener("push", (event) => {
    

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
        

        // Sync any pending cache operations
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const requests = await cache.keys();

        for (const request of requests) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.put(request, response);
                    
                }
            } catch (error) {
                console.error("[SW] Background sync failed for:", request.url, error);
            }
        }

        
    } catch (error) {
        console.error("[SW] Background sync error:", error);
    }
}

// Cache management functions
async function clearOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME);

    await Promise.all(oldCaches.map((name) => caches.delete(name)));

    
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


