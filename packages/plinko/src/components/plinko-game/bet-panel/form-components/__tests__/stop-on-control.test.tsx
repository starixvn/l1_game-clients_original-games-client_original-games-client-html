import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import StopOnControl from "../stop-on-control";

jest.mock("../label", () => {
    return function MockLabel({ title }: { title: string }) {
        return <div>{title}</div>;
    };
});

describe("StopOnControl", () => {
    const defaultProps = {
        value: 100,
        setValue: jest.fn(),
        isDisabled: false,
        title: "test_title",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render label and input field", () => {
            // Arrange
            const { container } = render(<StopOnControl {...defaultProps} />);

            // Act & Assert
            expect(container).toMatchSnapshot();
            expect(screen.getByText("test_title")).toBeInTheDocument();
            expect(screen.getByRole("spinbutton")).toBeInTheDocument();
        });
    });

    describe("Value Handling", () => {
        it("should display current value", () => {
            // Arrange
            render(<StopOnControl {...defaultProps} value={250} />);

            // Act & Assert
            const input = screen.getByRole("spinbutton");
            expect(input).toHaveValue(250);
        });

        it("should call setValue when input value changes", () => {
            // Arrange
            const mockSetValue = jest.fn();
            render(<StopOnControl {...defaultProps} setValue={mockSetValue} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "150" } });

            // Assert
            expect(mockSetValue).toHaveBeenCalledWith(150);
        });

        it("should handle negative values by converting to absolute", () => {
            // Arrange
            const mockSetValue = jest.fn();
            render(<StopOnControl {...defaultProps} setValue={mockSetValue} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "-75" } });

            // Assert
            expect(mockSetValue).toHaveBeenCalledWith(75);
        });
    });

    describe("Disabled State", () => {
        it("should disable input when isDisabled is true", () => {
            // Arrange
            render(<StopOnControl {...defaultProps} isDisabled={true} />);

            // Act & Assert
            const input = screen.getByRole("spinbutton");
            expect(input).toBeDisabled();
        });
    });

    describe("Value Formatting", () => {
        it("should format values", () => {
            // Arrange
            const mockSetValue = jest.fn();
            render(<StopOnControl {...defaultProps} setValue={mockSetValue} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "123.999" } });

            // Assert
            expect(mockSetValue).toHaveBeenCalledWith(123.999); // toFixed(2) applied
        });

        it("should handle negative values correctly", () => {
            // Arrange
            const mockSetValue = jest.fn();
            render(<StopOnControl {...defaultProps} setValue={mockSetValue} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "-50.75" } });

            // Assert
            expect(mockSetValue).toHaveBeenCalledWith(50.75); // Absolute value
        });
    });
});
