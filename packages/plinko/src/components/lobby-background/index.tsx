import { getAppSettings } from "@shared";
import { BgCachedImage } from "@shared/components/game-components/cached-image/bg-cached-image";
import { useMemo } from "react";
import { createPortal } from "react-dom";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const appSettings = getAppSettings();

const LobbyBackground = () => {
    const dashboardElement = useMemo(() => {
        return document.getElementById("dashboard");
    }, []);

    return (
        appSettings.appType === 1 &&
        dashboardElement &&
        createPortal(
            <div className="absolute top-0 left-0 w-full h-full bg-[#020C1C] z-[-10] overflow-hidden min-h-[800px]">
                <BgCachedImage
                    pathImage={`${basePath}/static/images/lobby/game-bg.webp`}
                    className="absolute w-full h-[786px] md:bg-[length:100%_100%] bg-auto bg-no-repeat bg-center"
                />
            </div>,
            dashboardElement
        )
    );
};

export default LobbyBackground;
