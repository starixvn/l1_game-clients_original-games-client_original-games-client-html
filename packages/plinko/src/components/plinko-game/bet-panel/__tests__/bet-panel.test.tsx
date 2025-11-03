import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import BetControl from "../bet-panel";

// Mock useShallow
jest.mock("zustand/shallow", () => ({
    useShallow: jest.fn((selector) => selector),
}));

// Mock the stores
const mockSendSocketEvent = jest.fn();
const mockSocket = {
    connected: true,
    emit: jest.fn(),
};
jest.mock("@shared/stores/game-store", () => ({
    useGameStore: jest.fn((selector) => {
        if (typeof selector === "function") {
            return selector({
                sendSocketEvent: mockSendSocketEvent,
                socket: mockSocket,
                gameConfigs: {
                    minBet: 1,
                    maxBet: 1000,
                },
                userStakeLevel: {
                    minBet: 1,
                    maxBet: 1000,
                },
            });
        }
        return {
            sendSocketEvent: mockSendSocketEvent,
            socket: mockSocket,
            gameConfigs: {
                minBet: 1,
                maxBet: 1000,
            },
            userStakeLevel: {
                minBet: 1,
                maxBet: 1000,
            },
        };
    }),
}));

const mockSetBetAmount = jest.fn();
jest.mock("@plinko/shared/stores/plinko-game-store", () => ({
    __esModule: true,
    default: jest.fn((selector) => {
        if (typeof selector === "function") {
            return selector({
                betAmount: 100,
                gameMode: "normal",
                numberOfRows: 16,
                numberOfDroppingBall: 0,
                actions: {
                    setBetAmount: mockSetBetAmount,
                },
            });
        }
        return {
            betAmount: 100,
            gameMode: "normal",
            numberOfRows: 16,
            numberOfDroppingBall: 0,
            actions: {
                setBetAmount: mockSetBetAmount,
            },
        };
    }),
}));

// Mock the hooks
jest.mock("@shared/react-hooks", () => ({
    useClientSeedPF: jest.fn(() => ({
        clientSeed: "test-seed-123",
    })),
    useCommonTranslate: jest.fn(() => ({
        t: (key: string) => key,
    })),
    useHotKey: jest.fn(),
    useBalance: jest.fn(() => 1000),
}));

jest.mock("@shared/react-contexts", () => ({
    useGameContext: jest.fn(() => ({
        gameMessageHandler: {
            register: jest.fn(() => "handler-id-123"),
            removeHandler: jest.fn(),
        },
    })),
}));

// Mock the message handler
jest.mock("@shared/components/game-base/handlers/game-message-handler", () => ({
    messageEventType: {
        END_BET: "END_BET",
    },
}));

// Mock the child components
jest.mock("../tab-navigation", () => {
    return function MockTabNavigation({ activeIndex, onChangeTab, isDisabled }: any) {
        return (
            <div data-testid="tab-navigation" data-active-index={activeIndex} data-disabled={isDisabled}>
                <button onClick={() => onChangeTab(0)} disabled={isDisabled} data-testid="manual-tab">
                    Manual
                </button>
                <button onClick={() => onChangeTab(1)} disabled={isDisabled} data-testid="auto-tab">
                    Auto
                </button>
            </div>
        );
    };
});

jest.mock("../bet-form", () => {
    return function MockBetForm({ isManualTab, isDisabled, isAutoBet, setIsAutoBet }: any) {
        return (
            <div data-testid="bet-form" data-manual-tab={isManualTab} data-disabled={isDisabled} data-auto-bet={isAutoBet}>
                <button onClick={() => setIsAutoBet(!isAutoBet)} disabled={isDisabled} data-testid="toggle-auto-bet">
                    Toggle Auto Bet
                </button>
            </div>
        );
    };
});

// Mock usePlaceBet hook
const mockHandlePlaceBet = jest.fn((amount: number) => true);
jest.mock("@plinko/shared/hooks/use-place-bet", () => ({
    usePlaceBet: jest.fn(() => ({
        handlePlaceBet: mockHandlePlaceBet,
    })),
}));

// Mock helpers
jest.mock("@shared/helpers", () => ({
    broadcastNotice: jest.fn(),
    createNoticeFromErrorCode: jest.fn(() => ({})),
}));

