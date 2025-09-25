import React, { useEffect, useState, useCallback, useMemo } from "react";
import { CardSection } from "./card-section";
import { GetBankerCardsResult, GetPlayerCardsResult } from "./score-utils";
import styles from "./baccarat-animations.module.scss";
import { BaccaratResult } from "./types";
import { WINNER_TEXT_MAP } from "./constants";
import { useTranslator } from "@shared/react-hooks/use-translator";
import { ResourceTypes } from "@shared/resources";
import useGameStore from "@shared/stores/game-store/game-store";


interface PlayerBankerResultProps {
    playResultAnimation: boolean;
    result?: BaccaratResult;
    isShowResult: boolean;
    language: string;
    isFinishShowResult: boolean;
    isHideAllCards: boolean;
}


export default function PlayerBankerResult(props: PlayerBankerResultProps) {
    const { playResultAnimation, result, isShowResult, isFinishShowResult, isHideAllCards } = props;
    const [showWinner, setShowWinner] = useState(false);

    const playerCards = useMemo(() => result ? GetPlayerCardsResult(result) : [], [result]);
    const bankerCards = useMemo(() => result ? GetBankerCardsResult(result) : [], [result]);

    const {t} = useTranslator([ResourceTypes.BACCARAT_MULTIPLAYER]);

    const startAnimation = useCallback(() => {
        if (!result) {
            return;
        }

        const allCards = [...playerCards, ...bankerCards].sort((a, b) => a.order - b.order).filter((card) => card.value);

        // Find the maximum animation delay (last card to flip)
        const maxDelay = allCards.length > 0 ? Math.max(...allCards.map(card => card.animationDelay)) : 0;

        // Show winner after all cards have finished flipping (add 500ms buffer for card flip animation)
        const winnerDelay = maxDelay + 1000;

        setTimeout(() => {
            setShowWinner(true);
        }, winnerDelay);

        allCards.forEach((card, index) => {
            setTimeout(() => {
                // Emit card state change if needed
            }, card.animationDelay);
        });
    }, [result, playerCards, bankerCards]);

    useEffect(() => {
        if (playResultAnimation) {
            startAnimation();
        } else {
            setShowWinner(isShowResult && !isHideAllCards);
        }
    }, [playResultAnimation, isShowResult, isHideAllCards, startAnimation]);

    useEffect(() => {
        const isShouldShowResults = isShowResult && isFinishShowResult && !isHideAllCards && showWinner;
        if (isShouldShowResults && result) {
            useGameStore.getState().setShouldShowResults(true);
        }
    }, [isShowResult, isFinishShowResult, isHideAllCards, showWinner, result]);

    const getWinnerText = (): string => {
        if (!result) {
            return "";
        }

        return WINNER_TEXT_MAP[result.winner] || "";
    };

    return (
        <div className="grid grid-cols-2 gap-[36px] md:gap-[110px] justify-center h-full pointer-events-none">
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

            {isShowResult && isFinishShowResult && !isHideAllCards && showWinner && (
                <div className={`${styles["winner-display"]} ${styles["winner-" + (result?.winner || 'tie')]} ${playResultAnimation ? styles["play-animation"] : ""}`}>
                    <p className={styles["winner-text"]}>{t(getWinnerText())}</p>
                </div>
            )}
        </div>
    );
}
