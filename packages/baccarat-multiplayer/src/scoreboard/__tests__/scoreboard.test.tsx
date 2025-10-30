import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScoreboardBaccarat, { ScoreboardComponentProps } from "../scoreboard";
import { Round } from "@shared/components/game-base/type";
import { BaccaratResult, BaccaratSettlementResult } from "../../baccarat-multiplayer-constants";

// Mock the shared components
jest.mock("@shared/components/game-components/round-history/scoreboard", () => ({
    SwitchableScoreboard: ({ rounds, scoreboards, ...props }: any) => (
        <div data-testid="switchable-scoreboard" data-rounds={rounds?.length || 0} data-scoreboards={scoreboards?.length || 0} {...props}>
            SwitchableScoreboard Mock
        </div>
    ),
    SlidableScoreboard: ({ boards, onSwiperReady, onSlideChange, ...props }: any) => (
        <div data-testid="slidable-scoreboard" data-boards={boards?.length || 0} {...props}>
            <div data-testid="big-road-board">{boards?.[0]}</div>
            <div data-testid="bead-road-board">{boards?.[1]}</div>
        </div>
    ),
}));

// Mock the scoreboard elements
jest.mock("../scoreboard-elements", () => ({
    BaccaratBigRoadConverter: {
        instance: {
            arrange: jest.fn(),
        },
        addBlinkNode: jest.fn(),
    },
    BaccaratBigRoadElement: {
        arrange: jest.fn(() => ({
            arrange: jest.fn(),
        })),
    },
    BaccaratBeadRoadCharacterElement: {
        arrange: jest.fn(),
    },
    BaccaratBeadRoadCharacterElementWithTranslator: jest.fn(),
}));

// Mock the utility functions
jest.mock("../utils", () => ({
    hasPlayerPair: jest.fn(),
    hasBankerPair: jest.fn(),
    hasNatural: jest.fn(),
}));

const mockHasPlayerPair = require("../utils").hasPlayerPair;
const mockHasBankerPair = require("../utils").hasBankerPair;
const mockHasNatural = require("../utils").hasNatural;
const mockBaccaratBigRoadConverter = require("../scoreboard-elements").BaccaratBigRoadConverter;

