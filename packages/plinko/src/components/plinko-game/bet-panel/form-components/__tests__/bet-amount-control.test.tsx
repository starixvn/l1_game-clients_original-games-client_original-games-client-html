import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BetAmountControl from "../bet-amount-control";

// Mock the stores
jest.mock("@shared/stores/game-store/game-store", () => ({
    useGameStore: jest.fn(),
}));

jest.mock("@plinko/shared/stores/plinko-game-store", () => ({
    __esModule: true,
    default: jest.fn(),
}));

// Mock the hooks
jest.mock("@shared/react-hooks", () => ({
    useCommonTranslate: jest.fn(),
    useClickOutside: jest.fn(),
    useClickSound: jest.fn().mockReturnValue(jest.fn()),
}));

describe("BetAmountControl", () => {
    const mockUseGameStore = require("@shared/stores/game-store/game-store").useGameStore;
    const mockUsePlinkoGameStore = require("@plinko/shared/stores/plinko-game-store").default;
    const mockUseCommonTranslate = require("@shared/react-hooks").useCommonTranslate;

    const defaultGameStoreState = {
        gameConfigs: {
            minBet: 10,
            maxBet: 1000,
        },
        userStakeLevel: {
            minBet: 5,
            maxBet: 500,
        },
    };

    const defaultPlinkoStoreState = {
        betAmount: 100,
    };

    const defaultTranslate = {
        t: (key: string) => key,
    };

    const defaultProps = {
        handleBetAmountChange: jest.fn(),
        isDisabled: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseGameStore.mockReturnValue(defaultGameStoreState);
        mockUsePlinkoGameStore.mockReturnValue(defaultPlinkoStoreState);
        mockUseCommonTranslate.mockReturnValue(defaultTranslate);
    });

    describe("Rendering", () => {
        it("should render label and input field", () => {
            // Arrange
            const { container } = render(<BetAmountControl {...defaultProps} />);

            // Act & Assert
            expect(screen.getByText("bet_amount")).toBeInTheDocument();
        });

        it("should render control buttons", () => {
            // Arrange
            render(<BetAmountControl {...defaultProps} />);

            // Act & Assert
            expect(screen.getByRole("button", { name: "1/2" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "2x" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "max" })).toBeInTheDocument();
        });
    });

    describe("Bet Amount Calculation", () => {
        it("should calculate min and max bet correctly", () => {
            // Arrange
            render(<BetAmountControl {...defaultProps} />);

            // Act & Assert
            expect(screen.getByRole("spinbutton")).toHaveValue(null); // Should show minBet initially
        });

        it("should handle when userStakeLevel maxBet is higher than gameConfigs maxBet", () => {
            // Arrange
            mockUseGameStore.mockReturnValue({
                gameConfigs: {
                    minBet: 10,
                    maxBet: 100,
                },
                userStakeLevel: {
                    minBet: 5,
                    maxBet: 500,
                },
            });
            render(<BetAmountControl {...defaultProps} />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "max" }));

            // Assert
            expect(defaultProps.handleBetAmountChange).toHaveBeenCalledWith(100); // Limited to gameConfigs.maxBet
        });

        it("should handle when userStakeLevel minBet is lower than gameConfigs minBet", () => {
            // Arrange
            mockUseGameStore.mockReturnValue({
                gameConfigs: {
                    minBet: 50,
                    maxBet: 1000,
                },
                userStakeLevel: {
                    minBet: 10,
                    maxBet: 500,
                },
            });
            render(<BetAmountControl {...defaultProps} />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "max" }));

            // Assert
            expect(defaultProps.handleBetAmountChange).toHaveBeenCalledWith(500); // Limited to userStakeLevel.maxBet
        });
    });

    describe("User Interactions", () => {
        it("should handle negative values by converting to absolute", () => {
            // Arrange
            render(<BetAmountControl {...defaultProps} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "-100" } });

            // Assert
            expect(input).toHaveValue(100);
        });

        it("should limit input to maximum value of 999999999", () => {
            // Arrange
            render(<BetAmountControl {...defaultProps} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "9999999999" } });

            // Assert
            expect(input).toHaveValue(999999999);
        });

        it("should reset to betAmount from store on blur", () => {
            // Arrange
            render(<BetAmountControl {...defaultProps} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "250" } });
            fireEvent.blur(input);

            // Assert
            expect(input).toHaveValue(null); // Reset to betAmount from store
        });

        it("should use minBet as fallback when input is empty on blur", () => {
            // Arrange
            render(<BetAmountControl {...defaultProps} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "" } });
            fireEvent.blur(input);

            // Assert
            expect(defaultProps.handleBetAmountChange).toHaveBeenCalledWith(0);
        });
    });

    describe("Control Buttons", () => {
        it("should call handleBetAmountChange with half amount when 1/2 button is clicked", () => {
            // Arrange
            render(<BetAmountControl {...defaultProps} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "200" } });
            fireEvent.click(screen.getByRole("button", { name: "1/2" }));

            // Assert
            expect(defaultProps.handleBetAmountChange).toHaveBeenCalledWith(100); // 200 / 2
        });

        it("should call handleBetAmountChange with double amount when 2x button is clicked", () => {
            // Arrange
            render(<BetAmountControl {...defaultProps} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "150" } });
            fireEvent.click(screen.getByRole("button", { name: "2x" }));

            // Assert
            expect(defaultProps.handleBetAmountChange).toHaveBeenCalledWith(300); // 150 * 2
        });

        it("should call handleBetAmountChange with maxBet when max button is clicked", () => {
            // Arrange
            render(<BetAmountControl {...defaultProps} />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "max" }));

            // Assert
            expect(defaultProps.handleBetAmountChange).toHaveBeenCalledWith(500); // maxBet
        });
    });

    describe("Disabled State", () => {
        it("should disable input when isDisabled is true", () => {
            // Arrange
            render(<BetAmountControl {...defaultProps} isDisabled={true} />);

            // Act & Assert
            expect(screen.getByRole("spinbutton")).toBeDisabled();
            expect(screen.getByRole("button", { name: "1/2" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "2x" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "max" })).toBeDisabled();
        });
    });
});
