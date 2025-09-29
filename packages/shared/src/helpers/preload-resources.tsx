import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useRef, useCallback } from "react";
import { getAppSettings, getGameSettings } from "../app-settings";
import { downloadAndCacheImage } from "./image-cache-controller";
import { logger } from '../services/logger';

// Constants
const DEFAULT_PROGRESS_BAR_ID = "progress-bar";
const MEMORIED_IMAGES = ["/chips/"];
const REQUEST_TIMEOUT = 10000;
const REQUEST_CLEANUP_THRESHOLD = 30000; // 30 seconds
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Types
interface PreloadResourcesProps {
    setIsDonePreload: () => void;
    gameId: number;
    cancelPreload?: boolean;
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
        logger.info('📦 [PRELOAD] Starting preload process', {
            gameId,
            timestamp: new Date().toISOString()
        });
        
        const preloadKey = gameId.toString();

        // Register callback
        this.registerCallback(preloadKey, onComplete);

        // If preload is already active, wait for it
        if (this.activePreloads.has(preloadKey)) {
            logger.info('⏳ [PRELOAD] Preload already active, waiting for completion', {
                gameId,
                preloadKey
            });
            await this.activePreloads.get(preloadKey);
            return;
        }

        logger.info('🚀 [PRELOAD] Starting new preload process', {
            gameId,
            preloadKey
        });
        
        // Start new preload
        const preloadPromise = this.executePreload(gameId, preloadKey, onProgress);
        this.activePreloads.set(preloadKey, preloadPromise);

