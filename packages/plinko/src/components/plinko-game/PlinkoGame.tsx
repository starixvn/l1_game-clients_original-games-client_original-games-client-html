import React, { useState, useRef, useMemo } from "react";
import { toast } from 'react-toastify';
import { GameBackground, MultiplierDisplay, BallLayout, CanvasBallLayoutRef, WinMessage } from "../../features/game/components";
import { AutoBetPanel, BetsTable } from "../../features/betting/components";
import { GameState, BetRecord } from "../../shared/types/index";
import { logger } from "../../services/logger";
import { useBettingStore } from "@shared/stores";

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

const PlinkoGame: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(defaultGameState);
    const [winMessage, setWinMessage] = useState<{
        isVisible: boolean;
        multiplier?: number;
        betAmount?: number;
        message?: string;
    }>({ isVisible: false });
    const [isAutoBetRunning, setIsAutoBetRunning] = useState(false);
    const ballLayoutRef = useRef<CanvasBallLayoutRef>(null);
    const autoBetHandlerRef = useRef(null);

    // Shared game context and betting store
    const { ownBets } = useBettingStore();

    // Default values for plinko multipliers (since shared system doesn't provide these)
    const payoutMultipliers = [0.5, 0.2, 1.4, 190, 1.6, 1.8, 190, 1.5, 1.6]; // Default multipliers
    const payoutProbabilities = payoutMultipliers.map(() => 1 / payoutMultipliers.length); // Equal probability

    // Mock values for plinko-specific functionality (since shared system doesn't provide these)
    const isConnected = true; // Socket is connected via shared system
    const isAuthenticated = true; // Assume authenticated
    const isBetting = false; // Plinko manages its own betting state

    // Mock functions for plinko-specific functionality
    const placeBet = (amount: number, gameMode: number, rows: number, clientSeed: string) => {
        // Plinko handles betting through its own logic
        logger.info('Plinko placeBet called', { amount, gameMode, rows, clientSeed });
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
            {/* Logger Controls - provided by shared GameApp at app level */}

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



