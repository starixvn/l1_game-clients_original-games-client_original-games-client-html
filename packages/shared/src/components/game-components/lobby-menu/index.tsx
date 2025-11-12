import { localStorageKeys, StorageHelper } from "@shared/helpers/storage-helper";
import { SSOResponse } from "sc-user-service-client/dist/auth";
import Image from "next/image";
import { StandaloneMode } from "@shared/utils/constant";
import { backToLobbyRedirect, handleStandaloneNavigation } from "@shared/utils/game-utils";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const LobbyMenu = () => {
    const sessionInfo = StorageHelper.get<SSOResponse & Partial<StandaloneMode>>(localStorageKeys.session);
    const returnUrl = StorageHelper.get<string>(localStorageKeys.returnUrl);

    const handleBackToLobby = () => {
        if (sessionInfo?.isStandalone) {
            handleStandaloneNavigation();
            return;
        }

        backToLobbyRedirect();
    };

    if (!returnUrl) {
        return null;
    }

    return (
        <button className="absolute top-[70px] right-[10px] md:right-[80px] z-[9999]" onClick={handleBackToLobby}>
            <Image src={`${basePath}/static/images/icons/home-icon.webp`} alt="Back to Lobby" width={75} height={75} />
        </button>
    );
};

export default LobbyMenu;