        try {
            await preloadPromise;
            logger.info('✅ [PRELOAD] Preload completed successfully', {
                gameId,
                preloadKey
            });
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
            logger.info('🔄 [PRELOAD] Executing preload process', {
                gameId,
                preloadKey
            });
            
            const imagePaths = await this.fetchImagesFromAPI(gameId);
            
            logger.info('📋 [PRELOAD] Received image paths from API', {
                gameId,
                imageCount: imagePaths.length,
                imagePaths: imagePaths.slice(0, 5), // Log first 5 paths for debugging
                totalPaths: imagePaths.length
            });
            
            await this.loadImagesProgressive(imagePaths, gameId, onProgress);
            
            logger.info('✅ [PRELOAD] Successfully completed preload execution', {
                gameId,
                preloadKey,
                totalImages: imagePaths.length
            });
        } catch (error) {
            logger.error('❌ [PRELOAD] Preload execution failed', {
                gameId,
                preloadKey,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    private async fetchImagesFromAPI(gameId: number): Promise<string[]> {
        logger.info('🌐 [PRELOAD] Fetching image paths from API', {
            gameId,
            apiEndpoint: `${basePath}/api/preload-images`
        });
        
        const globalState = GlobalPreloadState.getInstance();

        // Check for existing request
        const existingRequest = globalState.getActiveRequest(gameId);
        if (existingRequest) {
            logger.info('♻️ [PRELOAD] Found existing API request, reusing', {
                gameId
            });
            return existingRequest;
        }

        logger.info('🆕 [PRELOAD] Creating new API request', {
            gameId
        });
        
        globalState.cleanupOldRequests();

        // Create new request
        const requestPromise = this.createImageRequest(gameId);
        globalState.setActiveRequest(gameId, requestPromise);

        try {
            const result = await requestPromise;
            logger.info('✅ [PRELOAD] API request completed successfully', {
                gameId,
                imageCount: result.length,
                responseTime: Date.now()
            });
            return result;
        } finally {
            logger.debug('🧹 [PRELOAD] Cleaning up API request', {
                gameId
            });
            globalState.cleanupRequest(gameId);
        }
    }

    private async createImageRequest(gameId: number): Promise<string[]> {
        const startTime = Date.now();
        const apiUrl = `${basePath}/api/preload-images`;
        
        try {
            logger.info('📡 [PRELOAD] Creating API request', {
                gameId,
                apiUrl,
                requestPayload: { gameId },
                timeout: REQUEST_TIMEOUT
            });

            const response = await axios.post(apiUrl, { gameId }, { timeout: REQUEST_TIMEOUT });
            const responseTime = Date.now() - startTime;

            logger.info('📥 [PRELOAD] API response received', {
                gameId,
                responseTime: `${responseTime}ms`,
                status: response.status,
                statusText: response.statusText,
                dataType: typeof response?.data,
                hasData: !!response?.data
            });

            // API returns { status: "ok", data: string[] }, so extract the data array
            const responseData = response?.data;
            if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
                logger.info('✅ [PRELOAD] Successfully extracted image paths', {
                    gameId,
                    imageCount: responseData.data.length,
                    responseTime: `${responseTime}ms`,
                    samplePaths: responseData.data.slice(0, 3) // Log first 3 paths
                });
                return responseData.data;
            } else {
                logger.warn('⚠️ [PRELOAD] Unexpected API response format', {
                    gameId,
                    responseData,
                    hasDataProperty: 'data' in (responseData || {}),
                    isDataArray: Array.isArray(responseData?.data),
                    responseTime: `${responseTime}ms`
                });
                return [];
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            logger.error('❌ [PRELOAD] API request failed', {
                gameId,
                apiUrl,
                error: error.message,
                responseTime: `${responseTime}ms`,
                timeout: REQUEST_TIMEOUT,
                stack: error.stack
            });
            throw error;
        }
    }

    private async loadImagesProgressive(imagePaths: string[], gameId: number, onProgress?: (progress: number) => void): Promise<void> {
        const startTime = Date.now();
        
        logger.info('🖼️ [PRELOAD] Starting progressive image loading', {
            gameId,
            totalImages: imagePaths.length,
            imagePaths: imagePaths.slice(0, 3), // Log first 3 paths
            timestamp: new Date().toISOString()
        });

        if (imagePaths.length === 0) {
            logger.info('⏭️ [PRELOAD] No images to load, skipping', {
                gameId
            });
            return;
        }

        const totalImages = imagePaths.length;
        let loadedImages = 0;
        let failedImages = 0;

        logger.info('📊 [PRELOAD] Image loading statistics', {
            gameId,
            totalImages,
            basePath,
            memoriedImagesCount: this.getMemoriedImages(gameId).length
        });

        const updateProgress = () => {
            const progress = Math.min((loadedImages / totalImages) * 100, 100);
            onProgress?.(progress);
            updateProgressBar(progress);
            
            logger.debug('📈 [PRELOAD] Progress update', {
                gameId,
                progress: `${progress.toFixed(2)}%`,
                loadedImages,
                totalImages,
                failedImages
            });
        };

        updateProgress();

        const memoriedImages = this.getMemoriedImages(gameId);
        
        logger.info('💾 [PRELOAD] Cache configuration', {
            gameId,
            memoriedImages,
            cachePaths: memoriedImages.length
        });

        await Promise.all(
            imagePaths.map(async (path, index) => {
                const imageStartTime = Date.now();
                
                try {
                    logger.debug('🔄 [PRELOAD] Loading individual image', {
                        gameId,
                        imageIndex: index + 1,
                        totalImages,
                        imagePath: path,
                        isMemoried: memoriedImages.some(img => path.includes(img))
                    });
                    
                    await this.loadAndCacheImage(path, memoriedImages);
                    loadedImages++;
                    
                    const imageLoadTime = Date.now() - imageStartTime;
                    logger.debug('✅ [PRELOAD] Image loaded successfully', {
                        gameId,
                        imageIndex: index + 1,
                        imagePath: path,
                        loadTime: `${imageLoadTime}ms`,
                        progress: `${((loadedImages / totalImages) * 100).toFixed(2)}%`
                    });
                } catch (error) {
                    failedImages++;
                    const imageLoadTime = Date.now() - imageStartTime;
                    logger.warn('⚠️ [PRELOAD] Image failed to load', {
                        gameId,
                        imageIndex: index + 1,
                        imagePath: path,
                        loadTime: `${imageLoadTime}ms`,
                        error: error.message
                    });
                }
                
                updateProgress();
            })
        );

        const totalLoadTime = Date.now() - startTime;
        
        logger.info('🎉 [PRELOAD] Image loading completed', {
            gameId,
            totalImages,
            loadedImages,
            failedImages,
            successRate: `${((loadedImages / totalImages) * 100).toFixed(2)}%`,
            totalLoadTime: `${totalLoadTime}ms`,
            averageLoadTime: `${(totalLoadTime / totalImages).toFixed(2)}ms per image`
        });

        GlobalPreloadState.getInstance().setGameLoaded(gameId);
    }

    private getMemoriedImages(gameId: number): string[] {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
        const cachePaths = getGameSettings(gameId)?.gameResourceConfigs?.cachePaths ?? [];
        const cachePathsWithBase = cachePaths.map(path => basePath + path);
        return MEMORIED_IMAGES.concat(cachePathsWithBase);
    }

    private async loadAndCacheImage(path: string, memoriedImages: string[]): Promise<void> {
        const startTime = Date.now();
        
        logger.debug('🖼️ [PRELOAD] Starting image load and cache', {
            imagePath: path,
            isMemoried: memoriedImages.some(img => path.includes(img)),
            timestamp: new Date().toISOString()
        });
        
        const globalState = GlobalPreloadState.getInstance();

        // Check if already cached
        const existingPromise = globalState.getImageLoadingPromise(path);
        if (existingPromise) {
            logger.debug('♻️ [PRELOAD] Image already loading/cached, reusing', {
                imagePath: path
            });
            await existingPromise;
            return;
        }

        const loadingPromise = this.createImageLoadingPromise(path, memoriedImages);
        globalState.setImageLoadingPromise(path, loadingPromise);

        try {
            await loadingPromise;
            const loadTime = Date.now() - startTime;
            logger.debug('✅ [PRELOAD] Image loaded and cached successfully', {
                imagePath: path,
                loadTime: `${loadTime}ms`,
                isMemoried: memoriedImages.some(img => path.includes(img))
            });
        } catch (error) {
            const loadTime = Date.now() - startTime;
            logger.warn('❌ [PRELOAD] Image failed to load and cache', {
                imagePath: path,
                loadTime: `${loadTime}ms`,
                error: error.message,
                isMemoried: memoriedImages.some(img => path.includes(img))
            });
            throw error;
        }
    }

    private createImageLoadingPromise(path: string, memoriedImages: string[]): Promise<any> {
        const isMemoried = memoriedImages.some((memoriedImage) => path.removeBuildVersion().includes(memoriedImage));
        
        logger.debug('🔧 [PRELOAD] Creating image loading promise', {
            imagePath: path,
            isMemoried,
            loadingMethod: isMemoried ? 'downloadAndCacheImage' : 'Image() constructor'
        });
        
        if (isMemoried) {
            logger.debug('💾 [PRELOAD] Using cache download method', {
                imagePath: path
            });
            return downloadAndCacheImage(path);
        }

        return new Promise<void>((resolve) => {
            const img = new Image();
            const startTime = Date.now();
            
            img.onload = () => {
                const loadTime = Date.now() - startTime;
                logger.debug('✅ [PRELOAD] Image loaded via Image constructor', {
                    imagePath: path,
                    loadTime: `${loadTime}ms`,
                    imageWidth: img.width,
                    imageHeight: img.height
                });
                resolve();
            };
            
            img.onerror = (error) => {
                const loadTime = Date.now() - startTime;
                logger.warn('❌ [PRELOAD] Image failed to load via Image constructor', {
                    imagePath: path,
                    loadTime: `${loadTime}ms`,
                    error: error.toString()
                });
                resolve(); // Continue even if image fails
            };
            
            logger.debug('🔄 [PRELOAD] Setting image source', {
                imagePath: path
            });
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
        logger.info('🎬 [PRELOAD] PreloadResources component effect triggered', {
            componentId: componentId.current,
            gameId,
            routerReady: router?.isReady,
            enablePreloadResource,
            isGameLoaded: globalState.isGameLoaded(gameId)
        });

        if (!router?.isReady || !enablePreloadResource || gameId < 0) {
            logger.info('⏭️ [PRELOAD] Skipping preload due to conditions', {
                componentId: componentId.current,
                gameId,
                routerReady: router?.isReady,
                enablePreloadResource,
                gameIdValid: gameId >= 0
            });
            handlePreloadComplete();
            return undefined;
        }

        // Check if game is already loaded
        if (globalState.isGameLoaded(gameId)) {
            logger.info('♻️ [PRELOAD] Game already loaded, skipping preload', {
                componentId: componentId.current,
                gameId
            });
            handlePreloadComplete();
            return undefined;
        }

        let isMounted = true;

        const startPreload = async () => {
            try {
                logger.info('🚀 [PRELOAD] Starting preload process', {
                    componentId: componentId.current,
                    gameId
                });
                
                const preloadManager = PreloadManager.getInstance();
                await preloadManager.startPreload(
                    gameId,
                    () => {
                        if (isMounted) {
                            logger.info('✅ [PRELOAD] Preload completed successfully', {
                                componentId: componentId.current,
                                gameId
                            });
                            handlePreloadComplete();
                        }
                    },
                    handlePreloadProgress
                );
            } catch (error) {
                if (isMounted) {
                    logger.error('❌ [PRELOAD] Preload failed', {
                        componentId: componentId.current,
                        gameId,
                        error: error.message,
                        stack: error.stack
                    });
                    handlePreloadComplete();
                }
            }
        };

        startPreload();

        return () => {
            logger.info('🧹 [PRELOAD] Cleaning up preload effect', {
                componentId: componentId.current,
                gameId,
                enablePreloadResource
            });
            
            isMounted = false;
            if (enablePreloadResource && gameId >= 0) {
                const preloadManager = PreloadManager.getInstance();
                preloadManager.cancelPreload(gameId);
            }
        };
    }, [router?.isReady, gameId, enablePreloadResource, handlePreloadComplete, handlePreloadProgress]);

    // Handle cancel preload
    useEffect(() => {
        if (cancelPreload) {
            logger.info('🛑 [PRELOAD] Cancelling preload process', {
                componentId: componentId.current,
                gameId
            });
            
            const preloadManager = PreloadManager.getInstance();
            preloadManager.cancelPreload(gameId);
            handlePreloadComplete();
        }
    }, [cancelPreload, gameId, handlePreloadComplete]);

    return null;
};

// Utility function for external use
export const updateProgressBar = (percentage: number, progressBarId = DEFAULT_PROGRESS_BAR_ID) => {
    logger.debug('📊 [PRELOAD] Updating progress bar', {
        percentage: `${percentage.toFixed(2)}%`,
        progressBarId,
        timestamp: new Date().toISOString()
    });
    
    const progressBars = document.querySelectorAll(`#${progressBarId}`);
    
    logger.debug('🎯 [PRELOAD] Progress bar elements found', {
        progressBarId,
        elementCount: progressBars.length
    });
    
    progressBars.forEach((progressBar, index) => {
        if (progressBar instanceof HTMLElement) {
            progressBar.style.width = `${percentage}%`;
            logger.debug('✅ [PRELOAD] Progress bar updated', {
                progressBarId,
                elementIndex: index,
                percentage: `${percentage.toFixed(2)}%`
            });
        }
    });
};

export default PreloadResources;