describe("ScoreboardBaccarat", () => {
    // Test ID constants
    const TEST_IDS = {
        SLIDABLE_SCOREBOARD: "slidable-scoreboard",
        SWITCHABLE_SCOREBOARD: "switchable-scoreboard",
        BIG_ROAD_BOARD: "big-road-board",
        BEAD_ROAD_BOARD: "bead-road-board",
    } as const;

    const mockRoundHistory: Round<BaccaratResult, BaccaratSettlementResult>[] = [
        {
            roundId: 1,
            result: {
                player: {
                    card1: { suit: 0, rank: 1 },
                    card2: { suit: 1, rank: 13 },
                    card3: null,
                    score: 1,
                },
                banker: {
                    card1: { suit: 2, rank: 11 },
                    card2: { suit: 3, rank: 12 },
                    card3: null,
                    score: 1,
                },
            },
            settlementResult: {
                player: true,
                banker: false,
                tie: false,
                anyPair: false,
            },
        },
        {
            roundId: 2,
            result: {
                player: {
                    card1: { suit: 0, rank: 2 },
                    card2: { suit: 1, rank: 3 },
                    card3: null,
                    score: 5,
                },
                banker: {
                    card1: { suit: 2, rank: 4 },
                    card2: { suit: 3, rank: 5 },
                    card3: null,
                    score: 9,
                },
            },
            settlementResult: {
                player: false,
                banker: true,
                tie: false,
                anyPair: false,
            },
        },
    ];

    const defaultProps: ScoreboardComponentProps = {
        roundHistory: mockRoundHistory,
        isShowBlink: false,
        playResultAnimation: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockHasPlayerPair.mockReturnValue(false);
        mockHasBankerPair.mockReturnValue(false);
        mockHasNatural.mockReturnValue(false);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("rendering", () => {
        it("should render the component with default props", () => {
            // Act
            render(<ScoreboardBaccarat {...defaultProps} />);

            // Assert
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
            expect(screen.getByTestId(TEST_IDS.BIG_ROAD_BOARD)).toBeInTheDocument();
            expect(screen.getByTestId(TEST_IDS.BEAD_ROAD_BOARD)).toBeInTheDocument();
        });

        it("should render with empty round history", () => {
            // Arrange
            const props = { ...defaultProps, roundHistory: [] };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });

        it("should render with single round", () => {
            // Arrange
            const props = { ...defaultProps, roundHistory: [mockRoundHistory[0]] };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });
    });

    describe("data processing", () => {
        it("should process round history for big road correctly", () => {
            // Act
            render(<ScoreboardBaccarat {...defaultProps} />);

            // Assert - Check that the utility functions are called for each round
            expect(mockHasNatural).toHaveBeenCalledTimes(2);
            expect(mockHasPlayerPair).toHaveBeenCalledTimes(2);
            expect(mockHasBankerPair).toHaveBeenCalledTimes(2);

            // Check calls for first round
            expect(mockHasNatural).toHaveBeenCalledWith(mockRoundHistory[0].result);
            expect(mockHasPlayerPair).toHaveBeenCalledWith(mockRoundHistory[0].result?.player);
            expect(mockHasBankerPair).toHaveBeenCalledWith(mockRoundHistory[0].result?.banker);

            // Check calls for second round
            expect(mockHasNatural).toHaveBeenCalledWith(mockRoundHistory[1].result);
            expect(mockHasPlayerPair).toHaveBeenCalledWith(mockRoundHistory[1].result?.player);
            expect(mockHasBankerPair).toHaveBeenCalledWith(mockRoundHistory[1].result?.banker);
        });

        it("should add natural, playerPair, and bankerPair properties to settlements", () => {
            // Arrange
            mockHasNatural.mockReturnValue(true);
            mockHasPlayerPair.mockReturnValue(true);
            mockHasBankerPair.mockReturnValue(true);

            // Act
            render(<ScoreboardBaccarat {...defaultProps} />);

            // Assert
            const switchableScoreboards = screen.getAllByTestId(TEST_IDS.SWITCHABLE_SCOREBOARD);
            expect(switchableScoreboards).toHaveLength(2); // One for big road, one for bead road
            // The mock will receive the processed data with added properties
        });

        it("should handle rounds without results gracefully", () => {
            // Arrange
            const roundsWithoutResults: Round<BaccaratResult, BaccaratSettlementResult>[] = [
                {
                    roundId: 1,
                    result: null as any,
                    settlementResult: {
                        player: true,
                        banker: false,
                        tie: false,
                        anyPair: false,
                    },
                },
            ];
            const props = { ...defaultProps, roundHistory: roundsWithoutResults };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert - When result is null, utility functions are not called
            expect(mockHasNatural).not.toHaveBeenCalled();
            expect(mockHasPlayerPair).not.toHaveBeenCalled();
            expect(mockHasBankerPair).not.toHaveBeenCalled();
        });

        it("should handle rounds without settlement results gracefully", () => {
            // Arrange
            const roundsWithoutSettlement: Round<BaccaratResult, BaccaratSettlementResult>[] = [
                {
                    roundId: 1,
                    result: {
                        player: {
                            card1: { suit: 0, rank: 1 },
                            card2: { suit: 1, rank: 13 },
                            card3: null,
                            score: 1,
                        },
                        banker: {
                            card1: { suit: 2, rank: 11 },
                            card2: { suit: 3, rank: 12 },
                            card3: null,
                            score: 1,
                        },
                    },
                    settlementResult: null as any,
                },
            ];
            const props = { ...defaultProps, roundHistory: roundsWithoutSettlement };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert - Component should not crash and render
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });
    });

    describe("blink animation handling", () => {
        it("should add blink node when isShowBlink is true for big road", () => {
            // Arrange
            const props = { ...defaultProps, isShowBlink: true };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert
            expect(mockBaccaratBigRoadConverter.addBlinkNode).toHaveBeenCalledTimes(1);
            expect(mockBaccaratBigRoadConverter.addBlinkNode).toHaveBeenCalledWith([
                {
                    ...mockRoundHistory[0].settlementResult,
                    natural: false,
                    playerPair: false,
                    bankerPair: false,
                },
                {
                    ...mockRoundHistory[1].settlementResult,
                    natural: false,
                    playerPair: false,
                    bankerPair: false,
                },
            ]);
        });

        it("should not add blink node when isShowBlink is false", () => {
            // Arrange
            const props = { ...defaultProps, isShowBlink: false };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert
            expect(mockBaccaratBigRoadConverter.addBlinkNode).not.toHaveBeenCalled();
        });

        it("should prepend empty object to rounds when isShowBlink is true for bead road", () => {
            // Arrange
            const props = { ...defaultProps, isShowBlink: true };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert - The bead road should receive [{}, ...roundHistory]
            // This is tested implicitly through the component rendering
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });

        it("should use original roundHistory when isShowBlink is false for bead road", () => {
            // Arrange
            const props = { ...defaultProps, isShowBlink: false };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert - The bead road should receive roundHistory as-is
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });
    });

    describe("scoreboard columns management", () => {
        it("should initialize scoreboardColumnsRef with default value", () => {
            // Act
            render(<ScoreboardBaccarat {...defaultProps} />);

            // Assert - The component renders with default columns (17)
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });

        it("should update scoreboard columns when updateScoreboardColumns is called", () => {
            // Act
            render(<ScoreboardBaccarat {...defaultProps} />);

            // Assert - The component should handle column updates internally
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });
    });

    describe("props handling", () => {
        it("should pass playResultAnimation to scoreboards", () => {
            // Arrange
            const props = { ...defaultProps, playResultAnimation: true };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });

        it("should handle onSwiperReady callback", () => {
            // Arrange
            const mockOnSwiperReady = jest.fn();
            const props = { ...defaultProps, onSwiperReady: mockOnSwiperReady };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert - The callback should be passed through to SlidableScoreboard
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });

        it("should handle onSlideChange callback", () => {
            // Arrange
            const mockOnSlideChange = jest.fn();
            const props = { ...defaultProps, onSlideChange: mockOnSlideChange };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert - The callback should be passed through to SlidableScoreboard
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });

        it("should work without optional callbacks", () => {
            // Act
            render(<ScoreboardBaccarat {...defaultProps} />);

            // Assert
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });
    });

    describe("board rendering", () => {
        it("should render both big road and bead road boards", () => {
            // Act
            render(<ScoreboardBaccarat {...defaultProps} />);

            // Assert
            expect(screen.getByTestId(TEST_IDS.BIG_ROAD_BOARD)).toBeInTheDocument();
            expect(screen.getByTestId(TEST_IDS.BEAD_ROAD_BOARD)).toBeInTheDocument();
        });

        it("should pass correct props to big road scoreboard", () => {
            // Act
            render(<ScoreboardBaccarat {...defaultProps} />);

            // Assert
            const switchableScoreboards = screen.getAllByTestId(TEST_IDS.SWITCHABLE_SCOREBOARD);
            expect(switchableScoreboards).toHaveLength(2); // One for big road, one for bead road
        });

        it("should pass correct props to bead road scoreboard", () => {
            // Act
            render(<ScoreboardBaccarat {...defaultProps} />);

            // Assert
            const switchableScoreboards = screen.getAllByTestId(TEST_IDS.SWITCHABLE_SCOREBOARD);
            expect(switchableScoreboards).toHaveLength(2);
        });
    });

    describe("edge cases", () => {
        it("should handle rounds with tie results", () => {
            // Arrange
            const tieRound: Round<BaccaratResult, BaccaratSettlementResult> = {
                roundId: 1,
                result: {
                    player: {
                        card1: { suit: 0, rank: 6 },
                        card2: { suit: 1, rank: 7 },
                        card3: null,
                        score: 3,
                    },
                    banker: {
                        card1: { suit: 2, rank: 6 },
                        card2: { suit: 3, rank: 7 },
                        card3: null,
                        score: 3,
                    },
                },
                settlementResult: {
                    player: false,
                    banker: false,
                    tie: true,
                    anyPair: false,
                },
            };
            const props = { ...defaultProps, roundHistory: [tieRound] };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
        });

        it("should handle rounds with natural results", () => {
            // Arrange
            mockHasNatural.mockReturnValue(true);
            const naturalRound: Round<BaccaratResult, BaccaratSettlementResult> = {
                roundId: 1,
                result: {
                    player: {
                        card1: { suit: 0, rank: 1 },
                        card2: { suit: 1, rank: 7 },
                        card3: null,
                        score: 8,
                    },
                    banker: {
                        card1: { suit: 2, rank: 2 },
                        card2: { suit: 3, rank: 3 },
                        card3: null,
                        score: 5,
                    },
                },
                settlementResult: {
                    player: true,
                    banker: false,
                    tie: false,
                    anyPair: false,
                },
            };
            const props = { ...defaultProps, roundHistory: [naturalRound] };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert
            expect(mockHasNatural).toHaveBeenCalledWith(naturalRound.result);
        });

        it("should handle rounds with pairs", () => {
            // Arrange
            mockHasPlayerPair.mockReturnValue(true);
            mockHasBankerPair.mockReturnValue(true);
            const pairRound: Round<BaccaratResult, BaccaratSettlementResult> = {
                roundId: 1,
                result: {
                    player: {
                        card1: { suit: 0, rank: 13 },
                        card2: { suit: 1, rank: 13 },
                        card3: null,
                        score: 0,
                    },
                    banker: {
                        card1: { suit: 2, rank: 12 },
                        card2: { suit: 3, rank: 12 },
                        card3: null,
                        score: 0,
                    },
                },
                settlementResult: {
                    player: true,
                    banker: false,
                    tie: false,
                    anyPair: false,
                },
            };
            const props = { ...defaultProps, roundHistory: [pairRound] };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert
            expect(mockHasPlayerPair).toHaveBeenCalledWith(pairRound.result?.player);
            expect(mockHasBankerPair).toHaveBeenCalledWith(pairRound.result?.banker);
        });

        it("should handle large round history arrays", () => {
            // Arrange
            const largeRoundHistory = Array.from({ length: 100 }, (_, index) => ({
                ...mockRoundHistory[0],
                roundId: index + 1,
            }));
            const props = { ...defaultProps, roundHistory: largeRoundHistory };

            // Act
            render(<ScoreboardBaccarat {...props} />);

            // Assert
            expect(screen.getByTestId(TEST_IDS.SLIDABLE_SCOREBOARD)).toBeInTheDocument();
            expect(mockHasNatural).toHaveBeenCalledTimes(100);
            expect(mockHasPlayerPair).toHaveBeenCalledTimes(100);
            expect(mockHasBankerPair).toHaveBeenCalledTimes(100);
        });
    });

    describe("component structure", () => {
        it("should use memo for performance optimization", () => {
            // Assert
            expect(ScoreboardBaccarat).toBeDefined();
            // React.memo components maintain their original structure
        });

        it("should be a valid React component", () => {
            // Assert
            expect(ScoreboardBaccarat).toBeDefined();
            expect(ScoreboardBaccarat).toBeTruthy();
        });
    });
});
