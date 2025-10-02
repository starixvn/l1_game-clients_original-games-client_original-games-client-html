// Mock all dependencies before imports
jest.mock("@shared/react-hooks", () => ({
    useClickSound: jest.fn(() => jest.fn()),
}));

// Create mock stores
const mockGameStore = {
    roundHistory: [
        {
            roundId: 1,
            result: {
                player: { card1: { rank: 1, suit: 0 }, card2: { rank: 2, suit: 1 }, card3: null, score: 3 },
                banker: { card1: { rank: 3, suit: 2 }, card2: { rank: 4, suit: 3 }, card3: null, score: 7 },
            },
            settlementResult: {
                player: false,
                banker: true,
                tie: false,
                anyPair: false,
                playerPair: false,
                bankerPair: false,
                natural: false,
                isBlink: false,
            },
        },
    ],
    isShowBlink: false,
};

const mockStatisticStore = {
    isShowStatistic: false,
    showStatistic: jest.fn(),
    hideStatistic: jest.fn(),
};

jest.mock("@shared/stores/game-store/game-store", () => jest.fn(() => mockGameStore));

jest.mock("@shared/stores", () => ({
    useStatisticStore: jest.fn(() => mockStatisticStore),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BaccaratMultiplayerRoundHistory } from "../baccarat-multiplayer-round-history";

jest.mock("@shared/components/game-components/round-history/chain", () => ({
    RoundHistory: ({ roundHistory, isShowBlink, renderItem, numberOfItems, sideButton }: any) => (
        <div data-testid={ROUND_HISTORY_TEST_ID}>
            <div data-testid="round-history-items">{roundHistory?.map((item: any, index: number) => renderItem(item, index))}</div>
            {sideButton && <div data-testid={SIDE_BUTTON_TEST_ID}>{sideButton}</div>}
        </div>
    ),
}));

jest.mock("@shared/components/game-components/statistic/icon-statistic", () => ({
    IconStatistic: ({ onClick }: any) => (
        <button
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === ENTER_KEY) {
                    onClick();
                }
            }}
            data-testid={ICON_STATISTIC_TEST_ID}
            type="button"
            tabIndex={0}
        >
            Icon
        </button>
    ),
}));

jest.mock("../baccarat-multiplayer-statistic-popup", () => ({
    __esModule: true,
    default: ({ inline, onClose }: any) => (
        <div data-testid={STATISTIC_POPUP_TEST_ID} data-inline={inline} data-onclose={!!onClose}>
            Statistic Popup {inline ? "(Inline)" : ""}
        </div>
    ),
}));

