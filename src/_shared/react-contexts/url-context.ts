import isEmpty from "lodash/isEmpty";
import { createContext, useContext } from "react";
import { AnalyticsHelper, StorageHelper, localStorageKeys, setUserLatestGameId } from "../helpers";
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
    const gameId = Number(params.get("gameId") || 0);
    const redirectUrl = params.get("rurl");

    return { token, language, gameId, redirectUrl };
}

export function loadURLContext(): URLContextModel {
    const contextFromURL = parseContextFromURL();
    const contextFromLocalStorage = StorageHelper?.get(localStorageKeys.url) || null;

    if (!!contextFromURL) {
        const contextString = { ...contextFromURL, token: undefined };

        globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        StorageHelper?.set(localStorageKeys.url, contextString);
        AnalyticsHelper?.login(contextFromURL);
    }

    return contextFromURL || contextFromLocalStorage;
}

export const initialURLContextData = {
    ...loadURLContext(),
    backToRedirectUrl: (redirectUrl: string) => {
        if (!isEmpty(redirectUrl)) {
            const decodedUrl = GameUtils.base64Decode(redirectUrl);
            globalThis.location.href = decodedUrl;
        } else {
            updateURLContext({ backToLobby: true, gameId: 0 });
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.BACK_TO_LOBBY]: {} });
        }
    },
};

export const URLContext = createContext<URLContextModel>(initialURLContextData);

export const useURLContext = () => useContext(URLContext);

export function updateURLContext(context: Partial<URLContextModel>) {
    const contextFromLocalStorage = StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};

    if (context.gameId !== undefined) {
        // Use user-specific latestGameId if username is available in the session
        const session = StorageHelper.get<any>(localStorageKeys.session);
        const username = session?.username;
        setUserLatestGameId(context.gameId, username);
    }

    const updatedContext = { ...contextFromLocalStorage, ...context };
    StorageHelper.set(localStorageKeys.url, updatedContext);
}

export function getURLContext() {
    return StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};
}
