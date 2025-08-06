import { parseContextFromURL, loadURLContext, updateURLContext, getURLContext, URLContextModel } from "../../_shared/react-contexts/url-context";
import { StorageHelper, localStorageKeys, getUserLatestGameId, setUserLatestGameId } from "../../_shared/helpers";
import { AnalyticsHelper } from "../../_shared/helpers";
import { GameUtils } from "../../_shared/helpers/base-64-helper";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../../_shared/helpers/message-transmitter/global-transmitter";

// Mock dependencies
jest.mock("../../_shared/helpers", () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        url: "test.url",
        session: "test.session",
        latestGameId: "test.latest-game-id",
        userLatestGameId: "latest-game-id",
    },
    getUserLatestGameId: jest.fn(),
    setUserLatestGameId: jest.fn(),
}));

jest.mock("../../_shared/helpers/base-64-helper", () => ({
    GameUtils: {
        base64Decode: jest.fn(),
    },
}));

jest.mock("../../_shared/helpers/message-transmitter/global-transmitter", () => ({
    GlobalMessageTransmitter: {
        broadcast: jest.fn(),
    },
    GlobalTransmitterEvent: {
        BACK_TO_LOBBY: "BACK_TO_LOBBY",
    },
}));

const mockStorageHelper = StorageHelper as jest.Mocked<typeof StorageHelper>;
const mockGetUserLatestGameId = getUserLatestGameId as jest.MockedFunction<typeof getUserLatestGameId>;
const mockSetUserLatestGameId = setUserLatestGameId as jest.MockedFunction<typeof setUserLatestGameId>;
const mockGameUtils = GameUtils as jest.Mocked<typeof GameUtils>;
const mockGlobalMessageTransmitter = GlobalMessageTransmitter as jest.Mocked<typeof GlobalMessageTransmitter>;

describe("Simplified URL Parameter Combinations Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock globalThis.location
        Object.defineProperty(globalThis, "location", {
            value: {
                search: "",
                href: "http://localhost:3000",
            },
            writable: true,
        });

        // Mock globalThis.history
        Object.defineProperty(globalThis, "history", {
            value: {
                pushState: jest.fn(),
            },
            writable: true,
        });

        // Mock AnalyticsHelper
        (AnalyticsHelper as any) = {
            login: jest.fn(),
        };
    });

    describe("Direct Mode Logic", () => {
        it("should set isDirectMode to true when both ref and redirectUrl are present", () => {
            // Arrange
            globalThis.location.search = "?ref=d_direct&rurl=https://example.com&gameId=123";
            const expected: URLContextModel = {
                token: null,
                language: null,
                gameId: 123,
                isDirectMode: true,
                redirectUrl: "https://example.com",
            };

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expected);
        });

        it("should set isDirectMode to false when only ref is present", () => {
            // Arrange
            globalThis.location.search = "?ref=d_direct&gameId=123";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(false);
        });

        it("should set isDirectMode to false when only redirectUrl is present", () => {
            // Arrange
            globalThis.location.search = "?rurl=https://example.com&gameId=123";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(false);
        });

        it("should set isDirectMode to false when neither ref nor redirectUrl are present", () => {
            // Arrange
            globalThis.location.search = "?gameId=123";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(false);
        });
    });

    describe("Basic Parameter Parsing", () => {
        it("should parse all basic parameters correctly", () => {
            // Arrange
            globalThis.location.search = "?token=abc123&lang=en&gameId=1001&ref=d_direct&rurl=https://example.com";
            const expected: URLContextModel = {
                token: "abc123",
                language: "en",
                gameId: 1001,
                isDirectMode: true,
                redirectUrl: "https://example.com",
            };

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expected);
        });

        it("should handle missing optional parameters", () => {
            // Arrange
            globalThis.location.search = "?token=abc123&lang=en";
            const expected: URLContextModel = {
                token: "abc123",
                language: "en",
                gameId: 0,
                isDirectMode: false,
                redirectUrl: null,
            };

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expected);
        });

        it("should handle HTML-encoded ampersands", () => {
            // Arrange
            globalThis.location.search = "?token=abc123&amp;lang=en&amp;gameId=1001&amp;ref=d_direct&amp;rurl=https://example.com";
            const expected: URLContextModel = {
                token: "abc123",
                language: "en",
                gameId: 1001,
                isDirectMode: true,
                redirectUrl: "https://example.com",
            };

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expected);
        });
    });

    describe("loadURLContext", () => {
        it("should return context from URL when available", () => {
            // Arrange
            globalThis.location.search = "?token=abc123&lang=en&gameId=1001&ref=d_direct&rurl=https://example.com";
            const expectedContext = {
                language: "en",
                gameId: 1001,
                isDirectMode: true,
                redirectUrl: "https://example.com",
            };

            // Act
            const result = loadURLContext();

            // Assert
            expect(result).toEqual(expect.objectContaining({
                token: "abc123",
                ...expectedContext,
            }));
            expect(mockStorageHelper.set).toHaveBeenCalledWith(
                localStorageKeys.url,
                expectedContext
            );
        });

        it("should return context from localStorage when URL context is not available", () => {
            // Arrange
            globalThis.location.search = "";
            const localStorageContext = {
                language: "en",
                gameId: 1001,
                isDirectMode: false,
                redirectUrl: null,
            };
            mockStorageHelper.get.mockReturnValue(localStorageContext);

            // Act
            const result = loadURLContext();

            // Assert
            expect(result).toEqual(localStorageContext);
        });
    });

    describe("updateURLContext", () => {
        it("should update context in localStorage", () => {
            // Arrange
            const existingContext = { language: "en", gameId: 1001 };
            const newContext = { gameId: 1002, isDirectMode: true };
            mockStorageHelper.get.mockReturnValue(existingContext);

            // Act
            updateURLContext(newContext);

            // Assert
            expect(mockStorageHelper.set).toHaveBeenCalledWith(
                localStorageKeys.url,
                {
                    ...existingContext,
                    ...newContext,
                }
            );
        });

        it("should call setUserLatestGameId when gameId is provided", () => {
            // Arrange
            const newContext = { gameId: 1002 };
            mockStorageHelper.get.mockReturnValue({});

            // Act
            updateURLContext(newContext);

            // Assert
            expect(mockSetUserLatestGameId).toHaveBeenCalledWith(1002, undefined);
        });
    });

    describe("getURLContext", () => {
        it("should return context from localStorage", () => {
            // Arrange
            const expectedContext = { language: "en", gameId: 1001 };
            mockStorageHelper.get.mockReturnValue(expectedContext);

            // Act
            const result = getURLContext();

            // Assert
            expect(result).toEqual(expectedContext);
        });

        it("should return empty object when no context in localStorage", () => {
            // Arrange
            mockStorageHelper.get.mockReturnValue(null);

            // Act
            const result = getURLContext();

            // Assert
            expect(result).toEqual({});
        });
    });
}); 