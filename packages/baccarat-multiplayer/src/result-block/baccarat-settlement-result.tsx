import React, { useEffect, useState } from "react";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { useGameContext } from "@shared/react-contexts";
import { RoundState } from "@shared/components/game-base/type";
import { CardDisplay } from "./card-display";
import { EmptyCardIndex } from "../shared/components/card";
import styles from "./baccarat-animations.module.scss";
import { cn } from "@shared/utils";

interface CardOrder {
    order: number;
    value: number;
    type: "player" | "banker";
    accumulatedScore: number;
    playerHasThirdCard?: boolean;
}

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

interface BaccaratSettlementResultProps {
    className?: string;
}

type AnimationState = "idle" | "shake" | "open" | "close";

const DEFAULT_RESULT: Result = {
    banker: {
        card1: { card: EmptyCardIndex, type: 0 },
        card2: { card: EmptyCardIndex, type: 0 },
    },
    player: {
        card1: { card: EmptyCardIndex, type: 1 },
        card2: { card: EmptyCardIndex, type: 1 },
    },
    winner: "tie",
};

const labels = ["player", "banker"];

const renderCardDisplay = (
    result: Result,
    isShowResult: boolean,
    isAnimationResult: boolean,
    isFinishShowResult: boolean,
    isHideAllCards: boolean
) => {
    const language = "en"; // Default language
    if (!result || isHideAllCards) {
        return (
            <CardDisplay
                isFinishShowResult={isFinishShowResult}
                result={DEFAULT_RESULT}
                isAnimationResult={false}
                isShowResult={false}
                language={language}
                isHideAllCards={isHideAllCards}
            />
        );
    }

    return (
        <CardDisplay
            isFinishShowResult={isFinishShowResult}
            result={result}
            isAnimationResult={isAnimationResult}
            isShowResult={isShowResult}
            language={language}
            isHideAllCards={isHideAllCards}
        />
    );
};

const BaccaratSettlementResult: React.FC<BaccaratSettlementResultProps> = ({ className }) => {
    const { durations } = useGameContext();
    const { roundState } = useGameStateContext();
    const gameState = useGameStateContext();
    const last = (gameState as any)?.last;
    const [isShow, setIsShow] = useState(false);
    const [animationState, setAnimationState] = useState<AnimationState>("idle");
    const [showCards, setShowCards] = useState(false);
    const [result, setResult] = useState<Result>(DEFAULT_RESULT);
    const [isLoading, setIsLoading] = useState(true);

    const DELAY = 500; // Same delay as sedie plate

    useEffect(() => {
        // Get result from game state
        if (last) {
            const gameResult = last as any;
            console.log("[BaccaratSettlementResult] gameState.last =", gameResult);

            // Handle both normalized shape (arrays) and nested service shape (card1/card2/card3)
            const resultData = gameResult.result || gameResult;
            const settlementData = gameResult.settlementResult || {};

            const toCard = (input: any, defaultType: number) => {
                if (!input) return { card: EmptyCardIndex, type: defaultType };
                if (typeof input === "number") return { card: input, type: defaultType };
                if (typeof input === "object" && typeof input.card === "number") {
                    return { card: input.card, type: input.type !== undefined ? input.type : defaultType };
                }
                return { card: EmptyCardIndex, type: defaultType };
            };

            const playerSource = resultData.player;
            const bankerSource = resultData.banker;
            const sequenceCards: any[] = Array.isArray(resultData.cards) ? resultData.cards : [];

            let playerCardsArr: any[] = Array.isArray(playerSource)
                ? playerSource
                : [playerSource?.card1, playerSource?.card2, playerSource?.card3];

            let bankerCardsArr: any[] = Array.isArray(bankerSource)
                ? bankerSource
                : [bankerSource?.card1, bankerSource?.card2, bankerSource?.card3];

            // Fallback from sequence array when missing
            // sequence: [P1, B1, P2, B2, P3?, B3?]
            const s = sequenceCards;
            if (!playerCardsArr[0] && s[0]) playerCardsArr[0] = s[0];
            if (!bankerCardsArr[0] && s[1]) bankerCardsArr[0] = s[1];
            if (!playerCardsArr[1] && s[2]) playerCardsArr[1] = s[2];
            if (!bankerCardsArr[1] && s[3]) bankerCardsArr[1] = s[3];
            if (!playerCardsArr[2] && s[4]) playerCardsArr[2] = s[4];
            if (!bankerCardsArr[2] && s[5]) bankerCardsArr[2] = s[5];

            // Filter undefined/null
            playerCardsArr = playerCardsArr.filter((c) => c !== undefined && c !== null);
            bankerCardsArr = bankerCardsArr.filter((c) => c !== undefined && c !== null);

            console.log("[BaccaratSettlementResult] parsed arrays:", { playerCardsArr, bankerCardsArr });

            const newResult: Result = {
                player: {
                    card1: toCard(playerCardsArr[0], 1),
                    card2: toCard(playerCardsArr[1], 1),
                    card3: playerCardsArr[2] !== undefined ? toCard(playerCardsArr[2], 1) : undefined,
                },
                banker: {
                    card1: toCard(bankerCardsArr[0], 0),
                    card2: toCard(bankerCardsArr[1], 0),
                    card3: bankerCardsArr[2] !== undefined ? toCard(bankerCardsArr[2], 0) : undefined,
                },
                winner: (() => {
                    if (settlementData.banker) return "banker";
                    if (settlementData.player) return "player";
                    if (gameResult.winner) return gameResult.winner as "player" | "banker" | "tie";
                    return "tie";
                })(),
                playerPair: !!settlementData.playerPair,
                bankerPair: !!settlementData.bankerPair,
                natural: !!settlementData.natural,
            };

            console.log("Baccarat Result Data:", {
                originalData: gameResult,
                parsedResult: newResult,
                playerCards: [newResult.player.card1, newResult.player.card2, newResult.player.card3],
                bankerCards: [newResult.banker.card1, newResult.banker.card2, newResult.banker.card3],
            });

            setResult(newResult);
            setIsLoading(false);
        } else {
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
                timeoutDisplayResult = setTimeout(() => {
                    setIsShow(true);
                    setAnimationState("idle");
                    setShowCards(true);
                    setAnimationState("open");
                    timeout = setTimeout(() => {
                        resetState();
                    }, durations.showResult * 1000);
                }, DELAY);
                break;
            case RoundState.BeforePlaceBet:
            case RoundState.InRound:
                resetState();
                break;
            default:
                break;
        }

        return () => {
            timeout && clearTimeout(timeout);
            timeoutDisplayResult && clearTimeout(timeoutDisplayResult);
        };
    }, [roundState, durations]);

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
