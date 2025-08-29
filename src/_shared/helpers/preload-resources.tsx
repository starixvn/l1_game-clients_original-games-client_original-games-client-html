import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useRef, useCallback } from "react";
import { getAppSettings, getGameSettings } from "../app-settings";
import { downloadAndCacheImage } from "./image-cache-controller";

// Constants
const DEFAULT_PROGRESS_BAR_ID = "progress-bar";
const MEMORIED_IMAGES = ["/chips/"];
const REQUEST_TIMEOUT = 10000;
const REQUEST_CLEANUP_THRESHOLD = 30000; // 30 seconds

// Types
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

interface PreloadRequest {
    promise: Promise<string[]>;
    timestamp: number;
}

// Global state management
class GlobalPreloadState {
    private static instance: GlobalPreloadState;
    private loadedGamesCache: Record<number, boolean> = {};
    private activeRequests: Record<number, PreloadRequest> = {};
    private imageLoadingPromises: Record<string, Promise<void>> = {};

    static getInstance(): GlobalPreloadState {
        if (!GlobalPreloadState.instance) {
            GlobalPreloadState.instance = new GlobalPreloadState();
        }
        return GlobalPreloadState.instance;
    }

    isGameLoaded(gameId: number): boolean {
        return this.loadedGamesCache[gameId] || false;
    }

    setGameLoaded(gameId: number): void {
        this.loadedGamesCache[gameId] = true;
    }

    getActiveRequest(gameId: number): Promise<string[]> | null {
        const request = this.activeRequests[gameId];
        if (request && Date.now() - request.timestamp < REQUEST_CLEANUP_THRESHOLD) {
            return request.promise;
        }
        this.cleanupRequest(gameId);
        return null;
    }

    setActiveRequest(gameId: number, promise: Promise<string[]>): void {
        this.activeRequests[gameId] = {
            promise,
            timestamp: Date.now(),
        };
    }

    cleanupRequest(gameId: number): void {
        delete this.activeRequests[gameId];
    }

    cleanupOldRequests(): void {
        const now = Date.now();
        Object.keys(this.activeRequests).forEach((gameId) => {
            const request = this.activeRequests[gameId];
            if (now - request.timestamp >= REQUEST_CLEANUP_THRESHOLD) {
                this.cleanupRequest(+gameId);
            }
        });
    }

    getImageLoadingPromise(path: string): Promise<void> | null {
        return this.imageLoadingPromises[path] || null;
    }

    setImageLoadingPromise(path: string, promise: Promise<void>): void {
        this.imageLoadingPromises[path] = promise;
    }
}

// Preload manager for coordinating preload operations
class PreloadManager {
    private static instance: PreloadManager;
    private readonly activePreloads: Map<string, Promise<void>> = new Map();
    private readonly preloadCallbacks: Map<string, Set<() => void>> = new Map();

    static getInstance(): PreloadManager {
        if (!PreloadManager.instance) {
            PreloadManager.instance = new PreloadManager();
        }
        return PreloadManager.instance;
    }

    async startPreload(gameId: number, onComplete: () => void, onProgress?: (progress: number) => void): Promise<void> {
        const preloadKey = gameId.toString();

        // Register callback
        this.registerCallback(preloadKey, onComplete);

        // If preload is already active, wait for it
        if (this.activePreloads.has(preloadKey)) {
            await this.activePreloads.get(preloadKey);
            return;
        }

        // Start new preload
        const preloadPromise = this.executePreload(gameId, preloadKey, onProgress);
        this.activePreloads.set(preloadKey, preloadPromise);

        try {
            await preloadPromise;
        } finally {
            this.cleanupPreload(preloadKey);
        }
    }

    private registerCallback(preloadKey: string, onComplete: () => void): void {
        if (!this.preloadCallbacks.has(preloadKey)) {
            this.preloadCallbacks.set(preloadKey, new Set());
        }
        this.preloadCallbacks.get(preloadKey)?.add(onComplete);
    }

    private async executePreload(gameId: number, preloadKey: string, onProgress?: (progress: number) => void): Promise<void> {
        try {
            const imagePaths = await this.fetchImagesFromAPI(gameId);
            await this.loadImagesProgressive(imagePaths, gameId, onProgress);
        } catch (error) {
            console.error(`[PreloadManager] Preload failed for key: ${preloadKey}:`, error);
            throw error;
        }
    }

    private async fetchImagesFromAPI(gameId: number): Promise<string[]> {
        const globalState = GlobalPreloadState.getInstance();

        // Check for existing request
        const existingRequest = globalState.getActiveRequest(gameId);
        if (existingRequest) {
            return existingRequest;
        }

        globalState.cleanupOldRequests();

        // Create new request
        const requestPromise = this.createImageRequest(gameId);
        globalState.setActiveRequest(gameId, requestPromise);

        try {
            return await requestPromise;
        } finally {
            globalState.cleanupRequest(gameId);
        }
    }

    private async createImageRequest(gameId: number): Promise<string[]> {
        try {
            const response = await axios.post("/api/preload-images", { gameId }, { timeout: REQUEST_TIMEOUT });
            return (response?.data as string[]) || [];
        } catch (error) {
            console.error(`[fetchImagesFromAPI] Failed to fetch image paths:`, error);
            throw error;
        }
    }

