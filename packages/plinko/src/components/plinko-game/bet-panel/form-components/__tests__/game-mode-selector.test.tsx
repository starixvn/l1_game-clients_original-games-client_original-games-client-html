import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameModeSelector from "../game-mode-selector";

// Mock the stores
jest.mock("@plinko/shared/stores/plinko-game-store", () => ({
    __esModule: true,
    default: jest.fn(),
}));

// Mock the hooks
jest.mock("@shared/react-hooks", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: jest.fn((key) => key) }),
}));

jest.mock("@shared/react-contexts", () => ({
    useGameContext: jest.fn(),
}));

// Mock constants
jest.mock("@plinko/constants", () => ({
    GAME_MODES: {
        LOW: 0,
        MEDIUM: 1,
        HIGH: 2,
    },
}));

describe("GameModeSelector", () => {
    const mockUsePlinkoGameStore = require("@plinko/shared/stores/plinko-game-store").default;
    const mockUseGameContext = require("@shared/react-contexts").useGameContext;

    const defaultPlinkoStoreState = {
        gameMode: 0, // LOW
        setGameMode: jest.fn(),
    };

    const defaultGameContext = {
        tolgeeNamespace: "plinko",
    };

    const defaultProps = {
        isDisabled: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePlinkoGameStore.mockReturnValue(defaultPlinkoStoreState);
        mockUseGameContext.mockReturnValue(defaultGameContext);
    });

    describe("Rendering", () => {
        it("should render label and mode buttons", () => {
            // Arrange
            const { container } = render(<GameModeSelector {...defaultProps} />);

            // Act & Assert
            expect(screen.getByText("mode")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "mode_low" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "mode_medium" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "mode_high" })).toBeInTheDocument();
        });
    });

    describe("Game Mode Selection", () => {
        it("should show LOW mode as pressed by default", () => {
            // Arrange
            render(<GameModeSelector {...defaultProps} />);

            // Act & Assert
            const lowButton = screen.getByRole("button", { name: "mode_low" });
            expect(lowButton).toHaveAttribute("aria-pressed", "true");
        });

        it("should show MEDIUM mode as pressed when selected", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                gameMode: 1, // MEDIUM
            });
            render(<GameModeSelector {...defaultProps} />);

            // Act & Assert
            const mediumButton = screen.getByRole("button", { name: "mode_medium" });
            expect(mediumButton).toHaveAttribute("aria-pressed", "true");
        });

        it("should show HIGH mode as pressed when selected", () => {
            // Arrange
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                gameMode: 2, // HIGH
            });
            render(<GameModeSelector {...defaultProps} />);

            // Act & Assert
            const highButton = screen.getByRole("button", { name: "mode_high" });
            expect(highButton).toHaveAttribute("aria-pressed", "true");
        });

        const testCases = [
            { gameMode: 0, buttonName: "mode_low" },
            { gameMode: 1, buttonName: "mode_medium" },
            { gameMode: 2, buttonName: "mode_high" },
        ];
        testCases.forEach((testCase) => {
            it(`should show ${testCase.gameMode} mode as pressed when selected`, () => {
                // Arrange
                const mockSetGameMode = jest.fn();
                mockUsePlinkoGameStore.mockReturnValue({
                    ...defaultPlinkoStoreState,
                    setGameMode: mockSetGameMode,
                });
                render(<GameModeSelector {...defaultProps} />);
                // Act
                fireEvent.click(screen.getByRole("button", { name: testCase.buttonName }));

                // Assert
                expect(mockSetGameMode).toHaveBeenCalledWith(testCase.gameMode);
            });
        });
    });

    describe("Disabled State", () => {
        it("should disable all buttons when isDisabled is true", () => {
            // Arrange
            render(<GameModeSelector {...defaultProps} isDisabled={true} />);

            // Act & Assert
            expect(screen.getByRole("button", { name: "mode_low" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "mode_medium" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "mode_high" })).toBeDisabled();
        });

        it("should not call setGameMode when buttons are disabled", () => {
            // Arrange
            const mockSetGameMode = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setGameMode: mockSetGameMode,
            });
            render(<GameModeSelector {...defaultProps} isDisabled={true} />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "mode_low" }));

            // Assert
            expect(mockSetGameMode).not.toHaveBeenCalled();
        });
    });

    describe("Button Styling", () => {
        it("should have correct CSS classes for buttons", () => {
            // Arrange
            render(<GameModeSelector {...defaultProps} />);

            // Act & Assert
            const button = screen.getByRole("button", { name: "mode_low" });
            expect(button).toHaveClass(
                "inline-flex",
                "items-center",
                "justify-center",
                "whitespace-nowrap",
                "px-3",
                "transition-all",
                "disabled:pointer-events-none",
                "disabled:opacity-40",
                "focus-visible:!outline-none",
                "focus-visible:!outline-0",
                "rounded-lg",
                "flex-1",
                "text-sm",
                "aria-pressed:bg-[#2a4770]",
                "h-full",
                "disabled:opacity-50"
            );
        });

        it("should apply pressed styling to active button", () => {
            // Arrange
            render(<GameModeSelector {...defaultProps} />);

            // Act & Assert
            const lowButton = screen.getByRole("button", { name: "mode_low" });
            expect(lowButton).toHaveAttribute("aria-pressed", "true");
        });
    });
});
