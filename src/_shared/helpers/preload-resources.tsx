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

const memoriedImages = ["/chips/gn/", "/countdown-timer/", "/lobby/", "/cage/", "/anim/ball-middle/", "/ball/"];
const loadedGames: Record<number, boolean> = {};

const PreloadResources: React.FC<{
    setIsDonePreload: Function;
    gameId: number;
    isDirectMode?: boolean;
    bannerId?: number;
    locale?: string;
    gameIdsIcon?: number[];
    cancelPreload?: boolean;
    durationDelayDonePreload?: number;
    progressBarId?: string;
}> = ({ setIsDonePreload, gameId, bannerId, gameIdsIcon, locale = "en", cancelPreload, progressBarId }) => {
    const enablePreloadResource = getAppSettings().enablePreloadResource ?? true;
    const cachePaths = getGameSettings(gameId)?.gameResourceConfigs?.cachePaths || [];
    const preloadGameImages = [...memoriedImages, ...cachePaths];

    const router = useRouter();

    const getImage = async (path: string, cb) => {
        const img = new Image();
        img.src = path;
        img.onload = () => cb && cb();
        img.onerror = () => cb && cb();
    };

    const fetchImages = async () => {
        try {
            const response = await axios.post("/api/preload-images", {
                gameId,
                locale,
                gameIdsIcon,
                bannerId,
            });
            const imagesPath = (response?.data as string[]) || [];
            if (imagesPath.length > 0) {
                let loadedImages = 0;
                imagesPath.forEach((path) => {
                    const callBack = () => {


                        loadedImages++;
                        updateProgressBar(loadedImages, imagesPath.length, progressBarId);
                        checkFinish(loadedImages, imagesPath.length);
                    };
                    if (preloadGameImages.some((pathFolder) => path.includes(pathFolder))) {
                        downloadAndCacheImage(path)
                            .then(callBack)
                            .catch((error) => {
                                callBack();
                            });
                    } else {
                        getImage(path, callBack);
                    }
                });
            } else {
                setIsDonePreload();
            }
        } catch (error) {
            setIsDonePreload();
        }
    };

    const updateProgressBar = (loaded: number, total: number, progressBarId = DEFAULT_PROGRESS_BAR_ID) => {
        const percentage = (loaded / total) * 100;
        const progressBars = document.querySelectorAll(`#${progressBarId}`);
        progressBars.forEach((progressBar) => {
            if (progressBar instanceof HTMLElement) {
                progressBar.style.width = `${percentage}%`;
            }
        });
    };

    const checkFinish = (loaded: number, total: number) => {
        if (loaded === total) {
            loadedGames[gameId] = true;
            setIsDonePreload && setIsDonePreload();
        }
    };

    useEffect(() => {
        if (router?.isReady) {
            if (enablePreloadResource && gameId >= 0) {
                if (!loadedGames[gameId]) {
                    fetchImages();
                } else {
                    setIsDonePreload && setIsDonePreload();
                }
            }
        }
    }, [router?.isReady, gameId]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (cancelPreload) {
            setIsDonePreload && setIsDonePreload();
            timeout && clearTimeout(timeout);
        }

        return () => {
            timeout && clearTimeout(timeout);
        };
    }, [cancelPreload]);

    const handleStateWithoutPreloadResource = () => {
        updateProgressBar(1, 1, progressBarId);
        setIsDonePreload && setIsDonePreload();
    };

    return useMemo(() => {
        if (!enablePreloadResource || gameId < 0) {
            handleStateWithoutPreloadResource();

            return <></>;
        }

        return null;
    }, [gameId]);
};

export default PreloadResources;
