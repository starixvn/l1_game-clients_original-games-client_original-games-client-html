import React from "react";
import styles from "./baccarat-dot.module.scss";

type GameResult = 'player' | 'banker' | 'tie';

interface BaccaratDotProps {
    choice: GameResult | 'next';
    value?: string;
    highlight?: boolean;
    className?: string;
}

export const BaccaratDot: React.FC<BaccaratDotProps> = ({
    choice,
    value,
    highlight = false,
    className
}) => {
    const getDotClass = () => {
        if (highlight) {
            return styles['dot-next'];
        }
        if (choice === 'player') {
            return styles['dot-player'];
        }
        if (choice === 'banker') {
            return styles['dot-banker'];
        }
        if (choice === 'tie') {
            return styles['dot-tie'];
        }
        return styles['dot-next'];
    };

    const getDisplayValue = () => {
        if (value) {
            return value;
        }
        if (choice === 'player') {
            return 'P';
        }
        if (choice === 'banker') {
            return 'B';
        }
        if (choice === 'tie') {
            return 'T';
        }
        return '?';
    };

    return (
        <div className={`${styles.dot} ${getDotClass()} ${className || ''}`}>
            <div className={styles['dot-content']}>
                {getDisplayValue()}
            </div>
            {highlight && <div className={styles['blink']}></div>}
        </div>
    );
};

export default BaccaratDot;
