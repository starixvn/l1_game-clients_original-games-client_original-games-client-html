import React, { useEffect, useState } from "react";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { useGameContext } from "@shared/react-contexts";
import { useTranslator } from "@shared/react-hooks";
import { RoundState } from "@shared/components/game-base/type";
import PlayerBankerResult from "./player-banker-result";
import { EmptyCardIndex } from "../shared/components/card";
import dynamic from "next/dynamic";
import { BaccaratResult } from "./types";
import { determineWinner } from "./score-utils";


interface BaccaratSettlementResultProps {
    className?: string;
}

type AnimationState = "idle" | "open";

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

const WinningBalanceEffect = dynamic(() => import("@shared/components/game-components/balance-effect/winning-balance-effect"), {
    ssr: false,
});

const renderCardDisplay = (
    result: BaccaratResult | undefined,
    isShowResult: boolean,
    isAnimationResult: boolean,
    isFinishShowResult: boolean,
    isHideAllCards: boolean,
    roundState: RoundState,
    animationState: AnimationState,
    isUsingRoundHistoryData: boolean
) => {
    // During DisplayResult initial phase, show back cards only if not using historical data
    const isDisplayResultInitial = roundState === RoundState.DisplayResult && animationState === "idle" && !isUsingRoundHistoryData;

    if (roundState === RoundState.LockingBet || isDisplayResultInitial) {
        return (
            <PlayerBankerResult
                playResultAnimation={false}
                result={DEFAULT_RESULT}
                isShowResult={false}  // Show back cards
                language="en"
                isFinishShowResult={false}
                isHideAllCards={false}
                isGetResult={true}
            />
        );
    }

    if ([RoundState.BeforePlaceBet, RoundState.InRound].includes(roundState)) {
        // BeforePlaceBet & InRound: Show cards with entrance animation
        return (
            <PlayerBankerResult
                playResultAnimation={false}
                result={DEFAULT_RESULT}
                isShowResult={false}
                language="en"
                isFinishShowResult={false}
                isHideAllCards={false}
                isGetResult={false}
            />
        );
    }

    // During DisplayResult (with animation or historical data), show actual results
    return (
        <PlayerBankerResult
            playResultAnimation={isAnimationResult}
            result={result}
            isShowResult={isShowResult}
            language="en"
            isFinishShowResult={isFinishShowResult}
            isHideAllCards={isHideAllCards}
            isGetResult={isUsingRoundHistoryData}
        />
    );
};

const BaccaratSettlementResult: React.FC<BaccaratSettlementResultProps> = ({ className }) => {
    const { durations } = useGameContext();
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace || ""]);
    const { roundState } = useGameStateContext();
    const gameState = useGameStateContext();
    const last = gameState?.roundData?.last;

    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const [showCards, setShowCards] = useState(false);
    const [result, setResult] = useState<BaccaratResult>(DEFAULT_RESULT);
    const [isUsingRoundHistoryData, setIsUsingRoundHistoryData] = useState(false);

    const DELAY = 500; // Same delay as sedie plate

    // Helper function to process result data into BaccaratResult format
    const processResultData = (rawResult: any): BaccaratResult | null => {
        if (!rawResult) {
            return null;
        }

        const resultData = rawResult.result || rawResult;

        // Simple converter for rank/suit format (your socket format)
        const toCard = (input: any) => {
            if (!input || input.rank === undefined) {
                return { rank: EmptyCardIndex, suit: 0 };
            }
            return { rank: input.rank, suit: input.suit ?? 0 };
        };

        return {
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
    };

    useEffect(() => {
        let resultData: BaccaratResult | null = null;
        let isUsingHistorical = false;

        // Prioritize fresh WebSocket data over historical data
        if (last) {
            // Fresh WebSocket result data received - always use this for animation
            resultData = processResultData(last);
            // isUsingHistorical remains false (default)
        } else if (gameState?.roundHistory && gameState.roundHistory.length > 0) {
            // No fresh data - fallback to historical data (page load, no active result)
            const mostRecentRound = gameState.roundHistory[0] as any;
            resultData = processResultData(mostRecentRound);
            isUsingHistorical = true;
        }

        if (resultData) {
            setResult(resultData);

            // Only update the historical flag if we're actually switching from fresh to historical
            // If we were using historical data but now have fresh data, switch to fresh
            if (!isUsingHistorical && isUsingRoundHistoryData) {
                // We were using historical data but now have fresh data - enable animation
                setIsUsingRoundHistoryData(false);
            } else {
                setIsUsingRoundHistoryData(isUsingHistorical);
            }
        } else {
            // No data available - use default
            setResult(DEFAULT_RESULT);
            setIsUsingRoundHistoryData(false);
        }
    }, [last, gameState?.roundHistory]);

    // Handle transition from historical to fresh data
    useEffect(() => {
        if (last && isUsingRoundHistoryData) {
            // We received fresh WebSocket data while using historical data
            // This happens when you refresh during a round and then receive a finish event
            setIsUsingRoundHistoryData(false);

            // Reset animation states to prepare for fresh animation
            setShowCards(false);
            setAnimationState("idle");
        }
    }, [last, isUsingRoundHistoryData]);

    // Handle display result animation timing - only needed for DisplayResult state
    useEffect(() => {
        let timeoutDisplayResult;

        if (roundState === RoundState.DisplayResult) {
            timeoutDisplayResult && clearTimeout(timeoutDisplayResult);

            if (isUsingRoundHistoryData) {
                // Show result immediately when using historical data
                setShowCards(true);
                setAnimationState("idle");
            } else {
                // Keep back cards visible initially, then flip to results after delay
                setShowCards(true);
                setAnimationState("idle");
                timeoutDisplayResult = setTimeout(() => {
                    setAnimationState("open");
                }, DELAY);
            }
        } else {
            // Reset for non-DisplayResult states
            setShowCards(false);
            setAnimationState("idle");
            if (roundState === RoundState.BeforePlaceBet) {
                setIsUsingRoundHistoryData(false); // Reset flag for new round
            }
        }

        return () => {
            timeoutDisplayResult && clearTimeout(timeoutDisplayResult);
        };
    }, [roundState, isUsingRoundHistoryData]);

    return (
        <div
            className="h-[64px] w-full mt-[26px] mb-[19px] z-[var(--result-animation-index)]"
        >
            {roundState === RoundState.DisplayResult && 
                <div className="relative top-[-70px]">
                    <WinningBalanceEffect />
                </div>
            }
            <div className="flex justify-center w-full h-full">
                <div className="w-full">
                    {renderCardDisplay(result, showCards, animationState === "open", true, !showCards, roundState, animationState, isUsingRoundHistoryData)}
                </div>
            </div>
        </div>
    );
};

export default BaccaratSettlementResult;
