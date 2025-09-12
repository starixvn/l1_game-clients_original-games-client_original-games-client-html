import React from "react";
import styles from "./score-display.module.scss";

interface ScoreDisplayProps {
    score: number;
    type: 'player' | 'banker';
    visible: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, type, visible }) => {
    if (!visible) return null;
    console.log('[ScoreDisplay] show:', { score, type, visible });

    return (
        <div className={`${styles.score} ${styles[`${type}-score`]}`}>
            <span className={styles['score-number']}>{score}</span>
        </div>
    );
};
