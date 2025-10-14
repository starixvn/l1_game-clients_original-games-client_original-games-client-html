import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BetControl from "../bet-panel";
import { logger } from "@plinko/services/logger";

// Mock the logger
const mockLogger = {
    logBetAction: jest.fn(),
    logSocketEvent: jest.fn(),
    startWorkflow: jest.fn(),
    endWorkflow: jest.fn(),
    logUIEvent: jest.fn(),
};
jest.mock("@plinko/services/logger", () => ({
    logger: mockLogger,
}));

// Mock the stores
const mockSendSocketEvent = jest.fn();
jest.mock("@shared/stores/game-store", () => ({
    useGameStore: jest.fn((selector) => {
        if (typeof selector === "function") {
            return selector({
                sendSocketEvent: mockSendSocketEvent,
            });
        }
        return {
            sendSocketEvent: mockSendSocketEvent,
        };
    }),
}));

jest.mock("@plinko/shared/stores/plinko-game-store", () => ({
    __esModule: true,
    default: jest.fn(() => ({
        betAmount: 100,
        gameMode: "normal",
        numberOfRows: 16,
        numberOfDroppingBall: 0,
    })),
}));

// Mock the hooks
jest.mock("@shared/react-hooks", () => ({
    useClientSeedPF: jest.fn(() => ({
        clientSeed: "test-seed-123",
    })),
    useCommonTranslate: jest.fn(() => ({
        t: (key: string) => key,
    })),
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

describe("BetControl", () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
                "md:flex-col-reverse",
                "md:bg-primary-bg",
                "md:py-4",
                "md:px-0",
                "md:mt-0",
                "md:h-full"
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
            expect(mockSendSocketEvent).toHaveBeenCalledWith("bet", {
                amount: 100,
                gameMode: "normal",
                numberOfRows: 16,
                clientSeed: "test-seed-123",
            });
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
            expect(mockSendSocketEvent).toHaveBeenCalledWith("bet", {
                amount: 100,
                gameMode: "normal",
                numberOfRows: 16,
                clientSeed: "test-seed-123",
            });
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
                "font-bold",
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

    describe("Logger Integration", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should start bet-panel workflow on component initialization", () => {
            // Arrange & Act
            render(<BetControl />);

            // Assert
            expect(mockLogger.startWorkflow).toHaveBeenCalledWith(
                'bet-panel-init',
                'betting',
                'Initialize BetControl component'
            );
        });

        it("should log bet action when manual bet button is clicked", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "glossary_bet" }));

            // Assert
            expect(mockLogger.logBetAction).toHaveBeenCalledWith(
                'manual-bet-initiated',
                expect.objectContaining({
                    betAmount: 100,
                    gameMode: "normal",
                    numberOfRows: 16,
                    clientSeed: expect.stringContaining("provided")
                })
            );
        });

        it("should log socket event when bet is sent", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "glossary_bet" }));

            // Assert
            expect(mockLogger.logSocketEvent).toHaveBeenCalledWith(
                'bet',
                'sent',
                expect.objectContaining({
                    amount: 100,
                    gameMode: "normal",
                    numberOfRows: 16,
                    hasClientSeed: true
                }),
                expect.objectContaining({ category: 'betting' })
            );
        });

        it("should log auto bet start when auto bet is initiated", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByTestId("auto-tab"));
            fireEvent.click(screen.getByRole("button", { name: "start_auto_bet" }));

            // Assert
            expect(mockLogger.logBetAction).toHaveBeenCalledWith(
                'auto-bet-start',
                expect.objectContaining({
                    wasActive: false,
                    betAmount: 100,
                    gameMode: "normal",
                    numberOfRows: 16,
                    clientSeed: expect.stringContaining("provided")
                })
            );
        });

        it("should log auto bet stop when auto bet is stopped", () => {
            // Arrange
            render(<BetControl />);

            // Act
            fireEvent.click(screen.getByTestId("auto-tab"));
            fireEvent.click(screen.getByRole("button", { name: "start_auto_bet" }));
            fireEvent.click(screen.getByRole("button", { name: "stop_auto_bet" }));

            // Assert
            expect(mockLogger.logBetAction).toHaveBeenCalledWith(
                'auto-bet-manual-stop',
                expect.objectContaining({
                    wasActive: true,
                    betAmount: 100,
                    gameMode: "normal",
                    numberOfRows: 16
                })
            );
        });

        it("should log socket event when endBet is received", () => {
            // Arrange
            const mockRegister = jest.fn((event, handler) => {
                // Simulate calling the handler with endBet data
                setTimeout(() => handler({ endBet: 0 }), 0);
                return "handler-id-123";
            });
            const mockUseGameContext = require("@shared/react-contexts").useGameContext;
            mockUseGameContext.mockReturnValue({
                gameMessageHandler: {
                    register: mockRegister,
                    removeHandler: jest.fn(),
                },
            });

            // Act
            render(<BetControl />);

            // Wait for the async handler to be called
            return new Promise(resolve => {
                setTimeout(() => {
                    expect(mockLogger.logSocketEvent).toHaveBeenCalledWith(
                        'endBet',
                        'received',
                        expect.objectContaining({
                            endBet: 0,
                            isAutoBetCancelled: false,
                            wasProcessing: false
                        }),
                        expect.objectContaining({ category: 'betting' })
                    );
                    resolve(void 0);
                }, 10);
            });
        });

        it("should log bet processing complete when endBet is received", () => {
            // Arrange
            const mockRegister = jest.fn((event, handler) => {
                setTimeout(() => handler({ endBet: 100 }), 0);
                return "handler-id-123";
            });
            const mockUseGameContext = require("@shared/react-contexts").useGameContext;
            mockUseGameContext.mockReturnValue({
                gameMessageHandler: {
                    register: mockRegister,
                    removeHandler: jest.fn(),
                },
            });

            // Act
            render(<BetControl />);

            // Wait for the async handler to be called
            return new Promise(resolve => {
                setTimeout(() => {
                    expect(mockLogger.logBetAction).toHaveBeenCalledWith(
                        'bet-processing-complete',
                        expect.objectContaining({
                            wasProcessing: false,
                            endBet: 100
                        })
                    );
                    resolve(void 0);
                }, 10);
            });
        });

        it("should log UI event when component renders", () => {
            // Arrange & Act
            render(<BetControl />);

            // Assert
            expect(mockLogger.logUIEvent).toHaveBeenCalledWith(
                'bet-panel-render',
                expect.objectContaining({
                    tabIndex: 0,
                    isManualTab: true,
                    isAutoBet: false,
                    isProcessing: false,
                    betAmount: 100,
                    gameMode: "normal",
                    numberOfRows: 16,
                    numberOfDroppingBall: 0,
                    hasClientSeed: true
                })
            );
        });

        it("should end bet-panel workflow on unmount", () => {
            // Arrange
            const { unmount } = render(<BetControl />);

            // Act
            unmount();

            // Assert
            expect(mockLogger.endWorkflow).toHaveBeenCalledWith('bet-panel-init');
        });
    });
});
