import isEmpty from "lodash/isEmpty";
import { createContext, useContext } from "react";
import { StorageHelper, localStorageKeys } from "../helpers/storage-helper";
import { AnalyticsHelper } from "../helpers/analytic-helper";
import { GameUtils } from "../helpers/base-64-helper";
import { broadcastBackToLobby } from "../helpers/global-events-helper";

export type URLContextModel = {
    token?: string;
    language?: string;
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
    const redirectUrl = params.get("rurl");

    return { token, language, redirectUrl };
}

export function loadURLContext(): URLContextModel {
    console.log('[URL Context] Loading URL context...');

    const contextFromURL = parseContextFromURL();
    console.log('[URL Context] Context parsed from URL:', contextFromURL);

    const contextFromLocalStorage = StorageHelper?.get(localStorageKeys.url) || null;
    console.log('[URL Context] Context from localStorage:', contextFromLocalStorage);

    if (!!contextFromURL) {
        console.log('[URL Context] Using context from URL parameters');

        const contextString = { ...contextFromURL, token: undefined };
        console.log('[URL Context] Context to store in localStorage (without token):', contextString);

        // Keep URL params during development to make debugging easier
        const isLocalhost = typeof window !== "undefined"
            && /^(localhost|127\.0\.0\.1)/.test(window.location?.hostname || "");
        const isNonProductionEnv = (typeof process !== "undefined" && (process.env?.NODE_ENV || "").toLowerCase() !== "production");

        console.log('[URL Context] Environment check - isLocalhost:', isLocalhost, 'isNonProductionEnv:', isNonProductionEnv);

        if (!isLocalhost && !isNonProductionEnv) {
            const cleanUrl = globalThis.location?.href.split("?")[0];
            console.log('[URL Context] Clearing URL parameters in production. New URL:', cleanUrl);
            globalThis.history.pushState(null, "", cleanUrl);
        } else {
            console.log('[URL Context] Keeping URL parameters for development/debugging');
        }

        StorageHelper?.set(localStorageKeys.url, contextString);
        console.log('[URL Context] Context saved to localStorage');

        AnalyticsHelper?.login(contextFromURL);
        console.log('[URL Context] Analytics login event sent with URL context');

        console.log('[URL Context] Returning URL context:', contextFromURL);
        return contextFromURL;
    }

    console.log('[URL Context] No URL context found, returning localStorage context:', contextFromLocalStorage);
    return contextFromLocalStorage;
}

export const initialURLContextData = {
    ...loadURLContext(),
    backToRedirectUrl: (redirectUrl: string) => {
        if (!isEmpty(redirectUrl)) {
            const decodedUrl = GameUtils.base64Decode(redirectUrl);
            globalThis.location.href = decodedUrl;
        } else {
            updateURLContext({ backToLobby: true });
            broadcastBackToLobby();
        }
    },
};

export const URLContext = createContext<URLContextModel>(initialURLContextData);

export const useURLContext = () => useContext(URLContext);

export function updateURLContext(context: Partial<URLContextModel>) {
    const contextFromLocalStorage = StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};

    const updatedContext = { ...contextFromLocalStorage, ...context };
    StorageHelper.set(localStorageKeys.url, updatedContext);
}

export function getURLContext() {
    return StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};
}
