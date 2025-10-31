import { URLParams } from "@shared/constants/url-params";
import { localStorageKeys, StorageHelper } from "@shared/helpers/storage-helper";
import { SSOResponse } from "sc-user-service-client/dist/auth";
import Image from "next/image";
import { useSettingStore } from "@shared/stores/setting-store/setting-store";
import { GameUtils } from "@shared/helpers/base-64-helper";
import { StandaloneMode } from "@shared/utils/constant";
import { backToLobby, getBaseSessionInfo } from "@shared/utils/game-utils";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const LobbyMenu = () => {
    const sessionInfo = StorageHelper.get<SSOResponse & Partial<StandaloneMode>>(localStorageKeys.session);
    const returnUrl = StorageHelper.get<string>(localStorageKeys.returnUrl);

    const handleBackToLobby = () => {
        if(sessionInfo?.isStandalone) {
            handleStandaloneNavigation();
            return;
        }
        
        handleIframeNavigation();
    };

    const handleStandaloneNavigation = () => {
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
        backToLobby();
    }

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

    if(!returnUrl) {
        return null;
    }

    return (
        <button className="fixed top-[90px] right-[20px] z-[9999]" onClick={handleBackToLobby}>
            <Image src={`${basePath}/static/images/icons/home-icon.webp`} alt="Back to Lobby" width={60} height={60} />
        </button>
    );
};

export default LobbyMenu;
