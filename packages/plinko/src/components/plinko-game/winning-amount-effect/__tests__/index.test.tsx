import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import { WinningAmountEffect } from "../index";

// Mock the stores
jest.mock("@plinko/shared/stores/plinko-game-store", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("@shared", () => ({
    useCommonTranslate: jest.fn(),
}));

jest.mock("@shared/helpers", () => ({
    numberWithCommas: jest.fn((value, decimals) => {
        return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }),
}));

// Mock timers
jest.useFakeTimers();

describe("WinningAmountEffect", () => {
    const mockUsePlinkoGameStore = require("@plinko/shared/stores/plinko-game-store").default;
    const mockUseCommonTranslate = require("@shared").useCommonTranslate;
    const mockNumberWithCommas = require("@shared/helpers").numberWithCommas;

    const mockT = jest.fn((key) => key);
    const mockFinish = { winAmount: 1000 };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCommonTranslate.mockReturnValue({ t: mockT });
        mockNumberWithCommas.mockImplementation((value, decimals) => value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    describe("Rendering Logic", () => {
        it("should not render when winAmount is 0", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValue(null);

            // Act
            const { container } = render(<WinningAmountEffect />);

            // Assert
            expect(container.firstChild).toHaveClass("h-10");
            expect(container.textContent).toBe("");
        });

        it("should not render when finish is null", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValue(null);

            // Act
            const { container } = render(<WinningAmountEffect />);

            // Assert
            expect(container.firstChild).toHaveClass("h-10");
            expect(container.textContent).toBe("");
        });

        it("should not render when finish.winAmount is 0", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValue({ winAmount: 0 });

            // Act
            const { container } = render(<WinningAmountEffect />);

            // Assert
            expect(container.firstChild).toHaveClass("h-10");
            expect(container.textContent).toBe("");
        });

        it("should render when finish has positive winAmount", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish);

            // Act
            const { container } = render(<WinningAmountEffect />);

            // Assert
            expect(screen.getByText("win 1,000.00")).toBeInTheDocument();
        });
    });

    describe("State Management", () => {
        it("should accumulate winAmount when finish changes", () => {
            // Arrange
            const mockFinish1 = { winAmount: 500 };
            const mockFinish2 = { winAmount: 300 };
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish1).mockReturnValueOnce(mockFinish2);

            // Act
            render(<WinningAmountEffect />);

            // Assert
            expect(screen.getByText("win 800.00")).toBeInTheDocument();
        });

        it("should handle undefined winAmount gracefully", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce({ winAmount: undefined });

            // Act
            const { container } = render(<WinningAmountEffect />);

            // Assert
            expect(container.firstChild).toHaveClass("h-10");
            expect(container.textContent).toBe("");
        });

        it("should handle null winAmount gracefully", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce({ winAmount: null });

            // Act
            const { container } = render(<WinningAmountEffect />);

            // Assert
            expect(container.firstChild).toHaveClass("h-10");
            expect(container.textContent).toBe("");
        });
    });

    describe("Timer Behavior", () => {
        it("should clear winAmount after 3 seconds", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish);

            // Act
            const { rerender } = render(<WinningAmountEffect />);
            expect(screen.getByText("win 1,000.00")).toBeInTheDocument();

            // Fast-forward time by 3 seconds
            act(() => {
                jest.advanceTimersByTime(4000);
            });
            rerender(<WinningAmountEffect />);

            // Assert
            expect(screen.queryByText("win 1,000.00")).not.toBeInTheDocument();
        });

        it("should clear previous timeout when finish changes", () => {
            // Arrange
            const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
            const mockFinish1 = { winAmount: 500 };
            const mockFinish2 = { winAmount: 300 };
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish1).mockReturnValueOnce(mockFinish2);

            // Act
            const { rerender } = render(<WinningAmountEffect />);
            rerender(<WinningAmountEffect />);

            // Assert
            expect(clearTimeoutSpy).toHaveBeenCalled();
        });

        it("should cleanup timeout on unmount", () => {
            // Arrange
            const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish);

            // Act
            const { unmount } = render(<WinningAmountEffect />);
            unmount();

            // Assert
            expect(clearTimeoutSpy).toHaveBeenCalled();
        });
    });

    describe("Translation Integration", () => {
        it("should use translation for win text", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish);

            // Act
            render(<WinningAmountEffect />);

            // Assert
            expect(mockT).toHaveBeenCalledWith("win");
        });

        it("should format number with commas using helper function", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish);

            // Act
            render(<WinningAmountEffect />);

            // Assert
            expect(mockNumberWithCommas).toHaveBeenCalledWith(1000, 2);
        });

        it("should handle different win amounts correctly", () => {
            // Arrange
            const largeWinAmount = { winAmount: 1234567.89 };
            mockUsePlinkoGameStore.mockReturnValueOnce(largeWinAmount);

            // Act
            render(<WinningAmountEffect />);

            // Assert
            expect(mockNumberWithCommas).toHaveBeenCalledWith(1234567.89, 2);
            expect(screen.getByText("win 1,234,567.89")).toBeInTheDocument();
        });
    });
});
