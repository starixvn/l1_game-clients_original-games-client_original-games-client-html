import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { LobbyConfigs } from "sc-user-service-client/dist/lobby";

import { getLobbyGamesIds } from "./lobby-helper";
import { getAppSettings, getGameSettings } from "../app-settings";
import { systemName } from "../constants";
import { imageOptimizationHelper, optimizeImageUrl } from "./image-optimization-helper";

const DEFAULT_PROGRESS_BAR_ID = "progress-bar";
export const DURATION_HOLD_SPLASH_SCREEN = 1000;

// Analytics tracking
interface PreloadAnalytics {
    gameId: number;
    startTime: number;
    endTime?: number;
    totalImages: number;
    criticalImages: number;
    loadedImages: number;
    failedImages: number;
    apiResponseTime: number;
    totalLoadTime: number;
    cacheHits: number;
    compressionRatio: number;
}

// Extend Window interface for gtag
declare global {
    interface Window {
        gtag?: (command: string, eventName: string, parameters: any) => void;
    }
}

const analyticsData: PreloadAnalytics[] = [];

// Critical image paths that should be loaded first
const CRITICAL_IMAGE_PATHS = [
    "/cage/",
    "/countdown-timer/",
    "/chips/gn/",
    "/ball/",
    "/anim/ball-middle/"
];

// Progressive loading priorities
enum ImagePriority {
    CRITICAL = 1,
    HIGH = 2,
    MEDIUM = 3,
    LOW = 4
}

interface ImageWithPriority {
    path: string;
    priority: ImagePriority;
    size?: number;
    isCompressed?: boolean;
}

// Global preload manager to prevent multiple simultaneous preloads
class PreloadManager {
    private static instance: PreloadManager;
    private readonly activePreloads: Map<string, Promise<void>> = new Map();
    private readonly preloadCallbacks: Map<string, Set<() => void>> = new Map();
    private readonly analytics: Map<string, PreloadAnalytics> = new Map();

    static getInstance(): PreloadManager {
        if (!PreloadManager.instance) {
            PreloadManager.instance = new PreloadManager();
        }
        return PreloadManager.instance;
    }

    async startPreload(
        gameId: number,
        locale: string,
        gameIdsIcon: number[],
        bannerId: number,
        onComplete: () => void,
        onProgress?: (progress: number) => void
    ): Promise<void> {
        const preloadKey = getRequestKey(gameId, locale, gameIdsIcon, bannerId);

        console.log(`[PreloadManager] Starting preload for key: ${preloadKey}`);

        // Initialize analytics
        const analytics: PreloadAnalytics = {
            gameId,
            startTime: Date.now(),
            totalImages: 0,
            criticalImages: 0,
            loadedImages: 0,
            failedImages: 0,
            apiResponseTime: 0,
            totalLoadTime: 0,
            cacheHits: 0,
            compressionRatio: 0
        };
        this.analytics.set(preloadKey, analytics);

        // Register callback for this preload
        if (!this.preloadCallbacks.has(preloadKey)) {
            this.preloadCallbacks.set(preloadKey, new Set());
        }
        const cbSet = this.preloadCallbacks.get(preloadKey);
        if (cbSet) {
            cbSet.add(onComplete);
        }

        // If preload is already active, just wait for it
        if (this.activePreloads.has(preloadKey)) {
            console.log(`[PreloadManager] Preload already active for key: ${preloadKey}, waiting for completion`);
            await this.activePreloads.get(preloadKey);
            return;
        }

        // Start new preload
        const preloadPromise = this.executePreload(gameId, locale, gameIdsIcon, bannerId, preloadKey, onProgress);
        this.activePreloads.set(preloadKey, preloadPromise);

        try {
            await preloadPromise;
        } finally {
            // Finalize analytics
            const finalAnalytics = this.analytics.get(preloadKey);
            if (finalAnalytics) {
                finalAnalytics.endTime = Date.now();
                finalAnalytics.totalLoadTime = finalAnalytics.endTime - finalAnalytics.startTime;
                this.logAnalytics(finalAnalytics);
                analyticsData.push(finalAnalytics);
            }

            // Clean up
            this.activePreloads.delete(preloadKey);
            this.analytics.delete(preloadKey);
            const callbacks = this.preloadCallbacks.get(preloadKey);
            if (callbacks) {
                callbacks.forEach(callback => callback());
                this.preloadCallbacks.delete(preloadKey);
            }
        }
    }

