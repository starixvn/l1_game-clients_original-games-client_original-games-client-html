import { URLParams } from "@shared/constants/url-params";
import { localStorageKeys, StorageHelper } from "@shared/helpers/storage-helper";
import { BrowserDomUtils } from "@shared/utils/browser-dom-utils";
import { SSOResponse } from "sc-user-service-client/dist/auth";
import Image from "next/image";

const LobbyMenu = () => {
    const handleBackToLobby = () => {
        const params = getBaseSessionInfo();
        BrowserDomUtils.postMessageToParent({ ...params, backLobby: true });
    };

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

    return (
        <button className="fixed top-[90px] right-[20px] z-[9999]" onClick={handleBackToLobby}>
            <Image src="/static/images/icons/home-icon.webp" alt="Back to Lobby" width={60} height={60} />
            <Image src="/static/images/icons/menu-icon.webp" alt="Menu" width={60} height={60} />
        </button>
    );
};

export default LobbyMenu;
