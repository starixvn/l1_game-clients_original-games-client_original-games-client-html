import { URLParams } from "@shared/constants/url-params";
import { localStorageKeys, StorageHelper } from "@shared/helpers";
import { BrowserDomUtils } from "./browser-dom-utils";
import { SSOResponse } from "sc-user-service-client/dist/auth";

export const getDefaultGameId = (): number => {
    // Use environment variable if set, otherwise fallback to a known game ID

    const envGameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID;
    if (envGameId) {
        return Number(envGameId);
    }

    return 148;
};

export const backToLobby = () => {
    const sessionInfo = getBaseSessionInfo();
    BrowserDomUtils.postMessageToParent({ ...sessionInfo, backLobby: true });
}

export const getBaseSessionInfo = () => {
    const sessionInfo = StorageHelper.get<SSOResponse & { ssoTime: Date }>(localStorageKeys.session);

    return {
        [URLParams.session]: sessionInfo?.ss,
        [URLParams.time]: new Date(sessionInfo?.ssoTime).getTime(),
        username: sessionInfo?.username,
        [URLParams.isAuthenticated]: sessionInfo?.isAuthenticated,
        [URLParams.memberName]: sessionInfo?.memberName,
        language: sessionInfo?.language,
    };
};