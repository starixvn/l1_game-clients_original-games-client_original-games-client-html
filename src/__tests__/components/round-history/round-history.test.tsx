import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RoundHistory } from "../../../components/game-components/round-history/chain";
import { IconStatistic } from "../../../components/game-components/statistic/icon-statistic";

// Mock the BaseDialog component
jest.mock("../../../components/game-components/base-dialog", () => {
    return function MockBaseDialog({ children, isOpen, onCloseModal, enableBackdrop }: any) {
        if (!isOpen) return null;
        return (
            <div data-testid="base-dialog">
                {enableBackdrop && <div data-testid="overlay-mask" className="overlay-mask"></div>}
                <div data-testid="dialog-content">
                    <button onClick={onCloseModal} data-testid="close-dialog">Close</button>
                    {children}
                </div>
            </div>
        );
    };
});

// Mock the MiniItemNext component
jest.mock("../../../components/game-components/round-history/dot-next", () => ({
    MiniItemNext: ({ className }: { className: string }) => (
        <div data-testid="mini-item-next" className={className}>Next</div>
    ),
}));

// Mock react-device-detect
jest.mock("react-device-detect", () => ({
    isIOS: false,
    isMobileOnly: false,
}));

// Mock the click sound hook
jest.mock("../../../_shared/react-hooks", () => ({
    useClickSound: jest.fn(() => jest.fn()),
}));

