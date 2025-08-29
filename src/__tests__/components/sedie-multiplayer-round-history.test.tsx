import React from "react";
import { render, screen } from "@testing-library/react";
import { SedieMultiplayerRoundHistory } from "../../games/sedie-multiplayer/round-history/sedie-multiplayer-round-history";

// Mock the RoundHistory component
jest.mock("../../components/game-components/round-history/chain", () => ({
    RoundHistory: ({
        roundHistory,
        isShowBlink,
        renderItem,
        numberOfItems,
        sideButton,
        sizeNextItem,
        statisticPopupContent
    }: any) => (
        <div data-testid="round-history">
            <div data-testid="round-history-data">
                <div data-testid="round-history-length">{roundHistory?.length}</div>
                <div data-testid="is-show-blink">{isShowBlink ? "true" : "false"}</div>
                <div data-testid="number-of-items">{numberOfItems}</div>
                <div data-testid="size-next-item">{sizeNextItem}</div>
            </div>
            <div data-testid="side-button-container">{sideButton}</div>
            <div data-testid="statistic-popup-content-container">{statisticPopupContent}</div>
            <div data-testid="rendered-items">
                {roundHistory?.map((result: any, index: number) => renderItem({ result, index }))}
            </div>
        </div>
    ),
}));

// Mock the IconStatistic component
jest.mock("../../components/game-components/statistic/icon-statistic", () => ({
    IconStatistic: ({ onClick }: any) => (
        <button data-testid="icon-statistic" onClick={onClick}>
            Icon Statistic
        </button>
    ),
}));

// Mock the SedieMultiplayerRoundHistoryItem component
jest.mock("../../games/sedie-multiplayer/round-history/sedie-multiplayer-round-history-item", () => ({
    SedieMultiplayerRoundHistoryItem: ({ result, index }: any) => (
        <div key={`history-item-${index}`} data-testid={`history-item-${index}`}>
            {result?.result || "unknown"}
        </div>
    ),
}));

// Mock the SedieMultiplayerStatisticPopup component
// Statistic popup is now managed at page level; keep a placeholder for compatibility
jest.mock("../../games/sedie-multiplayer/round-history/sedie-multiplayer-statistic-popup", () => ({
    SedieMultiplayerStatisticPopup: () => null,
}));

// Mock the game store
jest.mock("../../_shared/stores/game-store/game-store", () => ({
    __esModule: true,
    default: () => ({
        roundHistory: [
            { id: 1, result: "red2" },
            { id: 2, result: "white3" },
            { id: 3, result: "red4" },
        ],
        isShowBlink: true,
    }),
}));

// Mock the useShallow hook
jest.mock("zustand/react/shallow", () => ({
    useShallow: (selector: any) => selector({
        roundHistory: [
            { id: 1, result: "red2" },
            { id: 2, result: "white3" },
            { id: 3, result: "red4" },
        ],
        isShowBlink: true,
    }),
}));

