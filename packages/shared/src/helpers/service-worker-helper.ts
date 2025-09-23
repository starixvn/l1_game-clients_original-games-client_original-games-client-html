// Service Worker Helper for managing offline caching
interface ServiceWorkerMessage {
    type: string;
    data?: any;
}

interface CacheInfo {
    [cacheName: string]: number;
}

class ServiceWorkerHelper {
    private static instance: ServiceWorkerHelper;
    private registration: ServiceWorkerRegistration | null = null;
    private readonly isSupported: boolean;
    private readonly basePath: string;

    private constructor() {
        this.isSupported = 'serviceWorker' in navigator;
        this.basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
        console.log('[ServiceWorkerHelper] Service Worker supported:', this.isSupported);
    }

    static getInstance(): ServiceWorkerHelper {
        if (!ServiceWorkerHelper.instance) {
            ServiceWorkerHelper.instance = new ServiceWorkerHelper();
        }
        return ServiceWorkerHelper.instance;
    }

    async register(): Promise<boolean> {
        if (!this.isSupported) {
            console.warn('[ServiceWorkerHelper] Service Worker not supported');
            return false;
        }

        try {
            console.log('[ServiceWorkerHelper] Registering service worker...');

            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('[ServiceWorkerHelper] Service Worker registered successfully:', this.registration);

            // Send basePath to service worker
            if (this.registration.active) {
                this.registration.active.postMessage({
                    type: 'SET_BASE_PATH',
                    basePath: this.basePath
                });
                console.log('[ServiceWorkerHelper] Sent basePath to service worker:', this.basePath);
            }

            // Handle service worker updates
            this.registration.addEventListener('updatefound', () => {
                console.log('[ServiceWorkerHelper] Service Worker update found');
                const newWorker = this.registration ? this.registration.installing : null;

                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[ServiceWorkerHelper] New service worker installed, ready to activate');
                            this.showUpdateNotification();
                        }
                    });
                }
            });

            // Handle service worker state changes
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[ServiceWorkerHelper] Service Worker controller changed');

                // Send basePath to new active service worker
                setTimeout(() => {
                    if (navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage({
                            type: 'SET_BASE_PATH',
                            basePath: this.basePath
                        });
                        console.log('[ServiceWorkerHelper] Sent basePath to new controller:', this.basePath);
                    }
                }, 100); // Small delay to ensure controller is ready
            });

            return true;
        } catch (error) {
            console.error('[ServiceWorkerHelper] Failed to register service worker:', error);
            return false;
        }
    }

    async unregister(): Promise<boolean> {
        if (!this.registration) {
            return false;
        }

        try {
            const result = await this.registration.unregister();
            console.log('[ServiceWorkerHelper] Service Worker unregistered:', result);
            this.registration = null;
            return result;
        } catch (error) {
            console.error('[ServiceWorkerHelper] Failed to unregister service worker:', error);
            return false;
        }
    }

    async update(): Promise<void> {
        if (!this.registration) {
            console.warn('[ServiceWorkerHelper] No service worker registration found');
            return;
        }

        try {
            console.log('[ServiceWorkerHelper] Checking for service worker updates...');
            await this.registration.update();
        } catch (error) {
            console.error('[ServiceWorkerHelper] Failed to update service worker:', error);
        }
    }

    async skipWaiting(): Promise<void> {
        if (!this.registration || !this.registration.waiting) {
            return;
        }

        try {
            console.log('[ServiceWorkerHelper] Skipping waiting...');
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } catch (error) {
            console.error('[ServiceWorkerHelper] Failed to skip waiting:', error);
        }
    }

    async clearCache(): Promise<void> {
        if (!this.registration || !this.registration.active) {
            return;
        }

        try {
            console.log('[ServiceWorkerHelper] Clearing cache...');
            if (this.registration.active) {
                this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
            }
        } catch (error) {
            console.error('[ServiceWorkerHelper] Failed to clear cache:', error);
        }
    }

    async getCacheInfo(): Promise<CacheInfo | null> {
        if (!this.registration || !this.registration.active) {
            return null;
        }

        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = (event) => {
                console.log('[ServiceWorkerHelper] Cache info received:', event.data);
                resolve(event.data);
            };

            try {
                if (this.registration && this.registration.active) {
                    this.registration.active.postMessage(
                        { type: 'GET_CACHE_INFO' },
                        [messageChannel.port2]
                    );
                } else {
                    resolve(null);
                    return;
                }
            } catch (error) {
                console.error('[ServiceWorkerHelper] Failed to get cache info:', error);
                resolve(null);
            }
        });
    }

    async requestBackgroundSync(): Promise<void> {
        if (!this.registration || !('sync' in this.registration)) {
            console.warn('[ServiceWorkerHelper] Background sync not supported');
            return;
        }

        try {
            console.log('[ServiceWorkerHelper] Requesting background sync...');
            await (this.registration as any).sync.register('background-sync');
        } catch (error) {
            console.error('[ServiceWorkerHelper] Failed to request background sync:', error);
        }
    }

    private showUpdateNotification(): void {
        // Show a notification to the user about the update
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Game Assets Updated', {
                body: 'New game assets are available. Refresh to update.',
                icon: `${this.basePath}/favicons/favicon.ico`,
                badge: `${this.basePath}/favicons/favicon.ico`,
                tag: 'game-update'
            });
        }

        // You can also show an in-app notification here
        console.log('[ServiceWorkerHelper] Update notification shown');
    }

    isRegistered(): boolean {
        return this.registration !== null;
    }

    getRegistration(): ServiceWorkerRegistration | null {
        return this.registration;
    }

    isServiceWorkerSupported(): boolean {
        return this.isSupported;
    }
}

// Export singleton instance
export const serviceWorkerHelper = ServiceWorkerHelper.getInstance();

// Auto-register service worker on module load
if (typeof window !== 'undefined') {
    serviceWorkerHelper.register().then((success) => {
        if (success) {
            console.log('[ServiceWorkerHelper] Auto-registration successful');
        }
    });
}

export default serviceWorkerHelper;