describe("RoundHistory Component", () => {
    // Arrange: Common test data
    const mockRoundHistory = [
        { id: 1, result: "red" },
        { id: 2, result: "blue" },
        { id: 3, result: "red" },
    ];

    const mockRenderItem = ({ result, index }: { result: any; index: number }) => (
        <div key={result.id} data-testid={`history-item-${index}`}>
            {result.result}
        </div>
    );

    const mockStatisticPopupContent = (
        <div data-testid="statistic-popup-content">
            <span data-testid="close-statistic" onClick={() => { }}>Close</span>
            <div>Statistic Content</div>
        </div>
    );

    beforeEach(() => {
        // Reset any mocks
        jest.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render round history items correctly", () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            expect(screen.getByTestId("history-item-0")).toBeInTheDocument();
            expect(screen.getByTestId("history-item-1")).toBeInTheDocument();
            expect(screen.getByTestId("history-item-2")).toBeInTheDocument();
            expect(screen.getAllByText("red")).toHaveLength(2);
            expect(screen.getByText("blue")).toBeInTheDocument();
        });

        it("should render with blink indicator when isShowBlink is true", () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: true,
                renderItem: mockRenderItem,
                numberOfItems: 3,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            expect(screen.getByTestId("mini-item-next")).toBeInTheDocument();
        });

        it("should not render blink indicator when isShowBlink is false", () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            expect(screen.queryByTestId("mini-item-next")).not.toBeInTheDocument();
        });

        it("should render side button when provided", () => {
            // Arrange
            const sideButton = <button data-testid="side-button">Side Button</button>;
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
                sideButton,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            expect(screen.getByTestId("side-button")).toBeInTheDocument();
        });

        it("should not render side button when not provided", () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            expect(screen.queryByTestId("side-button")).not.toBeInTheDocument();
        });
    });

    describe("Statistic Popup Functionality", () => {
        it("should not show statistic popup initially", () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
                sideButton: <IconStatistic />,
                statisticPopupContent: mockStatisticPopupContent,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            expect(screen.queryByTestId("base-dialog")).not.toBeInTheDocument();
            expect(screen.queryByTestId("statistic-popup-content")).not.toBeInTheDocument();
        });

        it("should show statistic popup when side button is clicked", async () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
                sideButton: <IconStatistic />,
                statisticPopupContent: mockStatisticPopupContent,
            };

            // Act
            render(<RoundHistory {...props} />);
            const sideButton = screen.getByTestId("icon-statistic");
            fireEvent.click(sideButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("statistic-popup-content")).toBeInTheDocument();
            });
        });

        it("should hide statistic popup when close button is clicked", async () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
                sideButton: <IconStatistic />,
                statisticPopupContent: mockStatisticPopupContent,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Open popup
            const sideButton = screen.getByTestId("icon-statistic");
            fireEvent.click(sideButton);

            // Wait for popup to appear
            await waitFor(() => {
                expect(screen.getByTestId("statistic-popup-content")).toBeInTheDocument();
            });

            // Close popup by clicking the side button again
            fireEvent.click(sideButton);

            // Assert
            await waitFor(() => {
                expect(screen.queryByTestId("statistic-popup-content")).not.toBeInTheDocument();
            });
        });

        it("should toggle statistic popup when side button is clicked multiple times", async () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
                sideButton: <IconStatistic />,
                statisticPopupContent: mockStatisticPopupContent,
            };

            // Act
            render(<RoundHistory {...props} />);
            const sideButton = screen.getByTestId("icon-statistic");

            // First click - open popup
            fireEvent.click(sideButton);
            await waitFor(() => {
                expect(screen.getByTestId("statistic-popup-content")).toBeInTheDocument();
            });

            // Second click - close popup
            fireEvent.click(sideButton);
            await waitFor(() => {
                expect(screen.queryByTestId("statistic-popup-content")).not.toBeInTheDocument();
            });

            // Third click - open popup again
            fireEvent.click(sideButton);
            await waitFor(() => {
                expect(screen.getByTestId("statistic-popup-content")).toBeInTheDocument();
            });
        });

        it("should not show statistic popup when statisticPopupContent is not provided", async () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
                sideButton: <IconStatistic />,
            };

            // Act
            render(<RoundHistory {...props} />);
            const sideButton = screen.getByTestId("icon-statistic");
            fireEvent.click(sideButton);

            // Assert
            await waitFor(() => {
                expect(screen.queryByTestId("statistic-popup-content")).not.toBeInTheDocument();
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty round history", () => {
            // Arrange
            const props = {
                roundHistory: [],
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            expect(screen.queryByTestId("history-item-0")).not.toBeInTheDocument();
        });

        it("should handle null round history", () => {
            // Arrange
            const props = {
                roundHistory: null,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            expect(screen.queryByTestId("history-item-0")).not.toBeInTheDocument();
        });

        it("should handle undefined round history", () => {
            // Arrange
            const props = {
                roundHistory: undefined,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            expect(screen.queryByTestId("history-item-0")).not.toBeInTheDocument();
        });

        it("should limit items when isShowBlink is true", () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: true,
                renderItem: mockRenderItem,
                numberOfItems: 2, // Should show 1 item when isShowBlink is true
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            expect(screen.getByTestId("history-item-0")).toBeInTheDocument();
            expect(screen.queryByTestId("history-item-1")).not.toBeInTheDocument();
            expect(screen.getByTestId("mini-item-next")).toBeInTheDocument();
        });

        it("should apply sizeNextItem class to MiniItemNext", () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: true,
                renderItem: mockRenderItem,
                numberOfItems: 3,
                sizeNextItem: "large",
            };

            // Act
            render(<RoundHistory {...props} />);

            // Assert
            const miniItem = screen.getByTestId("mini-item-next");
            expect(miniItem).toHaveClass("large");
        });
    });

    describe("Integration with IconStatistic", () => {
        it("should properly handle IconStatistic click events", async () => {
            // Arrange
            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
                sideButton: <IconStatistic />,
                statisticPopupContent: mockStatisticPopupContent,
            };

            // Act
            render(<RoundHistory {...props} />);
            const iconStatistic = screen.getByTestId("icon-statistic");
            fireEvent.click(iconStatistic);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("statistic-popup-content")).toBeInTheDocument();
            });
        });
    });

    describe("Statistic Popup with onClose", () => {
        it("should call onClose when statistic popup is closed", async () => {
            // Arrange
            const mockOnClose = jest.fn();
            const statisticPopupWithOnClose = React.cloneElement(mockStatisticPopupContent as React.ReactElement, {
                onClose: mockOnClose
            });

            const props = {
                roundHistory: mockRoundHistory,
                isShowBlink: false,
                renderItem: mockRenderItem,
                numberOfItems: 3,
                sideButton: <IconStatistic />,
                statisticPopupContent: statisticPopupWithOnClose,
            };

            // Act
            render(<RoundHistory {...props} />);

            // Open popup
            const sideButton = screen.getByTestId("icon-statistic");
            fireEvent.click(sideButton);

            // Wait for popup to appear
            await waitFor(() => {
                expect(screen.getByTestId("statistic-popup-content")).toBeInTheDocument();
            });

            // Close popup by clicking the side button again
            fireEvent.click(sideButton);

            // Assert
            await waitFor(() => {
                expect(screen.queryByTestId("statistic-popup-content")).not.toBeInTheDocument();
            });
        });
    });
});
