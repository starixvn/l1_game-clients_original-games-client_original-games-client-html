import { renderHook } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePlinkoGameLayout } from "../use-plinko-game-layout";
import { CANVAS_CONSTANTS } from "../../constants/scaling-constants";

// Mock react-device-detect
jest.mock("react-device-detect", () => ({
    isMobile: false, // Default to desktop for most tests
}));

// Mock window.innerHeight
let mockInnerHeightValue = 800; // Default value
Object.defineProperty(globalThis, 'innerHeight', {
    get: () => mockInnerHeightValue,
    set: (value) => { mockInnerHeightValue = value; },
    configurable: true
});

describe("usePlinkoGameLayout", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset isMobile to false (desktop) by default
        require("react-device-detect").isMobile = false;
    });

    afterEach(() => {
        // Reset mock inner height to default
        mockInnerHeightValue = 800;
    });

    describe("Initialization", () => {
        it("should initialize hook with correct refs on desktop", () => {
            // Arrange & Act
            const { result } = renderHook(() => usePlinkoGameLayout());

            // Assert
            expect(result.current.mainContainerRef).toBeDefined();
            expect(result.current.canvasContainerRef).toBeDefined();
            expect(result.current.slotsContainerRef).toBeDefined();
            expect(result.current.mainContainerRef.current).toBeNull();
            expect(result.current.canvasContainerRef.current).toBeNull();
            expect(result.current.slotsContainerRef.current).toBeNull();
        });

        it("should initialize hook with correct refs on mobile", () => {
            // Arrange
            require("react-device-detect").isMobile = true;

            // Act
            const { result } = renderHook(() => usePlinkoGameLayout());

            // Assert
            expect(result.current.mainContainerRef).toBeDefined();
            expect(result.current.canvasContainerRef).toBeDefined();
            expect(result.current.slotsContainerRef).toBeDefined();
        });

        it("should return refs that can be assigned", () => {
            // Arrange & Act
            const { result } = renderHook(() => usePlinkoGameLayout());

            // Act - Simulate ref assignment (normally done by React)
            const mockDiv = document.createElement('div');
            Object.defineProperty(result.current.mainContainerRef, 'current', {
                value: mockDiv,
                writable: true
            });

            // Assert
            expect(result.current.mainContainerRef.current).toBe(mockDiv);
        });
    });

    describe("Layout Calculations", () => {
        describe("Desktop Layout", () => {
            it("should return base game height for desktop devices", () => {
                // Arrange
                require("react-device-detect").isMobile = false;

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                expect(result.current.baseGameHeight).toBe(CANVAS_CONSTANTS.BASE_GAME_HEIGHT);
            });

            it("should maintain consistent base game height across multiple renders", () => {
                // Arrange & Act
                const { result, rerender } = renderHook(() => usePlinkoGameLayout());

                const firstHeight = result.current.baseGameHeight;
                rerender();
                const secondHeight = result.current.baseGameHeight;

                // Assert
                expect(firstHeight).toBe(secondHeight);
                expect(firstHeight).toBe(CANVAS_CONSTANTS.BASE_GAME_HEIGHT);
            });
        });

        describe("Mobile Layout", () => {
            beforeEach(() => {
                require("react-device-detect").isMobile = true;
            });

            it("should use base game height when screen height is above small screen threshold", () => {
                // Arrange
                mockInnerHeightValue = CANVAS_CONSTANTS.SMALL_SCREEN_THRESHOLD + 100;

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                expect(result.current.baseGameHeight).toBe(CANVAS_CONSTANTS.BASE_GAME_HEIGHT);
            });

            it("should calculate mobile height when screen height is below small screen threshold", () => {
                // Arrange
                const testHeight = CANVAS_CONSTANTS.SMALL_SCREEN_THRESHOLD - 100;
                mockInnerHeightValue = testHeight;
                const expectedHeight = Math.max(
                    CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT,
                    testHeight * CANVAS_CONSTANTS.MOBILE_HEIGHT_FACTOR
                );

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                expect(result.current.baseGameHeight).toBe(expectedHeight);
            });

            it("should use minimum mobile height when calculated height is too small", () => {
                // Arrange
                const verySmallHeight = 300;
                mockInnerHeightValue = verySmallHeight;

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                expect(result.current.baseGameHeight).toBe(CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT);
                expect(result.current.baseGameHeight).toBeGreaterThanOrEqual(CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT);
            });

            it("should always use minimum mobile height or calculated height, whichever is larger", () => {
                // Arrange
                const mediumHeight = 600;
                mockInnerHeightValue = mediumHeight;
                // 600 * 0.65 = 390, but Math.max takes MIN_MOBILE_HEIGHT (500)
                const expectedHeight = CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT;

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                expect(result.current.baseGameHeight).toBe(expectedHeight);
                expect(result.current.baseGameHeight).toBe(CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT);
            });

            it("should handle edge case where screen height equals small screen threshold", () => {
                // Arrange
                mockInnerHeightValue = CANVAS_CONSTANTS.SMALL_SCREEN_THRESHOLD;

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                expect(result.current.baseGameHeight).toBe(CANVAS_CONSTANTS.BASE_GAME_HEIGHT);
            });

            it("should handle very large screen heights correctly", () => {
                // Arrange
                const veryLargeHeight = 2000;
                mockInnerHeightValue = veryLargeHeight;

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                expect(result.current.baseGameHeight).toBe(CANVAS_CONSTANTS.BASE_GAME_HEIGHT);
            });

            it("should handle zero screen height gracefully", () => {
                // Arrange
                mockInnerHeightValue = 0;

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                expect(result.current.baseGameHeight).toBe(CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT);
            });

            it("should handle negative screen height gracefully", () => {
                // Arrange
                mockInnerHeightValue = -100;

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                expect(result.current.baseGameHeight).toBe(CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT);
            });
        });

        describe("isStackedLayout", () => {
            it("should be false on desktop devices", () => {
                // Arrange
                require("react-device-detect").isMobile = false;

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                // Note: isStackedLayout is not directly exposed, but we can infer it from baseGameHeight logic
                expect(result.current.baseGameHeight).toBe(CANVAS_CONSTANTS.BASE_GAME_HEIGHT);
            });

            it("should be true on mobile devices", () => {
                // Arrange
                require("react-device-detect").isMobile = true;
                mockInnerHeightValue = CANVAS_CONSTANTS.SMALL_SCREEN_THRESHOLD - 100;

                // Act
                const { result } = renderHook(() => usePlinkoGameLayout());

                // Assert
                // When isMobile is true and height is below threshold, mobile height calculation is used
                expect(result.current.baseGameHeight).not.toBe(CANVAS_CONSTANTS.BASE_GAME_HEIGHT);
            });
        });
    });

    describe("Error Handling", () => {
        it("should handle undefined window.innerHeight gracefully", () => {
            // Arrange
            require("react-device-detect").isMobile = true;
            mockInnerHeightValue = undefined as any;

            // Act & Assert - Should not throw
            expect(() => {
                renderHook(() => usePlinkoGameLayout());
            }).not.toThrow();
        });

        it("should handle non-numeric window.innerHeight gracefully", () => {
            // Arrange
            require("react-device-detect").isMobile = true;
            mockInnerHeightValue = "invalid" as any;

            // Act & Assert - Should not throw
            expect(() => {
                renderHook(() => usePlinkoGameLayout());
            }).not.toThrow();
        });
    });

    describe("Performance and Stability", () => {
        it("should maintain stable references across renders", () => {
            // Arrange & Act
            const { result, rerender } = renderHook(() => usePlinkoGameLayout());

            const firstRefs = {
                main: result.current.mainContainerRef,
                canvas: result.current.canvasContainerRef,
                slots: result.current.slotsContainerRef
            };

            rerender();

            const secondRefs = {
                main: result.current.mainContainerRef,
                canvas: result.current.canvasContainerRef,
                slots: result.current.slotsContainerRef
            };

            // Assert
            expect(firstRefs.main).toBe(secondRefs.main);
            expect(firstRefs.canvas).toBe(secondRefs.canvas);
            expect(firstRefs.slots).toBe(secondRefs.slots);
        });

        it("should not cause unnecessary re-renders when dependencies don't change", () => {
            // Arrange & Act
            const { result, rerender } = renderHook(() => usePlinkoGameLayout());

            const firstHeight = result.current.baseGameHeight;
            rerender();
            const secondHeight = result.current.baseGameHeight;

            // Assert
            expect(firstHeight).toBe(secondHeight);
        });
    });
});
