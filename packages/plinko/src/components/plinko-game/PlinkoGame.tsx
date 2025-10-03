import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { BallLayout, SimplifiedCanvasBallLayoutRef, WinMessage } from "../../features/game/components";
import { LoggerControls } from "../../features/ui/components";
import { GameState, BetRecord } from "../../shared/types/index";
import { logger } from "../../services/logger";
import { useBettingStore, useGameStore } from "@shared/stores";
import { useClientSeedPF } from "@shared/react-hooks";
import { useGameContext } from "@shared/react-contexts";
import { messageEventType } from "@shared/components/game-base/handlers";
import { usePlinkoGameStore } from "../../shared/stores/plinko-game-store";
import { getOddsForMode } from "../../game-odds-config";

const defaultGameState: GameState = {
    currentWin: 106,
    soundEnabled: true,
    balance: 10000, // Default balance for demo
    bets: [
        { player: "A***nnie", betAmount: 100, payout: 100 },
        { player: "A***nnie", betAmount: 100, payout: 4444.3 },
        { player: "john_smith92", betAmount: 100, payout: 100 },
        { player: "john_smith92", betAmount: 100, payout: 4444.3 },
        { player: "john_smith92", betAmount: 100, payout: 100 },
        { player: "john_smith92", betAmount: 100, payout: 4444.99 },
        { player: "john_smith92", betAmount: 100, payout: 100 },
        { player: "john_smith92", betAmount: 100, payout: 4444.3 },
        { player: "john_smith92", betAmount: 100, payout: 100 },
        { player: "john_smith92", betAmount: 100, payout: 100 },
    ],
    betsTab: "All",
};

interface PlinkoGameProps {
    isGameInitialized?: boolean;
}

