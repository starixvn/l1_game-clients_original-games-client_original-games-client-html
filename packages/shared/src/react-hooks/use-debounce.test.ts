import { renderHook, act } from "@testing-library/react";
import useDebounce from "./use-debounce";

jest.useFakeTimers();

describe("useDebounce", () => {
    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it("should return the initial value immediately", () => {
        const { result } = renderHook(() => useDebounce("initial", 500));

        // Initially, the value should match the input immediately
        expect(result.current).toBe("initial");
    });

    it("should update the value after the delay", () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: "initial", delay: 500 },
        });

        // Initially, the value should be the initial value
        expect(result.current).toBe("initial");

        // Change the value
        rerender({ value: "updated", delay: 500 });

        // The value should remain unchanged before the delay
        expect(result.current).toBe("initial");

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Now the value should update
        expect(result.current).toBe("updated");
    });

    it("should not update the value before the delay", () => {
        const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
            initialProps: { value: "initial", delay: 500 },
        });

        rerender({ value: "updated", delay: 500 });

        // Move time slightly forward, but not enough for the delay
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // The value should still not have changed
        expect(result.current).toBe("initial");
    });

    it("should clear the timeout on unmount", () => {
        const { unmount } = renderHook(() => useDebounce("initial", 500));
        // Arrange
        jest.spyOn(global, "clearTimeout");

        // Unmount the hook
        unmount();

        // Check that all timers are cleared
        expect(global.clearTimeout).toHaveBeenCalledTimes(1);
    });
});
