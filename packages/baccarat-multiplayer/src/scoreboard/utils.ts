import { Round } from '@shared/components/game-base/type';
import { BaccaratResult, BaccaratSettlementResult } from "../baccarat-multiplayer-constants";

export const hasPlayerPair = (playerCards: BaccaratResult['player']): boolean => {
    const cards = [playerCards.card1, playerCards.card2, playerCards.card3].filter(Boolean);
    return cards.some((card1, i) =>
        cards.some((card2, j) => i !== j && card1.rank === card2.rank)
    );
};

export const hasBankerPair = (bankerCards: BaccaratResult['banker']): boolean => {
    const cards = [bankerCards.card1, bankerCards.card2, bankerCards.card3].filter(Boolean);
    return cards.some((card1, i) =>
        cards.some((card2, j) => i !== j && card1.rank === card2.rank)
    );
};

export const hasNatural = (result: BaccaratResult): boolean => {
    const playerNatural = (result.player.score === 8 || result.player.score === 9) && !result.player.card3;
    const bankerNatural = (result.banker.score === 8 || result.banker.score === 9) && !result.banker.card3;

    return playerNatural || bankerNatural;
};

export const getScoreboardImagePath = (variant: "player" | "banker" | "tie"): string => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    switch (variant) {
        case "player":
            return `${basePath}/static/images/baccarat/scoreboard/bead-road/player.svg`;
        case "banker":
            return `${basePath}/static/images/baccarat/scoreboard/bead-road/banker.svg`;
        case "tie":
            return `${basePath}/static/images/baccarat/scoreboard/bead-road/tie.svg`;
        default:
            return "";
    }
};

export type WinnerResult = { hasWinner: true; winner: "player" | "banker" | "tie" } | { hasWinner: false };

export const getWinnerFromSettlement = (settlementResult: BaccaratSettlementResult): WinnerResult => {
    if (settlementResult.player) {
        return { hasWinner: true, winner: "player" };
    }
    if (settlementResult.banker) {
        return { hasWinner: true, winner: "banker" };
    }
    if (settlementResult.tie) {
        return { hasWinner: true, winner: "tie" };
    }
    return { hasWinner: false };
};

export const isBankerWin = (data: BaccaratSettlementResult[]): boolean => {
    return data.some((result) => result.banker);
};

export const getTieCount = (data: BaccaratSettlementResult[]): number => {
    const firstResult = data[0];
    if (!firstResult) {
        return 0;
    }
    return firstResult.tie ? data.length : data.length - 1;
};


export interface BaccaratBetCounts {
    player: number;
    banker: number;
    tie: number;
    playerPair: number;
    bankerPair: number;
}

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
