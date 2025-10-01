import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "@shared/components/game-base/type";
import styles from "./baccarat-highlight-bet-option.module.scss";
import { useEffect, useState } from "react";
import { Winner } from "@/baccarat-multiplayer-constants";
import { cn } from "@shared";
import Image from "next/image";

export const BaccaratHighlightBetOption = ({ choice }: { choice: string }) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    const { showResultInfo, settlementResult, roundState } = useGameStateContext();
    
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkViewport = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        checkViewport();
        window.addEventListener("resize", checkViewport);

        return () => window.removeEventListener("resize", checkViewport);
    }, []);


    // Get image path based on choice
    const getImagePath = (choice: string): string => {
        switch (choice) {
            case Winner.PLAYER:
                return `${basePath}/static/images/highlight-winning/${isDesktop ? "desktop" : "mobile"}/highlight-winning-player.webp`;
            case Winner.BANKER:
                return `${basePath}/static/images/highlight-winning/${isDesktop ? "desktop" : "mobile"}/highlight-winning-banker.webp`;
            case Winner.TIE:
                return `${basePath}/static/images/highlight-winning/${isDesktop ? "desktop" : "mobile"}/highlight-winning-tie.webp`;
            case Winner.ANY_PAIR:
                return `${basePath}/static/images/highlight-winning/${isDesktop ? "desktop" : "mobile"}/highlight-winning-anypair.webp`;
            default:
                return "";
        }
    };

    const imagePath = getImagePath(choice);

    // Get shadow class based on choice and viewport
    const getShadowClass = (choice: string): string => {
        const suffix = isDesktop ? "Desktop" : "Mobile";

        switch (choice) {
            case Winner.PLAYER:
                return styles[`playerPrevShadow${suffix}`];
            case Winner.BANKER:
                return styles[`bankerPrevShadow${suffix}`];
            case Winner.TIE:
                return styles[`tiePrevShadow${suffix}`];
            case Winner.ANY_PAIR:
                return styles[`anyPairPrevShadow${suffix}`];
            default:
                return "";
        }
    };

    const shadowClass = getShadowClass(choice);

    
    return (
        [RoundState.None, RoundState.DisplayResult].includes(roundState) &&
        showResultInfo &&
        settlementResult[choice] && (
            <div className={cn(`${styles["highlight"]} ${styles[choice]}`)}>
            {shadowClass && <div className={shadowClass}></div>}
            <Image
                src={imagePath}
                alt={`highlight-winning-${choice}`}
                width={199}
                height={185}
                className="w-full h-full object-contain"
                priority
            />
        </div>
        )
    );
};

export default BaccaratHighlightBetOption;
