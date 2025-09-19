import { Round } from '@shared/components/game-base/type';
import { BaccaratResult, BaccaratSettlementResult } from "../baccarat-multiplayer-constants";

// Helper function to detect player pair
export const hasPlayerPair = (playerCards: BaccaratResult['player']): boolean => {
    const cards = [playerCards.card1, playerCards.card2, playerCards.card3].filter(Boolean);
    return cards.some((card1, i) => 
        cards.some((card2, j) => i !== j && card1?.rank === card2?.rank)
    );
};

// Helper function to detect banker pair
export const hasBankerPair = (bankerCards: BaccaratResult['banker']): boolean => {
    const cards = [bankerCards.card1, bankerCards.card2, bankerCards.card3].filter(Boolean);
    return cards.some((card1, i) => 
        cards.some((card2, j) => i !== j && card1?.rank === card2?.rank)
    );
};

// Types for statistics
export interface BaccaratBetCounts {
    player: number;
    banker: number;
    tie: number;
    playerPair: number;
    bankerPair: number;
}

// Pure function for calculating bet statistics from round history
export const calculateBaccaratBetCounts = (roundHistory: Round<BaccaratResult, BaccaratSettlementResult>[]): BaccaratBetCounts => {
    const initialCounts: BaccaratBetCounts = {
        player: 0,
        banker: 0,
        tie: 0,
        playerPair: 0,
        bankerPair: 0,
    };

    return roundHistory.reduce((counts, round) => {
        if (!round.settlementResult || !round.result) {
            return counts;
        }

        const { settlementResult, result } = round;
        const hasPlayerPairDetected = hasPlayerPair(result.player);
        const hasBankerPairDetected = hasBankerPair(result.banker);

        return {
            player: counts.player + (settlementResult.player ? 1 : 0),
            banker: counts.banker + (settlementResult.banker ? 1 : 0),
            tie: counts.tie + (settlementResult.tie ? 1 : 0),
            playerPair: counts.playerPair + (hasPlayerPairDetected ? 1 : 0),
            bankerPair: counts.bankerPair + (hasBankerPairDetected ? 1 : 0),
        };
    }, initialCounts);
};
