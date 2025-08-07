import axios from "axios";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { LobbyConfigs } from "sc-user-service-client/dist/lobby";

import { getLobbyGamesIds } from "./lobby-helper";
import { getAppSettings, getGameSettings } from "../app-settings";
import { downloadAndCacheImage } from "./image-cache-controller";

const DEFAULT_PROGRESS_BAR_ID = "progress-bar";
export const DURATION_HOLD_SPLASH_SCREEN = 1000;

// Global preload manager to prevent multiple simultaneous preloads
class PreloadManager {
    private static instance: PreloadManager;
    private activePreloads: Map<string, Promise<void>> = new Map();
    private preloadCallbacks: Map<string, Set<() => void>> = new Map();

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
        onComplete: () => void
    ): Promise<void> {
        const preloadKey = getRequestKey(gameId, locale, gameIdsIcon, bannerId);

        console.log(`[PreloadManager] Starting preload for key: ${preloadKey}`);

        // Register callback for this preload
        if (!this.preloadCallbacks.has(preloadKey)) {
            this.preloadCallbacks.set(preloadKey, new Set());
        }
        this.preloadCallbacks.get(preloadKey)!.add(onComplete);

        // If preload is already active, just wait for it
        if (this.activePreloads.has(preloadKey)) {
            console.log(`[PreloadManager] Preload already active for key: ${preloadKey}, waiting for completion`);
            await this.activePreloads.get(preloadKey);
            return;
        }

        // Start new preload
        const preloadPromise = this.executePreload(gameId, locale, gameIdsIcon, bannerId, preloadKey);
        this.activePreloads.set(preloadKey, preloadPromise);

        try {
            await preloadPromise;
        } finally {
            // Clean up
            this.activePreloads.delete(preloadKey);
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
        preloadKey: string
    ): Promise<void> {
        console.log(`[PreloadManager] Executing preload for key: ${preloadKey}`);

        try {
            // Fetch image paths
            const imagePaths = await fetchImagesFromAPI(gameId, locale, gameIdsIcon, bannerId);

            // Load images
            await loadAllImagesOptimized(imagePaths, gameId);

            console.log(`[PreloadManager] Preload completed for key: ${preloadKey}`);
        } catch (error) {
            console.error(`[PreloadManager] Preload failed for key: ${preloadKey}:`, error);
            throw error;
        }
    }

    cancelPreload(gameId: number, locale: string, gameIdsIcon: number[], bannerId: number): void {
        const preloadKey = getRequestKey(gameId, locale, gameIdsIcon, bannerId);
        console.log(`[PreloadManager] Cancelling preload for key: ${preloadKey}`);

        // Remove callbacks
        this.preloadCallbacks.delete(preloadKey);

        // Note: We can't easily cancel the actual preload promise, but we can prevent new callbacks
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

// Fetch images from API with request deduplication
const fetchImagesFromAPI = async (gameId: number, locale: string, gameIdsIcon: number[], bannerId: number): Promise<string[]> => {
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

            console.log(`[fetchImagesFromAPI] API call completed in ${endTime - startTime}ms, received ${imagePaths.length} image paths`);

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

// Optimized image loading function
const loadAllImagesOptimized = async (imagePaths: string[], gameId: number): Promise<void> => {
    console.log(`[loadAllImagesOptimized] Starting to load ${imagePaths.length} images for game ${gameId}`);

    if (imagePaths.length === 0) {
        console.log(`[loadAllImagesOptimized] No images to load, completing preload`);
        return;
    }

    let loadedCount = 0;
    const totalCount = imagePaths.length;
    const startTime = Date.now();

    try {
        // Load images in batches to avoid overwhelming the browser
        const batchSize = 15; // Increased batch size for better performance
        const batches = [];

        for (let i = 0; i < imagePaths.length; i += batchSize) {
            batches.push(imagePaths.slice(i, i + batchSize));
        }

        console.log(`[loadAllImagesOptimized] Created ${batches.length} batches of ${batchSize} images each`);

        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];

            console.log(`[loadAllImagesOptimized] Loading batch ${batchIndex + 1}/${batches.length} with ${batch.length} images`);

            // Load batch in parallel
            await Promise.all(
                batch.map(async (path) => {
                    await loadAndCacheImageOptimized(path);
                    loadedCount++;

                    if (loadedCount % 10 === 0) {
                        console.log(`[loadAllImagesOptimized] Progress: ${loadedCount}/${totalCount} (${(loadedCount / totalCount * 100).toFixed(1)}%)`);
                    }
                })
            );
        }

        const endTime = Date.now();
        console.log(`[loadAllImagesOptimized] All images loaded in ${endTime - startTime}ms`);

        // Mark game as loaded in cache
        loadedGamesCache[gameId] = true;
        console.log(`[loadAllImagesOptimized] Game ${gameId} marked as cached`);

    } catch (error) {
        console.error(`[loadAllImagesOptimized] Error loading images:`, error);
        throw error;
    }
};

// Optimized image loading with caching
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
const CORE_IMAGE_PATHS = ["/chips/gn/", "/countdown-timer/", "/cage/", "/anim/ball-middle/", "/ball/"];

interface PreloadResourcesProps {
    setIsDonePreload: () => void;
    gameId: number;
    bannerId?: number;
    locale?: string;
    gameIdsIcon?: number[];
    cancelPreload?: boolean;
    durationDelayDonePreload?: number;
    progressBarId?: string;
}

const PreloadResources: React.FC<PreloadResourcesProps> = ({
    setIsDonePreload,
    gameId,
    bannerId,
    gameIdsIcon,
    locale = "en",
    cancelPreload,
    progressBarId = DEFAULT_PROGRESS_BAR_ID
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
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
            setIsLoading(true);

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
                    }
                );
            } catch (error) {
                if (isMounted) {
                    console.error(`[PreloadResources:${componentId.current}] Preload failed:`, error);
                    setIsDonePreload();
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
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

    // Render nothing if preload is disabled or gameId is invalid
    return useMemo(() => {
        if (!enablePreloadResource || gameId < 0) {
            console.log(`[PreloadResources:${componentId.current}] Preload disabled or invalid gameId, completing immediately`);
            updateProgressBar(100, progressBarId);
            setIsDonePreload();
            return null;
        }

        return null;
    }, [enablePreloadResource, gameId, progressBarId, setIsDonePreload]);
};

export default PreloadResources;