    private async loadImagesProgressive(imagePaths: string[], gameId: number, onProgress?: (progress: number) => void): Promise<void> {
        if (imagePaths.length === 0) {
            return;
        }

        const totalImages = imagePaths.length;
        let loadedImages = 0;

        const updateProgress = () => {
            const progress = Math.min((loadedImages / totalImages) * 100, 100);
            onProgress?.(progress);
            updateProgressBar(progress);
        };

        updateProgress();

        const memoriedImages = this.getMemoriedImages(gameId);

        await Promise.all(
            imagePaths.map(async (path) => {
                await this.loadAndCacheImage(path, memoriedImages);
                loadedImages++;
                updateProgress();
            })
        );

        GlobalPreloadState.getInstance().setGameLoaded(gameId);
    }

    private getMemoriedImages(gameId: number): string[] {
        return MEMORIED_IMAGES.concat(getGameSettings(gameId)?.gameResourceConfigs?.cachePaths ?? []);
    }

    private async loadAndCacheImage(path: string, memoriedImages: string[]): Promise<void> {
        const globalState = GlobalPreloadState.getInstance();

        // Check if already cached
        const existingPromise = globalState.getImageLoadingPromise(path);
        if (existingPromise) {
            await existingPromise;
            return;
        }

        const loadingPromise = this.createImageLoadingPromise(path, memoriedImages);
        globalState.setImageLoadingPromise(path, loadingPromise);

        try {
            await loadingPromise;
        } catch (error) {
            console.warn(`[loadAndCacheImage] Failed to load image: ${path}`, error);
            throw error;
        }
    }

    private createImageLoadingPromise(path: string, memoriedImages: string[]): Promise<any> {
        if (memoriedImages.some((memoriedImage) => path.includes(memoriedImage))) {
            return downloadAndCacheImage(path);
        }

        return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => {
                console.warn(`[loadAndCacheImage] Image failed to load: ${path}`);
                resolve(); // Continue even if image fails
            };
            img.src = path;
        });
    }

    private cleanupPreload(preloadKey: string): void {
        this.activePreloads.delete(preloadKey);
        const callbacks = this.preloadCallbacks.get(preloadKey);
        if (callbacks) {
            callbacks.forEach((callback) => callback());
            this.preloadCallbacks.delete(preloadKey);
        }
    }

    cancelPreload(gameId: number): void {
        const preloadKey = gameId.toString();
        this.preloadCallbacks.delete(preloadKey);
    }
}

// Main component
const PreloadResources: React.FC<PreloadResourcesProps> = ({
    setIsDonePreload,
    gameId,
    locale = "en",
    cancelPreload,
    progressBarId = DEFAULT_PROGRESS_BAR_ID,
    onProgressUpdate,
}) => {
    const router = useRouter();
    const componentId = useRef(`preload-${gameId}-${Date.now()}`);
    const globalState = GlobalPreloadState.getInstance();

    const enablePreloadResource = getAppSettings().enablePreloadResource ?? true;

    const handlePreloadComplete = useCallback(() => {
        updateProgressBar(100, progressBarId);
        setIsDonePreload();
    }, [progressBarId, setIsDonePreload]);

    const handlePreloadProgress = useCallback(
        (progress: number) => {
            onProgressUpdate?.(progress);
        },
        [onProgressUpdate]
    );

    // Main preload effect
    useEffect(() => {
        if (!router?.isReady || !enablePreloadResource || gameId < 0) {
            handlePreloadComplete();
            return undefined;
        }

        // Check if game is already loaded
        if (globalState.isGameLoaded(gameId)) {
            handlePreloadComplete();
            return undefined;
        }

        let isMounted = true;

        const startPreload = async () => {
            try {
                const preloadManager = PreloadManager.getInstance();
                await preloadManager.startPreload(
                    gameId,
                    () => {
                        if (isMounted) {
                            handlePreloadComplete();
                        }
                    },
                    handlePreloadProgress
                );
            } catch (error) {
                if (isMounted) {
                    console.error(`[PreloadResources:${componentId.current}] Preload failed:`, error);
                    handlePreloadComplete();
                }
            }
        };

        startPreload();

        return () => {
            isMounted = false;
            if (enablePreloadResource && gameId >= 0) {
                const preloadManager = PreloadManager.getInstance();
                preloadManager.cancelPreload(gameId);
            }
        };
    }, [router?.isReady, gameId, enablePreloadResource, locale, handlePreloadComplete, handlePreloadProgress]);

    // Handle cancel preload
    useEffect(() => {
        if (cancelPreload) {
            const preloadManager = PreloadManager.getInstance();
            preloadManager.cancelPreload(gameId);
            handlePreloadComplete();
        }
    }, [cancelPreload, gameId, handlePreloadComplete]);

    return null;
};

// Utility function for external use
export const updateProgressBar = (percentage: number, progressBarId = DEFAULT_PROGRESS_BAR_ID) => {
    const progressBars = document.querySelectorAll(`#${progressBarId}`);
    progressBars.forEach((progressBar) => {
        if (progressBar instanceof HTMLElement) {
            progressBar.style.width = `${percentage}%`;
        }
    });
};

export default PreloadResources;
