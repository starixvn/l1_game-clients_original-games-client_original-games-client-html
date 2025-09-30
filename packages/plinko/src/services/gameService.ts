import io from 'socket.io-client';

// Types based on the plinko-service integration tests and types.ts
export interface GameConfigs {
    gameId: number;
    odds: Record<number, Record<number, number[]>>;
    choices_maxbet: Record<string, number>;
    delayStartTime: number;
    enableFreeBet: boolean;
    enabled: boolean;
    maxbet: number;
    maxWinPerRound: number;
    maxbot: number;
    minbet: number;
    randomMode: number;
    name: string;
    siteExclusions: string[];
    exchangeReload: boolean;
    displayName: string;
    type: number;
    plinkoConfig: {
        odds: Record<number, Record<number, number[]>>;
    };
}

export interface User {
    name: string;
    rate: number;
}

export interface RoundHistory {
    roundId: number;
    result: number[];
    settlementResult: {
        slotIndex: number;
        multiplier: number;
    };
}

export interface SettlementResult {
    slotIndex: number;
    multiplier: number;
}

export interface FinishResult {
    result: number[];
    settlementResult: SettlementResult;
    winAmount: number;
    amount: number;
    reachMaxWin: boolean;
}

export interface PlayerBet {
    playerName: string;
    amount: number;
    winAmount: number;
    multiplier: number;
}

export interface GameEventData {
    gameConfigs?: GameConfigs;
    user?: User;
    roundHistory?: RoundHistory[];
    playerResultBoard?: any[];
    endBet?: number;
    ownBets?: {
        gameMode: number;
        numberOfRows: number;
    };
    finish?: FinishResult;
    playerBet?: PlayerBet;
    notice?: {
        errorCode: string;
    };
}

export interface PlaceBetPayload {
    amount: number;
    gameMode: number;
    numberOfRows: number;
    clientSeed: string;
}

export interface UserSession {
    session: string;
    ss: string;
    currency: string;
    username: string;
    browserUserAgent: string;
}

// Event types based on integration tests
export const eventTypes = {
    connect: 'connect',
    connectError: 'connect_error',
    disconnect: 'disconnect',
    signIn: 'sign-in',
    signedIn: 'signed-in',
    inGame: 'in-game',
    bet: 'bet',
    gameEvent: 'game-event',
};

export class GameService {
    private socket: any = null;
    private isConnected = false;
    private eventListeners: Map<string, Function[]> = new Map();

    constructor(private serviceUrl = 'https://l2-proxy1.lumigame.com/plinko') { }

    async connect(userSession: UserSession): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = io(this.serviceUrl, {
                transports: ['websocket'],
                query: userSession,
            });

            this.socket.on(eventTypes.connect, () => {
                console.log('✅ Connected to game service');
                this.isConnected = true;
                resolve();
            });

            this.socket.on(eventTypes.connectError, (error) => {
                console.error('❌ Connection error:', error);
                console.error('Service URL:', this.serviceUrl);
                console.error('User session:', userSession);
                this.isConnected = false;
                reject(error);
            });

            this.socket.on('connect_error', (error) => {
                console.error('🔌 Socket connect_error:', error);
                console.error('Error details:', error.message, error.description, error.context);
            });

            this.socket.on(eventTypes.disconnect, () => {
                console.log('Disconnected from game service');
                this.isConnected = false;
            });

            // Listen for game events
            this.socket.on(eventTypes.gameEvent, (data: GameEventData) => {
                this.emit('game-event', data);
            });

            this.socket.on(eventTypes.signedIn, () => {
                this.emit('signed-in');
            });
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Send sign-in event
    sendSignInEvent(): void {
        if (this.socket && this.isConnected) {
            this.socket.emit(eventTypes.signIn);
        }
    }

    // Send in-game event to get game configs
    sendInGameEvent(): void {
        if (this.socket && this.isConnected) {
            this.socket.emit(eventTypes.inGame);
        }
    }

    // Place a bet
    placeBet(payload: PlaceBetPayload): void {
        if (this.socket && this.isConnected) {
            this.socket.emit(eventTypes.bet, payload);
        }
    }

    // Event handling
    on(event: string, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);
    }

    off(event: string, callback?: Function): void {
        if (!this.eventListeners.has(event)) return;

        if (callback) {
            const listeners = this.eventListeners.get(event)!;
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        } else {
            this.eventListeners.delete(event);
        }
    }

    private emit(event: string, ...args: any[]): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(...args));
        }
    }

    // Utility methods
    isServiceConnected(): boolean {
        return this.isConnected;
    }

    // Wait for specific game event with optional filter
    async waitForGameEvent(filter?: (data: GameEventData) => boolean): Promise<GameEventData> {
        return new Promise((resolve) => {
            const handler = (data: GameEventData) => {
                if (!filter || filter(data)) {
                    this.off('game-event', handler);
                    resolve(data);
                }
            };
            this.on('game-event', handler);
        });
    }

    // Wait for signed-in event
    async waitForSignedIn(): Promise<void> {
        return new Promise((resolve) => {
            const handler = () => {
                this.off('signed-in', handler);
                resolve();
            };
            this.on('signed-in', handler);
        });
    }
}

// Singleton instance
let gameServiceInstance: GameService | null = null;

export const getGameService = (serviceUrl?: string): GameService => {
    if (!gameServiceInstance) {
        gameServiceInstance = new GameService(serviceUrl);
    }
    return gameServiceInstance;
};

export const createUserSession = (userId: string, playerName: string, currency = 'USD'): UserSession => {
    const sessionId = `${userId}-session-id`;
    return {
        session: sessionId,
        ss: sessionId,
        currency,
        username: `${userId}_${playerName}`,
        browserUserAgent: 'Mozilla/5.0 (compatible; GameClient)',
    };
};