    private async executePreload(
        gameId: number,
        locale: string,
        gameIdsIcon: number[],
        bannerId: number,
        preloadKey: string,
        onProgress?: (progress: number) => void
    ): Promise<void> {
        console.log(`[PreloadManager] Executing preload for key: ${preloadKey}`);

        try {
            // Fetch image paths with analytics
            const imagePaths = await fetchImagesFromAPI(gameId, locale, gameIdsIcon, bannerId, preloadKey);

            // Progressive loading with priority
            await loadImagesProgressive(imagePaths, gameId, preloadKey, onProgress);

            console.log(`[PreloadManager] Preload completed for key: ${preloadKey}`);
        } catch (error) {
            console.error(`[PreloadManager] Preload failed for key: ${preloadKey}:`, error);
            throw error;
        }
    }

    private logAnalytics(analytics: PreloadAnalytics): void {
        console.log(`[PreloadAnalytics] Game ${analytics.gameId} preload completed:`, {
            totalTime: `${analytics.totalLoadTime}ms`,
            apiTime: `${analytics.apiResponseTime}ms`,
            images: `${analytics.loadedImages}/${analytics.totalImages}`,
            critical: analytics.criticalImages,
            failed: analytics.failedImages,
            cacheHits: analytics.cacheHits,
            compression: `${analytics.compressionRatio}%`
        });

        // Send analytics to monitoring service
        this.sendAnalyticsToService(analytics);
    }

    private sendAnalyticsToService(analytics: PreloadAnalytics): void {
        // Send to analytics service (e.g., Google Analytics, custom endpoint)
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'preload_completed', {
                game_id: analytics.gameId,
                total_time: analytics.totalLoadTime,
                api_time: analytics.apiResponseTime,
                images_loaded: analytics.loadedImages,
                images_total: analytics.totalImages,
                cache_hits: analytics.cacheHits,
                compression_ratio: analytics.compressionRatio
            });
        }

        // Send to custom analytics endpoint
        fetch('/api/analytics/preload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analytics)
        }).catch(error => {
            console.warn('[PreloadManager] Failed to send analytics:', error);
        });
    }

    cancelPreload(gameId: number, locale: string, gameIdsIcon: number[], bannerId: number): void {
        const preloadKey = getRequestKey(gameId, locale, gameIdsIcon, bannerId);
        console.log(`[PreloadManager] Cancelling preload for key: ${preloadKey}`);

        // Remove callbacks
        this.preloadCallbacks.delete(preloadKey);
        this.analytics.delete(preloadKey);

        // Note: We can't easily cancel the actual preload promise, but we can prevent new callbacks
    }

    getAnalytics(): PreloadAnalytics[] {
        return [...analyticsData];
    }
}

// Enhanced global cache with request deduplication
const loadedGamesCache: Record<number, boolean> = {};
const imageLoadingPromises: Record<string, Promise<void>> = {};
const activeRequests: Record<string, Promise<string[]>> = {};
const requestTimestamps: Record<string, number> = {};

// Request deduplication helper
const getRequestKey = (gameId: number, locale: string, gameIdsIcon: number[], bannerId: number) => {
    return `${gameId}-${locale}-${JSON.stringify(gameIdsIcon)}-${bannerId}`;
};

