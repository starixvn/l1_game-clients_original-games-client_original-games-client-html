import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BetForm from "../bet-form";

// Mock the stores
jest.mock("@shared/stores/game-store/game-store", () => ({
    useGameStore: jest.fn(),
}));

jest.mock("@plinko/shared/stores/plinko-game-store", () => ({
    __esModule: true,
    default: jest.fn(),
}));

// Mock the form components
jest.mock("../form-components", () => ({
    BetAmountControl: ({ handleBetAmountChange, isDisabled }: any) => (
        <div data-testid="bet-amount-control">
            <button onClick={() => handleBetAmountChange(100)} disabled={isDisabled} data-testid="bet-amount-button">
                Set Bet Amount
            </button>
        </div>
    ),
    GameModeSelector: ({ isDisabled }: any) => (
        <div data-testid="game-mode-selector" data-disabled={isDisabled}>
            Game Mode Selector
        </div>
    ),
    RowsSelector: ({ isDisabled }: any) => (
        <div data-testid="rows-selector" data-disabled={isDisabled}>
            Rows Selector
        </div>
    ),
}));

// Mock AutoBetGroup
jest.mock("../auto-mode/auto-bet-group", () => {
    return function MockAutoBetGroup({ isDisabled, isAutoBet, setIsAutoBet, handleBetAmountChange, maxBet }: any) {
        return (
            <div data-testid="auto-bet-group" data-disabled={isDisabled} data-auto-bet={isAutoBet}>
                <button onClick={() => setIsAutoBet(!isAutoBet)} disabled={isDisabled} data-testid="toggle-auto-bet">
                    Toggle Auto Bet
                </button>
                <button onClick={() => handleBetAmountChange(maxBet)} disabled={isDisabled} data-testid="set-max-bet">
                    Set Max Bet
                </button>
            </div>
        );
    };
});

