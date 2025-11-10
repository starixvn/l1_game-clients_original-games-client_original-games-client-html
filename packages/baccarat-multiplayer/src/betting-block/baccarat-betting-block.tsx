import { useGameContext } from "@shared/react-contexts";
import { cn } from "@shared/utils/merge-tailwind-util";
import React from "react";
import { BaccaratBetOptions } from "../baccarat-multiplayer-constants";
import styles from "./baccarat-bet-options.module.scss";
import BaccaratMainOption from "./baccarat-main-option";
import BaccaratSubOptions from "./baccarat-sub-options";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";

interface BaccaratBettingBlockProps {
    className?: string;
}

const BaccaratBettingBlock: React.FC<BaccaratBettingBlockProps> = ({ className }) => {
    const { roundState } = useGameStateContext();
    const { tolgeeNamespace } = useGameContext();

    return (
        <div className={cn(styles.bettingWrapper, className)}>
            <div className={styles.mainOptionsRow}>
                <BaccaratMainOption tolgeeNamespace={tolgeeNamespace} choice={BaccaratBetOptions.PLAYER} roundState={roundState} />
                <BaccaratMainOption tolgeeNamespace={tolgeeNamespace} choice={BaccaratBetOptions.BANKER} roundState={roundState} />
            </div>
            <BaccaratSubOptions
                tolgeeNamespace={tolgeeNamespace}
                choices={[BaccaratBetOptions.ANY_PAIR, BaccaratBetOptions.TIE]}
                roundState={roundState}
            />
        </div>
    );
};

export default BaccaratBettingBlock;
