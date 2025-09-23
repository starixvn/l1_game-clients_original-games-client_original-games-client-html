import React, { useCallback, useEffect, useState } from "react";
import { BaccaratCard } from "./baccarat-card";
import { ScoreDisplay } from "./score-display";
import { CardOrderWithTiming } from "./types";
import styles from "./baccarat-animations.module.scss";
import { BaccaratBetOptions } from "../baccarat-multiplayer-constants";


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
        (card: CardOrderWithTiming, accumulatedScore: number) => {
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

    return (
        <div className={`${styles.cardSection} ${type === BaccaratBetOptions.PLAYER ? 'justify-end' : 'justify-start'}`}>
            <div className={`${styles.cardContainer} ${styles[type]} ${cardContainerAnimClass}`}>
                {cards.map((card, index) => (
                    <BaccaratCard
                        playResultAnimation={playResultAnimation}
                        key={card.order}
                        type={type}
                        card={card}
                        isShowResult={isShowResult}
                        onCardFlip={handleCardFlip}
                    />
                ))}

                {isShowResult && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ScoreDisplay
                            key={`score-${Object.values(visibleScores).filter(Boolean).length}`}
                            score={cards.reduce((total, card) => {
                                if (visibleScores[card.order]) {
                                    return card.accumulatedScore;
                                }
                                return total;
                            }, 0)}
                            type={type}
                            visible={Object.values(visibleScores).some(visible => visible)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
