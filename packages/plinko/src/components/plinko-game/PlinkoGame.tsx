import React, { useState, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/shallow";
import { BallLayout, SimplifiedCanvasBallLayoutRef } from "../../features/game/components";
import { LoggerControls } from "../../features/ui/components";
import { logger } from "../../services/logger";
import { useGameStore } from "@shared/stores";
import { useGameContext } from "@shared/react-contexts";
import { usePlinkoGameStore } from "../../shared/stores/plinko-game-store";
import RoundMultiplierHistory from "./round-multiplier-history/round-multiplier-history";

const WinningAmountEffect = dynamic(() => import("./winning-amount-effect"), { ssr: false });

const PlinkoGame = () => {
    const [payoutProbabilities, setPayoutProbabilities] = useState<number[]>([]);
    const ballLayoutRef = useRef<SimplifiedCanvasBallLayoutRef>(null);

    // Shared game context and betting store
    const { endBet, socket, gameConfigs } = useGameStore(
        useShallow((state) => ({
            endBet: state.endBet,
            socket: state.socket,
            gameConfigs: state.gameConfigs,
        }))
    );
    const { gameMode, numberOfRows } = usePlinkoGameStore();

    // Use shared PF system for clientSeed (like sedie-multiplayer)
    const { gameMessageHandler } = useGameContext();
    // Register Plinko-specific handlers when component mounts
    useEffect(() => {
        if (!gameMessageHandler) {
            return undefined;
        }

        // Register handler for endBet message (contains the finish object with result path)
        const endBetHandlerId = gameMessageHandler.register("endBet", (action) => {
            logger.info("🎯 [PLINKO GAME] ENDBET HANDLER CALLED - Bet result received, spawning ball with server path", action);

            if (action?.finish?.result) {
                const resultPath = action.finish.result;
                const slotIndex = action.finish.settlementResult?.slotIndex || 4;
                const multiplier = action.finish.settlementResult?.multiplier || 1;
                const betAmount = action.finish.amount || action.endBet || 100;
                const winAmount = action.finish.winAmount;
                const countOfOnes = resultPath.filter((p: number) => p === 1).length;

                console.log("🎯 [PLINKO GAME] Server result path details - FULL TRACE:", {
                    resultPath,
                    pathLength: resultPath.length,
                    expectedSlot: slotIndex,
                    countOfOnes,
                    slotIndexMatch: countOfOnes === slotIndex,
                    pathSum: resultPath.reduce((sum: number, val: number) => sum + val, 0), // Count of 1s
                    pathBreakdown: resultPath.join(""),
                    multiplier,
                    betAmount,
                    winAmount,
                    fullAction: action,
                });

                logger.info("🎯 [PLINKO GAME] Spawning ball with server result path - SERVICE TO COMPONENT", {
                    resultPath,
                    pathLength: resultPath.length,
                    slotIndex,
                    multiplier,
                    betAmount,
                    winAmount,
                    countOfOnes,
                    validation: {
                        pathLengthMatchesRows: resultPath.length === 9, // Assuming 9 rows
                        slotIndexMatchesCount: countOfOnes === slotIndex,
                        multiplierValid: multiplier > 0,
                        betAmountValid: betAmount > 0,
                    },
                });

                // Function to attempt spawning with retry logic
                const attemptSpawnBall = (retryCount = 0) => {
                    const maxRetries = 10; // Try for up to ~1 second (10 * 100ms)

                    if (ballLayoutRef.current?.spawnBallWithPath) {
                        try {
                            console.log("🚀 [PLINKO GAME] Calling spawnBallWithPath with data:", {
                                betAmount,
                                resultPath,
                                slotIndex,
                                multiplier,
                                countOfOnes,
                                ballLayoutReady: ballLayoutRef.current?.isReady?.(),
                            });

                            ballLayoutRef.current.spawnBallWithPath(betAmount, resultPath, slotIndex, multiplier);

                            logger.info("✅ [PLINKO GAME] Ball spawned successfully with server path", {
                                betAmount,
                                pathLength: resultPath.length,
                                slotIndex,
                                multiplier,
                                countOfOnes,
                            });
                            return true; // Success
                        } catch (error) {
                            logger.error("❌ [PLINKO GAME] Error spawning ball", {
                                error,
                                betAmount,
                                resultPath,
                                slotIndex,
                                multiplier,
                            });
                            return false; // Failed
                        }
                    } else {
                        if (retryCount < maxRetries) {
                            // Retry after 100ms
                            setTimeout(() => attemptSpawnBall(retryCount + 1), 100);
                        } else {
                            logger.error("❌ [PLINKO GAME] ballLayoutRef not available after max retries for spawning");
                        }
                        return false; // Still not ready, will retry
                    }
                };

                // Start attempting to spawn the ball
                attemptSpawnBall();
            } else {
                logger.warn("⚠️ [PLINKO GAME] EndBet message received but no result path found", action);
            }
        });

        return () => {
            // Cleanup handlers when component unmounts
            if (gameMessageHandler.removeHandler) {
                gameMessageHandler.removeHandler(endBetHandlerId);
            }
        };
    }, [gameMessageHandler, socket]);

    // Get multipliers from odds config based on current game mode and rows
    const payoutMultipliers = useMemo(() => {
        try {
            return gameConfigs?.odds?.[gameMode][numberOfRows] as unknown as number[];
        } catch (error) {
            console.warn("Failed to get odds for mode, using fallback multipliers", { gameMode, numberOfRows, error });
            // Fallback multipliers if config is invalid
            return [];
        }
    }, [gameMode, numberOfRows, gameConfigs]);

    // Update probabilities based on multipliers
    useEffect(() => {
        if (payoutMultipliers && payoutMultipliers.length > 0) {
            const defaultProbabilities = payoutMultipliers.map(() => 1 / payoutMultipliers.length);
            setPayoutProbabilities(defaultProbabilities);
        }
    }, [payoutMultipliers]);

    useEffect(() => {
        if (endBet !== -1) {
            useGameStore.getState().resetBettingInfo();
        }
    }, [endBet]);

    // Socket connection is now handled by shared InitSocketIO in page.tsx

    // Handle bet results for auto bet - disabled since lastBetResult is not provided by shared system
    // Plinko handles bet results through its own internal logic

    // Update multipliers from service configs - disabled since gameConfigs is not provided by shared system
    // Plinko uses hardcoded multipliers for now

    // Handle ball collision with multiplier slots
    const handleBallHit = (multiplier: number, betValue: number) => {
        //nothing
    };

    return (
        <div className="">
            {/* Logger Controls - positioned outside game-info to avoid clipping */}
            <div
                style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    right: "10px",
                    zIndex: 10000,
                }}
            >
                <LoggerControls className="w-full" />
            </div>

            <div className="game-info">
                <div className="frame-game">
                    <div className="frame-2">
                        <div className="game-layout-container">
                            <RoundMultiplierHistory />
                            <div className="ball-layout-wrapper">
                                <BallLayout
                                    ref={ballLayoutRef}
                                    multipliers={payoutMultipliers}
                                    probabilities={payoutProbabilities}
                                    onBallHit={handleBallHit}
                                />
                            </div>

                            {/* <PayoutsDisplay
                                multipliers={payoutMultipliers}
                                probabilities={payoutProbabilities}
                                betAmount={gameState.betAmount}
                                rows={gameState.rows}
                                className="payouts-below-ball-layout"
                            /> */}

                            {/* Temporary bet button for testing */}
                            {/* <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 100 }}>
                                <button
                                    onClick={() => placeBet(100, 1, 9)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    Place Bet ($100)
                                </button>
                            </div> */}
                        </div>
                    </div>
                    <WinningAmountEffect />
                </div>
            </div>
        </div>
    );
};

export default PlinkoGame;
