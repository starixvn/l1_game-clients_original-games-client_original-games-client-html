import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import RowsSelector from "../rows-selector";
import { logger } from "@plinko/services/logger";

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

// Mock the logger
const mockLogger = {
    logUIEvent: jest.fn(),
    logStateChange: jest.fn(),
};
jest.mock("@plinko/services/logger", () => ({
    logger: mockLogger,
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

    describe("Logger Integration", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should log UI event when slider value changes", () => {
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
            expect(mockLogger.logUIEvent).toHaveBeenCalledWith(
                'rows-selector-change',
                expect.objectContaining({
                    newValue: 14,
                    previousValue: 12,
                    minValue: 8,
                    maxValue: 16,
                    isValid: true,
                    deviceInfo: expect.objectContaining({
                        isMobile: expect.any(Boolean),
                    })
                })
            );
        });

        it("should log state change when setNumberOfRows is called", () => {
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
            expect(mockLogger.logStateChange).toHaveBeenCalledWith(
                'number-of-rows',
                12,
                14,
                expect.objectContaining({ category: 'state' })
            );
        });

        it("should log UI event when component renders", () => {
            // Arrange & Act
            render(<RowsSelector {...defaultProps} />);

            // Assert
            expect(mockLogger.logUIEvent).toHaveBeenCalledWith(
                'rows-selector-render',
                expect.objectContaining({
                    currentValue: 12,
                    minValue: 8,
                    maxValue: 16,
                    isDisabled: false,
                    deviceInfo: expect.objectContaining({
                        isMobile: expect.any(Boolean),
                    })
                })
            );
        });

        it("should log UI event when component is disabled", () => {
            // Arrange & Act
            render(<RowsSelector {...defaultProps} isDisabled={true} />);

            // Assert
            expect(mockLogger.logUIEvent).toHaveBeenCalledWith(
                'rows-selector-render',
                expect.objectContaining({
                    currentValue: 12,
                    minValue: 8,
                    maxValue: 16,
                    isDisabled: true,
                    deviceInfo: expect.objectContaining({
                        isMobile: expect.any(Boolean),
                    })
                })
            );
        });

        it("should log minimum value change", () => {
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
            expect(mockLogger.logUIEvent).toHaveBeenCalledWith(
                'rows-selector-change',
                expect.objectContaining({
                    newValue: 8,
                    previousValue: 12,
                    minValue: 8,
                    maxValue: 16,
                    isValid: true,
                    isMinValue: true,
                    deviceInfo: expect.objectContaining({
                        isMobile: expect.any(Boolean),
                    })
                })
            );
        });

        it("should log maximum value change", () => {
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
            expect(mockLogger.logUIEvent).toHaveBeenCalledWith(
                'rows-selector-change',
                expect.objectContaining({
                    newValue: 16,
                    previousValue: 12,
                    minValue: 8,
                    maxValue: 16,
                    isValid: true,
                    isMaxValue: true,
                    deviceInfo: expect.objectContaining({
                        isMobile: expect.any(Boolean),
                    })
                })
            );
        });
    });
});
