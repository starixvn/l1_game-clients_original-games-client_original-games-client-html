import { BaccaratBetWinCalculator } from "../baccarat-multiplayer-bet-history-calculator";

describe("BaccaratBetWinCalculator", () => {
    const calculator = new BaccaratBetWinCalculator();

    it("should pay correct winnings for player win", () => {
        // Arrange
        const pendingDetails = [
            { amount: 100, choice: "player" },
            { amount: 50, choice: "tie" },
        ];
        const resultData = {
            result: {},
            settlementResult: { player: true },
            odds: { player: 1.95, tie: 8 },
        } as any;

        // Act
        const betwin = calculator.calculateBetWin(pendingDetails, resultData);

        // Assert
        expect(betwin).toBeCloseTo(195);
    });

    it("should refund player/banker bets on tie", () => {
        // Arrange
        const pendingDetails = [
            { amount: 100, choice: "player" },
            { amount: 80, choice: "banker" },
            { amount: 20, choice: "tie" },
        ];
        const resultData = {
            result: {},
            settlementResult: { tie: true },
            odds: { player: 1.95, banker: 1.95, tie: 8 },
        } as any;

        // Act
        const betwin = calculator.calculateBetWin(pendingDetails, resultData);

        // Assert (refund + tie)
        expect(betwin).toBeCloseTo(20 * 8 + 100 + 80);
    });
});