describe("BetControl", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSetBetAmount.mockClear();
        mockHandlePlaceBet.mockClear();
        mockHandlePlaceBet.mockReturnValue(true);
    });

    describe("Rendering", () => {
        it("should render all main components", () => {
            // Arrange
            render(<BetControl />);

            // Act & Assert
            expect(screen.getByTestId("tab-navigation")).toBeInTheDocument();
            expect(screen.getByTestId("bet-form")).toBeInTheDocument();
        });

        it("should render manual bet button by default", () => {
            // Arrange
            render(<BetControl />);

            // Act & Assert
            expect(screen.getByRole("button", { name: "glossary_bet" })).toBeInTheDocument();
        });

        it("should render auto bet button when auto tab is selected", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByTestId("auto-tab"));

            // Assert
            expect(screen.getByRole("button", { name: "start_auto_bet" })).toBeInTheDocument();
        });

        it("should have correct CSS classes for layout", () => {
            // Arrange
            const { container } = render(<BetControl />);

            // Act & Assert
            const mainContainer = container.firstChild;
            expect(mainContainer).toHaveClass(
                "flex",
                "flex-col",
                "gap-3",
                "px-3",
                "mt-3",
                "rounded-t-xl",
                "justify-end",
                "lg:flex-col-reverse",
                "lg:bg-primary-bg",
                "lg:py-4",
                "lg:px-0",
                "lg:mt-0",
                "lg:h-full",
                "lg:min-h-[38.5rem]"
            );
        });
    });

    describe("Tab Navigation", () => {
        it("should start with manual tab selected", () => {
            // Arrange
            render(<BetControl />);

            // Act & Assert
            expect(screen.getByTestId("tab-navigation")).toHaveAttribute("data-active-index", "0");
            expect(screen.getByTestId("bet-form")).toHaveAttribute("data-manual-tab", "true");
        });

        it("should switch to auto tab when auto tab is clicked", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByTestId("auto-tab"));

            // Assert
            expect(screen.getByTestId("tab-navigation")).toHaveAttribute("data-active-index", "1");
            expect(screen.getByTestId("bet-form")).toHaveAttribute("data-manual-tab", "false");
        });

        it("should switch back to manual tab when manual tab is clicked", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByTestId("auto-tab"));
            fireEvent.click(screen.getByTestId("manual-tab"));

            // Assert
            expect(screen.getByTestId("tab-navigation")).toHaveAttribute("data-active-index", "0");
            expect(screen.getByTestId("bet-form")).toHaveAttribute("data-manual-tab", "true");
        });
    });

    describe("Manual Betting", () => {
        it("should send bet event when manual bet button is clicked", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "glossary_bet" }));

            // Assert
            expect(mockHandlePlaceBet).toHaveBeenCalledWith(100);
        });

        it("should set processing state when bet is placed", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "glossary_bet" }));

            // Assert
            expect(screen.getByRole("button", { name: "glossary_bet" })).toBeDisabled();
            expect(screen.getByTestId("bet-form")).toHaveAttribute("data-disabled", "true");
            expect(screen.getByTestId("tab-navigation")).toHaveAttribute("data-disabled", "true");
        });
    });

    describe("Auto Betting", () => {
        it("should start auto bet when auto bet button is clicked", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByTestId("auto-tab"));
            fireEvent.click(screen.getByRole("button", { name: "start_auto_bet" }));

            // Assert
            expect(screen.getByRole("button", { name: "stop_auto_bet" })).toBeInTheDocument();
            expect(screen.getByTestId("bet-form")).toHaveAttribute("data-auto-bet", "true");
            expect(mockHandlePlaceBet).toHaveBeenCalledWith(100);
        });

        it("should stop auto bet when stop auto bet button is clicked", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByTestId("auto-tab"));
            fireEvent.click(screen.getByRole("button", { name: "start_auto_bet" }));
            fireEvent.click(screen.getByRole("button", { name: "stop_auto_bet" }));

            // Assert
            expect(screen.getByRole("button", { name: "start_auto_bet" })).toBeInTheDocument();
            expect(screen.getByTestId("bet-form")).toHaveAttribute("data-auto-bet", "false");
        });

        it("should disable form and tabs when auto bet is active", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByTestId("auto-tab"));
            fireEvent.click(screen.getByRole("button", { name: "start_auto_bet" }));

            // Assert
            expect(screen.getByTestId("bet-form")).toHaveAttribute("data-disabled", "true");
            expect(screen.getByTestId("tab-navigation")).toHaveAttribute("data-disabled", "true");
        });
    });

    describe("Message Handling", () => {
        it("should register END_BET handler on mount", () => {
            // Arrange
            const mockRegister = jest.fn(() => "handler-id-123");
            const mockUseGameContext = require("@shared/react-contexts").useGameContext;
            mockUseGameContext.mockReturnValue({
                gameMessageHandler: {
                    register: mockRegister,
                    removeHandler: jest.fn(),
                },
            });
            render(<BetControl />);

            // Act & Assert
            expect(mockRegister).toHaveBeenCalledWith("END_BET", expect.any(Function));
        });

        it("should remove END_BET handler on unmount", () => {
            // Arrange
            const mockRemoveHandler = jest.fn();
            const mockUseGameContext = require("@shared/react-contexts").useGameContext;
            mockUseGameContext.mockReturnValue({
                gameMessageHandler: {
                    register: jest.fn(() => "handler-id-123"),
                    removeHandler: mockRemoveHandler,
                },
            });
            const { unmount } = render(<BetControl />);

            // Act
            unmount();

            // Assert
            expect(mockRemoveHandler).toHaveBeenCalledWith("handler-id-123");
        });
    });

    describe("Button Styling", () => {
        it("should have correct CSS classes for bet button", () => {
            // Arrange
            render(<BetControl />);

            // Act & Assert
            const betButton = screen.getByRole("button", { name: "glossary_bet" });
            expect(betButton).toHaveClass(
                "text-sm",
                "font-semibold",
                "w-full",
                "h-11",
                "rounded-xl",
                "uppercase",
                "bg-gradient-to-l",
                "from-[#1FDC13]",
                "to-[#1D9C05]",
                "shadow-[0_0_8px_rgba(255,255,255,0.3)]",
                "disabled:opacity-50"
            );
        });

        it("should disable button when processing", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "glossary_bet" }));

            // Assert
            const betButton = screen.getByRole("button", { name: "glossary_bet" });
            expect(betButton).toBeDisabled();
            expect(betButton).toHaveClass("disabled:opacity-50");
        });
    });

    describe("State Management", () => {
        it("should maintain separate state for tab index and auto bet", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByTestId("auto-tab"));
            fireEvent.click(screen.getByRole("button", { name: "start_auto_bet" }));

            // Assert
            expect(screen.getByTestId("tab-navigation")).toHaveAttribute("data-active-index", "1");
            expect(screen.getByTestId("bet-form")).toHaveAttribute("data-auto-bet", "true");
        });
    });

    describe("Hot Key Functionality", () => {
        it("should call useHotKey hook with correct parameters", () => {
            // Arrange
            const mockUseHotKey = require("@shared/react-hooks").useHotKey;
            render(<BetControl />);

            // Assert
            expect(mockUseHotKey).toHaveBeenCalledWith({
                onSpaceKey: expect.any(Function),
                onDKey: expect.any(Function),
                onSKey: expect.any(Function),
                onAKey: expect.any(Function),
                isEnabled: true,
            });
        });

        it("should trigger bet when space key is pressed (via onSpaceKey callback)", () => {
            // Arrange
            const mockUseHotKey = require("@shared/react-hooks").useHotKey;
            let onSpaceKeyCallback: (() => void) | undefined;
            mockUseHotKey.mockImplementation(({ onSpaceKey }) => {
                onSpaceKeyCallback = onSpaceKey;
            });
            render(<BetControl />);

            // Act
            if (onSpaceKeyCallback) {
                act(() => {
                    onSpaceKeyCallback();
                });
            }

            // Assert
            expect(mockHandlePlaceBet).toHaveBeenCalledWith(100);
        });

        it("should double bet amount when D key is pressed (via onDKey callback)", () => {
            // Arrange
            const mockUseHotKey = require("@shared/react-hooks").useHotKey;
            let onDKeyCallback: (() => void) | undefined;
            mockUseHotKey.mockImplementation(({ onDKey }) => {
                onDKeyCallback = onDKey;
            });
            render(<BetControl />);

            // Act
            if (onDKeyCallback) {
                onDKeyCallback();
            }

            // Assert
            expect(mockSetBetAmount).toHaveBeenCalledWith(200, 1, 1000);
        });

        it("should half bet amount when S key is pressed (via onSKey callback)", () => {
            // Arrange
            const mockUseHotKey = require("@shared/react-hooks").useHotKey;
            let onSKeyCallback: (() => void) | undefined;
            mockUseHotKey.mockImplementation(({ onSKey }) => {
                onSKeyCallback = onSKey;
            });
            render(<BetControl />);

            // Act
            if (onSKeyCallback) {
                onSKeyCallback();
            }

            // Assert
            expect(mockSetBetAmount).toHaveBeenCalledWith(50, 1, 1000);
        });

        it("should not trigger bet when space key is pressed during processing", () => {
            // Arrange
            const mockUseHotKey = require("@shared/react-hooks").useHotKey;
            let onSpaceKeyCallback: (() => void) | undefined;
            mockUseHotKey.mockImplementation(({ onSpaceKey }) => {
                onSpaceKeyCallback = onSpaceKey;
            });
            render(<BetControl />);

            // Act - First click to start processing
            fireEvent.click(screen.getByRole("button", { name: "glossary_bet" }));
            // Then try hot key
            if (onSpaceKeyCallback) {
                onSpaceKeyCallback();
            }

            // Assert - Should only be called once (from button click)
            expect(mockHandlePlaceBet).toHaveBeenCalledTimes(1);
        });

        it("should not trigger bet when space key is pressed in auto bet mode", () => {
            // Arrange
            const mockUseHotKey = require("@shared/react-hooks").useHotKey;
            let onSpaceKeyCallback: (() => void) | undefined;
            mockUseHotKey.mockImplementation(({ onSpaceKey }) => {
                onSpaceKeyCallback = onSpaceKey;
            });
            render(<BetControl />);

            // Act - Switch to auto tab and start auto bet
            fireEvent.click(screen.getByTestId("auto-tab"));
            fireEvent.click(screen.getByRole("button", { name: "start_auto_bet" }));
            // Then try hot key
            if (onSpaceKeyCallback) {
                onSpaceKeyCallback();
            }

            // Assert - Should only be called once (from auto bet start)
            expect(mockHandlePlaceBet).toHaveBeenCalledTimes(1);
        });
    });
});
