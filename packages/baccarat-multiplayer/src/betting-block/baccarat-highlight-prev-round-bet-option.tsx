import { isShowHighlightPrevResult, useGameStore } from "@shared";
import styles from "./baccarat-highlight-prev-round-bet-option.module.scss";
import { useShallow } from "zustand/shallow";
import Image from "next/image";
import { Winner } from "@/baccarat-multiplayer-constants";

export const BaccaratHighlightPrevRoundBetOption = ({ choice }: { choice: string }) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const { roundHistory, roundState } = useGameStore(
        useShallow((state) => ({ roundHistory: state.roundHistory, roundState: state.roundState }))
    );
    const isShow = isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory });

    // Get image path based on choice
    const getImagePath = (choice: string): string => {
        switch (choice) {
            case Winner.PLAYER:
                return `${basePath}/static/images/highlight-winning/highlight-winning-player.webp`;
            case Winner.BANKER:
                return `${basePath}/static/images/highlight-winning/highlight-winning-banker.webp`;
            case Winner.TIE:
                return `${basePath}/static/images/highlight-winning/highlight-winning-tie.webp`;
            case Winner.ANY_PAIR:
                return `${basePath}/static/images/highlight-winning/highlight-winning-anypair.webp`;
            default:
                return "";
        }
    };

    const imagePath = getImagePath(choice);
    const shadowClass = choice === "player" ? styles.playerPrevShadow : choice === "banker" ? styles.bankerPrevShadow : choice === "tie" ? styles.tiePrevShadow : choice === "anyPair" ? styles.anyPairPrevShadow : "";

    return true && imagePath ? (

        <div className={`${styles["highlight"]} ${styles[choice]}`}>
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
    ) : null;
};

export default BaccaratHighlightPrevRoundBetOption;
