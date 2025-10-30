import { useMemo } from "react";
import { Winner } from "@/baccarat-multiplayer-constants";
import { buildVersion } from "@shared";

const DEVICE_MODE = {
    DESKTOP: "desktop",
    MOBILE: "mobile",
};

export const useHighlightConfig = (choice: string, isDesktop: boolean) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const device = isDesktop ? DEVICE_MODE.DESKTOP : DEVICE_MODE.MOBILE;
    const suffix = isDesktop ? "Desktop" : "Mobile";

    return useMemo(() => {
        const imageMap: Record<string, string> = {
            [Winner.PLAYER]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-player.webp?v=${buildVersion}`,
            [Winner.BANKER]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-banker.webp?v=${buildVersion}`,
            [Winner.TIE]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-tie.webp?v=${buildVersion}`,
            [Winner.ANY_PAIR]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-anypair.webp?v=${buildVersion}`,
        };

        const shadowClassMap: Record<string, string> = {
            [Winner.PLAYER]: `playerPrevShadow${suffix}`,
            [Winner.BANKER]: `bankerPrevShadow${suffix}`,
            [Winner.TIE]: `tiePrevShadow${suffix}`,
            [Winner.ANY_PAIR]: `anyPairPrevShadow${suffix}`,
        };

        return {
            imagePath: imageMap[choice] || "",
            shadowClass: shadowClassMap[choice] || "",
        };
    }, [choice, basePath, device, suffix]);
};
