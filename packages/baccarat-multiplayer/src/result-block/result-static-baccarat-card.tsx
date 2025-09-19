import React from "react";
import { BaccaratGameLogic } from "../baccarat-helper";
import styles from "./result-baccarat-card.module.scss";
import { BaccaratBetOptions } from "@/baccarat-multiplayer-constants";

interface StaticBaccaratCardProps {
    card: { card: number; type: number };
    className?: string;
}

export const ResultStaticBaccaratCard: React.FC<StaticBaccaratCardProps> = ({
    card,
    className
}) => {
    const getCardDisplayValue = (value: number): string => {
        if (value === 0) return ''; // Empty card
        if (value === 1) return 'A';
        if (value === 11) return 'J';
        if (value === 12) return 'Q';
        if (value === 13) return 'K';
        return value.toString();
    };

    const getCardColor = (type: number): string => {
        // Type 1 = Player (green), Type 0 = Banker (red)
        return type === 1 ? BaccaratBetOptions.PLAYER : BaccaratBetOptions.BANKER;
    };

    return (
        <div className={`${styles.card} ${styles[getCardColor(card.type)]} ${className || ''}`}>
            <div className={styles["rotate-card"]}>
                <div className={styles.cardFace}>
                    <div className={styles["card-front"]}>
                        <div className={styles["card-value"]}>
                            {getCardDisplayValue(card.card)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
