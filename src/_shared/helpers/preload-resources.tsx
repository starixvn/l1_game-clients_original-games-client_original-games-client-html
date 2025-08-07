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

// Global cache to prevent reloading the same game resources
const loadedGamesCache: Record<number, boolean> = {};
const imageLoadingPromises: Record<string, Promise<void>> = {};

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
    const abortControllerRef = useRef<AbortController | null>(null);

    const enablePreloadResource = getAppSettings().enablePreloadResource ?? true;
    const gameSettings = getGameSettings(gameId);
    const cachePaths = gameSettings?.gameResourceConfigs?.cachePaths || [];
    const preloadGameImages = [...CORE_IMAGE_PATHS, ...cachePaths];

    // Optimized image loading with Promise.all for parallel loading
    const loadImage = useCallback(async (path: string): Promise<void> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if image fails
            img.src = path;
        });
    }, []);

    // Load and cache image with error handling
    const loadAndCacheImage = useCallback(async (path: string): Promise<void> => {
        try {
            if (preloadGameImages.some((pathFolder) => path.includes(pathFolder))) {
                await downloadAndCacheImage(path);
            } else {
                await loadImage(path);
            }
        } catch (error) {
            // Silently handle errors to prevent blocking the preload process
            console.warn(`Failed to load image: ${path}`, error);
        }
    }, [preloadGameImages, loadImage]);

    // Fetch images from API with timeout and error handling
    const fetchImages = useCallback(async (): Promise<string[]> => {
        try {
            abortControllerRef.current = new AbortController();
            const response = await axios.post("/api/preload-images", {
                gameId,
                locale,
                gameIdsIcon,
                bannerId,
            }, {
                signal: abortControllerRef.current.signal,
                timeout: 10000, // 10 second timeout
            });
            return (response?.data as string[]) || [];
        } catch (error) {
            if (axios.isCancel(error)) {
                return [];
            }
            console.error("Failed to fetch image paths:", error);
            return [];
        }
    }, [gameId, locale, gameIdsIcon, bannerId]);

    // Load all images with progress tracking
    const loadAllImages = useCallback(async (imagePaths: string[]) => {
        if (imagePaths.length === 0) {
            setIsDonePreload();
            return;
        }

        setIsLoading(true);
        let loadedCount = 0;
        const totalCount = imagePaths.length;

        // Create a unique key for this loading session
        const loadingKey = `${gameId}-${Date.now()}`;
        
        try {
            // Load images in batches to avoid overwhelming the browser
            const batchSize = 10;
            const batches = [];
            
            for (let i = 0; i < imagePaths.length; i += batchSize) {
                batches.push(imagePaths.slice(i, i + batchSize));
            }

            for (const batch of batches) {
                if (abortControllerRef.current?.signal.aborted) {
                    break;
                }

                // Load batch in parallel
                await Promise.all(
                    batch.map(async (path) => {
                        await loadAndCacheImage(path);
                        loadedCount++;
                        const newProgress = (loadedCount / totalCount) * 100;
                        setProgress(newProgress);
                        updateProgressBar(newProgress, progressBarId);
                    })
                );
            }

            // Mark game as loaded in cache
            loadedGamesCache[gameId] = true;
            
        } catch (error) {
            console.error("Error loading images:", error);
        } finally {
            setIsLoading(false);
            setIsDonePreload();
        }
    }, [gameId, loadAndCacheImage, progressBarId, setIsDonePreload]);

    // Main preload effect
    useEffect(() => {
        if (!router?.isReady || !enablePreloadResource || gameId < 0) {
            return;
        }

        // Check if game is already loaded
        if (loadedGamesCache[gameId]) {
            updateProgressBar(100, progressBarId);
            setIsDonePreload();
            return;
        }

        let isMounted = true;

        const startPreload = async () => {
            try {
                const imagePaths = await fetchImages();
                if (isMounted) {
                    await loadAllImages(imagePaths);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Preload failed:", error);
                    setIsDonePreload();
                }
            }
        };

        startPreload();

        return () => {
            isMounted = false;
            abortControllerRef.current?.abort();
        };
    }, [router?.isReady, gameId, enablePreloadResource, fetchImages, loadAllImages, progressBarId, setIsDonePreload]);

    // Handle cancel preload
    useEffect(() => {
        if (cancelPreload) {
            abortControllerRef.current?.abort();
            setIsDonePreload();
        }
    }, [cancelPreload, setIsDonePreload]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    // Render nothing if preload is disabled or gameId is invalid
    return useMemo(() => {
        if (!enablePreloadResource || gameId < 0) {
            updateProgressBar(100, progressBarId);
            setIsDonePreload();
            return null;
        }

        return null;
    }, [enablePreloadResource, gameId, progressBarId, setIsDonePreload]);
};

export default PreloadResources;
