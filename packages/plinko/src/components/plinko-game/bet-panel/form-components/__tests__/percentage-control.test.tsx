import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PercentageControl from "../percentage-control";

// Mock the hooks
jest.mock("@shared/react-hooks", () => ({
    useCommonTranslate: jest.fn().mockReturnValue({ t: jest.fn((key) => key) }),
}));

jest.mock("../icon-info-percentage-control", () => {
    return function MockIconInfoPercentageControl({ type }: { type: "on_win" | "on_loss" }) {
        return <div>IconInfoPercentageControl</div>;
    };
});

describe("PercentageControl", () => {
    const defaultProps = {
        isIncreaseOn: false,
        setIsIncreaseOn: jest.fn(),
        percentage: 0,
        setPercentage: jest.fn(),
        isDisabled: false,
        title: "test_title",
        type: "on_win" as const,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render label and control elements", () => {
            // Arrange
            const { container } = render(<PercentageControl {...defaultProps} />);

            // Act & Assert
            expect(screen.getByText("test_title")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "reset" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "increase_by" })).toBeInTheDocument();
            expect(screen.getByRole("spinbutton")).toBeInTheDocument();
        });

        it("should display percentage symbol", () => {
            // Arrange
            render(<PercentageControl {...defaultProps} />);

            // Act & Assert
            expect(screen.getByText("%")).toBeInTheDocument();
        });
    });

    describe("Button States", () => {
        it("should show reset button as pressed when isIncreaseOn is false", () => {
            // Arrange
            render(<PercentageControl {...defaultProps} isIncreaseOn={false} />);

            // Act & Assert
            const resetButton = screen.getByRole("button", { name: "reset" });
            expect(resetButton).toHaveAttribute("aria-pressed", "true");
        });

        it("should show increase_by button as pressed when isIncreaseOn is true", () => {
            // Arrange
            render(<PercentageControl {...defaultProps} isIncreaseOn={true} />);

            // Act & Assert
            const increaseButton = screen.getByRole("button", { name: "increase_by" });
            expect(increaseButton).toHaveAttribute("aria-pressed", "true");
        });

        it("should call setIsIncreaseOn and setPercentage when reset button is clicked", () => {
            // Arrange
            const mockSetIsIncreaseOn = jest.fn();
            const mockSetPercentage = jest.fn();
            render(<PercentageControl {...defaultProps} setIsIncreaseOn={mockSetIsIncreaseOn} setPercentage={mockSetPercentage} />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "reset" }));

            // Assert
            expect(mockSetIsIncreaseOn).toHaveBeenCalledWith(false);
            expect(mockSetPercentage).toHaveBeenCalledWith(0);
        });

        it("should call setIsIncreaseOn and setPercentage when increase_by button is clicked", () => {
            // Arrange
            const mockSetIsIncreaseOn = jest.fn();
            const mockSetPercentage = jest.fn();
            render(<PercentageControl {...defaultProps} setIsIncreaseOn={mockSetIsIncreaseOn} setPercentage={mockSetPercentage} />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "increase_by" }));

            // Assert
            expect(mockSetIsIncreaseOn).toHaveBeenCalledWith(true);
            expect(mockSetPercentage).toHaveBeenCalledWith(0);
        });
    });

    describe("Input Field", () => {
        it("should have correct value", () => {
            // Arrange
            render(<PercentageControl {...defaultProps} percentage={50} />);

            // Act & Assert
            const input = screen.getByRole("spinbutton");
            expect(input).toHaveValue(50);
        });

        it("should be disabled when isIncreaseOn is false", () => {
            // Arrange
            render(<PercentageControl {...defaultProps} isIncreaseOn={false} />);

            // Act & Assert
            const input = screen.getByRole("spinbutton");
            expect(input).toBeDisabled();
        });

        it("should be enabled when isIncreaseOn is true", () => {
            // Arrange
            render(<PercentageControl {...defaultProps} isIncreaseOn={true} />);

            // Act & Assert
            const input = screen.getByRole("spinbutton");
            expect(input).not.toBeDisabled();
        });

        it("should call setPercentage when value changes", () => {
            // Arrange
            const mockSetPercentage = jest.fn();
            render(<PercentageControl {...defaultProps} isIncreaseOn={true} setPercentage={mockSetPercentage} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "75" } });

            // Assert
            expect(mockSetPercentage).toHaveBeenCalledWith(75);
        });

        it("should handle negative values by converting to absolute", () => {
            // Arrange
            const mockSetPercentage = jest.fn();
            render(<PercentageControl {...defaultProps} isIncreaseOn={true} setPercentage={mockSetPercentage} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "-50" } });

            // Assert
            expect(mockSetPercentage).toHaveBeenCalledWith(50);
        });

        it("should limit input to maximum value of 10000", () => {
            // Arrange
            const mockSetPercentage = jest.fn();
            render(<PercentageControl {...defaultProps} isIncreaseOn={true} setPercentage={mockSetPercentage} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "15000" } });

            // Assert
            expect(mockSetPercentage).toHaveBeenCalledWith(10000);
        });
    });
});
