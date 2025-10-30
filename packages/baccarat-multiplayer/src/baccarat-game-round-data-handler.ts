import { GameRoundDataHandler } from "@shared/components/game-base/handlers/game-round-data-handler";
import { BaccaratGameLogic } from "./baccarat-helper";
import { Winner } from "./baccarat-multiplayer-constants";

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
        const { player, banker } = this.extractCards(result);
        const winner = this.determineWinner(result, player, banker);
        const additionalData = this.calculateAdditionalData(result, player, banker);

        return {
            player,
            banker,
            winner,
            ...additionalData,
        };
    }

    private extractCards(result: any) {
        if (result?.result?.player && result?.result?.banker) {
            return {
                player: this.extractCardsFromFormat(result.result.player),
                banker: this.extractCardsFromFormat(result.result.banker),
            };
        }

        return {
            player: (result?.playerCards || result?.player || []) as any[],
            banker: (result?.bankerCards || result?.banker || []) as any[],
        };
    }

    private extractCardsFromFormat(cards: any) {
        const validCards = [];
        for (let i = 1; i <= 3; i++) {
            const card = cards[`card${i}`];
            if (card?.card !== undefined) {
                validCards.push(card);
            }
        }
        return validCards;
    }

    private determineWinner(result: any, player: any[], banker: any[]) {
        if (result?.settlementResult) {
            if (result.settlementResult.player) {
                return Winner.PLAYER;
            }
            if (result.settlementResult.banker) {
                return Winner.BANKER;
            }
            return Winner.TIE;
        }
        return BaccaratGameLogic.calculateWinner(player, banker);
    }

    private calculateAdditionalData(result: any, player: any[], banker: any[]) {
        const playerTotal = BaccaratGameLogic.getBaccaratTotal(player);
        const bankerTotal = BaccaratGameLogic.getBaccaratTotal(banker);

        return {
            playerTotal,
            bankerTotal,
            isNatural: result?.settlementResult?.natural || BaccaratGameLogic.isNatural(player) || BaccaratGameLogic.isNatural(banker),
            playerPair: result?.settlementResult?.playerPair || BaccaratGameLogic.hasPair(player),
            bankerPair: result?.settlementResult?.bankerPair || BaccaratGameLogic.hasPair(banker),
            thirdCardInfo: BaccaratGameLogic.shouldDrawThirdCard(player, banker),
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
        if (normalized.winner === Winner.PLAYER) {
            stats.wins.player += 1;
        }
        if (normalized.winner === Winner.BANKER) {
            stats.wins.banker += 1;
        }
        if (normalized.winner === Winner.TIE) {
            stats.wins.tie += 1;
        }

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
        if (normalized.playerPair) {
            stats.pairs.player += 1;
        }
        if (normalized.bankerPair) {
            stats.pairs.banker += 1;
        }

        // Update third card counts
        if (normalized.thirdCardInfo?.player) {
            stats.thirdCards.player += 1;
        }
        if (normalized.thirdCardInfo?.banker) {
            stats.thirdCards.banker += 1;
        }

        return stats;
    }
}

export default BaccaratGameRoundDataHandler;
