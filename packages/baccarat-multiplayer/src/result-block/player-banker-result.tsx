import React, { useEffect } from "react";
import { CardSection } from "./card-section";
import { determineWinner, GetBankerCardsResult, GetPlayerCardsResult } from "./score-utils";
import styles from "./baccarat-animations.module.scss";
import { cn } from "@shared/utils";

interface Result {
    player: {
        card1: { card: number; type: number };
        card2: { card: number; type: number };
        card3?: { card: number; type: number };
    };
    banker: {
        card1: { card: number; type: number };
        card2: { card: number; type: number };
        card3?: { card: number; type: number };
    };
    winner: "player" | "banker" | "tie";
    playerPair?: boolean;
    bankerPair?: boolean;
    natural?: boolean;
}

interface PlayerBankerResultProps {
    playResultAnimation: boolean;
    result?: Result;
    isShowResult: boolean;
    language: string;
    isFinishShowResult: boolean;
    isHideAllCards: boolean;
}

interface PlayerBankerResultState {
    openedCards: number;
    showWinner: boolean;
}

export default function PlayerBankerResultComponent(props: PlayerBankerResultProps) {
    const { playResultAnimation, result, isShowResult, isFinishShowResult, isHideAllCards } = props;

    console.log("[PlayerBankerResult] props:", { playResultAnimation, isShowResult, isFinishShowResult, isHideAllCards });
    console.log("[PlayerBankerResult] result:", result);

    const playerCards = result ? GetPlayerCardsResult(result) : [];
    const bankerCards = result ? GetBankerCardsResult(result) : [];

    console.log("[PlayerBankerResult] playerCards:", playerCards);
    console.log("[PlayerBankerResult] bankerCards:", bankerCards);

    useEffect(() => {
        if (playResultAnimation) {
            startAnimation();
        }
    }, [playResultAnimation, isShowResult]);

    const getWinnerText = (): string => {
        if (!result) {
            return "";
        }

        try {
            const playerLastCard = playerCards[playerCards.length - 1];
            const bankerLastCard = bankerCards[bankerCards.length - 1];

            if (!playerLastCard || !bankerLastCard) {
                return "";
            }

            const playerScore = playerLastCard.accumulatedScore;
            const bankerScore = bankerLastCard.accumulatedScore;

            return determineWinner(playerScore, bankerScore);
        } catch (error) {
            return "";
        }
    };

    const startAnimation = () => {
        if (!result) {
            return;
        }

        const allCards = [...playerCards, ...bankerCards].sort((a, b) => a.order - b.order).filter((card) => card.value);

        console.log("[PlayerBankerResult] startAnimation cards:", allCards);

        allCards.forEach((card, index) => {
            setTimeout(() => {
                // Emit card state change if needed
            }, card.animationDelay);
        });
    };

    return (
        <div
        // className={`overlay-mask`}
        >
            <div className={cn(`${styles["animation-container"]} flex justify-between`)}>
                <CardSection
                    cards={playerCards}
                    label="Player"
                    type="player"
                    playResultAnimation={playResultAnimation}
                    isShowResult={isShowResult}
                    isHideAllCards={isHideAllCards}
                />

                <CardSection
                    cards={bankerCards}
                    label="Banker"
                    type="banker"
                    playResultAnimation={playResultAnimation}
                    isShowResult={isShowResult}
                    isHideAllCards={isHideAllCards}
                />

                {isShowResult && isFinishShowResult && !isHideAllCards && (
                    <div className={`${styles["winner-display"]} ${playResultAnimation ? styles["play-animation"] : ""}`}>
                        <p className={styles["winner-text"]}>{getWinnerText()}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
