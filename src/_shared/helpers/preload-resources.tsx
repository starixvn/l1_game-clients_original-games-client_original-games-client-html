import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { LobbyConfigs } from "sc-user-service-client/dist/lobby";

import { getLobbyGamesIds } from "./lobby-helper";
import { getAppSettings, getGameSettings } from "../app-settings";
import { downloadAndCacheImage } from "./image-cache-controller";

const DEFAULT_PROGRESS_BAR_ID = "progress-bar";
export const DURATION_HOLD_SPLASH_SCREEN = 1000;

export const getAndHandleBannerOffer = (authorizeInfo: AuthorizeResponse, lobbyConfigs: LobbyConfigs, callbackFn: Function) => {
    console.log("[PreloadResources] getAndHandleBannerOffer called");
    // Custom version: No banner functionality since lobby is removed
    return;
};

export const getAndHandleGameOfferIds = (authorizeInfo: AuthorizeResponse, lobbyConfigs: LobbyConfigs, callbackFn: Function) => {
    console.log("[PreloadResources] getAndHandleGameOfferIds called");
    const gameOfferIds = getLobbyGamesIds(lobbyConfigs as any, authorizeInfo);
    console.log("[PreloadResources] gameOfferIds:", gameOfferIds);
    if (gameOfferIds?.length > 0) {
        callbackFn(gameOfferIds);
    }
};

export const updateProgressBar = (percentage: number, progressBarId = DEFAULT_PROGRESS_BAR_ID) => {
    console.log("[PreloadResources] updateProgressBar called with percentage:", percentage);
    const progressBars = document.querySelectorAll(`#${progressBarId}`);
    progressBars.forEach((progressBar) => {
        if (progressBar instanceof HTMLElement) {
            progressBar.style.width = `${percentage}%`;
        }
    });
};

const memoriedImages = ["/chips/gn/", "/countdown-timer/", "/lobby/", "/cage/", "/anim/ball-middle/", "/ball/"];
const loadedGames: Record<number, boolean> = {};

const PreloadResources: React.FC<{
    setIsDonePreload: Function;
    gameId: number;
    bannerId?: number;
    locale?: string;
    gameIdsIcon?: number[];
    cancelPreload?: boolean;
    durationDelayDonePreload?: number;
    progressBarId?: string;
}> = ({ setIsDonePreload, gameId, bannerId, gameIdsIcon, locale = "en", cancelPreload, progressBarId }) => {
    console.log("[PreloadResources] component initialized with gameId:", gameId);
    const enablePreloadResource = getAppSettings().enablePreloadResource ?? true;
    const cachePaths = getGameSettings(gameId)?.gameResourceConfigs?.cachePaths || [];
    const preloadGameImages = [...memoriedImages, ...cachePaths];

    console.log("[PreloadResources] enablePreloadResource:", enablePreloadResource);
    console.log("[PreloadResources] cachePaths:", cachePaths);
    console.log("[PreloadGameImages] preloadGameImages:", preloadGameImages);

    const router = useRouter();

    const getImage = async (path: string, cb) => {
        console.log("[PreloadResources] getImage called for path:", path);
        const img = new Image();
        img.src = path;
        img.onload = () => {
            console.log("[PreloadResources] image loaded successfully:", path);
            cb && cb();
        };
        img.onerror = () => {
            console.error("[PreloadResources] image failed to load:", path);
            cb && cb();
        };
    };

    const fetchImages = async () => {
        console.log("[PreloadResources] fetchImages called");
        try {
            const response = await axios.post("/api/preload-images", {
                gameId,
                locale,
                gameIdsIcon,
                bannerId,
            });
            const imagesPath = (response?.data as string[]) || [];
            console.log("[PreloadResources] imagesPath received:", imagesPath);
            if (imagesPath.length > 0) {
                let loadedImages = 0;
                imagesPath.forEach((path) => {
                    const callBack = () => {
                        loadedImages++;
                        console.log("[PreloadResources] loadedImages progress:", loadedImages, "/", imagesPath.length);
                        updateProgressBar(loadedImages, imagesPath.length, progressBarId);
                        checkFinish(loadedImages, imagesPath.length);
                    };
                    if (preloadGameImages.some((pathFolder) => path.includes(pathFolder))) {
                        console.log("[PreloadResources] downloading and caching image:", path);
                        downloadAndCacheImage(path)
                            .then(callBack)
                            .catch((error) => {
                                console.error("[PreloadResources] downloadAndCacheImage error:", error);
                                callBack();
                            });
                    } else {
                        console.log("[PreloadResources] loading image normally:", path);
                        getImage(path, callBack);
                    }
                });
            } else {
                console.log("[PreloadResources] no images to load, calling setIsDonePreload");
                setIsDonePreload();
            }
        } catch (error) {
            console.error("[PreloadResources] fetchImages error:", error);
            setIsDonePreload();
        }
    };

    const updateProgressBar = (loaded: number, total: number, progressBarId = DEFAULT_PROGRESS_BAR_ID) => {
        const percentage = (loaded / total) * 100;
        console.log("[PreloadResources] updateProgressBar internal:", percentage + "%");
        const progressBars = document.querySelectorAll(`#${progressBarId}`);
        progressBars.forEach((progressBar) => {
            if (progressBar instanceof HTMLElement) {
                progressBar.style.width = `${percentage}%`;
            }
        });
    };

    const checkFinish = (loaded: number, total: number) => {
        console.log("[PreloadResources] checkFinish called:", loaded, "/", total);
        if (loaded === total) {
            console.log("[PreloadResources] all images loaded, marking game as loaded");
            loadedGames[gameId] = true;
            setIsDonePreload && setIsDonePreload();
        }
    };

    useEffect(() => {
        console.log("[PreloadResources] useEffect triggered, router.isReady:", router?.isReady);
        if (router?.isReady) {
            if (enablePreloadResource && gameId >= 0) {
                if (!loadedGames[gameId]) {
                    console.log("[PreloadResources] starting to fetch images for gameId:", gameId);
                    fetchImages();
                } else {
                    console.log("[PreloadResources] game already loaded, calling setIsDonePreload");
                    setIsDonePreload && setIsDonePreload();
                }
            }
        }
    }, [router?.isReady, gameId]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (cancelPreload) {
            console.log("[PreloadResources] cancelPreload triggered");
            setIsDonePreload && setIsDonePreload();
            timeout && clearTimeout(timeout);
        }

        return () => {
            timeout && clearTimeout(timeout);
        };
    }, [cancelPreload]);

    const handleStateWithoutPreloadResource = () => {
        console.log("[PreloadResources] handleStateWithoutPreloadResource called");
        updateProgressBar(1, 1, progressBarId);
        setIsDonePreload && setIsDonePreload();
    };

    return useMemo(() => {
        console.log("[PreloadResources] useMemo called, enablePreloadResource:", enablePreloadResource, "gameId:", gameId);
        if (!enablePreloadResource || gameId < 0) {
            handleStateWithoutPreloadResource();

            return <></>;
        }

        return null;
    }, [gameId]);
};

export default PreloadResources;
