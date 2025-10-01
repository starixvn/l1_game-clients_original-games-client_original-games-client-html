import { renderHook, act } from "@testing-library/react";
import { useIsDesktop } from "../use-is-desktop";

// Mock window object
const mockWindow = {
    innerWidth: 1024,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
};

Object.defineProperty(window, 'innerWidth', {
    writable: true,
    value: 1024,
});

Object.defineProperty(window, 'addEventListener', {
    writable: true,
    value: mockWindow.addEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
    writable: true,
    value: mockWindow.removeEventListener,
});

describe("useIsDesktop", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset window.innerWidth to desktop size
        (window as any).innerWidth = 1024;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("initial state", () => {
        it("should return true for desktop viewport (>= 768px)", () => {
            (window as any).innerWidth = 1024;

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(true);
        });

        it("should return false for mobile viewport (< 768px)", () => {
            (window as any).innerWidth = 375;

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(false);
        });

        it("should return false for tablet viewport (= 767px)", () => {
            (window as any).innerWidth = 767;

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(false);
        });

        it("should return true for tablet viewport (= 768px)", () => {
            (window as any).innerWidth = 768;

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(true);
        });
    });

    describe("event listener setup", () => {
        it("should add resize event listener on mount", () => {
            (window as any).innerWidth = 1024;

            renderHook(() => useIsDesktop());

            expect(window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
        });

        it("should remove resize event listener on unmount", () => {
            (window as any).innerWidth = 1024;

            const { unmount } = renderHook(() => useIsDesktop());

            unmount();

            expect(window.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
        });

        it("should call checkViewport initially", () => {
            (window as any).innerWidth = 1024;

            renderHook(() => useIsDesktop());

            // The hook should have been initialized with the current window.innerWidth
            expect(window.addEventListener).toHaveBeenCalledTimes(1);
        });
    });

    describe("resize handling", () => {
        it("should update state when window is resized to desktop size", () => {
            (window as any).innerWidth = 375; // Start with mobile

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(false);

            // Simulate resize to desktop
            (window as any).innerWidth = 1024;

            // Get the resize handler that was added
            const resizeHandler = mockWindow.addEventListener.mock.calls[0][1];

            act(() => {
                resizeHandler();
            });

            expect(result.current).toBe(true);
        });

        it("should update state when window is resized to mobile size", () => {
            (window as any).innerWidth = 1024; // Start with desktop

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(true);

            // Simulate resize to mobile
            (window as any).innerWidth = 375;

            // Get the resize handler that was added
            const resizeHandler = mockWindow.addEventListener.mock.calls[0][1];

            act(() => {
                resizeHandler();
            });

            expect(result.current).toBe(false);
        });

        it("should handle multiple resize events", () => {
            (window as any).innerWidth = 375; // Start with mobile

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(false);

            // Get the resize handler
            const resizeHandler = mockWindow.addEventListener.mock.calls[0][1];

            // Resize to desktop
            (window as any).innerWidth = 1024;
            act(() => {
                resizeHandler();
            });
            expect(result.current).toBe(true);

            // Resize to tablet
            (window as any).innerWidth = 767;
            act(() => {
                resizeHandler();
            });
            expect(result.current).toBe(false);

            // Resize back to desktop
            (window as any).innerWidth = 1200;
            act(() => {
                resizeHandler();
            });
            expect(result.current).toBe(true);
        });
    });

    describe("edge cases", () => {
        it("should handle zero width", () => {
            (window as any).innerWidth = 0;

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(false);
        });

        it("should handle very large width", () => {
            (window as any).innerWidth = 9999;

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(true);
        });

        it("should handle exactly 768px width", () => {
            (window as any).innerWidth = 768;

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(true);
        });

        it("should handle exactly 767px width", () => {
            (window as any).innerWidth = 767;

            const { result } = renderHook(() => useIsDesktop());

            expect(result.current).toBe(false);
        });
    });

    describe("cleanup", () => {
        it("should clean up event listener when component unmounts", () => {
            (window as any).innerWidth = 1024;

            const { unmount } = renderHook(() => useIsDesktop());

            expect(window.addEventListener).toHaveBeenCalledTimes(1);
            expect(window.removeEventListener).not.toHaveBeenCalled();

            unmount();

            expect(window.removeEventListener).toHaveBeenCalledTimes(1);
            expect(window.removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
        });

        it("should use the same handler for add and remove", () => {
            (window as any).innerWidth = 1024;

            const { unmount } = renderHook(() => useIsDesktop());

            const addHandler = mockWindow.addEventListener.mock.calls[0][1];

            unmount();

            const removeHandler = mockWindow.removeEventListener.mock.calls[0][1];

            expect(addHandler).toBe(removeHandler);
        });
    });

    describe("multiple instances", () => {
        it("should work correctly with multiple hook instances", () => {
            (window as any).innerWidth = 1024;

            const { result: result1 } = renderHook(() => useIsDesktop());
            const { result: result2 } = renderHook(() => useIsDesktop());

            expect(result1.current).toBe(true);
            expect(result2.current).toBe(true);

            // Both should have their own event listeners
            expect(window.addEventListener).toHaveBeenCalledTimes(2);
        });
    });
});
