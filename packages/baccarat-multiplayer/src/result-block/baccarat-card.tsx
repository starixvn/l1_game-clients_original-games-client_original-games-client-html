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

    // Add rotation class based on card order
    const getRotationClass = (order: number) => {
        if (order === 5) return styles['rotate-right']; // Player's third card
        if (order === 6) return styles['rotate-left']; // Banker's third card
        return '';
    };

    // Add banker third card class based on card order and player third card status
    const getBankerThirdCardClass = (order: number) => {
        const isBankerThirdCard = card.playerHasThirdCard ? order === 6 : order === 5;
        return isBankerThirdCard ? styles['banker-third-card'] : '';
    };

    useEffect(() => {
        if (isShowResult && !flipScheduledRef.current) {
            // Mark that we've scheduled a flip to prevent duplicates
            flipScheduledRef.current = true;

            // Sequential card opening - Order matters for timing!
            const delay = playResultAnimation ? (CARD_TIMINGS[card.order as keyof typeof CARD_TIMINGS] ?? 0) : 0;

            const flipTimer = setTimeout(() => {
                setIsFlipped(true);
                if (onCardFlip) {
                    onCardFlip(card, card.accumulatedScore);
                }
                // Reset the flag when done
                flipScheduledRef.current = false;
            }, delay);

            return () => clearTimeout(flipTimer);
        } else if (!isShowResult) {
            setIsFlipped(false);
            flipScheduledRef.current = false; // Reset flag when hiding results
        }
    }, [isShowResult, card.order, onCardFlip, playResultAnimation]);

    const cardOrderClass = styles[`card${card.order}`];
    const cardClassName = `${styles.card} ${styles[type]} ${cardOrderClass} ${flipAnimationClass} ${getRotationClass(card.order)} ${getBankerThirdCardClass(card.order)} ${className || ''}`;

    return (
        <div className={cardClassName}>
            <div className={styles['rotate-card']}>
                <div className={styles.cardFace}>
                    <div className={styles['card-back']}>
                        <CardBack />
                    </div>
                    <div className={styles['card-front']}>
                        <Card result={{ card: card.value.rank, type: card.value.suit }} customClassName={'card-baccarat'} />
                    </div>
                </div>
            </div>
        </div>
    );
};
