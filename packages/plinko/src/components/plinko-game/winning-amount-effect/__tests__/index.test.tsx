import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { WinningAmountEffect } from "../index";
import { logger } from "@plinko/services/logger";

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

// Mock the logger
const mockLogger = {
    logGameEvent: jest.fn(),
    logUIEvent: jest.fn(),
};
jest.mock("@plinko/services/logger", () => ({
    logger: mockLogger,
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
            expect(container).toMatchSnapshot();
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
            jest.advanceTimersByTime(4000);
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

    describe("Logger Integration", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should log game event when winning amount is displayed", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish);

            // Act
            render(<WinningAmountEffect />);

            // Assert
            expect(mockLogger.logGameEvent).toHaveBeenCalledWith(
                'winning-amount-display',
                expect.objectContaining({
                    winAmount: 1000,
                    displayText: '1,000.00',
                    deviceInfo: expect.objectContaining({
                        isMobile: expect.any(Boolean),
                    })
                })
            );
        });

        it("should log game event when win amount accumulates", () => {
            // Arrange
            const mockFinish1 = { winAmount: 500 };
            const mockFinish2 = { winAmount: 300 };
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish1).mockReturnValueOnce(mockFinish2);

            // Act
            render(<WinningAmountEffect />);

            // Assert
            expect(mockLogger.logGameEvent).toHaveBeenCalledWith(
                'winning-amount-accumulation',
                expect.objectContaining({
                    newWinAmount: 300,
                    accumulatedTotal: 800,
                    previousTotal: 500,
                    deviceInfo: expect.objectContaining({
                        isMobile: expect.any(Boolean),
                    })
                })
            );
        });

        it("should log UI event when effect is hidden after timeout", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish);

            // Act
            const { rerender } = render(<WinningAmountEffect />);
            jest.advanceTimersByTime(4000);
            rerender(<WinningAmountEffect />);

            // Assert
            expect(mockLogger.logUIEvent).toHaveBeenCalledWith(
                'winning-amount-hidden',
                expect.objectContaining({
                    reason: 'timeout',
                    winAmount: 1000,
                    displayDuration: 3000,
                    deviceInfo: expect.objectContaining({
                        isMobile: expect.any(Boolean),
                    })
                })
            );
        });

        it("should log game event when component initializes", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce(null);

            // Act
            render(<WinningAmountEffect />);

            // Assert
            expect(mockLogger.logGameEvent).toHaveBeenCalledWith(
                'winning-amount-init',
                expect.objectContaining({
                    initialState: 'no-win',
                    deviceInfo: expect.objectContaining({
                        isMobile: expect.any(Boolean),
                    })
                })
            );
        });

        it("should not log display events when winAmount is 0", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce({ winAmount: 0 });

            // Act
            render(<WinningAmountEffect />);

            // Assert
            expect(mockLogger.logGameEvent).not.toHaveBeenCalledWith(
                'winning-amount-display',
                expect.any(Object)
            );
        });

        it("should log UI event on component unmount with cleanup", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValueOnce(mockFinish);

            // Act
            const { unmount } = render(<WinningAmountEffect />);
            unmount();

            // Assert
            expect(mockLogger.logUIEvent).toHaveBeenCalledWith(
                'winning-amount-cleanup',
                expect.objectContaining({
                    reason: 'component-unmount',
                    hadActiveTimeout: true,
                    deviceInfo: expect.objectContaining({
                        isMobile: expect.any(Boolean),
                    })
                })
            );
        });
    });
});
