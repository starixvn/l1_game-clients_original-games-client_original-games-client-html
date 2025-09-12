import React, { useEffect, useState } from "react";
import Card from "../shared/components/card";
import CardBack from "../shared/components/card/card-back";
import { CARD_TIMINGS } from "./constants";
import styles from "./baccarat-card.module.scss";

interface CardOrder {
    order: number;
    value: any;
    type: 'player' | 'banker';
    accumulatedScore: number;
    playerHasThirdCard?: boolean;
}

interface BaccaratCardProps {
    card: CardOrder;
    className?: string;
    isShowResult: boolean;
    type: 'player' | 'banker';
    onCardFlip?: (card: CardOrder, accumulatedScore: number) => void;
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
    console.log('[BaccaratCard] render:', { order: card?.order, value: card?.value, type, isShowResult, playResultAnimation });
    const [isFlipped, setIsFlipped] = useState(false);
    const [flipAnimationClass, setFlipAnimationClass] = useState('');

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

    // Add banker third card class when it's the third card and player has only 2 cards
    const getBankerThirdCardClass = (order: number) => {
        if (order === 5 && !card.playerHasThirdCard) {
            return styles['banker-third-card'];
        }
        return '';
    };

    useEffect(() => {
        if (isShowResult) {
            // Sequential card opening
            let delay;
            switch (card.order) {
                case 1:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_1 : 0;
                    break;
                case 3:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_3 : 0;
                    break;
                case 2:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_2 : 0;
                    break;
                case 4:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_4 : 0;
                    break;
                case 5:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_5 : 0;
                    break;
                case 6:
                    delay = playResultAnimation ? CARD_TIMINGS.CARD_6 : 0;
                    break;
                default:
                    delay = 0;
            }

            const flipTimer = setTimeout(() => {
                setIsFlipped(true);
                if (onCardFlip) {
                    onCardFlip(card, card.accumulatedScore);
                }
            }, delay);

            return () => clearTimeout(flipTimer);
        } else {
            setIsFlipped(false);
        }
    }, [isShowResult, card, onCardFlip, playResultAnimation]);

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
                        <Card result={card.value} customClassName={'card-baccarat'} />
                    </div>
                </div>
            </div>
        </div>
    );
};