// Cleanup old requests (older than 30 seconds)
const cleanupOldRequests = () => {
    const now = Date.now();
    const thirtySecondsAgo = now - 30000;

    Object.keys(activeRequests).forEach(key => {
        if (requestTimestamps[key] && requestTimestamps[key] < thirtySecondsAgo) {
            console.log(`[PreloadResources] Cleaning up old request: ${key}`);
            delete activeRequests[key];
            delete requestTimestamps[key];
        }
    });
};

// CDN URL generation - removed for future implementation
// const getCDNUrl = (path: string): string => {
//     return path;
// };

// Image compression detection
const isCompressedImage = (path: string): boolean => {
    return path.includes('.webp') || path.includes('compressed') || path.includes('optimized');
};

// Progressive image prioritization with optimization
const prioritizeImages = (imagePaths: string[]): ImageWithPriority[] => {
    const optimalFormat = imageOptimizationHelper.getOptimalFormat();

    return imagePaths.map(path => {
        let priority = ImagePriority.LOW;
        const isCompressed = isCompressedImage(path);

        // Optimize the URL with the best format
        const optimizedUrl = optimizeImageUrl(path, {
            format: optimalFormat as any,
            quality: 85
        });

        // Critical images (UI elements, game mechanics)
        if (CRITICAL_IMAGE_PATHS.some(criticalPath => path.includes(criticalPath))) {
            priority = ImagePriority.CRITICAL;
        }
        // High priority (frequently used)
        else if (path.includes('/chips/') || path.includes('/ball/')) {
            priority = ImagePriority.HIGH;
        }
        // Medium priority (game-specific assets)
        else if (path.includes('/number/') || path.includes('/cage/')) {
            priority = ImagePriority.MEDIUM;
        }

        return {
            path: optimizedUrl,
            priority,
            isCompressed: isCompressed || optimizedUrl !== path
        };
    }).sort((a, b) => a.priority - b.priority);
};

// Fetch images from API with request deduplication and analytics
const fetchImagesFromAPI = async (
    gameId: number,
    locale: string,
    gameIdsIcon: number[],
    bannerId: number,
    preloadKey: string
): Promise<string[]> => {
    const requestKey = getRequestKey(gameId, locale, gameIdsIcon || [], bannerId || 0);

    console.log(`[fetchImagesFromAPI] Fetching images with key: ${requestKey}`);

    // Check if there's already an active request for this combination
    if (activeRequests[requestKey]) {
        console.log(`[fetchImagesFromAPI] Reusing existing request for key: ${requestKey}`);
        try {
            const result = await activeRequests[requestKey];
            console.log(`[fetchImagesFromAPI] Reused request completed, got ${result.length} images`);
            return result;
        } catch (error) {
            console.error(`[fetchImagesFromAPI] Reused request failed:`, error);
            // Remove failed request from cache
            delete activeRequests[requestKey];
            delete requestTimestamps[requestKey];
            throw error;
        }
    }

    // Cleanup old requests periodically
    cleanupOldRequests();

    console.log(`[fetchImagesFromAPI] Creating new request for key: ${requestKey}`);

    // Create new request
    const requestPromise = (async () => {
        try {
            const startTime = Date.now();

            console.log(`[fetchImagesFromAPI] Making API call to /api/preload-images`);

            const response = await axios.post("/api/preload-images", {
                gameId,
                locale,
                gameIdsIcon,
                bannerId,
            }, {
                timeout: 10000, // 10 second timeout
            });

            const endTime = Date.now();
            const imagePaths = (response?.data as string[]) || [];
            const apiResponseTime = endTime - startTime;

            // Update analytics
            const preloadManager = PreloadManager.getInstance();
            const analytics = preloadManager['analytics'].get(preloadKey);
            if (analytics) {
                analytics.apiResponseTime = apiResponseTime;
                analytics.totalImages = imagePaths.length;
                analytics.criticalImages = imagePaths.filter(path =>
                    CRITICAL_IMAGE_PATHS.some(criticalPath => path.includes(criticalPath))
                ).length;
            }

            console.log(`[fetchImagesFromAPI] API call completed in ${apiResponseTime}ms, received ${imagePaths.length} image paths`);

            return imagePaths;
        } catch (error) {
            console.error(`[fetchImagesFromAPI] Failed to fetch image paths:`, error);
            throw error;
        } finally {
            // Clean up the request from active requests
            delete activeRequests[requestKey];
            delete requestTimestamps[requestKey];
        }
    })();

    // Store the request promise and timestamp
    activeRequests[requestKey] = requestPromise;
    requestTimestamps[requestKey] = Date.now();

    return requestPromise;
};

