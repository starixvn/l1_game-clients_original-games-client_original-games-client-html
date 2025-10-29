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
    isHideAllCards: boolean;
    isGetResult?: boolean;
}

export default function PlayerBankerResult(props: PlayerBankerResultProps) {
    const { playResultAnimation, result, isShowResult, isHideAllCards, isGetResult = false } = props;
    const [showWinner, setShowWinner] = useState(false);
    const [playerAnimationComplete, setPlayerAnimationComplete] = useState(false);
    const [bankerAnimationComplete, setBankerAnimationComplete] = useState(false);

    const playerCards = useMemo(() => (result ? GetPlayerCardsResult(result) : []), [result]);
    const bankerCards = useMemo(() => (result ? GetBankerCardsResult(result) : []), [result]);

    const { t } = useTranslator([ResourceTypes.BACCARAT_MULTIPLAYER]);

    // Helper function to check if result contains valid game data (not default empty result)
    const hasValidResult = (result: BaccaratResult | undefined): boolean => {
        if (!result) {
            return false;
        }

        // Check if this is a default/empty result by looking at card ranks (-1 is EmptyCardIndex)
        const playerCard1Valid = result.player.card1.rank !== -1;
        const bankerCard1Valid = result.banker.card1.rank !== -1;

        return playerCard1Valid && bankerCard1Valid;
    };

    // Reset animation states when show result changes or when using invalid/dummy data
    useEffect(() => {
        if (!isShowResult || !hasValidResult(result)) {
            setShowWinner(false);
            setPlayerAnimationComplete(false);
            setBankerAnimationComplete(false);
        }
    }, [isShowResult, result]);

    // Handle historical data case - show winner immediately
    useEffect(() => {
        if (isGetResult && isShowResult && result && !showWinner && hasValidResult(result)) {
            // For historical/reload data, show winner immediately
            setShowWinner(true);
        }
    }, [isGetResult, isShowResult, result, showWinner]);

    // Show winner when both player and banker animations are complete (live game)
    useEffect(() => {
        if (
            !isGetResult &&
            playResultAnimation &&
            isShowResult &&
            playerAnimationComplete &&
            bankerAnimationComplete &&
            !showWinner &&
            hasValidResult(result)
        ) {
            // Add a small delay for better visual effect
            const winnerTimer = setTimeout(() => {
                setShowWinner(true);
            }, 300);

            return () => clearTimeout(winnerTimer);
        }
        return undefined;
    }, [isGetResult, playResultAnimation, isShowResult, playerAnimationComplete, bankerAnimationComplete, showWinner, result]);

    const handlePlayerAnimationComplete = useCallback(() => {
        setPlayerAnimationComplete(true);
    }, []);

    const handleBankerAnimationComplete = useCallback(() => {
        setBankerAnimationComplete(true);
    }, []);

    const getWinnerText = (): string => {
        if (!result) {
            return "";
        }

        return WINNER_TEXT_MAP[result.winner] || "";
    };

    // Don't show cards during transitions when using dummy/default data
    const shouldShowCards = isShowResult && hasValidResult(result);
    const shouldHideCards = isHideAllCards || (isShowResult && !hasValidResult(result));

    const isShouldShowResult = useCallback((showWinner: boolean, result: BaccaratResult | undefined) => {
        return showWinner && result && hasValidResult(result);
    }, []);

    useEffect(() => {
        if (isShouldShowResult(showWinner, result)) {
            useGameStore.getState().setShouldShowResults(true);
        }
    }, [showWinner, result, isShouldShowResult]);

    return (
        <div className="grid grid-cols-2 gap-x-[36px] md:gap-x-[110px] justify-center h-full pointer-events-none">
            <CardSection
                cards={playerCards}
                label="Player"
                type="player"
                playResultAnimation={playResultAnimation}
                isShowResult={shouldShowCards}
                isHideAllCards={shouldHideCards}
                isGetResult={isGetResult}
                onAnimationComplete={!isGetResult ? handlePlayerAnimationComplete : undefined}
            />

            <CardSection
                cards={bankerCards}
                label="Banker"
                type="banker"
                playResultAnimation={playResultAnimation}
                isShowResult={shouldShowCards}
                isHideAllCards={shouldHideCards}
                isGetResult={isGetResult}
                onAnimationComplete={!isGetResult ? handleBankerAnimationComplete : undefined}
            />

            {isShouldShowResult(showWinner, result) && (
                <div className="col-span-2 flex items-center justify-center relative top-[49px]">
                    <div className={`${styles["winner-display"]} ${styles["winner-" + result.winner]}`}>
                        <p className={styles["winner-text"]}>{t(getWinnerText())}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
