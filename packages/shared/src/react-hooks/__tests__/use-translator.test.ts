import { renderHook } from "@testing-library/react";
import { useTranslator, parseTranslationKey, useCommonTranslate, useSNTranslate } from "../use-translator";
import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "../../resources";

// Mock @tolgee/react
jest.mock("@tolgee/react", () => ({
    useTranslate: jest.fn(),
}));

describe("use-translator", () => {
    describe("parseTranslationKey", () => {
        test("should parse key with namespace correctly", () => {
            // Arrange
            const input = "namespace.testKey";

            // Act
            const result = parseTranslationKey(input);

            // Assert
            expect(result).toEqual({
                ns: "namespace",
                key: "testKey",
            });
        });

        test("should handle key without namespace", () => {
            // Arrange
            const input = "simpleKey";

            // Act
            const result = parseTranslationKey(input);

            // Assert
            expect(result).toEqual({
                key: "simpleKey",
            });
        });
    });

    describe("useTranslator", () => {
        const mockTranslate = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
            (useTranslate as jest.Mock).mockReturnValue({
                t: mockTranslate,
            });
        });

        test("should use default namespaces when no gameNamespaces provided", () => {
            // Arrange
            const expectedNamespaces = [ResourceTypes.SABA_NUMBER, ResourceTypes.COMMON];

            // Act
            const { result } = renderHook(() => useTranslator(), {
                wrapper: ({ children }) => children,
            });

            // Assert
            expect(useTranslate).toHaveBeenCalledWith(expectedNamespaces);
        });

        test("should combine game namespaces with default namespaces", () => {
            // Arrange
            const gameNamespace = "game-namespace";
            const expectedNamespaces = [gameNamespace, ResourceTypes.SABA_NUMBER, ResourceTypes.COMMON];

            // Act
            const { result } = renderHook(() => useTranslator([gameNamespace]), {
                wrapper: ({ children }) => children,
            });

            // Assert
            expect(useTranslate).toHaveBeenCalledWith(expectedNamespaces);
        });

        test("should translate key with namespace correctly", () => {
            // Arrange
            const key = "namespace.translationKey";
            const params = { value: "test-value" };
            const options = { count: 1 };
            mockTranslate.mockReturnValue("translated text");
            const { result } = renderHook(() => useTranslator(), {
                wrapper: ({ children }) => children,
            });

            // Act
            result.current.t(key, params, options);

            // Assert
            const { key: parsedKey, ns } = parseTranslationKey(key);
            expect(mockTranslate).toHaveBeenCalledWith({
                key: parsedKey,
                ns,
                params,
                ...options,
            });
        });
    });

    describe("useCommonTranslate", () => {
        test("should initialize with COMMON namespace", () => {
            // Arrange & Act
            const { result } = renderHook(() => useCommonTranslate(), {
                wrapper: ({ children }) => children,
            });

            // Assert
            expect(useTranslate).toHaveBeenCalledWith(ResourceTypes.COMMON);
        });
    });

    describe("useSNTranslate", () => {
        test("should initialize with SABA_NUMBER namespace", () => {
            // Arrange & Act
            const { result } = renderHook(() => useSNTranslate(), {
                wrapper: ({ children }) => children,
            });

            // Assert
            expect(useTranslate).toHaveBeenCalledWith(ResourceTypes.SABA_NUMBER);
        });
    });
});
