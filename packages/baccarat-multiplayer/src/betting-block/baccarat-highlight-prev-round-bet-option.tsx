import { cn, isShowHighlightPrevResult, useGameStore } from "@shared";
import styles from "./baccarat-highlight-prev-round-bet-option.module.scss";
import { useShallow } from "zustand/shallow";
import Image from "next/image";
import { Winner } from "@/baccarat-multiplayer-constants";
import { useEffect, useMemo, useState } from "react";

const DEVICE_MODE = {
    DESKTOP: "desktop",
    MOBILE: "mobile",
}

export const BaccaratHighlightPrevRoundBetOption = ({ choice }: { choice: string }) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    const { roundHistory, roundState } = useGameStore(
        useShallow((state) => ({
            roundHistory: state.roundHistory,
            roundState: state.roundState,
        }))
    );

    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { imagePath, shadowClass } = useMemo(() => {
        const device = isDesktop ? DEVICE_MODE.DESKTOP : DEVICE_MODE.MOBILE;
        const suffix = isDesktop ? "Desktop" : "Mobile";

        const imageMap: Record<string, string> = {
            [Winner.PLAYER]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-player.webp`,
            [Winner.BANKER]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-banker.webp`,
            [Winner.TIE]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-tie.webp`,
            [Winner.ANY_PAIR]: `${basePath}/static/images/highlight-winning/${device}/highlight-winning-anypair.webp`,
        };

        const classMap: Record<string, string> = {
            [Winner.PLAYER]: styles[`playerPrevShadow${suffix}`],
            [Winner.BANKER]: styles[`bankerPrevShadow${suffix}`],
            [Winner.TIE]: styles[`tiePrevShadow${suffix}`],
            [Winner.ANY_PAIR]: styles[`anyPairPrevShadow${suffix}`],
        };

        return {
            imagePath: imageMap[choice] || "",
            shadowClass: classMap[choice] || "",
        };
    }, [choice, basePath, isDesktop]);

    const isShow = isShowHighlightPrevResult({
        betChoice: choice,
        roundState,
        roundHistory,
    });

    if (!isShow || !imagePath) {
        return null;
    }

    return (
        <div className={cn(styles.highlight, styles[choice])}>
            {shadowClass && <div className={shadowClass} />}
            <Image
                src={imagePath}
                alt={`highlight-winning-${choice}`}
                width={199}
                height={185}
                className="w-full h-full object-contain"
                priority
            />
        </div>
    );
};

export default BaccaratHighlightPrevRoundBetOption;
