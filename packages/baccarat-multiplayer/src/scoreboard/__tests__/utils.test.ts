import {
    hasPlayerPair,
    hasBankerPair,
    hasNatural,
    getScoreboardImagePath,
    getWinnerFromSettlement,
    isBankerWin,
    getTieCount,
    calculateBaccaratBetCounts,
} from "../utils";
import { Round } from "@shared/components/game-base/type";
import { BaccaratResult, BaccaratSettlementResult } from "../../baccarat-multiplayer-constants";

describe("Baccarat Utils", () => {
    describe("hasPlayerPair", () => {
        it("should return true when player has two cards with same rank", () => {
            const playerCards = {
                card1: { suit: 0, rank: 10 },
                card2: { suit: 1, rank: 10 },
                card3: null,
                score: 0,
            };

            const result = hasPlayerPair(playerCards);
            expect(result).toBe(true);
        });

        it("should return true when player has three cards with same rank", () => {
            const playerCards = {
                card1: { suit: 0, rank: 7 },
                card2: { suit: 1, rank: 7 },
                card3: { suit: 2, rank: 7 },
                score: 1,
            };

            const result = hasPlayerPair(playerCards);
            expect(result).toBe(true);
        });

        it("should return false when player has no pairs", () => {
            const playerCards = {
                card1: { suit: 0, rank: 5 },
                card2: { suit: 1, rank: 8 },
                card3: null,
                score: 3,
            };

            const result = hasPlayerPair(playerCards);
            expect(result).toBe(false);
        });

        it("should return false when player has only one card", () => {
            const playerCards = {
                card1: { suit: 0, rank: 10 },
                card2: null,
                card3: null,
                score: 0,
            };

            const result = hasPlayerPair(playerCards);
            expect(result).toBe(false);
        });

        it("should handle cards with undefined rank", () => {
            const playerCards = {
                card1: { suit: 0, rank: undefined as any },
                card2: { suit: 1, rank: 10 },
                card3: null,
                score: 0,
            };

            const result = hasPlayerPair(playerCards);
            expect(result).toBe(false);
        });

        it("should handle null cards in the array", () => {
            const playerCards = {
                card1: null,
                card2: { suit: 1, rank: 10 },
                card3: { suit: 2, rank: 10 },
                score: 0,
            };

            const result = hasPlayerPair(playerCards);
            expect(result).toBe(true);
        });

        it("should handle three different cards with no pairs", () => {
            const playerCards = {
                card1: { suit: 0, rank: 5 },
                card2: { suit: 1, rank: 7 },
                card3: { suit: 2, rank: 9 },
                score: 1,
            };

            const result = hasPlayerPair(playerCards);
            expect(result).toBe(false);
        });

        it("should find pair among three cards", () => {
            const playerCards = {
                card1: { suit: 0, rank: 5 },
                card2: { suit: 1, rank: 7 },
                card3: { suit: 2, rank: 5 },
                score: 7,
            };

            const result = hasPlayerPair(playerCards);
            expect(result).toBe(true);
        });
    });

    describe("hasBankerPair", () => {
        it("should return true when banker has two cards with same rank", () => {
            const bankerCards = {
                card1: { suit: 0, rank: 9 },
                card2: { suit: 1, rank: 9 },
                card3: null,
                score: 8,
            };

            const result = hasBankerPair(bankerCards);
            expect(result).toBe(true);
        });

        it("should return true when banker has three cards with same rank", () => {
            const bankerCards = {
                card1: { suit: 0, rank: 6 },
                card2: { suit: 1, rank: 6 },
                card3: { suit: 2, rank: 6 },
                score: 8,
            };

            const result = hasBankerPair(bankerCards);
            expect(result).toBe(true);
        });

        it("should return false when banker has no pairs", () => {
            const bankerCards = {
                card1: { suit: 0, rank: 2 },
                card2: { suit: 1, rank: 7 },
                card3: null,
                score: 9,
            };

            const result = hasBankerPair(bankerCards);
            expect(result).toBe(false);
        });

        it("should return false when banker has only one card", () => {
            const bankerCards = {
                card1: { suit: 0, rank: 10 },
                card2: null,
                card3: null,
                score: 0,
            };

            const result = hasBankerPair(bankerCards);
            expect(result).toBe(false);
        });

        it("should handle cards with undefined rank", () => {
            const bankerCards = {
                card1: { suit: 0, rank: undefined as any },
                card2: { suit: 1, rank: 10 },
                card3: null,
                score: 0,
            };

            const result = hasBankerPair(bankerCards);
            expect(result).toBe(false);
        });

        it("should handle null cards in the array", () => {
            const bankerCards = {
                card1: null,
                card2: { suit: 1, rank: 10 },
                card3: { suit: 2, rank: 10 },
                score: 0,
            };

            const result = hasBankerPair(bankerCards);
            expect(result).toBe(true);
        });

        it("should handle three different cards with no pairs", () => {
            const bankerCards = {
                card1: { suit: 0, rank: 5 },
                card2: { suit: 1, rank: 7 },
                card3: { suit: 2, rank: 9 },
                score: 1,
            };

            const result = hasBankerPair(bankerCards);
            expect(result).toBe(false);
        });

        it("should find pair among three cards", () => {
            const bankerCards = {
                card1: { suit: 0, rank: 5 },
                card2: { suit: 1, rank: 7 },
                card3: { suit: 2, rank: 5 },
                score: 7,
            };

            const result = hasBankerPair(bankerCards);
            expect(result).toBe(true);
        });
    });

    describe("hasNatural", () => {
        it("should return true when player has natural (score 8)", () => {
            const result: BaccaratResult = {
                player: {
                    card1: { suit: 0, rank: 8 },
                    card2: { suit: 1, rank: 13 },
                    card3: null,
                    score: 8,
                },
                banker: {
                    card1: { suit: 2, rank: 5 },
                    card2: { suit: 3, rank: 2 },
                    card3: null,
                    score: 7,
                },
            };

            const natural = hasNatural(result);
            expect(natural).toBe(true);
        });

        it("should return true when player has natural (score 9)", () => {
            const result: BaccaratResult = {
                player: {
                    card1: { suit: 0, rank: 9 },
                    card2: { suit: 1, rank: 13 },
                    card3: null,
                    score: 9,
                },
                banker: {
                    card1: { suit: 2, rank: 5 },
                    card2: { suit: 3, rank: 2 },
                    card3: null,
                    score: 7,
                },
            };

            const natural = hasNatural(result);
            expect(natural).toBe(true);
        });

        it("should return true when banker has natural (score 8)", () => {
            const result: BaccaratResult = {
                player: {
                    card1: { suit: 0, rank: 5 },
                    card2: { suit: 1, rank: 2 },
                    card3: null,
                    score: 7,
                },
                banker: {
                    card1: { suit: 2, rank: 8 },
                    card2: { suit: 3, rank: 13 },
                    card3: null,
                    score: 8,
                },
            };

            const natural = hasNatural(result);
            expect(natural).toBe(true);
        });

        it("should return true when banker has natural (score 9)", () => {
            const result: BaccaratResult = {
                player: {
                    card1: { suit: 0, rank: 5 },
                    card2: { suit: 1, rank: 2 },
                    card3: null,
                    score: 7,
                },
                banker: {
                    card1: { suit: 2, rank: 9 },
                    card2: { suit: 3, rank: 13 },
                    card3: null,
                    score: 9,
                },
            };

            const natural = hasNatural(result);
            expect(natural).toBe(true);
        });

        it("should return false when neither has natural", () => {
            const result: BaccaratResult = {
                player: {
                    card1: { suit: 0, rank: 5 },
                    card2: { suit: 1, rank: 2 },
                    card3: null,
                    score: 7,
                },
                banker: {
                    card1: { suit: 2, rank: 4 },
                    card2: { suit: 3, rank: 3 },
                    card3: null,
                    score: 7,
                },
            };

            const natural = hasNatural(result);
            expect(natural).toBe(false);
        });
    });

    describe("getScoreboardImagePath", () => {
        const originalEnv = process.env;

        beforeEach(() => {
            jest.resetModules();
            process.env = { ...originalEnv };
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it("should return player image path", () => {
            const result = getScoreboardImagePath("player");
            expect(result).toBe("/static/images/baccarat/scoreboard/bead-road/player.svg");
        });

        it("should return banker image path", () => {
            const result = getScoreboardImagePath("banker");
            expect(result).toBe("/static/images/baccarat/scoreboard/bead-road/banker.svg");
        });

        it("should return tie image path", () => {
            const result = getScoreboardImagePath("tie");
            expect(result).toBe("/static/images/baccarat/scoreboard/bead-road/tie.svg");
        });

        it("should return empty string for invalid variant", () => {
            const result = getScoreboardImagePath("invalid" as any);
            expect(result).toBe("");
        });

        it("should prepend base path when NEXT_PUBLIC_BASE_PATH is set", () => {
            process.env.NEXT_PUBLIC_BASE_PATH = "/game";
            const result = getScoreboardImagePath("player");
            expect(result).toBe("/game/static/images/baccarat/scoreboard/bead-road/player.svg");
        });
    });

    describe("getWinnerFromSettlement", () => {
        it("should return player as winner when player settlement is true", () => {
            const settlement: BaccaratSettlementResult = {
                player: true,
                banker: false,
                tie: false,
                anyPair: false,
            };

            const result = getWinnerFromSettlement(settlement);
            expect(result).toEqual({ hasWinner: true, winner: "player" });
        });

        it("should return banker as winner when banker settlement is true", () => {
            const settlement: BaccaratSettlementResult = {
                player: false,
                banker: true,
                tie: false,
                anyPair: false,
            };

            const result = getWinnerFromSettlement(settlement);
            expect(result).toEqual({ hasWinner: true, winner: "banker" });
        });

        it("should return tie as winner when tie settlement is true", () => {
            const settlement: BaccaratSettlementResult = {
                player: false,
                banker: false,
                tie: true,
                anyPair: false,
            };

            const result = getWinnerFromSettlement(settlement);
            expect(result).toEqual({ hasWinner: true, winner: "tie" });
        });

        it("should return hasWinner false when no winner", () => {
            const settlement: BaccaratSettlementResult = {
                player: false,
                banker: false,
                tie: false,
                anyPair: false,
            };

            const result = getWinnerFromSettlement(settlement);
            expect(result).toEqual({ hasWinner: false });
        });

        it("should prioritize player over banker and tie", () => {
            const settlement: BaccaratSettlementResult = {
                player: true,
                banker: true,
                tie: true,
                anyPair: false,
            };

            const result = getWinnerFromSettlement(settlement);
            expect(result).toEqual({ hasWinner: true, winner: "player" });
        });
    });

    describe("isBankerWin", () => {
        it("should return true when any settlement has banker win", () => {
            const data: BaccaratSettlementResult[] = [
                { player: true, banker: false, tie: false, anyPair: false },
                { player: false, banker: true, tie: false, anyPair: false },
            ];

            const result = isBankerWin(data);
            expect(result).toBe(true);
        });

        it("should return false when no settlement has banker win", () => {
            const data: BaccaratSettlementResult[] = [
                { player: true, banker: false, tie: false, anyPair: false },
                { player: false, banker: false, tie: true, anyPair: false },
            ];

            const result = isBankerWin(data);
            expect(result).toBe(false);
        });

        it("should return false for empty array", () => {
            const data: BaccaratSettlementResult[] = [];

            const result = isBankerWin(data);
            expect(result).toBe(false);
        });
    });

    describe("getTieCount", () => {
        it("should return data length when first result has tie", () => {
            const data: BaccaratSettlementResult[] = [
                { player: false, banker: false, tie: true, anyPair: false },
                { player: true, banker: false, tie: false, anyPair: false },
                { player: false, banker: true, tie: false, anyPair: false },
            ];

            const result = getTieCount(data);
            expect(result).toBe(3);
        });

        it("should return data length minus 1 when first result does not have tie", () => {
            const data: BaccaratSettlementResult[] = [
                { player: true, banker: false, tie: false, anyPair: false },
                { player: false, banker: false, tie: true, anyPair: false },
                { player: false, banker: true, tie: false, anyPair: false },
            ];

            const result = getTieCount(data);
            expect(result).toBe(2);
        });

        it("should return 0 for empty array", () => {
            const data: BaccaratSettlementResult[] = [];

            const result = getTieCount(data);
            expect(result).toBe(0);
        });

        it("should return 0 when first result has no tie and array has 1 element", () => {
            const data: BaccaratSettlementResult[] = [
                { player: true, banker: false, tie: false, anyPair: false },
            ];

            const result = getTieCount(data);
            expect(result).toBe(0);
        });
    });

    describe("calculateBaccaratBetCounts", () => {
        const mockRoundHistory: Round<BaccaratResult, BaccaratSettlementResult>[] = [
            {
                roundId: 1,
                result: {
                    player: {
                        card1: { suit: 0, rank: 10 },
                        card2: { suit: 1, rank: 10 },
                        card3: null,
                        score: 0,
                    },
                    banker: {
                        card1: { suit: 2, rank: 5 },
                        card2: { suit: 3, rank: 6 },
                        card3: null,
                        score: 1,
                    },
                },
                settlementResult: {
                    player: true,
                    banker: false,
                    tie: false,
                    anyPair: false,
                },
            },
            {
                roundId: 2,
                result: {
                    player: {
                        card1: { suit: 0, rank: 7 },
                        card2: { suit: 1, rank: 8 },
                        card3: null,
                        score: 5,
                    },
                    banker: {
                        card1: { suit: 2, rank: 9 },
                        card2: { suit: 3, rank: 9 },
                        card3: null,
                        score: 8,
                    },
                },
                settlementResult: {
                    player: false,
                    banker: true,
                    tie: false,
                    anyPair: false,
                },
            },
            {
                roundId: 3,
                result: {
                    player: {
                        card1: { suit: 0, rank: 6 },
                        card2: { suit: 1, rank: 6 },
                        card3: null,
                        score: 2,
                    },
                    banker: {
                        card1: { suit: 2, rank: 5 },
                        card2: { suit: 3, rank: 5 },
                        card3: null,
                        score: 0,
                    },
                },
                settlementResult: {
                    player: false,
                    banker: false,
                    tie: true,
                    anyPair: false,
                },
            },
        ];

        it("should calculate bet counts correctly", () => {
            const result = calculateBaccaratBetCounts(mockRoundHistory);

            expect(result).toEqual({
                player: 1, // Round 1
                banker: 1, // Round 2
                tie: 1, // Round 3
                playerPair: 2, // Round 1 and Round 3
                bankerPair: 2, // Round 2 and Round 3
            });
        });

        it("should return zero counts for empty round history", () => {
            const result = calculateBaccaratBetCounts([]);

            expect(result).toEqual({
                player: 0,
                banker: 0,
                tie: 0,
                playerPair: 0,
                bankerPair: 0,
            });
        });

        it("should handle rounds without results gracefully", () => {
            const roundsWithoutResults: Round<BaccaratResult, BaccaratSettlementResult>[] = [
                {
                    roundId: 1,
                    result: null as any,
                    settlementResult: {
                        player: true,
                        banker: false,
                        tie: false,
                        anyPair: false,
                    },
                },
            ];

            const result = calculateBaccaratBetCounts(roundsWithoutResults);

            expect(result).toEqual({
                player: 0, // settlementResult exists but result is null
                banker: 0,
                tie: 0,
                playerPair: 0,
                bankerPair: 0,
            });
        });

        it("should handle rounds without settlement results gracefully", () => {
            const roundsWithoutSettlement: Round<BaccaratResult, BaccaratSettlementResult>[] = [
                {
                    roundId: 1,
                    result: {
                        player: {
                            card1: { suit: 0, rank: 10 },
                            card2: { suit: 1, rank: 10 },
                            card3: null,
                            score: 0,
                        },
                        banker: {
                            card1: { suit: 2, rank: 5 },
                            card2: { suit: 3, rank: 6 },
                            card3: null,
                            score: 1,
                        },
                    },
                    settlementResult: null as any,
                },
            ];

            const result = calculateBaccaratBetCounts(roundsWithoutSettlement);

            expect(result).toEqual({
                player: 0, // settlementResult is null
                banker: 0,
                tie: 0,
                playerPair: 0,
                bankerPair: 0,
            });
        });
    });
});
