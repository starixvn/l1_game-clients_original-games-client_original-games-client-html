import {
    calculatePegSafeScale,
    calculatePegsSpan
} from "../peg-scaling-utils";
import {
    CANVAS_CONSTANTS,
    PEG_CONSTANTS,
    DEFAULT_VALUES
} from "../../constants/scaling-constants";

describe("peg-scaling-utils", () => {
    describe("calculatePegSafeScale", () => {
        let mockContainerElement: HTMLDivElement;
        let mockFrameRect: DOMRect;

        beforeEach(() => {
            // Create mock container element
            mockContainerElement = {
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: 800,
                    height: 600,
                    left: 100,
                    right: 900,
                    top: 50,
                    bottom: 650,
                    x: 100,
                    y: 50,
                    toJSON: () => ({})
                })
            } as any;

            // Create mock frame rect
            mockFrameRect = {
                width: CANVAS_CONSTANTS.ORIGINAL_WIDTH,
                height: 600,
                left: 200,
                top: 100,
                right: 200 + CANVAS_CONSTANTS.ORIGINAL_WIDTH,
                bottom: 700,
                x: 200,
                y: 100,
                toJSON: () => ({})
            } as DOMRect;
        });

        it("should return NO_SCALE when container element is null", () => {
            // Arrange
            const numberOfRows = 12;

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, null);

            // Assert
            expect(result).toBe(DEFAULT_VALUES.NO_SCALE);
        });

        it("should return NO_SCALE when container element is undefined", () => {
            // Arrange
            const numberOfRows = 12;

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect);

            // Assert
            expect(result).toBe(DEFAULT_VALUES.NO_SCALE);
        });

        it("should return NO_SCALE when pegs fit within container bounds", () => {
            // Arrange
            const numberOfRows = 8; // Smaller number of rows = fewer pegs

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, mockContainerElement);

            // Assert
            expect(result).toBe(DEFAULT_VALUES.NO_SCALE);
        });

        it("should calculate scale down when pegs are cut off on the right side", () => {
            // Arrange
            const numberOfRows = 16; // Large number of rows = more pegs
            const narrowContainer = {
                ...mockContainerElement,
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: 400, // Very narrow container
                    height: 600,
                    left: 100,
                    right: 500,
                    top: 50,
                    bottom: 650,
                    x: 100,
                    y: 50,
                    toJSON: () => ({})
                })
            };

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, narrowContainer);

            // Assert
            expect(result).toBeLessThan(DEFAULT_VALUES.NO_SCALE);
            expect(result).toBeGreaterThan(0);
        });

        it("should calculate scale down when pegs are cut off on the left side", () => {
            // Arrange
            const numberOfRows = 16;
            const shiftedFrameRect = {
                ...mockFrameRect,
                left: 50, // Frame starts closer to container edge
                right: 50 + CANVAS_CONSTANTS.ORIGINAL_WIDTH
            };

            // Act
            const result = calculatePegSafeScale(numberOfRows, shiftedFrameRect, mockContainerElement);

            // Assert
            expect(result).toBeLessThan(DEFAULT_VALUES.NO_SCALE);
            expect(result).toBeGreaterThan(0);
        });

        it("should calculate scale down when pegs are cut off with default visual margin multiplier", () => {
            // Arrange
            const numberOfRows = 16;
            const narrowContainer = {
                ...mockContainerElement,
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: 500,
                    height: 600,
                    left: 100,
                    right: 600,
                    top: 50,
                    bottom: 650,
                    x: 100,
                    y: 50,
                    toJSON: () => ({})
                })
            };

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, narrowContainer);

            // Assert
            // Should scale down due to peg cutoff
            expect(result).toBeLessThan(DEFAULT_VALUES.NO_SCALE);
            expect(result).toBeGreaterThan(0);
        });

        it("should produce different scaling factors for different visual margin multipliers", () => {
            // Arrange
            const numberOfRows = 16;
            const narrowContainer = {
                ...mockContainerElement,
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: 500,
                    height: 600,
                    left: 100,
                    right: 600,
                    top: 50,
                    bottom: 650,
                    x: 100,
                    y: 50,
                    toJSON: () => ({})
                })
            };

            // Act
            const resultDefault = calculatePegSafeScale(numberOfRows, mockFrameRect, narrowContainer);
            const resultLayout = calculatePegSafeScale(numberOfRows, mockFrameRect, narrowContainer, PEG_CONSTANTS.VISUAL_MARGIN_MULTIPLIER.LAYOUT);

            // Assert
            // Different multipliers should produce different scaling factors
            expect(resultDefault).not.toBe(resultLayout);
            expect(resultDefault).toBeLessThan(DEFAULT_VALUES.NO_SCALE);
            expect(resultLayout).toBeLessThan(DEFAULT_VALUES.NO_SCALE);
        });

        it("should handle custom visual margin multiplier", () => {
            // Arrange
            const numberOfRows = 16;
            const customMarginMultiplier = 3;
            const narrowContainer = {
                ...mockContainerElement,
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: 500,
                    height: 600,
                    left: 100,
                    right: 600,
                    top: 50,
                    bottom: 650,
                    x: 100,
                    y: 50,
                    toJSON: () => ({})
                })
            };

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, narrowContainer, customMarginMultiplier);

            // Assert
            // Should still produce a valid scaling factor
            expect(result).toBeLessThan(DEFAULT_VALUES.NO_SCALE);
            expect(result).toBeGreaterThan(0);
        });

        it("should handle minimum number of rows", () => {
            // Arrange
            const numberOfRows = 1;

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, mockContainerElement);

            // Assert
            expect(result).toBe(DEFAULT_VALUES.NO_SCALE);
        });

        it("should handle large number of rows", () => {
            // Arrange
            const numberOfRows = 20;

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, mockContainerElement);

            // Assert
            // May or may not need scaling depending on container size
            expect(typeof result).toBe('number');
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(DEFAULT_VALUES.NO_SCALE);
        });

        it("should handle zero number of rows", () => {
            // Arrange
            const numberOfRows = 0;

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, mockContainerElement);

            // Assert
            expect(result).toBe(DEFAULT_VALUES.NO_SCALE);
        });

        it("should handle negative number of rows", () => {
            // Arrange
            const numberOfRows = -1;

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, mockContainerElement);

            // Assert
            expect(result).toBe(DEFAULT_VALUES.NO_SCALE);
        });

        it("should handle very wide container", () => {
            // Arrange
            const numberOfRows = 16;
            const veryWideContainer = {
                ...mockContainerElement,
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: 2000, // Very wide container
                    height: 600,
                    left: 100,
                    right: 2100,
                    top: 50,
                    bottom: 650,
                    x: 100,
                    y: 50,
                    toJSON: () => ({})
                })
            };

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, veryWideContainer);

            // Assert
            expect(result).toBe(DEFAULT_VALUES.NO_SCALE);
        });

        it("should handle container with zero width", () => {
            // Arrange
            const numberOfRows = 16;
            const zeroWidthContainer = {
                ...mockContainerElement,
                getBoundingClientRect: jest.fn().mockReturnValue({
                    width: 0,
                    height: 600,
                    left: 100,
                    right: 100,
                    top: 50,
                    bottom: 650,
                    x: 100,
                    y: 50,
                    toJSON: () => ({})
                })
            };

            // Act
            const result = calculatePegSafeScale(numberOfRows, mockFrameRect, zeroWidthContainer);

            // Assert
            // With zero width, scaling calculation may result in 0 or very small number
            expect(typeof result).toBe('number');
            expect(result).toBeGreaterThanOrEqual(0);
        });

        it("should handle frame rect with zero width", () => {
            // Arrange
            const numberOfRows = 16;
            const zeroWidthFrameRect = {
                ...mockFrameRect,
                width: 0
            };

            // Act
            const result = calculatePegSafeScale(numberOfRows, zeroWidthFrameRect, mockContainerElement);

            // Assert
            expect(result).toBe(DEFAULT_VALUES.NO_SCALE);
        });
    });

    describe("calculatePegsSpan", () => {
        it("should calculate peg span for minimum rows", () => {
            // Arrange
            const numberOfRows = 1;

            // Act
            const result = calculatePegsSpan(numberOfRows);

            // Assert
            expect(result).toHaveProperty("totalVisualLeftEdge");
            expect(result).toHaveProperty("totalVisualRightEdge");
            expect(result).toHaveProperty("pegsSpan");
            expect(result.pegsSpan).toBe(result.totalVisualRightEdge - result.totalVisualLeftEdge);
            expect(result.pegsSpan).toBeGreaterThan(0);
        });

        it("should calculate peg span for standard rows", () => {
            // Arrange
            const numberOfRows = 12;

            // Act
            const result = calculatePegsSpan(numberOfRows);

            // Assert
            expect(result.totalVisualLeftEdge).toBeDefined();
            expect(result.totalVisualRightEdge).toBeDefined();
            expect(result.pegsSpan).toBe(result.totalVisualRightEdge - result.totalVisualLeftEdge);
            expect(result.pegsSpan).toBeGreaterThan(0);
        });

        it("should calculate peg span for maximum rows", () => {
            // Arrange
            const numberOfRows = 20;

            // Act
            const result = calculatePegsSpan(numberOfRows);

            // Assert
            expect(result.pegsSpan).toBeGreaterThan(0);
            expect(result.totalVisualRightEdge).toBeGreaterThan(result.totalVisualLeftEdge);
        });

        it("should increase span with more rows", () => {
            // Arrange
            const smallRows = calculatePegsSpan(8);
            const largeRows = calculatePegsSpan(16);

            // Assert
            expect(largeRows.pegsSpan).toBeGreaterThan(smallRows.pegsSpan);
        });

        it("should use default visual margin multiplier when not specified", () => {
            // Arrange
            const numberOfRows = 12;

            // Act
            const result = calculatePegsSpan(numberOfRows);

            // Assert
            expect(result).toBeDefined();
            // The calculation should complete without errors
        });

        it("should apply custom visual margin multiplier correctly", () => {
            // Arrange
            const numberOfRows = 12;
            const customMultiplier = 1;

            // Act
            const resultWithDefault = calculatePegsSpan(numberOfRows);
            const resultWithCustom = calculatePegsSpan(numberOfRows, customMultiplier);

            // Assert
            // Different multipliers should produce different results
            expect(resultWithCustom.pegsSpan).not.toBe(resultWithDefault.pegsSpan);
        });

        it("should handle zero visual margin multiplier", () => {
            // Arrange
            const numberOfRows = 12;
            const zeroMultiplier = 0;

            // Act
            const result = calculatePegsSpan(numberOfRows, zeroMultiplier);

            // Assert
            expect(result.pegsSpan).toBeGreaterThan(0);
            // With zero margin, span should be smaller than default
            const defaultResult = calculatePegsSpan(numberOfRows);
            expect(result.pegsSpan).toBeLessThan(defaultResult.pegsSpan);
        });

        it("should handle large visual margin multiplier", () => {
            // Arrange
            const numberOfRows = 12;
            const largeMultiplier = 5;

            // Act
            const result = calculatePegsSpan(numberOfRows, largeMultiplier);

            // Assert
            expect(result.pegsSpan).toBeGreaterThan(0);
            // With large margin, span should be larger than default
            const defaultResult = calculatePegsSpan(numberOfRows);
            expect(result.pegsSpan).toBeGreaterThan(defaultResult.pegsSpan);
        });

        it("should handle zero number of rows", () => {
            // Arrange
            const numberOfRows = 0;

            // Act
            const result = calculatePegsSpan(numberOfRows);

            // Assert
            expect(result.pegsSpan).toBeGreaterThanOrEqual(0);
        });

        it("should handle negative number of rows", () => {
            // Arrange
            const numberOfRows = -1;

            // Act
            const result = calculatePegsSpan(numberOfRows);

            // Assert
            expect(result.pegsSpan).toBeGreaterThanOrEqual(0);
        });

        it("should return consistent results for same inputs", () => {
            // Arrange
            const numberOfRows = 12;

            // Act
            const result1 = calculatePegsSpan(numberOfRows);
            const result2 = calculatePegsSpan(numberOfRows);

            // Assert
            expect(result1.pegsSpan).toBe(result2.pegsSpan);
            expect(result1.totalVisualLeftEdge).toBe(result2.totalVisualLeftEdge);
            expect(result1.totalVisualRightEdge).toBe(result2.totalVisualRightEdge);
        });

        it("should have symmetric visual margins around pegs", () => {
            // Arrange
            const numberOfRows = 12;
            const { leftmostPegX, rightmostPegX, pegRadius } = calculatePegPositions(numberOfRows);
            const visualMarginMultiplier = DEFAULT_VALUES.DEFAULT_PEGS_SPAN_MARGIN_MULTIPLIER;

            // Act
            const result = calculatePegsSpan(numberOfRows, visualMarginMultiplier);

            // Assert
            const expectedLeftEdge = leftmostPegX - pegRadius - (pegRadius * visualMarginMultiplier);
            const expectedRightEdge = rightmostPegX + pegRadius + (pegRadius * visualMarginMultiplier);

            expect(result.totalVisualLeftEdge).toBe(expectedLeftEdge);
            expect(result.totalVisualRightEdge).toBe(expectedRightEdge);
        });
    });
});

// Helper function to test internal calculatePegPositions (accessed via calculatePegsSpan)
function calculatePegPositions(numberOfRows: number) {
    const { RADIUS: pegRadius, MAP_GAP: mapGap, INITIAL_COLUMNS: initialColumns } = PEG_CONSTANTS;
    const gap = pegRadius * 2 * mapGap;
    const columnsInRow = initialColumns + (numberOfRows - 1);
    const space = (CANVAS_CONSTANTS.ORIGINAL_WIDTH - gap * columnsInRow) / 2;
    const leftmostPegX = space + 1 * gap - pegRadius * mapGap;
    const rightmostPegX = space + columnsInRow * gap - pegRadius * mapGap;

    return {
        pegRadius,
        mapGap,
        gap,
        columnsInRow,
        space,
        leftmostPegX,
        rightmostPegX,
    };
}