const PlinkoGame: React.FC<PlinkoGameProps> = ({ isGameInitialized = false }) => {
    const [gameState, setGameState] = useState<GameState>(defaultGameState);
    const [winMessage, setWinMessage] = useState<{
        isVisible: boolean;
        multiplier?: number;
        betAmount?: number;
        message?: string;
    }>({ isVisible: false });
    const [isAutoBetRunning, setIsAutoBetRunning] = useState(false);
    const [localGameInitialized, setLocalGameInitialized] = useState(isGameInitialized);
    const ballLayoutRef = useRef<SimplifiedCanvasBallLayoutRef>(null);
    const autoBetHandlerRef = useRef(null);

    // Shared game context and betting store
    const { ownBets } = useBettingStore();
    const { socket } = useGameStore();
    const { gameMode, numberOfRows } = usePlinkoGameStore();

    // Use shared PF system for clientSeed (like sedie-multiplayer)
    const { clientSeed } = useClientSeedPF();
    const { gameMessageHandler } = useGameContext();

    const roundHistory = useGameStore((state) => state.roundHistory);

    console.log("ZEPHYR LOG - PLINKO GAME - roundHistory::: ", roundHistory);

    // Register Plinko-specific handlers when component mounts
    useEffect(() => {
        if (!gameMessageHandler) {
            return;
        }

        // Register handler for SIGNED_IN to send inGame message
        const signedInHandlerId = gameMessageHandler.register(messageEventType.SIGNED_IN, (action) => {
            if (socket?.connected) {
                // Plinko service expects inGame without parameters (based on integration tests)
                socket.emit("inGame");
            }
        });

        // Register handler for gameConfigs response to mark game as initialized
        const gameConfigsHandlerId = gameMessageHandler.register("gameConfigs", (action) => {
            setLocalGameInitialized(true);
        });

        // Register handler for endBet message (contains the finish object with result path)
        const endBetHandlerId = gameMessageHandler.register("endBet", (action) => {
            console.log("🎯 [PLINKO GAME] ENDBET HANDLER CALLED - Bet result received, spawning ball with server path", action);
            console.log("🎯 [PLINKO GAME] Ball layout ref status:", {
                exists: !!ballLayoutRef.current,
                isReady: ballLayoutRef.current?.isReady?.(),
                type: typeof ballLayoutRef.current,
                current: ballLayoutRef.current,
            });
            logger.info("🎯 [PLINKO GAME] ENDBET HANDLER CALLED - Bet result received, spawning ball with server path", action);

            if (action?.finish?.result) {
                const resultPath = action.finish.result;
                const slotIndex = action.finish.settlementResult?.slotIndex || 4;
                const multiplier = action.finish.settlementResult?.multiplier || 1;
                const betAmount = action.finish.amount || action.endBet || 100;
                const winAmount = action.finish.winAmount;

                console.log("🎯 [PLINKO GAME] Server result path details:", {
                    resultPath,
                    pathLength: resultPath.length,
                    expectedSlot: slotIndex,
                    pathSum: resultPath.reduce((sum, val) => sum + val, 0), // Count of 1s
                    pathBreakdown: resultPath.join(""),
                });

                logger.info("🎯 [PLINKO GAME] Spawning ball with server result path", {
                    resultPath,
                    pathLength: resultPath.length,
                    slotIndex,
                    multiplier,
                    betAmount,
                    winAmount,
                });

                // Function to attempt spawning with retry logic
                const attemptSpawnBall = (retryCount = 0) => {
                    const maxRetries = 10; // Try for up to ~1 second (10 * 100ms)

                    if (ballLayoutRef.current?.spawnBallWithPath) {
                        try {
                            ballLayoutRef.current.spawnBallWithPath(betAmount, resultPath, slotIndex, multiplier);
                            logger.info("✅ [PLINKO GAME] Ball spawned successfully with server path");
                            return true; // Success
                        } catch (error) {
                            logger.error("❌ [PLINKO GAME] Error spawning ball", { error });
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

        // Check if socket is already connected and signed in, send inGame if needed
        if (socket?.connected) {
            socket.emit("inGame");
        }

        return () => {
            // Cleanup handlers when component unmounts
            if (gameMessageHandler.removeHandler) {
                gameMessageHandler.removeHandler(signedInHandlerId);
                gameMessageHandler.removeHandler(gameConfigsHandlerId);
                gameMessageHandler.removeHandler(endBetHandlerId);
            }
        };
    }, [gameMessageHandler, socket]);

    // Update local state when prop changes
    useEffect(() => {
        setLocalGameInitialized(isGameInitialized);
    }, [isGameInitialized]);

    // Get multipliers from odds config based on current game mode and rows
    const payoutMultipliers = useMemo(() => {
        try {
            return getOddsForMode(gameMode, numberOfRows);
        } catch (error) {
            console.warn('Failed to get odds for mode, using fallback multipliers', { gameMode, numberOfRows, error });
            // Fallback multipliers if config is invalid
            return [0.5, 0.2, 1.4, 190, 1.6, 1.8, 190, 1.5, 1.6];
        }
    }, [gameMode, numberOfRows]);

    const [payoutProbabilities, setPayoutProbabilities] = useState<number[]>([]);

    // Update probabilities based on multipliers
    useEffect(() => {
        const defaultProbabilities = payoutMultipliers.map(() => 1 / payoutMultipliers.length);
        setPayoutProbabilities(defaultProbabilities);
    }, [payoutMultipliers]);

    // Connection status from socket (reactive to socket changes)
    const isConnected = useMemo(() => socket?.connected ?? false, [socket?.connected]);
    const isAuthenticated = true; // Assume authenticated since we're in the game
    const isBetting = false; // Plinko manages its own betting state

    // Send bets directly with clientSeed (compatible with PF system)
    const placeBet = (amount: number, gameMode: number, rows: number) => {
        // Immediately spawn ball for visual feedback
        if (ballLayoutRef.current?.isReady?.()) {
            console.log("🎯 [PLINKO GAME] Placing bet and spawning ball immediately", { amount, gameMode, rows });
            ballLayoutRef.current.spawnBall(amount);
        } else {
            console.warn("🎯 [PLINKO GAME] Ball layout not ready for immediate spawn", {
                hasRef: !!ballLayoutRef.current,
                isReady: ballLayoutRef.current?.isReady?.(),
            });
        }

        // Send bet to server for validation and potential server-guided path
        if (socket?.connected) {
            const betData = {
                amount,
                gameMode,
                numberOfRows: rows,
                clientSeed,
            };
            socket.emit("bet", betData);
        }
    };

    const clearBetResult = () => {
        // Plinko handles clearing results internally
    };

    // Socket connection is now handled by shared InitSocketIO in page.tsx

    // Handle bet results for auto bet - disabled since lastBetResult is not provided by shared system
    // Plinko handles bet results through its own internal logic

    // Update multipliers from service configs - disabled since gameConfigs is not provided by shared system
    // Plinko uses hardcoded multipliers for now

    // Handle ball collision with multiplier slots
    const handleBallHit = (multiplier: number, betValue: number) => {
        const payout = betValue * multiplier;
        const message = `🎯 Ball ($${betValue}) hit ${multiplier}x slot! Payout: $${payout.toFixed(2)}`;

        setWinMessage({
            isVisible: true,
            multiplier,
            betAmount: betValue,
            message,
        });

        // Update game state with win amount
        setGameState((prev) => ({
            ...prev,
            currentWin: payout,
        }));
    };

    // Handle win message animation end
    const handleWinMessageEnd = () => {
        setWinMessage((prev) => ({ ...prev, isVisible: false }));
        clearBetResult(); // Clear the bet result after win message
    };

    // Handle service bet results - disabled since lastBetResult is not provided by shared system
    // Plinko handles bet results through its own internal logic

    // Convert service player bets to UI format
    const convertedBets: BetRecord[] = useMemo(
        () =>
            Object.entries(ownBets).map(([choice, amount]) => ({
                player: "You", // Since ownBets is for the current player
                betAmount: amount,
                payout: 0, // Shared system doesn't provide payout info
            })),
        [ownBets]
    );

    const updateGameState = (updates: Partial<GameState>) => {
        setGameState((prev) => ({ ...prev, ...updates }));
    };

    const handleStopAutoBet = useCallback(() => {
        // Stop the AutoBetHandler
        autoBetHandlerRef.current?.stop();
        setIsAutoBetRunning(false);
    }, []);

    // Determine disabled state and message
    const isBetDisabled = !localGameInitialized || !isConnected || !isAuthenticated;
    const disabledMessage = !isConnected
        ? "(Connecting...)"
        : !isAuthenticated
            ? "(Authenticating...)"
            : !localGameInitialized
                ? "(Initializing...)"
                : "";

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
                    <WinMessage
                        isVisible={winMessage.isVisible}
                        message={winMessage.message}
                        multiplier={winMessage.multiplier}
                        betAmount={winMessage.betAmount}
                        onAnimationEnd={handleWinMessageEnd}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlinkoGame;
