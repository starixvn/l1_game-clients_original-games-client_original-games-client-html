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
    const [isEntrance, setIsEntrance] = useState(false);
    const flipScheduledRef = useRef(false); // Track if we've already scheduled a flip

    useEffect(() => {
        if (isFlipped && playResultAnimation) {
            // For 3rd cards, first show entrance animation, then flip
            if (card.order >= 5) { // 3rd cards
                if (isEntrance) {
                    setFlipAnimationClass(styles['flip']);
                } else {
                    setFlipAnimationClass(styles['entrance']);
                }
            } else {
                setFlipAnimationClass(styles['flip']);
            }
        } else if (isFlipped) {
            setFlipAnimationClass(`${styles['flip']} ${styles['no-animation']}`);
        } else {
            setFlipAnimationClass('');
        }
    }, [isFlipped, playResultAnimation, isEntrance, card.order]);


    useEffect(() => {
        let cleanup: (() => void) | undefined;

        if (isShowResult && !flipScheduledRef.current) {
            // Mark that we've scheduled a flip to prevent duplicates
            flipScheduledRef.current = true;

            // Sequential card opening - Order matters for timing!
            const baseDelay = CARD_TIMINGS[card.order as keyof typeof CARD_TIMINGS] || 0;
            const delay = playResultAnimation ? Math.max(baseDelay, 50) : 0; // Minimum 50ms delay for animation to work

            const flipTimer = setTimeout(() => {
                // For 3rd cards, first show entrance animation
                if (card.order >= 5) {
                    setIsEntrance(false); // Start with entrance
                    setIsFlipped(true);

                    // After entrance animation completes, flip the card
                    setTimeout(() => {
                        setIsEntrance(true);
                        if (onCardFlip) {
                            onCardFlip(card, card.accumulatedScore);
                        }
                    }, 600); // Wait for fast entrance animation to complete
                } else {
                    // Regular cards just flip
                    setIsFlipped(true);
                    if (onCardFlip) {
                        onCardFlip(card, card.accumulatedScore);
                    }
                }
                // Keep the flag set to prevent re-flipping this card
                // Only reset when isShowResult becomes false
            }, delay);

            cleanup = () => clearTimeout(flipTimer);
        } else if (!isShowResult) {
            setIsFlipped(false);
            setIsEntrance(false);
            flipScheduledRef.current = false; // Reset flag when hiding results
        }

        return cleanup;
    }, [isShowResult, card.order, onCardFlip, playResultAnimation]); // Changed card to card.order to prevent re-triggering on card data changes

    const cardOrderClass = styles[`card${card.order}`];
    const cardClassName = `${styles.card} ${styles[type]} ${cardOrderClass} ${flipAnimationClass} ${className || ''}`;

    return (
        <div className={cardClassName} data-card-order={card.order}>
            <div className={styles['baccarat-card-back']}>
                <CardBack />
            </div>
            <div className={styles['baccarat-card-front']}>
                <Card result={{ card: card.value.rank, type: card.value.suit }} />
            </div>
        </div>
    );
};
