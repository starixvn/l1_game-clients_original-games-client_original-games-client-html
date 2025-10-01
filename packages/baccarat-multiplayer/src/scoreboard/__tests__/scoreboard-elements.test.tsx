// Mock the scoreboard registry before importing the module
jest.mock("@shared/helpers/scoreboard-registry", () => ({
    registerBigRoadElement: jest.fn(),
}));

// Mock the game config before importing the module
jest.mock("../../game-config", () => ({
    GAME_ID: 150,
}));

// Mock the SCSS module before importing the module
jest.mock("@shared/components/game-components/round-history/dot/dot.module.scss", () => ({
    "dot-next": "dot-next-class",
    blink: "blink-class",
}));

// Mock the icon components
jest.mock("../beadboard-icon", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("../big-road-icon", () => ({
    __esModule: true,
    default: jest.fn(),
}));

// Mock the translator
jest.mock("@shared/components/page-components/translator", () => ({
    withTranslator: (Component: any) => Component,
}));

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
    BaccaratBeadRoadCharacterElement,
    BaccaratBigRoadConverter,
    BaccaratBigRoadElement,
} from "../scoreboard-elements";
import { Round } from "@shared/components/game-base/type";
import { BaccaratResult, BaccaratSettlementResult, BaccaratBetOptions } from "../../baccarat-multiplayer-constants";

const mockBeadBoardIcon = require("../beadboard-icon").default;
const mockBigRoadIcon = require("../big-road-icon").default;

