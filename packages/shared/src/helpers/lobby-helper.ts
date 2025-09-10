import * as Sentry from "@sentry/nextjs";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { GameSettings } from '@shared/components/game-base/type';
import { getAppSettings } from "../app-settings";
import { buildUrlWithPath } from "./url-helper";

export const getOfferGamesIds = (authorizeInfo: AuthorizeResponse): number[] => {
    return authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId) || [];
};

export const getRenderGameSettings = (authorizeInfo: AuthorizeResponse) => {
    const offerGamesIds = getOfferGamesIds(authorizeInfo);
    if (offerGamesIds) {
        const { gameSettings: allGamesSettings } = getAppSettings();
        return offerGamesIds?.map((gameId) => allGamesSettings[gameId]).filter((settings) => settings && !settings.isComingSoon);
    }
    return [];
};

export const getServiceStatusIsAvailable = async (gameSetting: GameSettings) => {
    let statusCode = 0;
    const { proxy } = getAppSettings();

    const serviceUrl = buildUrlWithPath(`${proxy.path}/${gameSetting.socketInfo.namespace}/`);
    try {
        const response = await fetch(serviceUrl);
        statusCode = response.status;
    } catch (error) {
        Sentry.captureException(new Error(`${gameSetting.gameName} service is unavailable`));
    }

    return statusCode === 200;
};
