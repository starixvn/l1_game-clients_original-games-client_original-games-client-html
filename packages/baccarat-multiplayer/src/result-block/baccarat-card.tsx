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
    const [animationPhase, setAnimationPhase] = useState<'entrance' | 'flip'>('entrance');
    const flipScheduledRef = useRef(false); // Track if we've already scheduled a flip

    useEffect(() => {
        if (isFlipped && playResultAnimation) {
            // For 3rd cards during live animation: entrance → flip sequence
            if (card.order >= 5) { // 3rd cards
                if (animationPhase === 'flip') {
                    setFlipAnimationClass(styles['flip']);
                } else {
                    setFlipAnimationClass(styles['entrance']);
                }
            } else {
                // Regular cards: direct flip
                setFlipAnimationClass(styles['flip']);
            }
        } else if (isFlipped) {
            // Historical data: immediate flip without animation
            setFlipAnimationClass(`${styles['flip']} ${styles['no-animation']}`);
        } else {
            // Not flipped: show back card
            setFlipAnimationClass('');
        }
    }, [isFlipped, playResultAnimation, animationPhase, card.order]);


    useEffect(() => {
        let cleanup: (() => void) | undefined;

        if (isShowResult && !flipScheduledRef.current) {
            // Mark that we've scheduled a flip to prevent duplicates
            flipScheduledRef.current = true;

            // Sequential card opening - Order matters for timing!
            const baseDelay = CARD_TIMINGS[card.order as keyof typeof CARD_TIMINGS] || 0;
            const delay = playResultAnimation ? Math.max(baseDelay, 50) : 0; // Minimum 50ms delay for animation to work

            const flipTimer = setTimeout(() => {
                // Live animation with 3rd cards: entrance → flip sequence
                if (card.order >= 5 && playResultAnimation) {
                    setAnimationPhase('entrance'); // Start with entrance animation
                    setIsFlipped(true);

                    // After entrance animation completes, transition to flip
                    setTimeout(() => {
                        setAnimationPhase('flip');
                        if (onCardFlip) {
                            onCardFlip(card, card.accumulatedScore);
                        }
                    }, 600); // Wait for entrance animation to complete
                } else {
                    // Regular cards or historical data: direct flip without entrance
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
            // Reset animation states when hiding results
            setIsFlipped(false);
            setAnimationPhase('entrance'); // Reset to default phase
            flipScheduledRef.current = false; // Allow re-flip when results show again
        }

        return cleanup;
    }, [isShowResult, card.order, onCardFlip, playResultAnimation]); // Optimized dependency array

    const cardOrderClass = styles[`card${card.order}`] || '';
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
