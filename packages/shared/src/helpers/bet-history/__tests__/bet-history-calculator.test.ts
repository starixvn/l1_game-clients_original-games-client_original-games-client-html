import { GenericBetWinCalculator } from "../bet-history-calculator";

describe("GenericBetWinCalculator", () => {
    const calculator = new GenericBetWinCalculator();

    it("should calculate winnings correctly for winning bets", () => {
        // Arrange
        const pendingDetails = [
            { amount: 100, choice: "red" },
            { amount: 50, choice: "black" },
        ];
        const resultData = {
            result: {},
            settlementResult: { red: true, black: false },
            odds: { red: 2, black: 2 },
        } as any;

        // Act
        const betwin = calculator.calculateBetWin(pendingDetails, resultData);

        // Assert
        expect(betwin).toBe(200);
    });

    it("should return 0 when there are no winning bets", () => {
        // Arrange
        const pendingDetails = [
            { amount: 100, choice: "red" },
        ];
        const resultData = {
            result: {},
            settlementResult: { black: true },
            odds: { red: 2, black: 2 },
        } as any;

        // Act
        const betwin = calculator.calculateBetWin(pendingDetails, resultData);

        // Assert
        expect(betwin).toBe(0);
    });
});