// Progressive image loading with priority
const loadImagesProgressive = async (
    imagePaths: string[],
    gameId: number,
    preloadKey: string,
    onProgress?: (progress: number) => void
): Promise<void> => {
    console.log(`[loadImagesProgressive] Starting progressive load of ${imagePaths.length} images for game ${gameId}`);

    if (imagePaths.length === 0) {
        console.log(`[loadImagesProgressive] No images to load, completing preload`);
        return;
    }

    const prioritizedImages = prioritizeImages(imagePaths);
    const preloadManager = PreloadManager.getInstance();
    const analytics = preloadManager['analytics'].get(preloadKey);

    console.log(`[loadImagesProgressive] Prioritized images:`, {
        critical: prioritizedImages.filter(img => img.priority === ImagePriority.CRITICAL).length,
        high: prioritizedImages.filter(img => img.priority === ImagePriority.HIGH).length,
        medium: prioritizedImages.filter(img => img.priority === ImagePriority.MEDIUM).length,
        low: prioritizedImages.filter(img => img.priority === ImagePriority.LOW).length
    });

    // Calculate total images for progress tracking
    const totalImages = prioritizedImages.length;
    let loadedImages = 0;

    // Progress callback wrapper
    const updateProgress = () => {
        const progress = Math.min((loadedImages / totalImages) * 100, 100);
        onProgress?.(progress);
        updateProgressBar(progress, DEFAULT_PROGRESS_BAR_ID);
    };

    // Initial progress (API call completed)
    updateProgress();

    // Load critical images first
    await loadImagesByPriority(prioritizedImages, ImagePriority.CRITICAL, analytics, () => {
        loadedImages += prioritizedImages.filter(img => img.priority === ImagePriority.CRITICAL).length;
        updateProgress();
    });

    // Load high priority images
    await loadImagesByPriority(prioritizedImages, ImagePriority.HIGH, analytics, () => {
        loadedImages += prioritizedImages.filter(img => img.priority === ImagePriority.HIGH).length;
        updateProgress();
    });

    // Load medium priority images
    await loadImagesByPriority(prioritizedImages, ImagePriority.MEDIUM, analytics, () => {
        loadedImages += prioritizedImages.filter(img => img.priority === ImagePriority.MEDIUM).length;
        updateProgress();
    });

    // Load low priority images
    await loadImagesByPriority(prioritizedImages, ImagePriority.LOW, analytics, () => {
        loadedImages += prioritizedImages.filter(img => img.priority === ImagePriority.LOW).length;
        updateProgress();
    });

    // Mark game as loaded in cache
    loadedGamesCache[gameId] = true;
    console.log(`[loadImagesProgressive] Game ${gameId} marked as cached`);

    // Calculate final analytics
    if (analytics) {
        analytics.compressionRatio = Math.round(
            (prioritizedImages.filter(img => img.isCompressed).length / prioritizedImages.length) * 100
        );
    }
};

