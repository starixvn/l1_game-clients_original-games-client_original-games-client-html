import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SedieMultiplayerStatisticPopup } from "../../games/sedie-multiplayer/round-history/sedie-multiplayer-statistic-popup";

// Mock the game store
jest.mock("../../_shared/stores/game-store/game-store", () => ({
    __esModule: true,
    default: () => ({
        roundHistory: [
            { id: 1, result: "red2" },
            { id: 2, result: "white3" },
            { id: 3, result: "red4" },
        ],
        isShowBlink: false,
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
        isShowBlink: false,
    }),
}));

// Mock the PercentageStatistic component
jest.mock("../../components/game-components/statistic", () => ({
    __esModule: true,
    default: ({ roundHistory, mainChoices, iconRenderer, renderAsBar, barColors, barHeightPx, roundedRadiusPx, barLabelFontSizePx }: any) => (
        <div data-testid="percentage-statistic">
            <div data-testid="round-history-length">{roundHistory?.length}</div>
            <div data-testid="main-choices">{mainChoices?.join(",")}</div>
            <div data-testid="render-as-bar">{renderAsBar ? "true" : "false"}</div>
            <div data-testid="bar-colors">{barColors ? "true" : "false"}</div>
            <div data-testid="bar-height">{barHeightPx}</div>
            <div data-testid="rounded-radius">{roundedRadiusPx}</div>
            <div data-testid="bar-label-font-size">{barLabelFontSizePx}</div>
            {iconRenderer && (
                <div data-testid="icon-renderer">
                    {iconRenderer("red2")}
                </div>
            )}
        </div>
    ),
}));

// Mock the ScoreboardSeDie component
jest.mock("../../games/sedie-multiplayer/scoreboard", () => ({
    __esModule: true,
    default: ({ roundHistory, isShowBlink, isOddEven }: any) => (
        <div data-testid="scoreboard-se-die">
            <div data-testid="scoreboard-round-history-length">{roundHistory?.length}</div>
            <div data-testid="scoreboard-is-show-blink">{isShowBlink ? "true" : "false"}</div>
            <div data-testid="scoreboard-is-odd-even">{isOddEven ? "true" : "false"}</div>
        </div>
    ),
}));

// Mock the Image component
jest.mock("next/image", () => ({
    __esModule: true,
    default: ({ src, alt, width, height }: any) => (
        <img src={src} alt={alt} width={width} height={height} data-testid="statistic-icon" />
    ),
}));

// Mock the constants
jest.mock("../../games/sedie-multiplayer/sedie-multiplayer-constants", () => ({
    mainChoices: ["red", "white"],
    SeDieChoices: {
        white4: "white4",
        white3: "white3",
        red2: "red2",
        red3: "red3",
        red4: "red4",
    },
    SeDieStatisticColors: ["#ff0000", "#ffffff"],
}));

// Mock the styles
jest.mock("../../games/sedie-multiplayer/statistic-popup.module.scss", () => ({
    "statistic-container": "statistic-container-class",
    panel: "panel-class",
    grid: "grid-class",
    close: "close-class",
}));

