import { URLParams } from "@shared/constants/url-params";
import { localStorageKeys, StorageHelper } from "@shared/helpers";
import { BrowserDomUtils } from "./browser-dom-utils";
import { SSOResponse } from "sc-user-service-client/dist/auth";
import { GameUtils } from "@shared/helpers/base-64-helper";
import { useSettingStore } from "@shared/stores/setting-store";
import { StandaloneMode } from "./constant";

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

export const backToLobbyRedirect = () => {
    const returnUrl = StorageHelper.get<string>(localStorageKeys.returnUrl);

    const decodedReturnUrl = GameUtils.base64Decode(returnUrl);
    const otherParams = buildOtherParams();

    if(decodedReturnUrl) {
        const url = new URL(decodedReturnUrl);

        url.searchParams.append("params", GameUtils.base64Encode(JSON.stringify(otherParams)));
       globalThis.window.location.replace(url);
    }
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

export const handleStandaloneNavigation = () => {
    const returnUrl = StorageHelper.get<string>(localStorageKeys.returnUrl);

    const decodedReturnUrl = GameUtils.base64Decode(returnUrl);
    const mainParams = buildMainParams();
    const otherParams = buildOtherParams();
    if(decodedReturnUrl) {
        const url = new URL(decodedReturnUrl);

        Object.entries(mainParams).forEach(([key, value]) => url.searchParams.append(key, value.toString()));
        url.searchParams.append("params", GameUtils.base64Encode(JSON.stringify(otherParams)));
        globalThis.window.location.replace(url);
    }
}

const buildMainParams = () => {
    const sessionInfo = StorageHelper.get<SSOResponse & Partial<StandaloneMode>>(localStorageKeys.session);

    return {
        [URLParams.currencyGroup]: sessionInfo?.cg,
        [URLParams.operator]: sessionInfo?.op,
        [URLParams.language]: sessionInfo?.lang,
        ...(sessionInfo?.rurl && { [URLParams.returnUrl]: sessionInfo?.rurl }),
        ...(sessionInfo?.lurl && { [URLParams.lobbyUrl]: sessionInfo?.lurl }),
    };
}

const buildOtherParams = () => {
    const enabledMusic= useSettingStore.getState().enabledMusic;
    const enabledSound = useSettingStore.getState().enabledSound;
    const sessionInfo = getBaseSessionInfo();

    return {
        ...sessionInfo,
        [URLParams.musicEnable]: enabledMusic ?? false,
        [URLParams.sfxEnable]: enabledSound ?? false,
    };
};