// Load images by priority level
const loadImagesByPriority = async (
    prioritizedImages: ImageWithPriority[],
    priority: ImagePriority,
    analytics?: PreloadAnalytics,
    onBatchComplete?: () => void
): Promise<void> => {
    const imagesToLoad = prioritizedImages.filter(img => img.priority === priority);

    if (imagesToLoad.length === 0) {
        return;
    }

    const priorityName = ImagePriority[priority];
    console.log(`[loadImagesByPriority] Loading ${priorityName} priority images: ${imagesToLoad.length}`);

    const batchSize = priority === ImagePriority.CRITICAL ? 5 : 15; // Smaller batches for critical images
    const batches = [];

    for (let i = 0; i < imagesToLoad.length; i += batchSize) {
        batches.push(imagesToLoad.slice(i, i + batchSize));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];

        console.log(`[loadImagesByPriority] Loading ${priorityName} batch ${batchIndex + 1}/${batches.length} with ${batch.length} images`);

        // Load batch in parallel
        await Promise.all(
            batch.map(async (imageData) => {
                try {
                    await loadAndCacheImageOptimized(imageData.path);
                    if (analytics) {
                        analytics.loadedImages++;
                        if (imageData.isCompressed) {
                            analytics.compressionRatio++;
                        }
                    }
                } catch (error) {
                    console.warn(`[loadImagesByPriority] Failed to load image: ${imageData.path}`, error);
                    if (analytics) {
                        analytics.failedImages++;
                    }
                }
            })
        );

        // Progress update for critical images
        if (priority === ImagePriority.CRITICAL) {
            const progress = ((batchIndex + 1) * batch.length / imagesToLoad.length) * 100;
            console.log(`[loadImagesByPriority] Critical images progress: ${progress.toFixed(1)}%`);
        }
    }

    console.log(`[loadImagesByPriority] Completed loading ${priorityName} priority images`);

    // Call progress callback when batch is complete
    onBatchComplete?.();
};

// Optimized image loading with caching and analytics
const loadAndCacheImageOptimized = async (path: string): Promise<void> => {
    try {
        // Check if already cached
        if (imageLoadingPromises[path]) {
            await imageLoadingPromises[path];
            return;
        }

        // Create loading promise
        const loadingPromise = (async () => {
            const img = new Image();
            return new Promise<void>((resolve, reject) => {
                img.onload = () => {
                    console.log(`[loadAndCacheImageOptimized] Image loaded successfully: ${path}`);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`[loadAndCacheImageOptimized] Image failed to load: ${path}`);
                    resolve(); // Continue even if image fails
                };
                img.src = path;
            });
        })();

        imageLoadingPromises[path] = loadingPromise;
        await loadingPromise;
    } catch (error) {
        console.warn(`[loadAndCacheImageOptimized] Failed to load image: ${path}`, error);
        throw error;
    }
};

export const getAndHandleBannerOffer = (authorizeInfo: AuthorizeResponse, lobbyConfigs: LobbyConfigs, callbackFn: Function) => {
    // Custom version: No banner functionality since lobby is removed
    return;
};

export const getAndHandleGameOfferIds = (authorizeInfo: AuthorizeResponse, lobbyConfigs: LobbyConfigs, callbackFn: Function) => {
    const gameOfferIds = getLobbyGamesIds(lobbyConfigs as any, authorizeInfo);
    if (gameOfferIds?.length > 0) {
        callbackFn(gameOfferIds);
    }
};

export const updateProgressBar = (percentage: number, progressBarId = DEFAULT_PROGRESS_BAR_ID) => {
    const progressBars = document.querySelectorAll(`#${progressBarId}`);
    progressBars.forEach((progressBar) => {
        if (progressBar instanceof HTMLElement) {
            progressBar.style.width = `${percentage}%`;
        }
    });
};

// Core image paths that are always needed
const CORE_IMAGE_PATHS = [
    `/chips/${systemName}/`,
    "/countdown-timer/",
    "/cage/",
    "/anim/ball-middle/",
    "/ball/",
];

interface PreloadResourcesProps {
    setIsDonePreload: () => void;
    gameId: number;
    bannerId?: number;
    locale?: string;
    gameIdsIcon?: number[];
    cancelPreload?: boolean;
    durationDelayDonePreload?: number;
    progressBarId?: string;
    onProgressUpdate?: (progress: number) => void;
}

