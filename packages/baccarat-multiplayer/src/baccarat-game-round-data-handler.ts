import { GameRoundDataHandler } from "@shared/components/game-base/handlers/game-round-data-handler";
import { BaccaratGameLogic } from "./baccarat-helper";

export class BaccaratGameRoundDataHandler extends GameRoundDataHandler {
    buildGameRoundDataAfterReceiveFinishEvent(previousRoundData: any, result: any, roundId: number) {
        const normalized = this.normalizeResult(result);

        const resultRoundData = {
            player: normalized.player,
            banker: normalized.banker,
            winner: normalized.winner,
            roundId,
            timestamp: new Date().toISOString(),
        };

        const mergedHistory = (previousRoundData?.history || []).concat([{ ...resultRoundData }]);

        const statistics = this.calculateStatistics(previousRoundData?.statistics, normalized);

        return {
            history: mergedHistory,
            last: resultRoundData,
            roundId,
            timestamp: resultRoundData.timestamp,
            gameType: "baccarat",
            statistics,
        };
    }

    private normalizeResult(result: any) {
        // Handle the new API data format
        let player: any[] = [];
        let banker: any[] = [];

        if (result?.result?.player && result?.result?.banker) {
            // New format: result.player.card1, result.player.card2, etc.
            const playerCards = [];
            const bankerCards = [];

            if (result.result.player.card1 && result.result.player.card1.card !== undefined) playerCards.push(result.result.player.card1);
            if (result.result.player.card2 && result.result.player.card2.card !== undefined) playerCards.push(result.result.player.card2);
            if (result.result.player.card3 && result.result.player.card3.card !== undefined) playerCards.push(result.result.player.card3);

            if (result.result.banker.card1 && result.result.banker.card1.card !== undefined) bankerCards.push(result.result.banker.card1);
            if (result.result.banker.card2 && result.result.banker.card2.card !== undefined) bankerCards.push(result.result.banker.card2);
            if (result.result.banker.card3 && result.result.banker.card3.card !== undefined) bankerCards.push(result.result.banker.card3);

            player = playerCards;
            banker = bankerCards;
        } else {
            // Fallback to old format
            player = (result?.playerCards || result?.player || []) as any[];
            banker = (result?.bankerCards || result?.banker || []) as any[];
        }

        // Determine winner from settlement result or calculate
        let winner: "player" | "banker" | "tie";
        if (result?.settlementResult) {
            if (result.settlementResult.player) {
                winner = "player";
            } else if (result.settlementResult.banker) {
                winner = "banker";
            } else {
                winner = "tie";
            }
        } else {
            winner = BaccaratGameLogic.calculateWinner(player, banker);
        }

        // Add additional baccarat-specific data
        const playerTotal = BaccaratGameLogic.getBaccaratTotal(player);
        const bankerTotal = BaccaratGameLogic.getBaccaratTotal(banker);
        const isNatural = result?.settlementResult?.natural || BaccaratGameLogic.isNatural(player) || BaccaratGameLogic.isNatural(banker);
        const playerPair = result?.settlementResult?.playerPair || BaccaratGameLogic.hasPair(player);
        const bankerPair = result?.settlementResult?.bankerPair || BaccaratGameLogic.hasPair(banker);
        const thirdCardInfo = BaccaratGameLogic.shouldDrawThirdCard(player, banker);

        return {
            player,
            banker,
            winner,
            playerTotal,
            bankerTotal,
            isNatural,
            playerPair,
            bankerPair,
            thirdCardInfo
        };
    }

    private calculateStatistics(prevStats: any, normalized: any) {
        const stats = {
            wins: {
                player: 0,
                banker: 0,
                tie: 0,
            },
            totals: {
                player: normalized.playerTotal || BaccaratGameLogic.getBaccaratTotal(normalized.player),
                banker: normalized.bankerTotal || BaccaratGameLogic.getBaccaratTotal(normalized.banker),
            },
            rounds: 1,
            naturals: {
                player: 0,
                banker: 0,
            },
            pairs: {
                player: 0,
                banker: 0,
            },
            thirdCards: {
                player: 0,
                banker: 0,
            },
        } as any;

        if (prevStats) {
            stats.wins.player = prevStats.wins?.player || 0;
            stats.wins.banker = prevStats.wins?.banker || 0;
            stats.wins.tie = prevStats.wins?.tie || 0;
            stats.rounds = (prevStats.rounds || 0) + 1;
            stats.naturals.player = prevStats.naturals?.player || 0;
            stats.naturals.banker = prevStats.naturals?.banker || 0;
            stats.pairs.player = prevStats.pairs?.player || 0;
            stats.pairs.banker = prevStats.pairs?.banker || 0;
            stats.thirdCards.player = prevStats.thirdCards?.player || 0;
            stats.thirdCards.banker = prevStats.thirdCards?.banker || 0;
        }

        // Update win counts
        if (normalized.winner === "player") stats.wins.player += 1;
        if (normalized.winner === "banker") stats.wins.banker += 1;
        if (normalized.winner === "tie") stats.wins.tie += 1;

        // Update natural counts
        if (normalized.isNatural) {
            if (BaccaratGameLogic.isNatural(normalized.player)) {
                stats.naturals.player += 1;
            }
            if (BaccaratGameLogic.isNatural(normalized.banker)) {
                stats.naturals.banker += 1;
            }
        }

        // Update pair counts
        if (normalized.playerPair) stats.pairs.player += 1;
        if (normalized.bankerPair) stats.pairs.banker += 1;

        // Update third card counts
        if (normalized.thirdCardInfo?.player) stats.thirdCards.player += 1;
        if (normalized.thirdCardInfo?.banker) stats.thirdCards.banker += 1;

        return stats;
    }
}

export default BaccaratGameRoundDataHandler;


