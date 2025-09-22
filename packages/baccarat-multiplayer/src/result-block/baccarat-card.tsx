import React, { useEffect, useState, useRef } from "react";
import Card from "../shared/components/card";
import CardBack from "../shared/components/card/card-back";
import { CARD_TIMINGS } from "./constants";
import styles from "./baccarat-card.module.scss";
import { CardOrderWithTiming } from "./types";

interface BaccaratCardProps {
    card: CardOrderWithTiming;
    className?: string;
    isShowResult: boolean;
    type: 'player' | 'banker'; // Context for styling, not card data
    onCardFlip?: (card: CardOrderWithTiming, accumulatedScore: number) => void;
    playResultAnimation?: boolean;
}

export const BaccaratCard: React.FC<BaccaratCardProps> = ({
    card,
    className,
    isShowResult,
    type,
    onCardFlip,
    playResultAnimation
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [flipAnimationClass, setFlipAnimationClass] = useState('');
    const flipScheduledRef = useRef(false); // Track if we've already scheduled a flip

    useEffect(() => {
        if (isFlipped && playResultAnimation) {
            setFlipAnimationClass(styles['flip']);
        } else if (isFlipped) {
            setFlipAnimationClass(`${styles['flip']} ${styles['no-animation']}`);
        } else {
            setFlipAnimationClass('');
        }
    }, [isFlipped, playResultAnimation]);


    useEffect(() => {
        let cleanup: (() => void) | undefined;

        if (isShowResult && !flipScheduledRef.current) {
            // Mark that we've scheduled a flip to prevent duplicates
            flipScheduledRef.current = true;

            // Sequential card opening - Order matters for timing!
            const delay = playResultAnimation ? (CARD_TIMINGS[card.order as keyof typeof CARD_TIMINGS] || 0) : 0;

            const flipTimer = setTimeout(() => {
                setIsFlipped(true);
                if (onCardFlip) {
                    onCardFlip(card, card.accumulatedScore);
                }
                // Reset the flag when done
                flipScheduledRef.current = false;
            }, delay);

            cleanup = () => clearTimeout(flipTimer);
        } else if (!isShowResult) {
            setIsFlipped(false);
            flipScheduledRef.current = false; // Reset flag when hiding results
        }

        return cleanup;
    }, [isShowResult, card, onCardFlip, playResultAnimation]);

    const cardOrderClass = styles[`card${card.order}`];
    const cardClassName = `${styles.card} ${styles[type]} ${cardOrderClass} ${flipAnimationClass} ${className || ''}`;

    return (
        <div className={cardClassName}>
            <div className={styles['baccarat-card-back']}>
                <CardBack />
            </div>
            <div className={styles['baccarat-card-front']}>
                <Card result={{ card: card.value.rank, type: card.value.suit }} />
            </div>
        </div>
    );
};
