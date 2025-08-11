import isEmpty from "lodash/isEmpty";
import { createContext, useContext } from "react";
import { AnalyticsHelper, StorageHelper, localStorageKeys } from "../helpers";
import { GameUtils } from "../helpers/base-64-helper";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../helpers/message-transmitter/global-transmitter";

export type URLContextModel = {
    token?: string;
    language?: string;
    gameId?: number;
    redirectUrl?: string;
    backToLobby?: boolean;
    backToRedirectUrl?: Function;
};

export function parseContextFromURL(): URLContextModel | undefined {
    console.log("[URLContext] parseContextFromURL called");
    // Fix: Handle HTML-encoded ampersands by decoding them first
    const rawSearch = globalThis.location?.search || '';
    const decodedSearch = rawSearch.replace(/&amp;/g, '&');

    console.log("[URLContext] rawSearch:", rawSearch);
    console.log("[URLContext] decodedSearch:", decodedSearch);

    const params = new URLSearchParams(decodedSearch);

    // Reload page
    if (Array.from(params.values()).length === 0) {
        console.log("[URLContext] no params found, returning undefined");
        return;
    }

    const token = params.get("token");
    const language = params.get("lang");
    const gameId = Number(params.get("gameId") || 0);
    const redirectUrl = params.get("rurl");

    const context = { token, language, gameId, redirectUrl };
    console.log("[URLContext] parsed context:", context);
    return context;
}

export function loadURLContext(): URLContextModel {
    console.log("[URLContext] loadURLContext called");
    const contextFromURL = parseContextFromURL();
    const contextFromLocalStorage = StorageHelper?.get(localStorageKeys.url) || null;

    console.log("[URLContext] contextFromURL:", contextFromURL);
    console.log("[URLContext] contextFromLocalStorage:", contextFromLocalStorage);

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
        console.log("[URLContext] using contextFromURL");
        return contextFromURL;
    }

    console.log("[URLContext] using contextFromLocalStorage");
    return contextFromLocalStorage;
}

export const initialURLContextData = {
    ...loadURLContext(),
    backToRedirectUrl: (redirectUrl: string) => {
        console.log("[URLContext] backToRedirectUrl called with:", redirectUrl);
        if (!isEmpty(redirectUrl)) {
            const decodedUrl = GameUtils.base64Decode(redirectUrl);
            console.log("[URLContext] decoded redirect URL:", decodedUrl);
            globalThis.location.href = decodedUrl;
        } else {
            console.log("[URLContext] no redirect URL, going back to lobby");
            updateURLContext({ backToLobby: true, gameId: 0 });
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.BACK_TO_LOBBY]: {} });
        }
    },
};

export const URLContext = createContext<URLContextModel>(initialURLContextData);

export const useURLContext = () => useContext(URLContext);

export function updateURLContext(context: Partial<URLContextModel>) {
    console.log("[URLContext] updateURLContext called with:", context);
    const contextFromLocalStorage = StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};

    // latestGameId persistence removed due to one-game-per-session behavior

    const updatedContext = { ...contextFromLocalStorage, ...context };
    console.log("[URLContext] updated context:", updatedContext);
    StorageHelper.set(localStorageKeys.url, updatedContext);
}

export function getURLContext() {
    const context = StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};
    console.log("[URLContext] getURLContext returned:", context);
    return context;
}
