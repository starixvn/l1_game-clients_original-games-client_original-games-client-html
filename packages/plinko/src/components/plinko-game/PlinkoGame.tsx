import React, { useState, useRef, useMemo, useEffect } from "react";
import { toast } from 'react-toastify';
import { BallLayout, LayeredCanvasBallLayoutRef, WinMessage, PayoutsDisplay } from "../../features/game/components";
import { performDirectSpawnTest } from "../../features/game/components/ball/ball-test-utils";
import { LoggerControls } from "../../features/ui/components";
import { AutoBetPanel, BetsTable } from "../../features/betting/components";
import { GameState, BetRecord } from "../../shared/types/index";
import { logger } from "../../services/logger";
import { useBettingStore, useGameStore } from "@shared/stores";
import { useClientSeedPF } from "@shared/react-hooks";
import { useGameContext } from "@shared/react-contexts";
import { messageEventType } from "@shared/components/game-base/handlers";

const defaultGameState: GameState = {
    currentWin: 106,
    betAmount: 100,
    gameMode: 'Lightning',
    rows: 9,
    numberOfBets: 20000,
    onWinAction: 'Reset',
    onWinPercentage: 0,
    onLossAction: 'Reset',
    onLossPercentage: 0,
    stopOnWin: 0,
    stopOnLoss: 0,
    activeTab: 'Manual',
    soundEnabled: true,
    balance: 10000, // Default balance for demo
    bets: [
        { player: 'A***nnie', betAmount: 100, payout: 100 },
        { player: 'A***nnie', betAmount: 100, payout: 4444.30 },
        { player: 'john_smith92', betAmount: 100, payout: 100 },
        { player: 'john_smith92', betAmount: 100, payout: 4444.30 },
        { player: 'john_smith92', betAmount: 100, payout: 100 },
        { player: 'john_smith92', betAmount: 100, payout: 4444.99 },
        { player: 'john_smith92', betAmount: 100, payout: 100 },
        { player: 'john_smith92', betAmount: 100, payout: 4444.30 },
        { player: 'john_smith92', betAmount: 100, payout: 100 },
        { player: 'john_smith92', betAmount: 100, payout: 100 },
    ],
    betsTab: 'All'
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
    const ballLayoutRef = useRef<LayeredCanvasBallLayoutRef>(null);
    const autoBetHandlerRef = useRef(null);

    // Shared game context and betting store
    const { ownBets } = useBettingStore();
    const { socket } = useGameStore();

    // Use shared PF system for clientSeed (like sedie-multiplayer)
    const { clientSeed } = useClientSeedPF();
    const { gameMessageHandler } = useGameContext();

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
            console.log('🎯 [PLINKO GAME] ENDBET HANDLER CALLED - Bet result received, spawning ball with server path', action);
            console.log('🎯 [PLINKO GAME] Ball layout ref status:', {
                exists: !!ballLayoutRef.current,
                isReady: ballLayoutRef.current?.isReady?.(),
                type: typeof ballLayoutRef.current,
                current: ballLayoutRef.current
            });
            logger.info('🎯 [PLINKO GAME] ENDBET HANDLER CALLED - Bet result received, spawning ball with server path', action);

            if (action?.finish?.result) {
                const resultPath = action.finish.result;
                const slotIndex = action.finish.settlementResult?.slotIndex || 4;
                const multiplier = action.finish.settlementResult?.multiplier || 1;
                const betAmount = action.finish.amount || action.endBet || 100;
                const winAmount = action.finish.winAmount;

                console.log('🎯 [PLINKO GAME] Server result path details:', {
                    resultPath,
                    pathLength: resultPath.length,
                    expectedSlot: slotIndex,
                    rows: gameState.rows,
                    expectedSteps: gameState.rows - 1,
                    pathSum: resultPath.reduce((sum, val) => sum + val, 0), // Count of 1s
                    pathBreakdown: resultPath.join(''),
                    isValidLength: resultPath.length === gameState.rows - 1
                });

                // Validate path length
                if (resultPath.length !== gameState.rows - 1) {
                    console.warn(`⚠️ [PLINKO GAME] Path length mismatch! Expected ${gameState.rows - 1} steps for ${gameState.rows} rows, got ${resultPath.length} steps`);
                }
                logger.info('🎯 [PLINKO GAME] Spawning ball with server result path', {
                    resultPath,
                    pathLength: resultPath.length,
                    slotIndex,
                    multiplier,
                    betAmount,
                    winAmount
                });

                // Function to attempt spawning with retry logic
                const attemptSpawnBall = (retryCount = 0) => {
                    const maxRetries = 10; // Try for up to ~1 second (10 * 100ms)


                    if (ballLayoutRef.current?.spawnBallWithPath) {
                        try {
                            ballLayoutRef.current.spawnBallWithPath(betAmount, resultPath, slotIndex, multiplier);
                            logger.info('✅ [PLINKO GAME] Ball spawned successfully with server path');
                            return true; // Success
                        } catch (error) {
                            logger.error('❌ [PLINKO GAME] Error spawning ball', { error });
                            return false; // Failed
                        }
                    } else {
                        if (retryCount < maxRetries) {
                            // Retry after 100ms
                            setTimeout(() => attemptSpawnBall(retryCount + 1), 100);
                        } else {
                            logger.error('❌ [PLINKO GAME] ballLayoutRef not available after max retries for spawning');
                        }
                        return false; // Still not ready, will retry
                    }
                };

                // Start attempting to spawn the ball
                attemptSpawnBall();
            } else {
                logger.warn('⚠️ [PLINKO GAME] EndBet message received but no result path found', action);
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

    // Default values for plinko multipliers (since shared system doesn't provide these)
    // Multipliers from service or defaults
    const [payoutMultipliers] = useState<number[]>([0.5, 0.2, 1.4, 190, 1.6, 1.8, 190, 1.5, 1.6]);
    const [payoutProbabilities, setPayoutProbabilities] = useState<number[]>([]);

    // Update multipliers from service configs (similar to standalone project)
    useEffect(() => {
        // For now, keep default multipliers since the shared system may not provide odds
        // In a real implementation, this would come from gameConfigs.odds
        const defaultProbabilities = payoutMultipliers.map(() => 1 / payoutMultipliers.length);
        setPayoutProbabilities(defaultProbabilities);
    }, [payoutMultipliers]);

    // Connection status from socket (reactive to socket changes)
    const isConnected = useMemo(() => socket?.connected ?? false, [socket?.connected]);
    const isAuthenticated = true; // Assume authenticated since we're in the game
    const isBetting = false; // Plinko manages its own betting state


    // Send bets directly with clientSeed (compatible with PF system)
    const placeBet = (amount: number, gameMode: number, rows: number, clientSeedParam: string) => {
        if (socket?.connected) {
            const betData = {
                amount,
                gameMode,
                numberOfRows: rows,
                clientSeed: clientSeedParam
            };
            socket.emit("bet", betData);
        }
    };
    const clearBetResult = () => {
        // Plinko handles clearing results internally
    };

    // Ball layout configuration - dynamic based on rows (memoized to prevent re-renders)
    const ballsPerRow = useMemo(() =>
        Array.from({ length: gameState.rows }, (_, i) => i + 3),
        [gameState.rows]
    );

    // Socket connection is now handled by shared InitSocketIO in page.tsx

    // Handle bet results for auto bet - disabled since lastBetResult is not provided by shared system
    // Plinko handles bet results through its own internal logic

    // Update multipliers from service configs - disabled since gameConfigs is not provided by shared system
    // Plinko uses hardcoded multipliers for now

    // Test function to spawn a ball with predefined path for testing
    const spawnTestBall = () => {
        // Spawn a ball with a path that will hit the center multiplier (index 4)
        const testPath = [0, 1, 0, 1, 0, 1, 0, 1, 0]; // Path to center slot
        const finalSlot = 4; // Center multiplier slot
        const multiplier = 2; // 2x multiplier

        ballLayoutRef.current?.spawnBallWithPath(100, testPath, finalSlot, multiplier);
    };

    // Handle ball collision with multiplier slots
    const handleBallHit = (multiplier: number, betValue: number) => {
        const payout = betValue * multiplier;
        const message = `🎯 Ball ($${betValue}) hit ${multiplier}x slot! Payout: $${payout.toFixed(2)}`;

        setWinMessage({
            isVisible: true,
            multiplier,
            betAmount: betValue,
            message
        });

        // Update game state with win amount
        setGameState(prev => ({
            ...prev,
            currentWin: payout
        }));
    };

    // Handle win message animation end
    const handleWinMessageEnd = () => {
        setWinMessage(prev => ({ ...prev, isVisible: false }));
        clearBetResult(); // Clear the bet result after win message
    };

    // Handle service bet results - disabled since lastBetResult is not provided by shared system
    // Plinko handles bet results through its own internal logic

    // Convert service player bets to UI format
    const convertedBets: BetRecord[] = useMemo(() =>
        Object.entries(ownBets).map(([choice, amount]) => ({
            player: 'You', // Since ownBets is for the current player
            betAmount: amount,
            payout: 0 // Shared system doesn't provide payout info
        })),
        [ownBets]
    );

    const updateGameState = (updates: Partial<GameState>) => {
        setGameState(prev => ({ ...prev, ...updates }));
    };

    return (
        <div className="main-container">
            {/* Logger Controls - positioned outside game-info to avoid clipping */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                zIndex: 10000
            }}>
                <LoggerControls className="w-full" />
            </div>

            <div className="game-info">

                <div className="frame-game">
                    <div className="frame-2">
                        <div className="game-layout-container">
                            <div className="ball-layout-wrapper">
                                <BallLayout
                                    ref={ballLayoutRef}
                                    rows={gameState.rows}
                                    ballsPerRow={ballsPerRow}
                                    multipliers={payoutMultipliers}
                                    probabilities={payoutProbabilities}
                                    betAmount={gameState.betAmount}
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

                <div id="button-bet" className="button-bet">
                    {!localGameInitialized && (
                        <div className="game-initializing">
                            Initializing game...
                        </div>
                    )}
                    {gameState.activeTab === 'Manual' ? (
                        <>
                            {/* Manual Bet Button */}
                            <button
                                className="button-bet-manual"
                                disabled={!localGameInitialized || !isConnected || !isAuthenticated || isBetting}
                                onClick={async () => {
                                    if (isConnected && isAuthenticated && localGameInitialized) {
                                        // Manual bet mode - place single bet
                                        const gameModeMap: Record<string, number> = {
                                            'Low': 0,
                                            'Medium': 1,
                                            'High': 2,
                                            'Lightning': 0 // Default to Low for Lightning
                                        };
                                        const gameMode = gameModeMap[gameState.gameMode] ?? 0;

                                        placeBet(gameState.betAmount, gameMode, gameState.rows, clientSeed);

                                        // Ball will be spawned with service-determined path when results are received
                                    }
                                }}
                            >
                                BET (${gameState.betAmount})
                                {!isConnected && ' (Connecting...)'}
                                {isConnected && !isAuthenticated && ' (Authenticating...)'}
                                {isBetting && ' (Betting...)'}
                            </button>

                            {/* Test Button for Ball Spawn */}
                            <button
                                className="span-bet"
                                onClick={spawnTestBall}
                                style={{
                                    marginLeft: '10px',
                                    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                                    border: '2px solid #cc4545',
                                    color: 'white',
                                    fontSize: '14px',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 4px 8px rgba(255, 107, 107, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                🎯 TEST BALL
                            </button>

                            {/* Direct Spawn Test Button */}
                            <button
                                className="span-bet"
                                onClick={() => {
                                    logger.info('🎯 DIRECT SPAWN TEST clicked - using ball test utilities');

                                    // Use the test utilities from @ball/ folder
                                    const testConfig = {
                                        rows: gameState.rows,
                                        betAmount: gameState.betAmount,
                                        multipliers: payoutMultipliers,
                                        payoutProbabilities: payoutProbabilities
                                    };

                                    performDirectSpawnTest(ballLayoutRef.current, testConfig);
                                }}
                                style={{
                                    marginLeft: '10px',
                                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                                    border: '2px solid #3d8b40',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                DIRECT SPAWN
                            </button>
                        </>
                    ) : (
                        // Auto Bet Button - moved from AutoBetPanel
                        <button
                            className={`button-bet-auto ${isAutoBetRunning ? 'running' : ''}`}
                            disabled={!localGameInitialized || !isConnected || !isAuthenticated}
                            onClick={async () => {
                                if (isAutoBetRunning) {
                                    // Stop the AutoBetHandler
                                    autoBetHandlerRef.current?.stop();
                                    setIsAutoBetRunning(false);
                                } else {
                                    // Validate before starting
                                    if (gameState.balance < gameState.betAmount) {
                                        toast.error('Insufficient balance');
                                        return;
                                    }
                                    if (gameState.numberOfBets < 1) {
                                        toast.error('Number of bets must be at least 1');
                                        return;
                                    }

                                    // Create AutoBetHandler instance if not exists
                                    if (!autoBetHandlerRef.current) {
                                        const { AutoBetHandler } = await import('../../services/autoBetHandler');

                                        const config = {
                                            numberOfBets: gameState.numberOfBets,
                                            onWinAction: gameState.onWinAction,
                                            onWinPercentage: gameState.onWinPercentage,
                                            onLossAction: gameState.onLossAction,
                                            onLossPercentage: gameState.onLossPercentage,
                                            stopOnWin: gameState.stopOnWin,
                                            stopOnLoss: gameState.stopOnLoss,
                                            initialBetAmount: gameState.betAmount,
                                            gameMode: (() => {
                                                const gameModeMap: Record<string, number> = {
                                                    'Low': 0,
                                                    'Medium': 1,
                                                    'High': 2,
                                                    'Lightning': 0 // Default to Low for Lightning
                                                };
                                                return gameModeMap[gameState.gameMode] ?? 0;
                                            })(),
                                            numberOfRows: gameState.rows
                                        };

                                        const callbacks = {
                                            onBetPlaced: (betAmount: number) => {
                                                // Auto bet placed callback
                                            },
                                            onBetResult: () => {
                                                // Forward to parent if needed
                                            },
                                            onAutoBetComplete: (reason: string) => {
                                                setIsAutoBetRunning(false);
                                            },
                                            onBalanceUpdate: (newBalance: number) => {
                                                updateGameState({ balance: newBalance });
                                            }
                                        };

                                        autoBetHandlerRef.current = new AutoBetHandler(config, gameState.balance, (amount, gameMode, rows) => placeBet(amount, gameMode, rows, clientSeed), callbacks);
                                    }

                                    setIsAutoBetRunning(true);
                                    autoBetHandlerRef.current.start();
                                }
                            }}
                        >
                            {isAutoBetRunning ? 'STOP AUTO BET' : 'START AUTO BET'}
                        </button>
                    )}
                </div>

                <AutoBetPanel
                    sharedConfig={{
                        betAmount: gameState.betAmount,
                        gameMode: gameState.gameMode,
                        rows: gameState.rows
                    }}
                    autoConfig={{
                        numberOfBets: gameState.numberOfBets,
                        onWinAction: gameState.onWinAction,
                        onWinPercentage: gameState.onWinPercentage,
                        onLossAction: gameState.onLossAction,
                        onLossPercentage: gameState.onLossPercentage,
                        stopOnWin: gameState.stopOnWin,
                        stopOnLoss: gameState.stopOnLoss
                    }}
                    activeTab={gameState.activeTab}
                    onSharedConfigChange={(config) => updateGameState(config)}
                    onAutoConfigChange={(config) => updateGameState(config)}
                    onTabChange={(tab) => updateGameState({ activeTab: tab })}
                    onBalanceUpdate={(newBalance) => updateGameState({ balance: newBalance })}
                />

                <BetsTable
                    bets={convertedBets.length > 0 ? convertedBets : gameState.bets}
                    activeTab={gameState.betsTab}
                    onTabChange={(tab) => updateGameState({ betsTab: tab })}
                />
            </div>
        </div>
    );
};

export default PlinkoGame;



