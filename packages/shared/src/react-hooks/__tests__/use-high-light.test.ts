import { RoundState } from '@shared/merged/components/game-base/type';
import { isHighLightWinningResult, isShowHighlightPrevResult } from "../use-high-light";

describe("use-high-light", () => {
    describe("isHighLightWinningResult", () => {
        it("should return true when all conditions are met for highlighting winning result", () => {
            // Arrange
            const props = {
                betChoice: "player",
                roundState: RoundState.DisplayResult,
                showResultInfo: true,
                settlementResult: {
                    banker: false,
                    player: true,
                },
            };

            // Act
            const result = isHighLightWinningResult(props);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false when round state is not DisplayResult", () => {
            // Arrange
            const props = {
                betChoice: "player",
                roundState: RoundState.InRound,
                showResultInfo: true,
                settlementResult: {
                    player: true,
                },
            };

            // Act
            const result = isHighLightWinningResult(props);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when showResultInfo is false", () => {
            // Arrange
            const props = {
                betChoice: "player",
                roundState: RoundState.DisplayResult,
                showResultInfo: false,
                settlementResult: {
                    player: true,
                },
            };

            // Act
            const result = isHighLightWinningResult(props);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when settlementResult for betChoice is false", () => {
            // Arrange
            const props = {
                betChoice: "player",
                roundState: RoundState.DisplayResult,
                showResultInfo: true,
                settlementResult: {
                    player: false,
                },
            };

            // Act
            const result = isHighLightWinningResult(props);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("isShowHighlightPrevResult", () => {
        it("should return true when previous round exists and was won", () => {
            // Arrange
            const props = {
                betChoice: "player",
                roundState: RoundState.SwitchRound,
                roundHistory: [
                    {
                        settlementResult: {
                            player: true,
                        },
                    },
                ],
            };

            // Act
            const result = isShowHighlightPrevResult(props);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false when round history is empty", () => {
            // Arrange
            const props = {
                betChoice: "player",
                roundState: RoundState.InRound,
                roundHistory: [],
            };

            // Act
            const result = isShowHighlightPrevResult(props);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when round state is not valid", () => {
            // Arrange
            const props = {
                betChoice: "player",
                roundState: RoundState.DisplayResult,
                roundHistory: [
                    {
                        settlementResult: {
                            player: true,
                        },
                    },
                ],
            };

            // Act
            const result = isShowHighlightPrevResult(props);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when previous round was lost", () => {
            // Arrange
            const props = {
                betChoice: "player",
                roundState: RoundState.InRound,
                roundHistory: [
                    {
                        settlementResult: {
                            player: false,
                        },
                    },
                ],
            };

            // Act
            const result = isShowHighlightPrevResult(props);

            // Assert
            expect(result).toBe(false);
        });
    });
});
