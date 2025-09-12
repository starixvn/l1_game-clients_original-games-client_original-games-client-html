import React, { useEffect } from "react";
import styles from "./baccarat-bet-options.module.scss";
import { useGameContext } from "@shared/react-contexts";
import { BaccaratBetOptions } from "../baccarat-constants";
import BaccaratSubOptions from "./baccarat-sub-options";
import BaccaratMainOption from "./baccarat-main-option";

interface BaccaratBettingBlockProps {
    className?: string;
}

const BaccaratBettingBlock: React.FC<BaccaratBettingBlockProps> = ({ className }) => {
    const { tolgeeNamespace } = useGameContext();
    // Dev diagnostics for CSS modules
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            const missingClasses = [];
            const expectedClasses = [
                "bettingBlock",
                "bettingArea",
                "playerBet",
                "bankerBet",
                "tieBet",
                "betButton",
                "betAmount"
            ];

            expectedClasses.forEach(className => {
                if (!styles[className]) {
                    missingClasses.push(className);
                }
            });

            if (missingClasses.length > 0) {
                console.warn(
                    `[BaccaratBettingBlock] Missing CSS module classes: ${missingClasses.join(", ")}`
                );
            }
        }
    }, []);

    return (
        <div className={`${styles.bettingWrapper} ${className || ""}`}>
            <div className={styles.mainOptionsRow}>
                <BaccaratMainOption tolgeeNamespace={tolgeeNamespace} choice={BaccaratBetOptions.PLAYER} />
                <BaccaratMainOption tolgeeNamespace={tolgeeNamespace} choice={BaccaratBetOptions.BANKER} />
            </div>
            <BaccaratSubOptions
                tolgeeNamespace={tolgeeNamespace}
                choices={[BaccaratBetOptions.PLAYER_PAIR, BaccaratBetOptions.TIE, BaccaratBetOptions.BANKER_PAIR]}
            />
        </div>
    );
};

export default BaccaratBettingBlock;
