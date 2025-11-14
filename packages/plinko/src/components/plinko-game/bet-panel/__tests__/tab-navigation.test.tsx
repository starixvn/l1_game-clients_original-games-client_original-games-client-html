import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TabNavigation from "../tab-navigation";

// Mock the useCommonTranslate hook
jest.mock("@shared", () => ({
    useCommonTranslate: () => ({
        t: (key: string) => key,
    }),
    useClickSound: jest.fn().mockReturnValue(jest.fn()),
}));

describe("TabNavigation", () => {
    const defaultProps = {
        activeIndex: 0,
        onChangeTab: jest.fn(),
        isDisabled: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render both tab buttons", () => {
            // Arrange
            const { container } = render(<TabNavigation {...defaultProps} />);

            // Act & Assert
            expect(screen.getByText("manual")).toBeInTheDocument();
            expect(screen.getByText("auto")).toBeInTheDocument();
        });

        it("should render with correct active tab styling", () => {
            // Arrange
            const { container } = render(<TabNavigation {...defaultProps} activeIndex={1} />);

            // Act & Assert
            const activeIndicator = document.querySelector("[style*='transform: translateX(100%)']");
            expect(activeIndicator).toBeInTheDocument();
            expect(activeIndicator).toHaveStyle({
                transform: "translateX(100%)",
            });
        });

        it("should render with correct inactive tab styling", () => {
            // Arrange
            render(<TabNavigation {...defaultProps} activeIndex={0} />);

            // Act & Assert
            const activeIndicator = document.querySelector("[style*='transform: translateX(0%)']");
            expect(activeIndicator).toHaveStyle({
                transform: "translateX(0%)",
            });
        });
    });

    describe("User Interactions", () => {
        it("should call onChangeTab with correct index when manual tab is clicked", () => {
            // Arrange
            const mockOnChangeTab = jest.fn();
            render(<TabNavigation {...defaultProps} onChangeTab={mockOnChangeTab} />);

            // Act
            fireEvent.click(screen.getByText("manual"));

            // Assert
            expect(mockOnChangeTab).toHaveBeenCalledWith(0);
            expect(mockOnChangeTab).toHaveBeenCalledTimes(1);
        });

        it("should call onChangeTab with correct index when auto tab is clicked", () => {
            // Arrange
            const mockOnChangeTab = jest.fn();
            render(<TabNavigation {...defaultProps} onChangeTab={mockOnChangeTab} />);

            // Act
            fireEvent.click(screen.getByText("auto"));

            // Assert
            expect(mockOnChangeTab).toHaveBeenCalledWith(1);
            expect(mockOnChangeTab).toHaveBeenCalledTimes(1);
        });

        it("should not call onChangeTab when disabled and tab is clicked", () => {
            // Arrange
            const mockOnChangeTab = jest.fn();
            render(<TabNavigation {...defaultProps} onChangeTab={mockOnChangeTab} isDisabled={true} />);

            // Act
            fireEvent.click(screen.getByText("manual"));
            fireEvent.click(screen.getByText("auto"));

            // Assert
            expect(mockOnChangeTab).not.toHaveBeenCalled();
        });
    });

    describe("Active Tab Indicator", () => {
        it("should position indicator at first tab when activeIndex is 0", () => {
            // Arrange
            render(<TabNavigation {...defaultProps} activeIndex={0} />);

            // Act & Assert
            const activeIndicator = document.querySelector("[style*='transform: translateX(0%)']");
            expect(activeIndicator).toHaveStyle({
                transform: "translateX(0%)",
                width: "50%",
            });
        });

        it("should position indicator at second tab when activeIndex is 1", () => {
            // Arrange
            render(<TabNavigation {...defaultProps} activeIndex={1} />);

            // Act & Assert
            const activeIndicator = document.querySelector("[style*='transform: translateX(100%)']");
            expect(activeIndicator).toHaveStyle({
                transform: "translateX(100%)",
                width: "50%",
            });
        });

        it("should have correct width for indicator based on number of tabs", () => {
            // Arrange
            render(<TabNavigation {...defaultProps} activeIndex={0} />);

            // Act & Assert
            const activeIndicator = document.querySelector("[style*='width: 50%']");
            expect(activeIndicator).toHaveStyle({
                width: "50%", // 100 / 2 tabs = 50%
            });
        });
    });

    describe("Accessibility", () => {
        it("should render buttons with proper roles", () => {
            // Arrange
            render(<TabNavigation {...defaultProps} />);

            // Act & Assert
            const buttons = screen.getAllByRole("button");
            expect(buttons).toHaveLength(2);
        });

        it("should disable buttons when isDisabled is true", () => {
            // Arrange
            render(<TabNavigation {...defaultProps} isDisabled={true} />);

            // Act & Assert
            const buttons = screen.getAllByRole("button");
            buttons.forEach((button) => {
                expect(button).toBeDisabled();
            });
        });
    });
});