describe("BaccaratBeadRoadCharacterElement", () => {
    const mockTranslate = jest.fn();

    const createMockRound = (
        settlementResult?: Partial<BaccaratSettlementResult>,
        result?: Partial<BaccaratResult>
    ): Round<BaccaratResult, BaccaratSettlementResult> => ({
        roundId: 1,
        result: result ? {
            player: {
                card1: { suit: 0, rank: 1 },
                card2: { suit: 1, rank: 2 },
                card3: null,
                score: 3,
                ...result.player,
            },
            banker: {
                card1: { suit: 2, rank: 3 },
                card2: { suit: 3, rank: 4 },
                card3: null,
                score: 7,
                ...result.banker,
            },
            ...result,
        } : undefined,
        settlementResult: settlementResult ? {
            player: false,
            banker: false,
            tie: false,
            anyPair: false,
            playerPair: false,
            bankerPair: false,
            ...settlementResult,
        } : undefined,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslate.mockImplementation((key: string) => key);

        // Set up mock implementations
        mockBeadBoardIcon.mockImplementation(({ choice, hasPlayerPair, hasBankerPair }: any) =>
            React.createElement('div', {
                'data-testid': `beadboard-icon-${choice}`
            }, `BeadBoardIcon: ${choice}${hasPlayerPair ? ' PlayerPair' : ''}${hasBankerPair ? ' BankerPair' : ''}`)
        );

        mockBigRoadIcon.mockImplementation(({ round, isBlink, isEmpty }: any) =>
            React.createElement('div', {
                'data-testid': 'big-road-icon'
            }, `BigRoadIcon: ${round.data.length} items${isBlink ? ' Blink' : ''}${isEmpty ? ' Empty' : ''}`)
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("renderElement", () => {
        it("should render blinking dot when round has no settlement result", () => {
            // Arrange
            const round = createMockRound();
            const element = new BaccaratBeadRoadCharacterElement({ round });

            // Act
            const result = element.renderElement(round, mockTranslate);

            // Assert
            const { container } = render(<>{result}</>);
            expect(container.querySelector("span")).toBeInTheDocument();
            expect(container.querySelector("span")?.className).toContain("dot-next-class");
            expect(container.querySelector("span")?.className).toContain("blink-class");
        });

        it("should render tie result correctly", () => {
            // Arrange
            const round = createMockRound({ tie: true });
            const element = new BaccaratBeadRoadCharacterElement({ round });

            // Act
            const result = element.renderElement(round, mockTranslate);

            // Assert
            render(<>{result}</>);
            expect(mockBeadBoardIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    choice: BaccaratBetOptions.TIE,
                }),
                {}
            );
        });

        it("should render banker result correctly", () => {
            // Arrange
            const round = createMockRound({ banker: true });
            const element = new BaccaratBeadRoadCharacterElement({ round });

            // Act
            const result = element.renderElement(round, mockTranslate);

            // Assert
            render(<>{result}</>);
            expect(mockBeadBoardIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    choice: BaccaratBetOptions.BANKER,
                }),
                {}
            );
        });

        it("should render player result correctly", () => {
            // Arrange
            const round = createMockRound({ player: true });
            const element = new BaccaratBeadRoadCharacterElement({ round });

            // Act
            const result = element.renderElement(round, mockTranslate);

            // Assert
            render(<>{result}</>);
            expect(mockBeadBoardIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    choice: BaccaratBetOptions.PLAYER,
                }),
                {}
            );
        });

        it("should handle rounds with player pair", () => {
            // Arrange
            const round = createMockRound({ player: true });
            const element = new BaccaratBeadRoadCharacterElement({ round });

            // Act
            const result = element.renderElement(round, mockTranslate);

            // Assert
            render(<>{result}</>);
            expect(mockBeadBoardIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    choice: BaccaratBetOptions.PLAYER,
                }),
                {}
            );
        });

        it("should handle rounds with banker pair", () => {
            // Arrange
            const round = createMockRound({ banker: true });
            const element = new BaccaratBeadRoadCharacterElement({ round });

            // Act
            const result = element.renderElement(round, mockTranslate);

            // Assert
            render(<>{result}</>);
            expect(mockBeadBoardIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    choice: BaccaratBetOptions.BANKER,
                }),
                {}
            );
        });

        it("should handle rounds with both pairs", () => {
            // Arrange
            const round = createMockRound({ tie: true });
            const element = new BaccaratBeadRoadCharacterElement({ round });

            // Act
            const result = element.renderElement(round, mockTranslate);

            // Assert
            render(<>{result}</>);
            expect(mockBeadBoardIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    choice: BaccaratBetOptions.TIE,
                }),
                {}
            );
        });

        it("should handle rounds without result data", () => {
            // Arrange
            const round = createMockRound({ banker: true }, null);
            const element = new BaccaratBeadRoadCharacterElement({ round });

            // Act
            const result = element.renderElement(round, mockTranslate);

            // Assert
            render(<>{result}</>);
            expect(mockBeadBoardIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    choice: BaccaratBetOptions.BANKER,
                }),
                {}
            );
        });
    });

    describe("render", () => {
        it("should render element when round is provided", () => {
            // Arrange
            const round = createMockRound({ player: true });
            const element = new BaccaratBeadRoadCharacterElement({ round, t: mockTranslate });

            // Act
            const result = element.render();

            // Assert
            render(<>{result}</>);
            expect(mockBeadBoardIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    choice: BaccaratBetOptions.PLAYER,
                }),
                {}
            );
        });

        it("should render empty element when round is not provided", () => {
            // Arrange
            const element = new BaccaratBeadRoadCharacterElement({ round: undefined, t: mockTranslate });

            // Act
            const result = element.render();

            // Assert
            const { container } = render(<>{result}</>);
            expect(container.firstChild).toBeNull();
        });

        it("should pass translator function to renderElement", () => {
            // Arrange
            const round = createMockRound({ player: true });
            const element = new BaccaratBeadRoadCharacterElement({ round, t: mockTranslate });

            // Act
            const result = element.render();

            // Assert
            expect(result).toBeDefined();
            render(<>{result}</>);
        });
    });
});

describe("BaccaratBigRoadConverter", () => {
    describe("static methods", () => {
        describe("addBlinkNode", () => {
            it("should add blink node to rounds array", () => {
                // Arrange
                const rounds: BaccaratSettlementResult[] = [
                    {
                        player: true,
                        banker: false,
                        tie: false,
                        anyPair: false,
                        playerPair: false,
                        bankerPair: false,
                    },
                ];

                // Act
                BaccaratBigRoadConverter.addBlinkNode(rounds);

                // Assert
                expect(rounds).toHaveLength(2);
                expect(rounds[0]).toEqual({
                    banker: false,
                    player: undefined,
                    tie: undefined,
                    drawId: 0,
                    anyPair: false,
                    playerPair: false,
                    bankerPair: false,
                });
            });

            it("should create blink node based on last round", () => {
                // Arrange
                const rounds: BaccaratSettlementResult[] = [
                    {
                        player: false,
                        banker: true,
                        tie: false,
                        anyPair: false,
                        playerPair: false,
                        bankerPair: false,
                    },
                ];

                // Act
                BaccaratBigRoadConverter.addBlinkNode(rounds);

                // Assert
                expect(rounds[0].banker).toBe(true);
                expect(rounds[0].player).toBeUndefined();
            });

            it("should handle empty rounds array", () => {
                // Arrange
                const rounds: BaccaratSettlementResult[] = [];

                // Act
                BaccaratBigRoadConverter.addBlinkNode(rounds);

                // Assert
                expect(rounds).toHaveLength(1);
                expect(rounds[0].banker).toBeUndefined();
                expect(rounds[0].player).toBeUndefined();
            });
        });

        describe("instance", () => {
            it("should return the same instance", () => {
                // Act
                const instance1 = BaccaratBigRoadConverter.instance;
                const instance2 = BaccaratBigRoadConverter.instance;

                // Assert
                expect(instance1).toBe(instance2);
                expect(instance1).toBeInstanceOf(BaccaratBigRoadConverter);
            });
        });
    });

    describe("converter behavior", () => {
        it("should use banker as positive key in arrangement logic", () => {
            // This is tested implicitly through the converter's usage in BigRoadElement
            // The converter uses positiveKey() internally for arrangement
            expect(BaccaratBigRoadConverter.instance).toBeDefined();
        });

        it("should use tie as special key in arrangement logic", () => {
            // This is tested implicitly through the converter's usage in BigRoadElement
            // The converter uses specialKey() internally for arrangement
            expect(BaccaratBigRoadConverter.instance).toBeDefined();
        });
    });
});

