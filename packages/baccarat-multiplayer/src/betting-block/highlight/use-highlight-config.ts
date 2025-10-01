import { useMemo } from "react";
import { Winner } from "@/baccarat-multiplayer-constants";

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
            [Winner.PLAYER]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-player.webp`,
            [Winner.BANKER]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-banker.webp`,
            [Winner.TIE]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-tie.webp`,
            [Winner.ANY_PAIR]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-anypair.webp`,
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
