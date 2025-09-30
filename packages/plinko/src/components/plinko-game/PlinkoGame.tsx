import React, { useState, useRef, useMemo, useEffect } from "react";
import { toast } from 'react-toastify';
import { MultiplierDisplay, BallLayout, LayeredCanvasBallLayoutRef, WinMessage } from "../../features/game/components";
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
            logger.warn('gameMessageHandler not available, cannot register handlers');
            return;
        }

        logger.info('🎮 [PLINKO GAME] Registering Plinko-specific handlers');

        // Register handler for SIGNED_IN to send inGame message
        const signedInHandlerId = gameMessageHandler.register(messageEventType.SIGNED_IN, (action) => {
            logger.info('🎮 [PLINKO GAME] SIGNED_IN received, sending inGame for Plinko', action);
            if (socket?.connected) {
                // Plinko service expects inGame without parameters (based on integration tests)
                socket.emit("inGame");
                logger.info('Sent inGame event to Plinko service');
            } else {
                logger.warn('Socket not connected, cannot send inGame');
            }
        });

        // Register handler for gameConfigs response to mark game as initialized
        const gameConfigsHandlerId = gameMessageHandler.register("gameConfigs", (action) => {
            logger.info('🎮 [PLINKO GAME] Game initialized with configs', action);
            setLocalGameInitialized(true);
        });

        // Register handler for endBet message (contains the finish object with result path)
        console.log('🎯 Registering endBet handler...');
        const endBetHandlerId = gameMessageHandler.register("endBet", (action) => {
            logger.info('🎯 [PLINKO GAME] ENDBET HANDLER CALLED - Bet result received, spawning ball with server path', action);
            console.log('🎯 ENDBET HANDLER CALLED with action:', action);

            if (action?.finish?.result) {
                const resultPath = action.finish.result;
                const slotIndex = action.finish.settlementResult?.slotIndex || 4;
                const multiplier = action.finish.settlementResult?.multiplier || 1;
                const betAmount = action.finish.amount || action.endBet || 100;
                const winAmount = action.finish.winAmount;

                console.log('🎯 HANDLER: Processing result path:', resultPath, 'slotIndex:', slotIndex, 'multiplier:', multiplier);
                console.log('🎯 HANDLER: ballLayoutRef.current exists:', !!ballLayoutRef.current);
                console.log('🎯 HANDLER: ballLayoutRef.current.spawnBallWithPath exists:', !!ballLayoutRef.current?.spawnBallWithPath);

                logger.info('🎯 [PLINKO GAME] Spawning ball with server result path', {
                    resultPath,
                    pathLength: resultPath.length,
                    slotIndex,
                    multiplier,
                    betAmount,
                    winAmount
                });

                // Spawn ball with the server-provided path
                if (ballLayoutRef.current && ballLayoutRef.current.spawnBallWithPath) {
                    console.log('🎯 HANDLER: Calling spawnBallWithPath with params:', betAmount, resultPath, slotIndex, multiplier);
                    try {
                        ballLayoutRef.current.spawnBallWithPath(betAmount, resultPath, slotIndex, multiplier);
                        logger.info('✅ [PLINKO GAME] Ball spawned successfully with server path');
                        console.log('✅ HANDLER: spawnBallWithPath call completed');
                    } catch (error) {
                        console.error('❌ HANDLER: Error calling spawnBallWithPath:', error);
                        logger.error('❌ [PLINKO GAME] Error spawning ball', { error });
                    }
                } else {
                    console.error('❌ HANDLER: ballLayoutRef not ready:', {
                        ref: ballLayoutRef.current,
                        hasSpawnMethod: !!ballLayoutRef.current?.spawnBallWithPath
                    });
                    logger.error('❌ [PLINKO GAME] ballLayoutRef not available for spawning');
                }
            } else {
                logger.warn('⚠️ [PLINKO GAME] EndBet message received but no result path found', action);
            }
        });

        // Check if socket is already connected and signed in, send inGame if needed
        if (socket?.connected) {
            logger.info('🎮 [PLINKO GAME] Socket already connected, sending inGame');
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
    const payoutMultipliers = [0.5, 0.2, 1.4, 190, 1.6, 1.8, 190, 1.5, 1.6]; // Default multipliers
    const payoutProbabilities = payoutMultipliers.map(() => 1 / payoutMultipliers.length); // Equal probability

    // Connection status from socket (reactive to socket changes)
    const isConnected = useMemo(() => socket?.connected ?? false, [socket?.connected]);
    const isAuthenticated = true; // Assume authenticated since we're in the game
    const isBetting = false; // Plinko manages its own betting state


    // Send bets directly with clientSeed (compatible with PF system)
    const placeBet = (amount: number, gameMode: number, rows: number, clientSeedParam: string) => {
        logger.info('🎮 [PLINKO GAME] Placing bet', {
            amount,
            gameMode,
            rows,
            clientSeed: clientSeedParam
        });

        if (socket?.connected) {
            const betData = {
                amount,
                gameMode,
                numberOfRows: rows,
                clientSeed: clientSeedParam
            };
            socket.emit("bet", betData);
            logger.info('✅ [PLINKO GAME] Bet message sent to socket');
        } else {
            logger.error('❌ [PLINKO GAME] Socket not connected, cannot send bet');
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

    // Legacy multipliers for the game (keeping for backward compatibility)
    const multipliers = ['0.5x', '0.2x', '1.4x', '190x', '1.60x', '1.8x', '190x', '1.5x', '1.60x'];

    // Socket connection is now handled by shared InitSocketIO in page.tsx

    // Handle bet results for auto bet - disabled since lastBetResult is not provided by shared system
    // Plinko handles bet results through its own internal logic

    // Update multipliers from service configs - disabled since gameConfigs is not provided by shared system
    // Plinko uses hardcoded multipliers for now

    // Test function to spawn a ball with predefined path for testing
    const spawnTestBall = () => {
        console.log('🎯 Spawning test ball with predefined path');
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
                        <MultiplierDisplay multipliers={multipliers} />
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
                                className="span-bet"
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

                                        logger.info('Placing manual bet', {
                                            betAmount: gameState.betAmount,
                                            gameMode: gameState.gameMode,
                                            gameModeIndex: gameMode,
                                            rows: gameState.rows,
                                            clientSeed: clientSeed, // From shared PF system
                                            balance: gameState.balance
                                        });

                                        placeBet(gameState.betAmount, gameMode, gameState.rows, clientSeed);

                                        // Ball will be spawned with service-determined path when results are received
                                    } else {
                                        console.error('❌ Cannot place bet - conditions not met:', {
                                            isConnected,
                                            isAuthenticated,
                                            localGameInitialized,
                                            socketConnected: socket?.connected
                                        });
                                        logger.warn('Cannot place bet - game not ready', {
                                            isConnected,
                                            isAuthenticated,
                                            isGameInitialized
                                        });
                                    }
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    fontSize: 'inherit',
                                    fontWeight: 'inherit',
                                    cursor: 'pointer',
                                    padding: 0
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
                                    console.log('🎯 DIRECT SPAWN BUTTON CLICKED - Starting test using @ball/ test utilities');
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
                            className="span-bet"
                            disabled={!localGameInitialized || !isConnected || !isAuthenticated}
                            onClick={async () => {
                                if (isAutoBetRunning) {
                                    logger.info('Stopping auto bet');
                                    // Stop the AutoBetHandler
                                    autoBetHandlerRef.current?.stop();
                                    setIsAutoBetRunning(false);
                                } else {
                                    logger.info('Starting auto bet validation', {
                                        balance: gameState.balance,
                                        betAmount: gameState.betAmount,
                                        numberOfBets: gameState.numberOfBets
                                    });

                                    // Validate before starting
                                    if (gameState.balance < gameState.betAmount) {
                                        logger.warn('Auto bet validation failed - insufficient balance', {
                                            balance: gameState.balance,
                                            betAmount: gameState.betAmount
                                        });
                                        toast.error('Insufficient balance');
                                        return;
                                    }
                                    if (gameState.numberOfBets < 1) {
                                        logger.warn('Auto bet validation failed - invalid number of bets', {
                                            numberOfBets: gameState.numberOfBets
                                        });
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
                                                console.log(`Auto bet placed: $${betAmount}`);
                                            },
                                            onBetResult: () => {
                                                // Forward to parent if needed
                                            },
                                            onAutoBetComplete: (reason: string) => {
                                                console.log('Auto bet completed:', reason);
                                                setIsAutoBetRunning(false);
                                            },
                                            onBalanceUpdate: (newBalance: number) => {
                                                updateGameState({ balance: newBalance });
                                            }
                                        };

                                        autoBetHandlerRef.current = new AutoBetHandler(config, gameState.balance, (amount, gameMode, rows) => placeBet(amount, gameMode, rows, clientSeed), callbacks);
                                    }

                                    logger.info('Starting auto bet', {
                                        config: {
                                            numberOfBets: gameState.numberOfBets,
                                            onWinAction: gameState.onWinAction,
                                            onWinPercentage: gameState.onWinPercentage,
                                            onLossAction: gameState.onLossAction,
                                            onLossPercentage: gameState.onLossPercentage,
                                            stopOnWin: gameState.stopOnWin,
                                            stopOnLoss: gameState.stopOnLoss,
                                            initialBetAmount: gameState.betAmount
                                        }
                                    });

                                    setIsAutoBetRunning(true);
                                    autoBetHandlerRef.current.start();
                                }
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'inherit',
                                fontSize: 'inherit',
                                fontWeight: 'inherit',
                                cursor: 'pointer',
                                padding: 0
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



