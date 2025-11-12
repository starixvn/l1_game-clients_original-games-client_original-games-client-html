import isEmpty from "lodash/isEmpty";
import { createContext, useContext } from "react";
import { StorageHelper, localStorageKeys } from "../helpers/storage-helper";
import { AnalyticsHelper } from "../helpers/analytic-helper";
import { GameUtils } from "../helpers/base-64-helper";
import { broadcastBackToLobby } from "../helpers/global-events-helper";
import { URLParams } from "@shared/constants/url-params";
import { backToLobbyRedirect } from "@shared/utils/game-utils";

export type URLContextModel = {
    token?: string;
    language?: string;
    redirectUrl?: string;
    backToLobby?: boolean;
    backToRedirectUrl?: Function;
};

export function parseContextFromURL(): URLContextModel | undefined {
    // Fix: Handle HTML-encoded ampersands by decoding them first
    const rawSearch = globalThis.location?.search || "";
    const decodedSearch = rawSearch.replace(/&amp;/g, "&");

    const params = new URLSearchParams(decodedSearch);

    // Reload page
    if (Array.from(params.values()).length === 0) {
        return;
    }

    let token = params.get("token");
    const language = params.get("lang");
    let redirectUrl = params.get("rurl");

    const param = params.get("params");
    const lobbyUrl = params.get("lurl");
    const returnUrl = params.get("rurl");
    const parentUrl = params.get("purl");
    const ref = params.get("ref");
    const isStandalone = params.get("isStandalone");
    const currencyGroup = params.get("cg");
    const op = params.get("op");
    const appType = params.get("appType");

    if (token || param) {
        clearStorage();
    }

    if (appType) {
        StorageHelper.set(localStorageKeys.appType, appType);
    }

    if (isStandalone) {
        const standaloneMode = {
            isStandalone: isStandalone === "true",
            cg: currencyGroup,
            op: op,
            lang: language,
            rurl: returnUrl,
            lurl: lobbyUrl,
        };

        StorageHelper.set(localStorageKeys.standaloneMode, standaloneMode);
    }

    if (lobbyUrl) {
        StorageHelper.set(localStorageKeys.lobbyUrl, lobbyUrl);
    }
    if (returnUrl) {
        StorageHelper.set(localStorageKeys.returnUrl, returnUrl);
    }
    if (parentUrl) {
        StorageHelper.set(localStorageKeys.parentUrl, parentUrl);
    }
    if (ref) {
        StorageHelper.set(localStorageKeys.ref, ref);
    }

    if (param) {
        const decodedUrl = GameUtils.base64Decode(param);
        const urlSearchParams = new URLSearchParams(decodedUrl);
        const lobbyUrl = urlSearchParams.get(URLParams.lobbyUrl);
        const parentUrl = urlSearchParams.get(URLParams.parentUrl);
        const returnUrl = urlSearchParams.get(URLParams.returnUrl);
        StorageHelper.set(localStorageKeys.session, {
            ss: urlSearchParams.get(URLParams.session),
            username: urlSearchParams.get(URLParams.username),
            language: urlSearchParams.get(URLParams.language),
        });

        StorageHelper.set(localStorageKeys.settingStore, {
            enabledMusic: urlSearchParams.get(URLParams.musicEnable),
            enabledSound: urlSearchParams.get(URLParams.sfxEnable),
        });

        if (lobbyUrl) {
            StorageHelper.set(localStorageKeys.lobbyUrl, lobbyUrl);
        }
        if (parentUrl) {
            StorageHelper.set(localStorageKeys.parentUrl, parentUrl);
        }
        if (returnUrl) {
            StorageHelper.set(localStorageKeys.returnUrl, returnUrl);
            redirectUrl = returnUrl;
        }
    }

    return { token, language, redirectUrl };
}

const clearStorage = () => {
    StorageHelper.remove(localStorageKeys.session);
    StorageHelper.remove(localStorageKeys.settingStore);
    StorageHelper.remove(localStorageKeys.lobbyUrl);
    StorageHelper.remove(localStorageKeys.returnUrl);
    StorageHelper.remove(localStorageKeys.standaloneMode);
    StorageHelper.remove(localStorageKeys.appType);
    StorageHelper.remove(localStorageKeys.parentUrl);
    StorageHelper.remove(localStorageKeys.umInfo);
    StorageHelper.remove(localStorageKeys.ref);
};

export function loadURLContext(): URLContextModel {
    const contextFromURL = parseContextFromURL();
    const contextFromLocalStorage = StorageHelper?.get(localStorageKeys.url) || null;

    if (!!contextFromURL) {
        const contextString = { ...contextFromURL, token: undefined };
        // Keep URL params during development to make debugging easier
        const isLocalhost = typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)/.test(window.location?.hostname || "");
        const isNonProductionEnv = typeof process !== "undefined" && (process.env?.NODE_ENV || "").toLowerCase() !== "production";
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
            const ref = StorageHelper.get<string>(localStorageKeys.ref);
            
            if (ref) {
                handleDirectModeNavigation();
            }

            backToLobbyRedirect();
        } else {
            updateURLContext({ backToLobby: true });
            broadcastBackToLobby();
        }
    },
};

const handleDirectModeNavigation = () => {
    const returnUrl = StorageHelper.get<string>(localStorageKeys.returnUrl);
    if (returnUrl) {
        globalThis.location.replace(returnUrl);
    }
}

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
