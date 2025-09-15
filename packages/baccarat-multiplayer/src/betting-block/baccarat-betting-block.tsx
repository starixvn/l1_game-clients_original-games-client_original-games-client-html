import { useGameContext } from "@shared/react-contexts";
import React, { useEffect } from "react";
import { BaccaratBetOptions } from "../baccarat-multiplayer-constants";
import styles from "./baccarat-bet-options.module.scss";
import BaccaratMainOption from "./baccarat-main-option";
import BaccaratSubOptions from "./baccarat-sub-options";

interface BaccaratBettingBlockProps {
    className?: string;
}

const BaccaratBettingBlock: React.FC<BaccaratBettingBlockProps> = ({ className }) => {
    const { tolgeeNamespace } = useGameContext();
    // Dev diagnostics for CSS modules
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            const missingClasses = [];
            const expectedClasses = ["bettingBlock", "bettingArea", "playerBet", "bankerBet", "tieBet", "betButton", "betAmount"];

            expectedClasses.forEach((className) => {
                if (!styles[className]) {
                    missingClasses.push(className);
                }
            });

            if (missingClasses.length > 0) {
                console.warn(`[BaccaratBettingBlock] Missing CSS module classes: ${missingClasses.join(", ")}`);
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
                choices={[BaccaratBetOptions.PLAYER, BaccaratBetOptions.TIE, BaccaratBetOptions.BANKER]}
            />
        </div>
    );
};

export default BaccaratBettingBlock;
