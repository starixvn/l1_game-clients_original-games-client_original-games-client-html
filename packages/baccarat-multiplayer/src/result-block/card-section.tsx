import React, { useCallback, useEffect, useState } from "react";
import { BaccaratCard } from "./baccarat-card";
import { ScoreDisplay } from "./score-display";
import { CardOrderWithTiming } from "./score-utils";
import styles from "./baccarat-animations.module.scss";

interface CardOrder {
    order: number;
    value: any;
    type: 'player' | 'banker';
    accumulatedScore: number;
    playerHasThirdCard?: boolean;
}

interface CardSectionProps {
    cards: CardOrderWithTiming[];
    label: string;
    type: 'player' | 'banker';
    playResultAnimation: boolean;
    isShowResult: boolean;
    isHideAllCards: boolean;
}

export const CardSection: React.FC<CardSectionProps> = ({
    cards,
    label,
    type,
    playResultAnimation,
    isShowResult,
    isHideAllCards
}) => {
    const [visibleScores, setVisibleScores] = useState<{ [key: number]: boolean }>({});
    const [cardContainerAnimClass, setCardContainerAnimClass] = useState('');

    // Reset states when show result changes
    useEffect(() => {
        if (!isShowResult) {
            setVisibleScores({});
        }
    }, [isShowResult]);

    useEffect(() => {
        if (isHideAllCards) {
            setCardContainerAnimClass(styles['hide-all-cards']);
        } else if (!isHideAllCards && !isShowResult && !playResultAnimation) {
            setCardContainerAnimClass(styles['show-all-cards']);
        } else {
            setCardContainerAnimClass('');
        }
    }, [isHideAllCards, isShowResult, playResultAnimation]);

    const handleCardFlip = useCallback(
        (card: CardOrder, accumulatedScore: number) => {
            // Add delay to match card flip animation completion
            setTimeout(() => {
                setVisibleScores((prev) => ({
                    ...prev,
                    [card.order]: true,
                }));
            }, 600); // Match the animation duration from BaccaratCard
        },
        [type],
    );

    console.log('[CardSection] props:', { type, label, playResultAnimation, isShowResult, isHideAllCards });
    console.log('[CardSection] cards:', cards);
    return (
        <div className={`${styles.cardSection}`}>
            <div className={`${styles.label} ${type === 'player' ? styles['label-player'] : styles['label-banker']}`}>{label}</div>
            <div className={`${styles.cardContainer} ${styles[type]} ${cardContainerAnimClass}`}>
                {cards.map((card, index) => (
                    <BaccaratCard
                        playResultAnimation={playResultAnimation}
                        key={card.order}
                        type={type}
                        card={{ ...card, type } as CardOrder}
                        isShowResult={isShowResult}
                        onCardFlip={handleCardFlip}
                    />
                ))}

                {isShowResult &&
                    cards.map((card, index) => (
                        <div key={card.order}>
                            <ScoreDisplay score={card.accumulatedScore} type={type} visible={visibleScores[card.order]} />
                        </div>
                    ))}
            </div>
        </div>
    );
};