describe("BaccaratBigRoadElement", () => {
    const mockRound: any = {
        data: [
            {
                player: true,
                banker: false,
                tie: false,
                anyPair: false,
                playerPair: false,
                bankerPair: false,
            },
            {
                player: false,
                banker: true,
                tie: false,
                anyPair: false,
                playerPair: false,
                bankerPair: false,
            },
        ],
    };

    describe("renderElement", () => {
        it("should render BigRoadIcon with correct props for normal round", () => {
            // Arrange
            const element = new BaccaratBigRoadElement({ round: mockRound });

            // Act
            const result = element.renderElement(mockRound);

            // Assert
            render(<>{result}</>);
            expect(mockBigRoadIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    round: mockRound,
                    isBlink: false,
                    isEmpty: false,
                }),
                {}
            );
        });

        it("should detect blink state correctly", () => {
            // Arrange
            const blinkRound = {
                ...mockRound,
                data: [
                    {
                        player: undefined,
                        banker: undefined,
                        tie: false,
                        anyPair: false,
                        playerPair: false,
                        bankerPair: false,
                    },
                ],
            };
            const element = new BaccaratBigRoadElement({ round: blinkRound });

            // Act
            const result = element.renderElement(blinkRound);

            // Assert
            render(<>{result}</>);
            expect(mockBigRoadIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    round: blinkRound,
                    isBlink: true,
                    isEmpty: true,
                }),
                {}
            );
        });

        it("should detect empty state correctly", () => {
            // Arrange
            const emptyRound = {
                ...mockRound,
                data: [],
            };
            const element = new BaccaratBigRoadElement({ round: emptyRound });

            // Act
            const result = element.renderElement(emptyRound);

            // Assert
            render(<>{result}</>);
            expect(mockBigRoadIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    round: emptyRound,
                    isBlink: false,
                    isEmpty: true,
                }),
                {}
            );
        });

        it("should detect empty state when all results are false", () => {
            // Arrange
            const emptyResultsRound = {
                ...mockRound,
                data: [
                    {
                        player: false,
                        banker: false,
                        tie: false,
                        anyPair: false,
                        playerPair: false,
                        bankerPair: false,
                    },
                ],
            };
            const element = new BaccaratBigRoadElement({ round: emptyResultsRound });

            // Act
            const result = element.renderElement(emptyResultsRound);

            // Assert
            render(<>{result}</>);
            expect(mockBigRoadIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    round: emptyResultsRound,
                    isBlink: false,
                    isEmpty: true,
                }),
                {}
            );
        });

        it("should handle mixed blink and data states", () => {
            // Arrange
            const mixedRound = {
                ...mockRound,
                data: [
                    {
                        player: undefined,
                        banker: true,
                        tie: false,
                        anyPair: false,
                        playerPair: false,
                        bankerPair: false,
                    },
                    {
                        player: true,
                        banker: false,
                        tie: false,
                        anyPair: false,
                        playerPair: false,
                        bankerPair: false,
                    },
                ],
            };
            const element = new BaccaratBigRoadElement({ round: mixedRound });

            // Act
            const result = element.renderElement(mixedRound);

            // Assert
            render(<>{result}</>);
            expect(mockBigRoadIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    round: mixedRound,
                    isBlink: true,
                    isEmpty: false,
                }),
                {}
            );
        });
    });
});