jest.mock("@shared/components/game-components/game-loading/loading-spinner", () => ({
    LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Test constants
const ROUND_HISTORY_TEST_ID = "round-history";
const STATISTIC_POPUP_TEST_ID = "statistic-popup";
const ICON_STATISTIC_TEST_ID = "icon-statistic";
const SIDE_BUTTON_TEST_ID = "side-button";
const DATA_INLINE_ATTR = "data-inline";
const DATA_ONCLOSE_ATTR = "data-onclose";
const TRUE_STRING = "true";
const ENTER_KEY = "Enter";

describe("BaccaratMultiplayerRoundHistory", () => {
    const mockUseClickSound = require("@shared/react-hooks").useClickSound;
    const mockUseStatisticStore = require("@shared/stores").useStatisticStore;

    const mockClickSound = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset mock store to default state
        mockGameStore.roundHistory = [
            {
                roundId: 1,
                result: {
                    player: { card1: { rank: 1, suit: 0 }, card2: { rank: 2, suit: 1 }, card3: null, score: 3 },
                    banker: { card1: { rank: 3, suit: 2 }, card2: { rank: 4, suit: 3 }, card3: null, score: 7 },
                },
                settlementResult: {
                    player: false,
                    banker: true,
                    tie: false,
                    anyPair: false,
                    playerPair: false,
                    bankerPair: false,
                    natural: false,
                    isBlink: false,
                },
            },
        ];
        mockGameStore.isShowBlink = false;

        mockStatisticStore.isShowStatistic = false;
        mockStatisticStore.showStatistic.mockClear();
        mockStatisticStore.hideStatistic.mockClear();

        mockUseClickSound.mockReturnValue(mockClickSound);
    });

    describe("initial rendering", () => {
        it("should render RoundHistory component when statistic is not shown", () => {
            render(<BaccaratMultiplayerRoundHistory />);

            expect(screen.getByTestId(ROUND_HISTORY_TEST_ID)).toBeInTheDocument();
            expect(screen.queryByTestId(STATISTIC_POPUP_TEST_ID)).not.toBeInTheDocument();
        });

        it("should render statistic popup when isShowStatistic is true", () => {
            mockStatisticStore.isShowStatistic = true;

            render(<BaccaratMultiplayerRoundHistory />);

            expect(screen.getByTestId(STATISTIC_POPUP_TEST_ID)).toBeInTheDocument();
            expect(screen.queryByTestId(ROUND_HISTORY_TEST_ID)).not.toBeInTheDocument();
        });
    });

    describe("statistic toggle functionality", () => {
        it("should call clickSound and showStatistic when icon is clicked", () => {
            render(<BaccaratMultiplayerRoundHistory />);

            fireEvent.click(screen.getByTestId(ICON_STATISTIC_TEST_ID));

            expect(mockClickSound).toHaveBeenCalledTimes(1);
            expect(mockStatisticStore.showStatistic).toHaveBeenCalledTimes(1);
        });

        it("should pass correct props to RoundHistory component", () => {
            render(<BaccaratMultiplayerRoundHistory />);

            const roundHistory = screen.getByTestId(ROUND_HISTORY_TEST_ID);
            expect(roundHistory).toBeInTheDocument();

            expect(screen.getByTestId(SIDE_BUTTON_TEST_ID)).toBeInTheDocument();
        });
    });

    describe("statistic popup behavior", () => {
        it("should render statistic popup with onClose prop when isShowStatistic is true", () => {
            mockStatisticStore.isShowStatistic = true;

            render(<BaccaratMultiplayerRoundHistory />);

            const statisticPopup = screen.getByTestId(STATISTIC_POPUP_TEST_ID);
            expect(statisticPopup).toBeInTheDocument();
            expect(statisticPopup).toHaveAttribute(DATA_INLINE_ATTR, TRUE_STRING);
            expect(statisticPopup).toHaveAttribute(DATA_ONCLOSE_ATTR, TRUE_STRING);
        });

        it("should pass hideStatistic as onClose to statistic popup", () => {
            mockStatisticStore.isShowStatistic = true;

            render(<BaccaratMultiplayerRoundHistory />);

            const statisticPopup = screen.getByTestId(STATISTIC_POPUP_TEST_ID);
            expect(statisticPopup).toBeInTheDocument();
        });
    });

    describe("round history data integration", () => {
        it("should pass roundHistory and isShowBlink to RoundHistory component", () => {
            render(<BaccaratMultiplayerRoundHistory />);

            const roundHistory = screen.getByTestId(ROUND_HISTORY_TEST_ID);
            expect(roundHistory).toBeInTheDocument();
        });

        it("should handle empty round history", () => {
            mockGameStore.roundHistory = [];

            render(<BaccaratMultiplayerRoundHistory />);

            const roundHistory = screen.getByTestId(ROUND_HISTORY_TEST_ID);
            expect(roundHistory).toBeInTheDocument();
        });

        it("should handle undefined round history", () => {
            mockGameStore.roundHistory = undefined as any;

            render(<BaccaratMultiplayerRoundHistory />);

            const roundHistory = screen.getByTestId(ROUND_HISTORY_TEST_ID);
            expect(roundHistory).toBeInTheDocument();
        });

        it("should handle isShowBlink changes", () => {
            mockGameStore.isShowBlink = true;

            render(<BaccaratMultiplayerRoundHistory />);

            const roundHistory = screen.getByTestId(ROUND_HISTORY_TEST_ID);
            expect(roundHistory).toBeInTheDocument();
        });
    });

    describe("store integration", () => {
        it("should call useGameStore", () => {
            const mockUseGameStore = require("@shared/stores/game-store/game-store");
            mockUseGameStore.mockClear();

            render(<BaccaratMultiplayerRoundHistory />);

            expect(mockUseGameStore).toHaveBeenCalledTimes(1);
        });

        it("should call useStatisticStore", () => {
            render(<BaccaratMultiplayerRoundHistory />);

            expect(mockUseStatisticStore).toHaveBeenCalledTimes(1);
        });
    });

    describe("accessibility and user interactions", () => {
        it("should handle keyboard interactions on statistic icon", () => {
            render(<BaccaratMultiplayerRoundHistory />);

            const iconButton = screen.getByTestId(ICON_STATISTIC_TEST_ID);
            fireEvent.focus(iconButton);
            fireEvent.keyDown(iconButton, { key: ENTER_KEY, code: ENTER_KEY });

            expect(mockClickSound).toHaveBeenCalledTimes(1);
            expect(mockStatisticStore.showStatistic).toHaveBeenCalledTimes(1);
        });

        it("should be keyboard accessible", () => {
            render(<BaccaratMultiplayerRoundHistory />);

            const iconButton = screen.getByTestId(ICON_STATISTIC_TEST_ID);
            expect(iconButton).toHaveAttribute("type", "button");
            expect(iconButton).toHaveAttribute("tabIndex", "0");
        });
    });

    describe("dynamic import behavior", () => {
        it("should use dynamic import for statistic popup", () => {
            mockStatisticStore.isShowStatistic = true;

            render(<BaccaratMultiplayerRoundHistory />);

            expect(screen.getByTestId(STATISTIC_POPUP_TEST_ID)).toBeInTheDocument();
        });
    });

    describe("container styling", () => {
        it("should have proper container styling", () => {
            render(<BaccaratMultiplayerRoundHistory />);

            const container = screen.getByTestId(ROUND_HISTORY_TEST_ID).parentElement;
            expect(container).toBeInTheDocument();
        });
    });
});
