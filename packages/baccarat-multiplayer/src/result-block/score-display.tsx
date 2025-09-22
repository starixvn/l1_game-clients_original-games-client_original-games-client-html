import React from "react";
import styles from "./score-display.module.scss";

interface ScoreDisplayProps {
    score: number;
    type: 'player' | 'banker';
    visible: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, type, visible }) => {
    if (!visible) {
        return null;
    }

    const scoreClassName = `${type}-score`;

    return (
        <div className={`${styles.score} ${styles[scoreClassName]}`}>
            <span className={styles['score-number']}>{score}</span>
        </div>
    );
};
