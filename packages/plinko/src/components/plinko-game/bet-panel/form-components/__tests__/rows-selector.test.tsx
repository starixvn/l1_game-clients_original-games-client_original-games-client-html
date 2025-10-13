import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import RowsSelector from "../rows-selector";

// Mock the stores
jest.mock("@plinko/shared/stores/plinko-game-store", () => ({
    __esModule: true,
    default: jest.fn(),
}));

// Mock the hooks
jest.mock("@shared/react-hooks", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: jest.fn((key) => key) }),
}));

jest.mock("@shared/react-contexts", () => ({
    useGameContext: jest.fn(),
}));

// Mock constants
jest.mock("@plinko/constants", () => ({
    NUMBER_OF_ROWS: {
        MIN: 8,
        MAX: 16,
    },
}));

describe("RowsSelector", () => {
    const mockUsePlinkoGameStore = require("@plinko/shared/stores/plinko-game-store").default;
    const mockUseGameContext = require("@shared/react-contexts").useGameContext;

    const defaultPlinkoStoreState = {
        numberOfRows: 12,
        setNumberOfRows: jest.fn(),
    };

    const defaultGameContext = {
        tolgeeNamespace: "plinko",
    };

    const defaultProps = {
        isDisabled: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePlinkoGameStore.mockReturnValue(defaultPlinkoStoreState);
        mockUseGameContext.mockReturnValue(defaultGameContext);
    });

    describe("Rendering", () => {
        it("should render label and range input", () => {
            // Arrange
            const { container } = render(<RowsSelector {...defaultProps} />);

            // Act & Assert
            expect(container).toMatchSnapshot();
            expect(screen.getByText("row")).toBeInTheDocument();
            expect(screen.getByRole("slider")).toBeInTheDocument();
        });

        it("should display current number of rows", () => {
            // Arrange
            render(<RowsSelector {...defaultProps} />);

            // Act & Assert
            expect(screen.getByText("12")).toBeInTheDocument();
        });
    });

    describe("Range Input Configuration", () => {
        it("should have correct min and max values", () => {
            // Arrange
            render(<RowsSelector {...defaultProps} />);

            // Act & Assert
            const slider = screen.getByRole("slider");
            expect(slider).toHaveAttribute("min", "8");
            expect(slider).toHaveAttribute("max", "16");
        });

        it("should have correct value", () => {
            // Arrange
            render(<RowsSelector {...defaultProps} />);

            // Act & Assert
            const slider = screen.getByRole("slider");
            expect(slider).toHaveValue("12");
        });
    });

    describe("User Interactions", () => {
        it("should call setNumberOfRows when slider value changes", () => {
            // Arrange
            const mockSetNumberOfRows = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setNumberOfRows: mockSetNumberOfRows,
            });
            render(<RowsSelector {...defaultProps} />);

            // Act
            const slider = screen.getByRole("slider");
            fireEvent.change(slider, { target: { value: "14" } });

            // Assert
            expect(mockSetNumberOfRows).toHaveBeenCalledWith(14);
        });

        it("should handle minimum value", () => {
            // Arrange
            const mockSetNumberOfRows = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setNumberOfRows: mockSetNumberOfRows,
            });
            render(<RowsSelector {...defaultProps} />);

            // Act
            const slider = screen.getByRole("slider");
            fireEvent.change(slider, { target: { value: "8" } });

            // Assert
            expect(mockSetNumberOfRows).toHaveBeenCalledWith(8);
        });

        it("should handle maximum value", () => {
            // Arrange
            const mockSetNumberOfRows = jest.fn();
            mockUsePlinkoGameStore.mockReturnValue({
                ...defaultPlinkoStoreState,
                setNumberOfRows: mockSetNumberOfRows,
            });
            render(<RowsSelector {...defaultProps} />);

            // Act
            const slider = screen.getByRole("slider");
            fireEvent.change(slider, { target: { value: "16" } });

            // Assert
            expect(mockSetNumberOfRows).toHaveBeenCalledWith(16);
        });
    });

    describe("Disabled", () => {
        it("should disable input when isDisabled is true", () => {
            // Arrange
            const { container } = render(<RowsSelector {...defaultProps} isDisabled={true} />);

            // Act & Assert
            expect(container).toMatchSnapshot();
            expect(screen.getByRole("slider")).toBeDisabled();
        });
    });
});