const PreloadResources: React.FC<PreloadResourcesProps> = ({
    setIsDonePreload,
    gameId,
    bannerId,
    gameIdsIcon,
    locale = "en",
    cancelPreload,
    progressBarId = DEFAULT_PROGRESS_BAR_ID,
    onProgressUpdate
}) => {
    const router = useRouter();
    const componentId = useRef(`preload-${gameId}-${Date.now()}-${Math.random()}`);

    const enablePreloadResource = getAppSettings().enablePreloadResource ?? true;
    const gameSettings = getGameSettings(gameId);
    const cachePaths = gameSettings?.gameResourceConfigs?.cachePaths || [];
    const preloadGameImages = [...CORE_IMAGE_PATHS, ...cachePaths];

    console.log(`[PreloadResources:${componentId.current}] Component initialized:`, {
        gameId,
        locale,
        gameIdsIcon,
        bannerId,
        enablePreloadResource,
        cachePaths: cachePaths.length,
        preloadGameImages: preloadGameImages.length
    });

    // Main preload effect using the global manager
    useEffect(() => {
        console.log(`[PreloadResources:${componentId.current}] useEffect triggered:`, {
            routerReady: router?.isReady,
            enablePreloadResource,
            gameId,
            isAlreadyCached: loadedGamesCache[gameId]
        });

        if (!router?.isReady || !enablePreloadResource || gameId < 0) {
            console.log(`[PreloadResources:${componentId.current}] Skipping preload - conditions not met`);
            updateProgressBar(100, progressBarId);
            setIsDonePreload();
            return;
        }

        // Check if game is already loaded
        if (loadedGamesCache[gameId]) {
            console.log(`[PreloadResources:${componentId.current}] Game ${gameId} already cached, skipping preload`);
            updateProgressBar(100, progressBarId);
            setIsDonePreload();
            return;
        }

        let isMounted = true;

        const startPreload = async () => {
            console.log(`[PreloadResources:${componentId.current}] Starting preload process`);
            // setIsLoading(true); // This line was removed

            try {
                const preloadManager = PreloadManager.getInstance();
                await preloadManager.startPreload(
                    gameId,
                    locale,
                    gameIdsIcon || [],
                    bannerId || 0,
                    () => {
                        if (isMounted) {
                            console.log(`[PreloadResources:${componentId.current}] Preload completed via manager`);
                            updateProgressBar(100, progressBarId);
                            setIsDonePreload();
                        }
                    },
                    (progress) => {
                        if (isMounted && onProgressUpdate) {
                            console.log(`[PreloadResources:${componentId.current}] Progress update: ${progress}%`);
                            onProgressUpdate(progress);
                        }
                    }
                );
            } catch (error) {
                if (isMounted) {
                    console.error(`[PreloadResources:${componentId.current}] Preload failed:`, error);
                    setIsDonePreload();
                }
            }

            return;
        };

        startPreload();

        return () => {
            console.log(`[PreloadResources:${componentId.current}] Component cleanup`);
            isMounted = false;

            // Cancel preload if component unmounts
            if (enablePreloadResource && gameId >= 0) {
                const preloadManager = PreloadManager.getInstance();
                preloadManager.cancelPreload(gameId, locale, gameIdsIcon || [], bannerId || 0);
            }
        };
    }, [router?.isReady, gameId, enablePreloadResource, locale, gameIdsIcon, bannerId, progressBarId, setIsDonePreload]);

    // Handle cancel preload
    useEffect(() => {
        if (cancelPreload) {
            console.log(`[PreloadResources:${componentId.current}] Cancel preload requested`);
            const preloadManager = PreloadManager.getInstance();
            preloadManager.cancelPreload(gameId, locale, gameIdsIcon || [], bannerId || 0);
            setIsDonePreload();
        }
    }, [cancelPreload, gameId, locale, gameIdsIcon, bannerId, setIsDonePreload]);

    // Render nothing
    return null;
};

export default PreloadResources;
