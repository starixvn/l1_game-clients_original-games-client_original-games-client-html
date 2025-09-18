import React, { useEffect, useState } from "react";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { useGameContext } from "@shared/react-contexts";
import { RoundState } from "@shared/components/game-base/type";
import PlayerBankerResultComponent from "./player-banker-result";
import { EmptyCardIndex } from "../shared/components/card";
import styles from "./baccarat-animations.module.scss";
import { cn } from "@shared/utils";
import dynamic from "next/dynamic";
import { BaccaratResult } from "./types";
import { determineWinner } from "./score-utils";
import { BaccaratResultStorage } from "./result-storage";


interface BaccaratSettlementResultProps {
    className?: string;
}

type AnimationState = "idle" | "shake" | "open" | "close";

const DEFAULT_RESULT: BaccaratResult = {
    banker: {
        card1: { rank: EmptyCardIndex, suit: 0 },
        card2: { rank: EmptyCardIndex, suit: 0 },
        score: 0
    },
    player: {
        card1: { rank: EmptyCardIndex, suit: 0 },
        card2: { rank: EmptyCardIndex, suit: 0 },
        score: 0
    },
    winner: "tie",
};

const labels = ["player", "banker"];

const WinningBalanceEffect = dynamic(() => import("@shared/components/game-components/balance-effect/winning-balance-effect"), {
    ssr: false,
});

const renderCardDisplay = (
    result: BaccaratResult | undefined,
    isShowResult: boolean,
    isAnimationResult: boolean,
    isFinishShowResult: boolean,
    isHideAllCards: boolean
) => {
    return (
        <PlayerBankerResultComponent
            playResultAnimation={isAnimationResult}
            result={result}
            isShowResult={isShowResult}
            language="en"
            isFinishShowResult={isFinishShowResult}
            isHideAllCards={isHideAllCards}
        />
    );
};

const BaccaratSettlementResult: React.FC<BaccaratSettlementResultProps> = ({ className }) => {
    const { durations } = useGameContext();
    const { roundState } = useGameStateContext();
    const gameState = useGameStateContext();
    const last = gameState?.roundData?.last;

    const [isShow, setIsShow] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const [showCards, setShowCards] = useState(false);
    const [result, setResult] = useState<BaccaratResult>(DEFAULT_RESULT);
    const [isLoading, setIsLoading] = useState(true);
    const [isUsingStoredData, setIsUsingStoredData] = useState(false);

    const DELAY = 500; // Same delay as sedie plate

    useEffect(() => {
        // Always try to load from storage first (for refresh recovery)
        const storedResult = BaccaratResultStorage.getStoredResult();
        if (storedResult) {
            setResult(storedResult);
            setIsUsingStoredData(true); // Using stored data
            setIsLoading(false);
            return;
        }

        // No stored data - check if we have fresh WebSocket data
        if (last) {
            // WebSocket provided fresh result data - process and store it
            const gameResult = last as any;
            const resultData = gameResult.result || gameResult;

            // Simple converter for rank/suit format (your socket format)
            const toCard = (input: any) => {
                if (!input || input.rank === undefined) {
                    return { rank: EmptyCardIndex, suit: 0 };
                }
                return { rank: input.rank, suit: input.suit ?? 0 };
            };

            const newResult: BaccaratResult = {
                player: {
                    card1: toCard(resultData.player?.card1),
                    card2: toCard(resultData.player?.card2),
                    card3: resultData.player?.card3 ? toCard(resultData.player.card3) : undefined,
                    score: resultData.player?.score ?? 0
                },
                banker: {
                    card1: toCard(resultData.banker?.card1),
                    card2: toCard(resultData.banker?.card2),
                    card3: resultData.banker?.card3 ? toCard(resultData.banker.card3) : undefined,
                    score: resultData.banker?.score ?? 0
                },
                winner: determineWinner(
                    resultData.player?.score ?? 0,
                    resultData.banker?.score ?? 0
                )
            };

            // Store the result for persistence across page refreshes
            BaccaratResultStorage.storeResult(newResult);

            setResult(newResult);
            setIsUsingStoredData(false); // Fresh data from WebSocket
            setIsLoading(false);
        } else {
            // No stored data and no fresh WebSocket data - use default
            setResult(DEFAULT_RESULT);
            setIsUsingStoredData(false);
            setIsLoading(false);
        }
    }, [last]);

    // Follow sedie plate timing pattern
    useEffect(() => {
        const resetState = () => {
            setIsShow(false);
            setShowCards(false);
            setAnimationState("idle");
        };

        let timeoutDisplayResult;
        let timeout;

        switch (roundState) {
            case RoundState.LockingBet:
                setIsShow(true);
                setShowCards(false);
                setAnimationState("shake");
                break;
            case RoundState.DisplayResult:
                timeoutDisplayResult && clearTimeout(timeoutDisplayResult);

                if (isUsingStoredData) {
                    // Skip animation and show result immediately when using stored data
                    setIsShow(true);
                    setShowCards(true);
                    setAnimationState("idle");
                    // No timeout needed - keep the result visible
                } else {
                    // Normal animation flow for fresh WebSocket data
                    timeoutDisplayResult = setTimeout(() => {
                        setIsShow(true);
                        setAnimationState("idle");
                        setShowCards(true);
                        setAnimationState("open");
                        // Ensure animation lasts at least 6 seconds to cover all card timings (CARD_6 at 5000ms + buffer)
                        const animationDuration = Math.max(durations.showResult * 1000, 6000);
                        timeout = setTimeout(() => {
                            resetState();
                        }, animationDuration);
                    }, DELAY);
                }
                break;
            case RoundState.BeforePlaceBet:
            case RoundState.InRound:
                // Clear stored result when starting a new round
                BaccaratResultStorage.clearStoredResult();
                setIsUsingStoredData(false); // Reset flag for new round
                resetState();
                break;
            default:
                break;
        }

        return () => {
            timeout && clearTimeout(timeout);
            timeoutDisplayResult && clearTimeout(timeoutDisplayResult);
        };
    }, [roundState, durations, isUsingStoredData]);

    if (isLoading) {
        return (
            <div className={`${styles["settlement-container"]} ${className || ""}`}>
                <div className={styles.loading}>Loading game results...</div>
            </div>
        );
    }

    const classAnimation = styles[`baccarat-result-${animationState}`];

    return (
        <div
            className={cn(`${styles["baccarat-result-object"]} p-2 h-[94px] w-full mb-1 z-[var(--result-animation-index)] content-center`)}
            style={
                {
                    "--shake-duration": "2000ms",
                    "--open-duration": "1000ms",
                    "--close-duration": "1000ms",
                } as React.CSSProperties
            }
        >
            <WinningBalanceEffect />
            <div
                className={cn(
                    `${styles["baccarat-result-container"]} ${styles["baccarat-result-container-" + animationState]}`,
                    "flex justify-center w-full"
                )}
            >
                {isShow ? (
                    <div className={cn(`${styles["baccarat-result-display"]} ${classAnimation}`, "w-full")}>
                        {renderCardDisplay(result, showCards, animationState === "open", true, !showCards)}
                    </div>
                ) : (
                    <div className="flex justify-between w-full">
                        {labels.map((label) => (
                            <div key={label} className="text-[rgba(255,255,255,0.16)] text-xl font-semibold px-6 uppercase">
                                {label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BaccaratSettlementResult;
