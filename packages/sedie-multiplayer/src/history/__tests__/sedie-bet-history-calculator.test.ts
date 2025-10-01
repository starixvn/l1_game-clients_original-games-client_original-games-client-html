import { SeDieBetWinCalculator } from "../sedie-multiplayer-bet-history-calculator";

describe("SeDieBetWinCalculator", () => {
    const calculator = new SeDieBetWinCalculator();

    it("should calculate winnings for winning bet", () => {
        // Arrange
        const pendingDetails = [
            { amount: 100, choice: "even" },
        ];
        const resultData = {
            result: {},
            settlementResult: { even: true },
            odds: { even: 1.97 },
        } as any;

        // Act
        const betwin = calculator.calculateBetWin(pendingDetails, resultData);

        // Assert
        expect(betwin).toBeCloseTo(197);
    });

    it("should return 0 when losing all bets", () => {
        // Arrange
        const pendingDetails = [
            { amount: 100, choice: "odd" },
        ];
        const resultData = {
            result: {},
            settlementResult: { even: true },
            odds: { odd: 1.97 },
        } as any;

        // Act
        const betwin = calculator.calculateBetWin(pendingDetails, resultData);

        // Assert
        expect(betwin).toBe(0);
    });
});
