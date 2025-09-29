import React, { useContext, useEffect, useState, createContext, ReactNode, useCallback, useMemo } from 'react';
import { getGameService, GameService, createUserSession, GameConfigs, User, RoundHistory, GameEventData, PlayerBet } from './gameService';

interface BetResult {
    endBet?: number;
    ownBets?: {
        gameMode: number;
        numberOfRows: number;
    };
    finish?: {
        result: number[];
        settlementResult: {
            slotIndex: number;
            multiplier: number;
        };
        winAmount: number;
        amount: number;
        reachMaxWin: boolean;
    };
    playerBet?: {
        playerName: string;
        amount: number;
        winAmount: number;
        multiplier: number;
    };
}

interface GameServiceContextType {
    gameService: GameService;
    isConnected: boolean;
    isAuthenticated: boolean;
    gameConfigs: GameConfigs | null;
    user: User | null;
    roundHistory: RoundHistory[];
    playerResultBoard: any[];
    playerBets: PlayerBet[];
    lastBetResult: BetResult | null;
    isBetting: boolean;
    connect: (userId: string, playerName: string, currency?: string) => Promise<void>;
    disconnect: () => void;
    sendInGameEvent: () => void;
    placeBet: (amount: number, gameMode: number, numberOfRows: number, clientSeed: string) => void;
    clearBetResult: () => void;
    error: string | null;
}

const GameServiceContext = createContext<GameServiceContextType | null>(null);

interface GameServiceProviderProps {
    children: ReactNode;
    serviceUrl?: string;
}

export const GameServiceProvider: React.FC<GameServiceProviderProps> = ({
    children,
    serviceUrl
}) => {
    const gameService = getGameService(serviceUrl);
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [gameConfigs, setGameConfigs] = useState<GameConfigs | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [roundHistory, setRoundHistory] = useState<RoundHistory[]>([]);
    const [playerResultBoard, setPlayerResultBoard] = useState<any[]>([]);
    const [playerBets, setPlayerBets] = useState<PlayerBet[]>([]);
    const [lastBetResult, setLastBetResult] = useState<BetResult | null>(null);
    const [isBetting, setIsBetting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Handle game events
        const handleGameEvent = (data: GameEventData) => {
            if (data.gameConfigs) {
                setGameConfigs(data.gameConfigs);
            }
            if (data.user) {
                setUser(data.user);
            }
            if (data.roundHistory) {
                setRoundHistory(data.roundHistory);
            }
            if (data.playerResultBoard) {
                setPlayerResultBoard(data.playerResultBoard);
            }
            if (data.playerBet) {
                // Add new player bet to the list (keep only recent bets)
                setPlayerBets(prev => {
                    const newBets = [data.playerBet, ...prev];
                    return newBets.slice(0, 50); // Keep only the 50 most recent bets
                });
            }

            // Handle betting results
            if (data.endBet !== undefined || data.ownBets || data.finish || data.playerBet) {
                setLastBetResult(prev => ({
                    ...prev,
                    endBet: data.endBet ?? prev?.endBet,
                    ownBets: data.ownBets ?? prev?.ownBets,
                    finish: data.finish ?? prev?.finish,
                    playerBet: data.playerBet ?? prev?.playerBet,
                }));

                // If we have a finish result, betting is complete
                if (data.finish) {
                    setIsBetting(false);
                }
            }

            // Handle error notices
            if (data.notice) {
                setError(`Error: ${data.notice.errorCode}`);
                setIsBetting(false); // Reset betting state on error
                // Clear error after 5 seconds
                setTimeout(() => setError(null), 5000);
            }
        };

        const handleSignedIn = () => {
            setIsAuthenticated(true);
        };

        gameService.on('game-event', handleGameEvent);
        gameService.on('signed-in', handleSignedIn);

        return () => {
            gameService.off('game-event', handleGameEvent);
            gameService.off('signed-in', handleSignedIn);
        };
    }, [gameService]);

    const connect = useCallback(async (userId: string, playerName: string, currency = 'USD') => {
        try {
            setError(null);
            const userSession = createUserSession(userId, playerName, currency);
            await gameService.connect(userSession);

            setIsConnected(true);

            // Start sign-in process
            gameService.sendSignInEvent();
            await gameService.waitForSignedIn();

            // Send in-game event to get initial data
            gameService.sendInGameEvent();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect to game service';
            setError(errorMessage);
            throw err;
        }
    }, [gameService]);

    const disconnect = useCallback(() => {
        gameService.disconnect();
        setIsConnected(false);
        setIsAuthenticated(false);
        setGameConfigs(null);
        setUser(null);
        setRoundHistory([]);
        setPlayerResultBoard([]);
        setPlayerBets([]);
        setLastBetResult(null);
        setIsBetting(false);
    }, [gameService]);

    const clearBetResult = useCallback(() => {
        setLastBetResult(null);
    }, []);

    const sendInGameEvent = useCallback(() => {
        gameService.sendInGameEvent();
    }, [gameService]);

    const placeBet = useCallback((amount: number, gameMode: number, numberOfRows: number, clientSeed: string) => {
        setIsBetting(true);
        setLastBetResult(null); // Clear previous result
        gameService.placeBet({ amount, gameMode, numberOfRows, clientSeed });
    }, [gameService]);

    const contextValue = useMemo<GameServiceContextType>(() => ({
        gameService,
        isConnected,
        isAuthenticated,
        gameConfigs,
        user,
        roundHistory,
        playerResultBoard,
        playerBets,
        lastBetResult,
        isBetting,
        connect,
        disconnect,
        sendInGameEvent,
        placeBet,
        clearBetResult,
        error,
    }), [
        gameService,
        isConnected,
        isAuthenticated,
        gameConfigs,
        user,
        roundHistory,
        playerResultBoard,
        playerBets,
        lastBetResult,
        isBetting,
        connect,
        disconnect,
        sendInGameEvent,
        placeBet,
        clearBetResult,
        error,
    ]);

    return (
        <GameServiceContext.Provider value={contextValue}>
            {children}
        </GameServiceContext.Provider>
    );
};

export const useGameService = (): GameServiceContextType => {
    const context = useContext(GameServiceContext);
    if (!context) {
        throw new Error('useGameService must be used within a GameServiceProvider');
    }
    return context;
};
