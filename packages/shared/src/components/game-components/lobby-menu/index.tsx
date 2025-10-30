import { URLParams } from "@shared/constants/url-params";
import { localStorageKeys, StorageHelper } from "@shared/helpers/storage-helper";
import { BrowserDomUtils } from "@shared/utils/browser-dom-utils";
import { SSOResponse } from "sc-user-service-client/dist/auth";
import Image from "next/image";
import { useSettingStore } from "@shared/stores/setting-store/setting-store";
import { GameUtils } from "@shared/helpers/base-64-helper";
import { StandaloneMode } from "@shared/utils/constant";

const LobbyMenu = () => {
    const sessionInfo = StorageHelper.get<SSOResponse & Partial<StandaloneMode>>(localStorageKeys.session);

    const handleBackToLobby = () => {
        if(sessionInfo?.isStandalone) {
            handleStandaloneNavigation();
            return;
        }
        
        handleIframeNavigation();
    };

    const handleStandaloneNavigation = () => {
        const returnUrl = StorageHelper.get<string>(localStorageKeys.returnUrl);
        const decodedReturnUrl = GameUtils.base64Decode(returnUrl);
        const mainParams = buildMainParams();
        const otherParams = buildOtherParams();

        if(decodedReturnUrl) {
            const url = new URL(decodedReturnUrl);

            Object.entries(mainParams).forEach(([key, value]) => url.searchParams.append(key, value.toString()));
            url.searchParams.append("params", GameUtils.base64Encode(JSON.stringify(otherParams)));
            window.location.replace(url);
        }
    }

    const handleIframeNavigation = () => {
        const params = getBaseSessionInfo();
        BrowserDomUtils.postMessageToParent({ ...params, backLobby: true });
    }

    const getBaseSessionInfo = () => {
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

    const buildMainParams = () => {
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

    return (
        <button className="fixed top-[90px] right-[20px] z-[9999]" onClick={handleBackToLobby}>
            <Image src="/static/images/icons/home-icon.webp" alt="Back to Lobby" width={60} height={60} />
            <Image src="/static/images/icons/menu-icon.webp" alt="Menu" width={60} height={60} />
        </button>
    );
};

export default LobbyMenu;
