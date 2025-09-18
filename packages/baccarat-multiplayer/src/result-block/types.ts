// Shared types for Baccarat result components

export interface BaccaratCard {
    rank: number; // 0-12 (A=0, 2-10=1-9, J=10, Q=11, K=12)
    suit: number; // 0-3 (suit type from socket)
}

export interface BaccaratResult {
    player: {
        card1: BaccaratCard;
        card2: BaccaratCard;
        card3?: BaccaratCard;
        score: number; // Final score from socket
    };
    banker: {
        card1: BaccaratCard;
        card2: BaccaratCard;
        card3?: BaccaratCard;
        score: number; // Final score from socket
    };
    winner: "player" | "banker" | "tie";
}

export interface CardOrderWithTiming {
    value: BaccaratCard;
    order: number;
    animationDelay: number;
    accumulatedScore: number;
    playerHasThirdCard?: boolean;
}

// History result item - simplified structure for historical data
export interface BaccaratHistoryResult {
    roundId: number;
    player: any[]; // Raw card data from history
    banker: any[]; // Raw card data from history
    winner: 'player' | 'banker' | 'tie';
    playerTotal: number;
    bankerTotal: number;
}