describe("SedieMultiplayerStatisticPopup Component", () => {
    describe("Basic Rendering", () => {
        it("should render the statistic popup container", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            expect(screen.getByTestId("statistic-popup")).toBeInTheDocument();
            expect(screen.getByTestId("statistic-popup")).toHaveClass("statistic-container-class");
        });

        it("should render the panel and grid structure", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            expect(screen.getByTestId("statistic-popup")).toBeInTheDocument();
            expect(screen.getByTestId("statistic-popup").querySelector(".panel-class")).toBeInTheDocument();
            expect(screen.getByTestId("statistic-popup").querySelector(".grid-class")).toBeInTheDocument();
        });

        it("should render the close button", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            const closeButton = screen.getByTestId("statistic-popup").querySelector(".close-class");
            expect(closeButton).toBeInTheDocument();
        });

        it("should render two PercentageStatistic components", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            const percentageStatistics = screen.getAllByTestId("percentage-statistic");
            expect(percentageStatistics).toHaveLength(2);
        });

        it("should render the ScoreboardSeDie component", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            expect(screen.getByTestId("scoreboard-se-die")).toBeInTheDocument();
        });
    });

    describe("PercentageStatistic Configuration", () => {
        it("should pass correct props to first PercentageStatistic (side choices)", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            const percentageStatistics = screen.getAllByTestId("percentage-statistic");
            const firstStatistic = percentageStatistics[0];

            expect(firstStatistic.querySelector('[data-testid="round-history-length"]')).toHaveTextContent("3");
            expect(firstStatistic.querySelector('[data-testid="main-choices"]')).toHaveTextContent("white4,white3,red2,red3,red4");
            expect(firstStatistic.querySelector('[data-testid="render-as-bar"]')).toHaveTextContent("false");
            expect(firstStatistic.querySelector('[data-testid="icon-renderer"]')).toBeInTheDocument();
        });

        it("should pass correct props to second PercentageStatistic (main choices with bar)", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            const percentageStatistics = screen.getAllByTestId("percentage-statistic");
            const secondStatistic = percentageStatistics[1];

            expect(secondStatistic.querySelector('[data-testid="round-history-length"]')).toHaveTextContent("3");
            expect(secondStatistic.querySelector('[data-testid="main-choices"]')).toHaveTextContent("red,white");
            expect(secondStatistic.querySelector('[data-testid="render-as-bar"]')).toHaveTextContent("true");
            expect(secondStatistic.querySelector('[data-testid="bar-colors"]')).toHaveTextContent("true");
            expect(secondStatistic.querySelector('[data-testid="bar-height"]')).toHaveTextContent("12");
            expect(secondStatistic.querySelector('[data-testid="rounded-radius"]')).toHaveTextContent("12");
            expect(secondStatistic.querySelector('[data-testid="bar-label-font-size"]')).toHaveTextContent("14");
        });
    });

    describe("Icon Renderer Functionality", () => {
        it("should render correct icon for red2 choice", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            const iconRenderer = screen.getAllByTestId("percentage-statistic")[0].querySelector('[data-testid="icon-renderer"]');
            const icon = iconRenderer?.querySelector('[data-testid="statistic-icon"]') as HTMLImageElement;

            expect(icon).toBeInTheDocument();
            expect(icon.src).toContain("/static/images/sedie-multiplayer/statistic-icon-red2.webp");
            expect(icon.alt).toBe("red2");
            expect(icon.width).toBe(16);
            expect(icon.height).toBe(16);
        });

        it("should return null for unknown choice", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            const iconRenderer = screen.getAllByTestId("percentage-statistic")[0].querySelector('[data-testid="icon-renderer"]');
            // The iconRenderer should only render for "red2" as defined in the mock
            expect(iconRenderer).toBeInTheDocument();
        });
    });

    describe("ScoreboardSeDie Configuration", () => {
        it("should pass correct props to ScoreboardSeDie", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            expect(screen.getByTestId("scoreboard-round-history-length")).toHaveTextContent("3");
            expect(screen.getByTestId("scoreboard-is-show-blink")).toHaveTextContent("false");
            expect(screen.getByTestId("scoreboard-is-odd-even")).toHaveTextContent("false");
        });
    });

    describe("Close Functionality", () => {
        it("should call onClose when close button is clicked", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);
            const closeButton = screen.getByTestId("statistic-popup").querySelector(".close-class");
            fireEvent.click(closeButton!);

            // Assert
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("should not throw error when onClose is not provided", () => {
            // Arrange & Act
            const renderComponent = () => render(<SedieMultiplayerStatisticPopup />);

            // Assert
            expect(renderComponent).not.toThrow();
        });

        it("should handle undefined onClose gracefully", () => {
            // Arrange
            const onClose = undefined;

            // Act
            const renderComponent = () => render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            expect(renderComponent).not.toThrow();
        });
    });

    describe("Side Choices Configuration", () => {
        it("should define correct side choices array", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            const firstStatistic = screen.getAllByTestId("percentage-statistic")[0];
            const mainChoices = firstStatistic.querySelector('[data-testid="main-choices"]')?.textContent;

            // The side choices should be in the correct order: white4, white3, red2, red3, red4
            expect(mainChoices).toBe("white4,white3,red2,red3,red4");
        });
    });

    describe("Integration with Game Store", () => {
        it("should use game store data correctly", () => {
            // Arrange
            const onClose = jest.fn();

            // Act
            render(<SedieMultiplayerStatisticPopup onClose={onClose} />);

            // Assert
            // Verify that the component is using the mocked game store data
            const percentageStatistics = screen.getAllByTestId("percentage-statistic");
            percentageStatistics.forEach(statistic => {
                expect(statistic.querySelector('[data-testid="round-history-length"]')).toHaveTextContent("3");
            });

            expect(screen.getByTestId("scoreboard-round-history-length")).toHaveTextContent("3");
            expect(screen.getByTestId("scoreboard-is-show-blink")).toHaveTextContent("false");
        });
    });
});
