import React, { useEffect } from "react";
import { CardSection } from "./card-section";
import { GetBankerCardsResult, GetPlayerCardsResult } from "./score-utils";
import styles from "./baccarat-animations.module.scss";
import { cn } from "@shared/utils";
import { BaccaratResult } from "./types";
import { WINNER_TEXT_MAP } from "./constants";


interface PlayerBankerResultProps {
    playResultAnimation: boolean;
    result?: BaccaratResult;
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

    const playerCards = result ? GetPlayerCardsResult(result) : [];
    const bankerCards = result ? GetBankerCardsResult(result) : [];

    useEffect(() => {
        if (playResultAnimation) {
            startAnimation();
        }
    }, [playResultAnimation, isShowResult]);

    const getWinnerText = (): string => {
        if (!result) return "";
        return WINNER_TEXT_MAP[result.winner] || "";
    };

    const startAnimation = () => {
        if (!result) {
            return;
        }

        const allCards = [...playerCards, ...bankerCards].sort((a, b) => a.order - b.order).filter((card) => card.value);


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