describe("BetForm", () => {
    const mockUseGameStore = require("@shared/stores/game-store/game-store").useGameStore;
    const mockUsePlinkoGameStore = require("@plinko/shared/stores/plinko-game-store").default;

    const defaultGameStoreState = {
        gameMinBet: 10,
        gameMaxBet: 1000,
        userStakeLevel: {
            minBet: 5,
            maxBet: 500,
        },
    };

    const defaultPlinkoStoreState = {
        betAmount: 50,
        setBetAmount: jest.fn(),
    };

    const defaultProps = {
        isManualTab: true,
        isDisabled: false,
        isAutoBet: false,
        setIsAutoBet: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseGameStore.mockReturnValue(defaultGameStoreState);
        mockUsePlinkoGameStore.mockReturnValue(defaultPlinkoStoreState);
    });

    describe("Rendering", () => {
        it("should render all form components", () => {
            // Arrange
            render(<BetForm {...defaultProps} />);

            // Act & Assert
            expect(screen.getByTestId("bet-amount-control")).toBeInTheDocument();
            expect(screen.getByTestId("game-mode-selector")).toBeInTheDocument();
            expect(screen.getByTestId("rows-selector")).toBeInTheDocument();
        });

        it("should render AutoBetGroup when not in manual tab", () => {
            // Arrange
            render(<BetForm {...defaultProps} isManualTab={false} />);

            // Act & Assert
            expect(screen.getByTestId("auto-bet-group")).toBeInTheDocument();
        });

        it("should not render AutoBetGroup when in manual tab", () => {
            // Arrange
            render(<BetForm {...defaultProps} isManualTab={true} />);

            // Act & Assert
            expect(screen.queryByTestId("auto-bet-group")).not.toBeInTheDocument();
        });

        it("should pass disabled state to all form components", () => {
            // Arrange
            render(<BetForm {...defaultProps} isDisabled={true} />);

            // Act & Assert
            expect(screen.getByTestId("game-mode-selector")).toHaveAttribute("data-disabled", "true");
            expect(screen.getByTestId("rows-selector")).toHaveAttribute("data-disabled", "true");
        });

        it("should pass disabled state to AutoBetGroup when not in manual tab", () => {
            // Arrange
            render(<BetForm {...defaultProps} isManualTab={false} isDisabled={true} />);

            // Act & Assert
            expect(screen.getByTestId("auto-bet-group")).toHaveAttribute("data-disabled", "true");
        });
    });

    describe("Bet Amount Handling", () => {
        it("should call setBetAmount with correct parameters when bet amount changes", () => {
            // Arrange
            const mockSetBetAmount = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setBetAmount: mockSetBetAmount,
            });
            render(<BetForm {...defaultProps} />);

            // Act
            fireEvent.click(screen.getByTestId("bet-amount-button"));

            // Assert
            expect(mockSetBetAmount).toHaveBeenCalledWith(100, 10, 500); // amount, minBet, maxBet
        });

        it("should calculate min and max bet correctly from game store and user stake level", () => {
            // Arrange
            const mockSetBetAmount = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setBetAmount: mockSetBetAmount,
            });
            render(<BetForm {...defaultProps} />);

            // Act
            fireEvent.click(screen.getByTestId("bet-amount-button"));

            // Assert
            // minBet = Math.max(userStakeLevel.minBet, gameMinBet) = Math.max(5, 10) = 10
            // maxBet = Math.min(userStakeLevel.maxBet, gameMaxBet) = Math.min(500, 1000) = 500
            expect(mockSetBetAmount).toHaveBeenCalledWith(100, 10, 500);
        });

        it("should handle missing game config gracefully", () => {
            // Arrange
            mockUseGameStore.mockReturnValue({
                gameMinBet: null,
                gameMaxBet: null,
                userStakeLevel: null,
            });
            const mockSetBetAmount = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setBetAmount: mockSetBetAmount,
            });
            render(<BetForm {...defaultProps} />);

            // Act
            fireEvent.click(screen.getByTestId("bet-amount-button"));

            // Assert
            expect(mockSetBetAmount).toHaveBeenCalledWith(100, 0, 0);
        });

        it("should call setBetAmount on mount when minBet and maxBet change", async () => {
            // Arrange
            const mockSetBetAmount = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setBetAmount: mockSetBetAmount,
            });
            render(<BetForm {...defaultProps} />);

            // Act & Assert
            await waitFor(() => {
                expect(mockSetBetAmount).toHaveBeenCalledWith(50, 10, 500);
            });
        });
    });

    describe("Auto Bet Integration", () => {
        it("should pass correct props to AutoBetGroup", () => {
            // Arrange
            const mockSetIsAutoBet = jest.fn();
            render(<BetForm {...defaultProps} isManualTab={false} isAutoBet={true} setIsAutoBet={mockSetIsAutoBet} />);

            // Act & Assert
            const autoBetGroup = screen.getByTestId("auto-bet-group");
            expect(autoBetGroup).toHaveAttribute("data-auto-bet", "true");
        });

        it("should call setIsAutoBet when auto bet is toggled", () => {
            // Arrange
            const mockSetIsAutoBet = jest.fn();
            render(<BetForm {...defaultProps} isManualTab={false} setIsAutoBet={mockSetIsAutoBet} />);

            // Act
            fireEvent.click(screen.getByTestId("toggle-auto-bet"));

            // Assert
            expect(mockSetIsAutoBet).toHaveBeenCalledWith(true);
        });

        it("should pass maxBet to AutoBetGroup", () => {
            // Arrange
            render(<BetForm {...defaultProps} isManualTab={false} />);

            // Act
            fireEvent.click(screen.getByTestId("set-max-bet"));

            // Assert
            const mockSetBetAmount = defaultPlinkoStoreState.setBetAmount;
            expect(mockSetBetAmount).toHaveBeenCalledWith(500, 10, 500); // maxBet, minBet, maxBet
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero bet amounts", () => {
            // Arrange
            mockUseGameStore.mockReturnValue({
                gameMinBet: 0,
                gameMaxBet: 0,
                userStakeLevel: {
                    minBet: 0,
                    maxBet: 0,
                },
            });
            const mockSetBetAmount = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setBetAmount: mockSetBetAmount,
            });
            render(<BetForm {...defaultProps} />);

            // Act
            fireEvent.click(screen.getByTestId("bet-amount-button"));

            // Assert
            expect(mockSetBetAmount).toHaveBeenCalledWith(100, 0, 0);
        });

        it("should handle when userStakeLevel maxBet is higher than gameMaxBet", () => {
            // Arrange
            mockUseGameStore.mockReturnValue({
                gameMinBet: 10,
                gameMaxBet: 100,
                userStakeLevel: {
                    minBet: 5,
                    maxBet: 200,
                },
            });
            const mockSetBetAmount = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setBetAmount: mockSetBetAmount,
            });
            render(<BetForm {...defaultProps} />);

            // Act
            fireEvent.click(screen.getByTestId("bet-amount-button"));

            // Assert
            // maxBet should be limited to gameMaxBet (100)
            expect(mockSetBetAmount).toHaveBeenCalledWith(100, 10, 100);
        });

        it("should handle when userStakeLevel minBet is lower than gameMinBet", () => {
            // Arrange
            mockUseGameStore.mockReturnValue({
                gameMinBet: 50,
                gameMaxBet: 1000,
                userStakeLevel: {
                    minBet: 10,
                    maxBet: 500,
                },
            });
            const mockSetBetAmount = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setBetAmount: mockSetBetAmount,
            });
            render(<BetForm {...defaultProps} />);

            // Act
            fireEvent.click(screen.getByTestId("bet-amount-button"));

            // Assert
            // minBet should be limited to gameMinBet (50)
            expect(mockSetBetAmount).toHaveBeenCalledWith(100, 50, 500);
        });
    });

    describe("Component Structure", () => {
        it("should have correct CSS classes for layout", () => {
            // Arrange
            const { container } = render(<BetForm {...defaultProps} />);

            // Act & Assert
            const formContainer = container.firstChild;
            expect(formContainer).toHaveClass(
                "flex",
                "flex-col",
                "gap-3",
                "p-3",
                "md:gap-4",
                "md:px-3",
                "md:py-3",
                "md:max-h-[30.75rem]",
                "md:overflow-y-auto"
            );
        });

        it("should have scrollbar scrollbar-hide-on-idle", () => {
            // Arrange
            const { container } = render(<BetForm {...defaultProps} />);

            // Act & Assert
            const formContainer = container.firstChild;
            expect(formContainer).toHaveClass("scrollbar-hide-on-idle");
        });
    });
});
