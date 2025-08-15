import { useMemoriedImage } from "../use-memoried-image";
import { downloadAndCacheImage, imageCache } from "../../helpers/image-cache-controller";
import { act, waitFor, renderHook } from "@testing-library/react";

// Mock the image cache controller
jest.mock("../../helpers/image-cache-controller");
const mockedDownloadAndCacheImage = downloadAndCacheImage as jest.MockedFunction<typeof downloadAndCacheImage>;

describe("useMemoriedImage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear the imageCache
        Object.keys(imageCache).forEach((key) => delete imageCache[key]);
    });

    test("should handle successful image loading", async () => {
        // Arrange
        const imagePath = "https://example.com/test-image.jpg";
        const expectedBase64 = "base64EncodedImageData";
        mockedDownloadAndCacheImage.mockResolvedValueOnce({
            imageBase64: expectedBase64,
            valid: true,
            path: imagePath,
        });

        // Act
        const { result } = renderHook(() => useMemoriedImage(imagePath));

        // Assert initial state
        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBeNull();

        // Wait for the async operation to complete with timeout
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, { timeout: 3000 });

        // Assert final state
        expect(result.current.data).toBe(expectedBase64);
        expect(result.current.error).toBeNull();
        expect(mockedDownloadAndCacheImage).toHaveBeenCalledWith(imagePath);
    });

    test("should handle invalid image response", async () => {
        // Arrange
        const imagePath = "https://example.com/invalid-image.jpg";
        mockedDownloadAndCacheImage.mockResolvedValueOnce({
            imageBase64: "",
            valid: false,
            path: imagePath,
        });

        // Act
        const { result } = renderHook(() => useMemoriedImage(imagePath));

        // Assert initial state
        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBeNull();

        // Wait for the async operation to complete with timeout
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, { timeout: 3000 });

        // Assert final state
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error.message).toBe("Network response was not ok");
    });

    test("should handle network error", async () => {
        // Arrange
        const imagePath = "https://example.com/error-image.jpg";
        const expectedError = new Error("Network error");
        mockedDownloadAndCacheImage.mockRejectedValueOnce(expectedError);

        // Act
        const { result } = renderHook(() => useMemoriedImage(imagePath));

        // Assert initial state
        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBeNull();

        // Wait for the async operation to complete with timeout
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, { timeout: 3000 });

        // Assert final state
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBe(expectedError);
        expect(mockedDownloadAndCacheImage).toHaveBeenCalledTimes(1);
    });

    test("should use cached image when available", () => {
        // Arrange
        const imagePath = "https://example.com/cached-image.jpg";
        const cachedBase64 = "cachedBase64EncodedData";
        imageCache[imagePath] = {
            data: cachedBase64,
            timestamp: Date.now(),
            size: cachedBase64.length
        };

        // Act
        const { result } = renderHook(() => useMemoriedImage(imagePath));

        // Assert
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe(cachedBase64);
        expect(result.current.error).toBeNull();
        expect(mockedDownloadAndCacheImage).not.toHaveBeenCalled();
    });

    test("should handle invalid path", () => {
        // Arrange & Act
        const { result } = renderHook(() => useMemoriedImage(null as any));

        // Assert
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("Invalid image path");
        expect(mockedDownloadAndCacheImage).not.toHaveBeenCalled();
    });

    test("should handle empty path", () => {
        // Arrange & Act
        const { result } = renderHook(() => useMemoriedImage(""));

        // Assert
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("Invalid image path");
        expect(mockedDownloadAndCacheImage).not.toHaveBeenCalled();
    });

    test("should update when path changes", async () => {
        // Arrange
        const initialPath = "https://example.com/initial-image.jpg";
        const newPath = "https://example.com/new-image.jpg";
        const initialBase64 = "initialBase64EncodedData";
        const newBase64 = "newBase64EncodedData";

        mockedDownloadAndCacheImage
            .mockResolvedValueOnce({
                imageBase64: initialBase64,
                valid: true,
                path: initialPath,
            })
            .mockResolvedValueOnce({
                imageBase64: newBase64,
                valid: true,
                path: newPath,
            });

        // Act
        const { result, rerender } = renderHook((path) => useMemoriedImage(path), { initialProps: initialPath });

        // Wait for first load
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, { timeout: 3000 });
        expect(result.current.data).toBe(initialBase64);

        // Change the path
        act(() => {
            delete imageCache[newPath];
            rerender(newPath);
        });

        // Assert loading state after path change
        expect(result.current.isLoading).toBe(true);

        // Wait for second load with timeout
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        }, { timeout: 3000 });

        // Assert final state
        expect(result.current.data).toBe(newBase64);
        expect(result.current.error).toBeNull();
        expect(mockedDownloadAndCacheImage).toHaveBeenCalledTimes(2);
        expect(mockedDownloadAndCacheImage).toHaveBeenNthCalledWith(1, initialPath);
        expect(mockedDownloadAndCacheImage).toHaveBeenNthCalledWith(2, newPath);
    });
});
