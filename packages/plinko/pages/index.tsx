import React, { useState, useEffect, useRef, useMemo } from "react";
import { toast } from 'react-toastify';
import { GameBackground, MultiplierDisplay, BallLayout, CanvasBallLayoutRef, WinMessage } from "../src/features/game/components";
import { AutoBetPanel, BetsTable } from "../src/features/betting/components";
// import { GameInfo, LoggerControls } from "../src/features/ui/components";
import { LoggerControls } from "../src/features/ui/components";
import { GameState, BetRecord } from "../src/shared/types/index";
import { useGameService, logger } from "../src/services";

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

export default function Home() {
    const [gameState, setGameState] = useState<GameState>(defaultGameState);
    const [payoutMultipliers, setPayoutMultipliers] = useState<number[]>([]);
    const [payoutProbabilities, setPayoutProbabilities] = useState<number[]>([]);
    const [winMessage, setWinMessage] = useState<{
        isVisible: boolean;
        multiplier?: number;
        betAmount?: number;
        message?: string;
    }>({ isVisible: false });
    const [isAutoBetRunning, setIsAutoBetRunning] = useState(false);
    const ballLayoutRef = useRef<CanvasBallLayoutRef>(null);
    const autoBetHandlerRef = useRef(null);

    // Game service integration
    const {
        isConnected,
        isAuthenticated,
        gameConfigs,
        playerBets,
        lastBetResult,
        isBetting,
        connect,
        disconnect,
        placeBet,
        clearBetResult
    } = useGameService();

    // Ball layout configuration - dynamic based on rows (memoized to prevent re-renders)
    const ballsPerRow = useMemo(() =>
        Array.from({ length: gameState.rows }, (_, i) => i + 3),
        [gameState.rows]
    );

    // Legacy multipliers for the game (keeping for backward compatibility)
    const multipliers = ['0.5x', '0.2x', '1.4x', '190x', '1.60x', '1.8x', '190x', '1.5x', '1.60x'];

    // Connect to game service on mount
    useEffect(() => {
        const connectToService = async () => {
            try {
                // For demo purposes, using a test user. In production, this would come from authentication
                await connect('test-user-123', 'TestPlayer');
            } catch (error) {
                console.error('Failed to connect to game service:', error);
            }
        };

        connectToService();

        // Cleanup on unmount
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    // Handle bet results for auto bet
    useEffect(() => {
        if (lastBetResult?.finish && autoBetHandlerRef.current?.isActive()) {
            const { finish } = lastBetResult;
            const payout = finish.winAmount;
            const betAmount = finish.amount;
            const win = payout > betAmount; // Win if payout > bet amount

            autoBetHandlerRef.current.processBetResult({
                win,
                payout,
                betAmount
            });
        }
    }, [lastBetResult]);

    // Update multipliers from service configs
    useEffect(() => {
        if (gameConfigs?.odds) {
            // Extract multipliers for current game mode and number of rows
            // Map UI game modes to service game modes (0: Low, 1: Medium, 2: High)
            const gameModeMap: Record<string, number> = {
                'Low': 0,
                'Medium': 1,
                'High': 2,
                'Lightning': 0 // Default to Low for Lightning
            };
            const gameMode = gameModeMap[gameState.gameMode] ?? 0;
            const oddsForMode = gameConfigs.odds[gameMode];
            if (oddsForMode?.[gameState.rows]) {
                setPayoutMultipliers(oddsForMode[gameState.rows]);
                // Note: probabilities would need to be calculated or provided by service
                setPayoutProbabilities([]);
            }
        }
    }, [gameConfigs, gameState.gameMode, gameState.rows]);

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

    // Handle service bet results
    useEffect(() => {
        if (lastBetResult?.finish) {
            const { finish } = lastBetResult;
            const payout = finish.winAmount;
            const multiplier = finish.settlementResult.multiplier;
            const path = finish.result;
            const finalSlot = finish.settlementResult.slotIndex;

            logger.info('Bet result received', {
                betAmount: finish.amount,
                payout,
                multiplier,
                path: path.length,
                finalSlot,
                win: payout > finish.amount
            });

            // Spawn ball with service-determined path
            ballLayoutRef.current?.spawnBallWithPath(finish.amount, path, finalSlot, multiplier);

            const message = `🎯 Service Result: Ball hit ${multiplier}x slot! Payout: $${payout.toFixed(2)}`;

            setWinMessage({
                isVisible: true,
                multiplier,
                betAmount: finish.amount,
                message
            });

            // Update game state with win amount
            setGameState(prev => ({
                ...prev,
                currentWin: payout
            }));
        }
    }, [lastBetResult]);

    // Convert service player bets to UI format
    const convertedBets: BetRecord[] = useMemo(() =>
        playerBets.map(bet => ({
            player: bet.playerName,
            betAmount: bet.amount,
            payout: bet.winAmount
        })),
        [playerBets]
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
                <GameBackground />

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
                    {gameState.activeTab === 'Manual' ? (
                        // Manual Bet Button
                        <button
                            className="span-bet"
                            onClick={async () => {
                                if (isConnected && isAuthenticated) {
                                    // Manual bet mode - place single bet
                                    const gameModeMap: Record<string, number> = {
                                        'Low': 0,
                                        'Medium': 1,
                                        'High': 2,
                                        'Lightning': 0 // Default to Low for Lightning
                                    };
                                    const gameMode = gameModeMap[gameState.gameMode] ?? 0;
                                    const clientSeed = Math.random().toString(36).substring(2, 15);

                                    logger.info('Placing manual bet', {
                                        betAmount: gameState.betAmount,
                                        gameMode: gameState.gameMode,
                                        gameModeIndex: gameMode,
                                        rows: gameState.rows,
                                        clientSeed,
                                        balance: gameState.balance
                                    });

                                    placeBet(gameState.betAmount, gameMode, gameState.rows, clientSeed);

                                    // Ball will be spawned with service-determined path when results are received
                                } else {
                                    logger.warn('Cannot place bet - not connected to game service', {
                                        isConnected,
                                        isAuthenticated
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
                            disabled={!isConnected || !isAuthenticated || isBetting}
                        >
                            BET (${gameState.betAmount})
                            {!isConnected && ' (Connecting...)'}
                            {isConnected && !isAuthenticated && ' (Authenticating...)'}
                            {isBetting && ' (Betting...)'}
                        </button>
                    ) : (
                        // Auto Bet Button - moved from AutoBetPanel
                        <button
                            className="span-bet"
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
                                        const { AutoBetHandler } = await import('../src/services/autoBetHandler');

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

                                        autoBetHandlerRef.current = new AutoBetHandler(config, gameState.balance, placeBet, callbacks);
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
                            disabled={false} // Allow stopping anytime
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

                {/* <GameInfo
                    gameName="Plinko"
                    rtp="97%"
                /> */}

                <BetsTable
                    bets={convertedBets.length > 0 ? convertedBets : gameState.bets}
                    activeTab={gameState.betsTab}
                    onTabChange={(tab) => updateGameState({ betsTab: tab })}
                />
            </div>
            {/* <div className="pic-28" /> */}
        </div>
    );
}
