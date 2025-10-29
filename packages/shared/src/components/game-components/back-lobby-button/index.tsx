import { URLParams } from "@shared/constants/url-params";
import { localStorageKeys, StorageHelper } from "@shared/helpers/storage-helper";
import { BrowserDomUtils } from "@shared/utils/browser-dom-utils";

const BackLobbyButton = () => {
    const handleBackToLobby = () => {
        const params = getBaseSessionInfo();
        BrowserDomUtils.postMessageToParent({ ...params, backLobby: true });
    }

    const getBaseSessionInfo = () => {
        const sessionInfo = StorageHelper.get<{ ss: string; ssoTime: string; username: string; isAuthenticated: boolean; memberName: string; language: string }>(localStorageKeys.session);
        return {
            [URLParams.session]: sessionInfo?.ss,
            [URLParams.time]: new Date(sessionInfo?.ssoTime).getTime(),
            username: sessionInfo?.username,
            [URLParams.isAuthenticated]: sessionInfo?.isAuthenticated,
            [URLParams.memberName]: sessionInfo?.memberName,
            language: sessionInfo?.language,
        };
    }
    return <button className="fixed top-[40px] left-[-250px]  z-[9999] bg-red-500 w-[200px]" onClick={handleBackToLobby}>Back to Lobby</button>;
}

export default BackLobbyButton;