import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import NumberOfBetsControl from "../number-of-bets-control";

// Mock the hooks
jest.mock("@shared/react-hooks", () => ({
    useCommonTranslate: jest.fn(),
}));

describe("NumberOfBetsControl", () => {
    const mockUseCommonTranslate = require("@shared/react-hooks").useCommonTranslate;

    const defaultTranslator = {
        t: (key: string) => key,
    };

    const defaultProps = {
        numberOfBets: 10,
        setNumberOfBets: jest.fn(),
        isDisabled: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCommonTranslate.mockReturnValue(defaultTranslator);
    });

    describe("Rendering", () => {
        it("should render label and input field", () => {
            // Arrange
            const { container } = render(<NumberOfBetsControl {...defaultProps} />);

            // Act & Assert
            expect(screen.getByText("number_of_bet")).toBeInTheDocument();
            expect(screen.getByRole("spinbutton")).toBeInTheDocument();
        });

        it("should render control buttons", () => {
            // Arrange
            render(<NumberOfBetsControl {...defaultProps} />);

            // Act & Assert
            expect(screen.getByRole("button", { name: "∞" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "100" })).toBeInTheDocument();
        });
    });

    describe("Input Value Handling", () => {
        it("should display current numberOfBets value", () => {
            // Arrange
            render(<NumberOfBetsControl {...defaultProps} numberOfBets={50} />);

            // Act & Assert
            const input = screen.getByRole("spinbutton");
            expect(input).toHaveValue(50);
        });

        it("should call setNumberOfBets when input value changes", () => {
            // Arrange
            const mockSetNumberOfBets = jest.fn();
            render(<NumberOfBetsControl {...defaultProps} setNumberOfBets={mockSetNumberOfBets} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "25" } });

            // Assert
            expect(mockSetNumberOfBets).toHaveBeenCalledWith(25);
        });

        it("should handle negative values by converting to absolute", () => {
            // Arrange
            const mockSetNumberOfBets = jest.fn();
            render(<NumberOfBetsControl {...defaultProps} setNumberOfBets={mockSetNumberOfBets} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "-30" } });

            // Assert
            expect(mockSetNumberOfBets).toHaveBeenCalledWith(30);
        });

        it("should limit input to maximum value of 99999999", () => {
            // Arrange
            const mockSetNumberOfBets = jest.fn();
            render(<NumberOfBetsControl {...defaultProps} setNumberOfBets={mockSetNumberOfBets} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.change(input, { target: { value: "999999999" } });

            // Assert
            expect(mockSetNumberOfBets).toHaveBeenCalledWith(99999999);
        });
    });

    describe("Infinity Handling", () => {
        it("should show infinity symbol when numberOfBets is Infinity", () => {
            // Arrange
            render(<NumberOfBetsControl {...defaultProps} numberOfBets={Infinity} />);

            // Act & Assert
            const infinitySymbols = screen.getAllByText("∞");
            expect(infinitySymbols).toHaveLength(2); // One in span, one in button
        });

        it("should not show infinity symbol when numberOfBets is not Infinity", () => {
            // Arrange
            render(<NumberOfBetsControl {...defaultProps} numberOfBets={10} />);

            // Act & Assert
            const infinitySymbols = screen.queryAllByText("∞");
            expect(infinitySymbols).toHaveLength(1); // Only the button, not the span
        });

        it("should call setNumberOfBets with 0 when input is focused and numberOfBets is Infinity", () => {
            // Arrange
            const mockSetNumberOfBets = jest.fn();
            render(<NumberOfBetsControl {...defaultProps} numberOfBets={Infinity} setNumberOfBets={mockSetNumberOfBets} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.focus(input);

            // Assert
            expect(mockSetNumberOfBets).toHaveBeenCalledWith(0);
        });

        it("should call setNumberOfBets with current value when input is focused and numberOfBets is not Infinity", () => {
            // Arrange
            const mockSetNumberOfBets = jest.fn();
            render(<NumberOfBetsControl {...defaultProps} numberOfBets={50} setNumberOfBets={mockSetNumberOfBets} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.focus(input);

            // Assert
            expect(mockSetNumberOfBets).toHaveBeenCalledWith(50);
        });

        it("should call setNumberOfBets with Infinity when input is blurred and value is 0", () => {
            // Arrange
            const mockSetNumberOfBets = jest.fn();
            render(<NumberOfBetsControl {...defaultProps} numberOfBets={0} setNumberOfBets={mockSetNumberOfBets} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.blur(input);

            // Assert
            expect(mockSetNumberOfBets).toHaveBeenCalledWith(Infinity);
        });

        it("should call setNumberOfBets with current value when input is blurred and value is not 0", () => {
            // Arrange
            const mockSetNumberOfBets = jest.fn();
            render(<NumberOfBetsControl {...defaultProps} numberOfBets={25} setNumberOfBets={mockSetNumberOfBets} />);

            // Act
            const input = screen.getByRole("spinbutton");
            fireEvent.blur(input);

            // Assert
            expect(mockSetNumberOfBets).toHaveBeenCalledWith(25);
        });
    });

    describe("Control Buttons", () => {
        it("should call setNumberOfBets with Infinity when ∞ button is clicked", () => {
            // Arrange
            const mockSetNumberOfBets = jest.fn();
            render(<NumberOfBetsControl {...defaultProps} setNumberOfBets={mockSetNumberOfBets} />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "∞" }));

            // Assert
            expect(mockSetNumberOfBets).toHaveBeenCalledWith(Infinity);
        });

        it("should call setNumberOfBets with 10 when 10 button is clicked", () => {
            // Arrange
            const mockSetNumberOfBets = jest.fn();
            render(<NumberOfBetsControl {...defaultProps} setNumberOfBets={mockSetNumberOfBets} />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "10" }));

            // Assert
            expect(mockSetNumberOfBets).toHaveBeenCalledWith(10);
        });

        it("should call setNumberOfBets with 100 when 100 button is clicked", () => {
            // Arrange
            const mockSetNumberOfBets = jest.fn();
            render(<NumberOfBetsControl {...defaultProps} setNumberOfBets={mockSetNumberOfBets} />);

            // Act
            fireEvent.click(screen.getByRole("button", { name: "100" }));

            // Assert
            expect(mockSetNumberOfBets).toHaveBeenCalledWith(100);
        });
    });
});
