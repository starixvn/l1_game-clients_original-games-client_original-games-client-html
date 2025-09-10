import { renderHook, cleanup } from "@testing-library/react";
import { usePWAWoker } from "../use-pwa-worker";

describe("usePWAWorker", () => {
    // Mock setup
    const mockTerminate = jest.fn();
    const mockPostMessage = jest.fn();
    let mockWorker: any;

    beforeEach(() => {
        // Arrange: Reset mocks and setup Worker
        mockWorker = {
            terminate: mockTerminate,
            postMessage: mockPostMessage,
            onmessage: null,
        };

        // Mock Worker constructor
        (global as any).Worker = jest.fn().mockImplementation(() => mockWorker);
        (global as any).window = {
            Worker: (global as any).Worker,
        };

        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    test("should initialize worker when browser supports Web Workers", () => {
        // Arrange
        const workerUrl = "/worker.js";
        const workerOptions = { type: "module" };

        // Act
        const { result } = renderHook(() => usePWAWoker());

        // Assert
        expect(global.Worker).toHaveBeenCalledWith(workerUrl, workerOptions);
        expect(result.current.current).toBe(mockWorker);
    });

    test("should handle worker messages correctly", () => {
        // Arrange
        const testData = { type: "TEST_MESSAGE", payload: "test" };

        // Act
        renderHook(() => usePWAWoker());
        mockWorker.onmessage({ data: testData });

        // Assert
        expect(mockPostMessage).toHaveBeenCalledWith(testData);
    });

    test("should handle worker initialization errors", () => {
        // Arrange
        const consoleSpy = jest.spyOn(console, "log");
        const mockError = new Error("Worker initialization failed");
        (global as any).Worker = jest.fn().mockImplementation(() => {
            throw mockError;
        });

        // Act
        renderHook(() => usePWAWoker());

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith(mockError);
    });

    test("should terminate worker on cleanup", () => {
        // Arrange
        const { unmount } = renderHook(() => usePWAWoker());

        // Act
        unmount();

        // Assert
        expect(mockTerminate).toHaveBeenCalled();
    });
});