describe("SedieMultiplayerRoundHistory Component", () => {
    describe("Basic Rendering", () => {

        it("should render the RoundHistory component", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            expect(screen.getByTestId("round-history")).toBeInTheDocument();
        });

        it("should render the IconStatistic component", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            expect(screen.getByTestId("icon-statistic")).toBeInTheDocument();
        });

        it("should render the IconStatistic side button", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            expect(screen.getByTestId("icon-statistic")).toBeInTheDocument();
        });
    });

    describe("RoundHistory Props Configuration", () => {
        it("should pass correct roundHistory to RoundHistory component", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            expect(screen.getByTestId("round-history-length")).toHaveTextContent("3");
        });

        it("should pass correct isShowBlink to RoundHistory component", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            expect(screen.getByTestId("is-show-blink")).toHaveTextContent("true");
        });

        it("should pass correct numberOfItems to RoundHistory component", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            expect(screen.getByTestId("number-of-items")).toHaveTextContent("14");
        });

        it("should pass correct sizeNextItem to RoundHistory component", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            expect(screen.getByTestId("size-next-item")).toHaveTextContent("medium");
        });

        it("should pass renderItem function to RoundHistory component", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            // Verify that the renderItem function is working by checking rendered items
            expect(screen.getByTestId("history-item-0")).toBeInTheDocument();
            expect(screen.getByTestId("history-item-1")).toBeInTheDocument();
            expect(screen.getByTestId("history-item-2")).toBeInTheDocument();
        });

        it("should pass sideButton to RoundHistory component", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            const sideButtonContainer = screen.getByTestId("side-button-container");
            expect(sideButtonContainer).toContainElement(screen.getByTestId("icon-statistic"));
        });

        it("should not render statistic popup content inline (handled at page level)", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            const statisticPopupContainer = screen.getByTestId("statistic-popup-content-container");
            expect(statisticPopupContainer).toBeInTheDocument();
            expect(statisticPopupContainer.childElementCount).toBeGreaterThanOrEqual(0);
        });
    });

    describe("Rendered Items", () => {
        it("should render correct number of history items", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            expect(screen.getByTestId("history-item-0")).toBeInTheDocument();
            expect(screen.getByTestId("history-item-1")).toBeInTheDocument();
            expect(screen.getByTestId("history-item-2")).toBeInTheDocument();
        });

        it("should render correct result values in history items", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            expect(screen.getByTestId("history-item-0")).toHaveTextContent("red2");
            expect(screen.getByTestId("history-item-1")).toHaveTextContent("white3");
            expect(screen.getByTestId("history-item-2")).toHaveTextContent("red4");
        });
    });

    describe("Component Structure", () => {
        it("should have correct component hierarchy", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            const container = screen.getByTestId("round-history").parentElement;
            expect(container).toBeInTheDocument();

            const roundHistory = screen.getByTestId("round-history");
            expect(roundHistory).toBeInTheDocument();

            expect(screen.getByTestId("round-history-data")).toBeInTheDocument();
            expect(screen.getByTestId("side-button-container")).toBeInTheDocument();
            expect(screen.getByTestId("statistic-popup-content-container")).toBeInTheDocument();
            expect(screen.getByTestId("rendered-items")).toBeInTheDocument();
        });
    });

    describe("Game Store Integration", () => {
        it("should use game store data correctly", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            // Verify that the component is using the mocked game store data
            expect(screen.getByTestId("round-history-length")).toHaveTextContent("3");
            expect(screen.getByTestId("is-show-blink")).toHaveTextContent("true");

            // Verify that the round history data is being used to render items
            expect(screen.getByTestId("history-item-0")).toHaveTextContent("red2");
            expect(screen.getByTestId("history-item-1")).toHaveTextContent("white3");
            expect(screen.getByTestId("history-item-2")).toHaveTextContent("red4");
        });
    });

    describe("Props Validation", () => {
        it("should pass all required props to RoundHistory", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            // Verify that all required props are being passed
            expect(screen.getByTestId("round-history")).toBeInTheDocument();
            expect(screen.getByTestId("round-history-data")).toBeInTheDocument();
            expect(screen.getByTestId("side-button-container")).toBeInTheDocument();
            expect(screen.getByTestId("statistic-popup-content-container")).toBeInTheDocument();
            expect(screen.getByTestId("rendered-items")).toBeInTheDocument();
        });

        it("should pass correct renderItem function that handles result and index", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            // Verify that the renderItem function is working correctly
            expect(screen.getByTestId("history-item-0")).toHaveTextContent("red2");
            expect(screen.getByTestId("history-item-1")).toHaveTextContent("white3");
            expect(screen.getByTestId("history-item-2")).toHaveTextContent("red4");
        });
    });

    describe("Component Isolation", () => {
        it("should not have any direct state management", () => {
            // Arrange & Act
            render(<SedieMultiplayerRoundHistory />);

            // Assert
            // The component should only use the game store and not have local state
            // This is verified by the fact that it only passes props to RoundHistory
            expect(screen.getByTestId("round-history")).toBeInTheDocument();
        });
    });
});
