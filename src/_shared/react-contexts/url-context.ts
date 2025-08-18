import isEmpty from "lodash/isEmpty";
import { createContext, useContext } from "react";
import { StorageHelper, localStorageKeys } from "../helpers/storage-helper";
import { GameIds } from "../constants";
import { AnalyticsHelper } from "../helpers/analytic-helper";
import { GameUtils } from "../helpers/base-64-helper";
import { broadcastBackToLobby } from "../helpers/global-events-helper";

export type URLContextModel = {
    token?: string;
    language?: string;
    gameId?: number;
    redirectUrl?: string;
    backToLobby?: boolean;
    backToRedirectUrl?: Function;
};

export function parseContextFromURL(): URLContextModel | undefined {
    // Fix: Handle HTML-encoded ampersands by decoding them first
    const rawSearch = globalThis.location?.search || '';
    const decodedSearch = rawSearch.replace(/&amp;/g, '&');

    const params = new URLSearchParams(decodedSearch);

    // Reload page
    if (Array.from(params.values()).length === 0) {
        return;
    }

    const token = params.get("token");
    const language = params.get("lang");
    const gameIdParam = params.get("gameId");
    let gameId = Number(gameIdParam);
    if (!gameIdParam || Number.isNaN(gameId) || gameId <= 0) {
        gameId = GameIds.SeDieMultiplayer;
    }
    const redirectUrl = params.get("rurl");

    return { token, language, gameId, redirectUrl };
}

export function loadURLContext(): URLContextModel {
    const contextFromURL = parseContextFromURL();
    const contextFromLocalStorage = StorageHelper?.get(localStorageKeys.url) || null;

    if (!!contextFromURL) {
        const contextString = { ...contextFromURL, token: undefined };
        // Keep URL params during development to make debugging easier
        const isLocalhost = typeof window !== "undefined"
            && /^(localhost|127\.0\.0\.1)/.test(window.location?.hostname || "");
        const isNonProductionEnv = (typeof process !== "undefined" && (process.env?.NODE_ENV || "").toLowerCase() !== "production");
        if (!isLocalhost && !isNonProductionEnv) {
            globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        }
        StorageHelper?.set(localStorageKeys.url, contextString);
        AnalyticsHelper?.login(contextFromURL);
        return contextFromURL;
    }

    return contextFromLocalStorage;
}

export const initialURLContextData = {
    ...loadURLContext(),
    backToRedirectUrl: (redirectUrl: string) => {
        if (!isEmpty(redirectUrl)) {
            const decodedUrl = GameUtils.base64Decode(redirectUrl);
            globalThis.location.href = decodedUrl;
        } else {
            updateURLContext({ backToLobby: true, gameId: 0 });
            broadcastBackToLobby();
        }
    },
};

export const URLContext = createContext<URLContextModel>(initialURLContextData);

export const useURLContext = () => useContext(URLContext);

export function updateURLContext(context: Partial<URLContextModel>) {
    const contextFromLocalStorage = StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};

    // latestGameId persistence removed due to one-game-per-session behavior

    const updatedContext = { ...contextFromLocalStorage, ...context };
    StorageHelper.set(localStorageKeys.url, updatedContext);
}

export function getURLContext() {
    return StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};
}
