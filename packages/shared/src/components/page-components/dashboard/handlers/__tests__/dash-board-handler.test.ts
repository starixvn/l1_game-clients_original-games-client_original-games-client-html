import { DashboardHandler } from "../dash-board-handler";
import { getAppSettings } from "../../../../../_shared/app-settings";
import { getOfferGamesIds, StorageHelper } from "../../../../../_shared/helpers";
import { loadURLContext } from "../../../../../_shared/react-contexts";
import { TolgeeInstance } from "@tolgee/core";
import { SSOResponse, AuthorizeResponse } from "sc-user-service-client/dist/auth";

// Mock dependencies
jest.mock("../../../../../_shared/app-settings", () => ({
    getAppSettings: jest.fn().mockReturnValue({
        appType: "test",
        system: "gn",
        gameSettings: {
            1005: { id: 1005, name: "SeBall1" },
            148: { id: 148, name: "SeDie" },
        },
    }),
}));
jest.mock("../../../../../_shared/helpers", () => ({
    getOfferGamesIds: jest.fn().mockReturnValue([1005, 148]),
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        url: "url",
        latestGameId: "latestGameId",
    },
}));
jest.mock("../../../../../_shared/react-contexts", () => ({
    loadURLContext: jest.fn().mockReturnValue({
        gameId: 0,
    }),
}));

const mockGetAppSettings = getAppSettings as jest.MockedFunction<typeof getAppSettings>;
const mockGetOfferGamesIds = getOfferGamesIds as jest.MockedFunction<typeof getOfferGamesIds>;

// Set up the mock implementation
mockGetAppSettings.mockReturnValue({
    appType: 10,
    serverDomainMapper: [],
    socketGatewayPath: "",
    proxy: { ssl: "", subDomain: "", path: "" },
    sentry: {
        dsn: "test-dsn",
        environment: "test",
    },
    gameSettings: {
        1005: { id: 1005, gameName: "SeBall1", gameResourceConfigs: { path: "test" } },
        148: { id: 148, gameName: "SeDie", gameResourceConfigs: { path: "test" } },
    },
    subGuideDomain: "",
    googleAnalyticId: "",
    enableMsgpackParser: false,
    system: "",
    useTolgeeStatic: false,
    enableDebugLogs: false,
    gamePath: "",
});
const mockStorageHelper = StorageHelper as jest.Mocked<typeof StorageHelper>;
const mockLoadURLContext = loadURLContext as jest.MockedFunction<typeof loadURLContext>;

describe("DashboardHandler", () => {
    // Arrange: Common test setup
    const defaultProps = {
        router: {
            push: jest.fn(),
            query: {},
            route: "/",
            pathname: "/",
            asPath: "/",
            basePath: "",
            isLocaleDomain: false,
            isReady: true,
            isPreview: false,
            isFallback: false,
            defaultLocale: "en",
            domainLocales: [],
            locale: "en",
            locales: ["en"],
            events: {
                on: jest.fn(),
                off: jest.fn(),
                emit: jest.fn(),
            },
            beforePopState: jest.fn(),
            prefetch: jest.fn(),
            reload: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            replace: jest.fn(),
        },
        session: {
            isAuthenticated: true,
            username: "testuser",
            language: "en",
            ss: "test-session-token",
            memberName: "testuser",
            isUM: false,
            umInfo: null,
            system: 1,
        } as SSOResponse,
        queryGame: 1005,
        setIsUm: jest.fn(),
        tolgee: {} as TolgeeInstance,
        authorizeResponse: {
            authorized: true,
            user: {
                UID: 1,
                id: 1,
                username: "testuser",
                avatarId: 1,
                currency: "USD",
                name: "Test User",
                red: 1000,
                settings: { theme: "light" },
                isSignedInSM: true,
                isDisplayPlayerCurrency: true,
                offerGames: [
                    { gameId: 1005, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                    { gameId: 148, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                ],
                balance: 1000,
                fractionalOddsFormat: false,
                enableQuickBet: true,
                enabledGameIds: [1005, 148],
                availSpins: 0,
                scoins: 0,
            },
            errorCode: null,
            umInfo: null,
            isUM: false,
        } as AuthorizeResponse,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetAppSettings.mockReturnValue({
            appType: 10,
            serverDomainMapper: [],
            socketGatewayPath: "",
            proxy: { ssl: "", subDomain: "", path: "" },
            sentry: {
                dsn: "test-dsn",
                environment: "test",
            },
            gameSettings: {
                1001: { id: 1001, gameName: "Game 1", gameResourceConfigs: { path: "test" } },
                1002: { id: 1002, gameName: "Game 2", gameResourceConfigs: { path: "test" } },
                1003: { id: 1003, gameName: "Game 3", gameResourceConfigs: { path: "test" } },
            },
            subGuideDomain: "",
            googleAnalyticId: "",
            enableMsgpackParser: false,
            system: "",
            useTolgeeStatic: false,
            enableDebugLogs: false,
            gamePath: "",
        });
        mockGetOfferGamesIds.mockReturnValue([1005, 148]);
        mockLoadURLContext.mockReturnValue({
            gameId: 1005,
            token: "test-token",
            language: "en",
        });
    });

    describe("Constructor", () => {
        it("should initialize with valid props", () => {
            // Act
            const handler = new DashboardHandler(defaultProps);

            // Assert
            expect(handler).toBeInstanceOf(DashboardHandler);
        });
    });

    describe("checkIsNotOfferGame", () => {
        it("should return true when queryGame is 0 (lobby access) and game is not in offer games", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true); // Game 0 is not in offer games [1001, 1002]
        });

        it("should return true when queryGame is not in offer games in direct mode", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 9999, // Game not in offer
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
        });

        it("should return false when queryGame is in offer games in direct mode", () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([1001, 1002]);
            const props = {
                ...defaultProps,
                queryGame: 1001, // Game in offer
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when queryGame is 0 even with null authorizeResponse", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
                authorizeResponse: null,
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Returns false when authorizeResponse is null
        });

        it("should return false when queryGame is 0 even with undefined authorizeResponse", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
                authorizeResponse: undefined,
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Returns false when authorizeResponse is undefined
        });

        it("should return true when queryGame is 0 and no offer games", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
                authorizeResponse: {
                    ...defaultProps.authorizeResponse,
                    user: {
                        ...defaultProps.authorizeResponse.user,
                        offerGames: [],
                    },
                },
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true); // Game 0 is not in empty offer games list
        });

        it("should return true when queryGame is 0 and lobbyConfigs is null", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
                lobbyConfigs: null,
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true); // Game 0 is not in offer games [1001, 1002]
        });

        it("should return true when queryGame is 0 and lobbyConfigs is undefined", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
                lobbyConfigs: undefined,
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true); // Game 0 is not in offer games [1001, 1002]
        });

        it("should return true when queryGame is 0 and no lobby games available", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true); // Game 0 is not in offer games [1001, 1002]
        });

        it("should return true when queryGame is not 0 and user has no offer games", () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([]); // Mock to return empty array
            const props = {
                ...defaultProps,
                queryGame: 1001, // Not lobby
                authorizeResponse: {
                    ...defaultProps.authorizeResponse,
                    user: {
                        ...defaultProps.authorizeResponse.user,
                        offerGames: [],
                    },
                },
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true); // Game 1001 is not in empty offer games list
        });

        it("should return false when queryGame is not 0 and lobbyConfigs is null (timing issue)", () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([1001, 1002]);
            const props = {
                ...defaultProps,
                queryGame: 1001, // Not lobby
                lobbyConfigs: null,
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Game 1001 is in offer games [1001, 1002]
        });

        it("should return false when queryGame is not 0 and no lobby games are available", () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([1001, 1002]);
            const props = {
                ...defaultProps,
                queryGame: 1001, // Not lobby
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Game 1001 is in offer games [1001, 1002]
        });

        it("should return false when queryGame is not 0 and user has offer games and lobby games are available", () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([1001, 1002]);
            const props = {
                ...defaultProps,
                queryGame: 1001, // Not lobby
                authorizeResponse: {
                    ...defaultProps.authorizeResponse,
                    user: {
                        ...defaultProps.authorizeResponse.user,
                        offerGames: [
                            { gameId: 1001, minBet: 1, maxBet: 100, maxBetPerChoices: {} },
                            { gameId: 1002, minBet: 1, maxBet: 100, maxBetPerChoices: {} },
                        ],
                    },
                },
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
        });

        it("should handle timing issue where queryGame is not 0 and authorizeResponse is incomplete on first load", () => {
            // Arrange - Simulate first load scenario where data is not yet available
            mockGetOfferGamesIds.mockReturnValue([1001, 1002]);
            const props = {
                ...defaultProps,
                queryGame: 1001, // Not lobby
                authorizeResponse: {
                    ...defaultProps.authorizeResponse,
                    user: {
                        ...defaultProps.authorizeResponse.user,
                        offerGames: undefined, // Missing offerGames property - simulates incomplete data
                    },
                },
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Returns false when data is not available (timing issue)
        });

        it("should handle timing issue where queryGame is not 0 and lobbyConfigs is incomplete on first load", () => {
            // Arrange - Simulate first load scenario where lobbyConfigs is not yet loaded
            mockGetOfferGamesIds.mockReturnValue([1001, 1002]);
            const props = {
                ...defaultProps,
                queryGame: 1001, // Not lobby
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Returns false when data is not available (timing issue)
        });
    });

    describe("shouldRenderGames", () => {
        it("should return true when openGameId is 0", () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps);

            // Act
            const result = handler.shouldRenderGames([1001, 1002], 0);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true when openGameId is null", () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps);

            // Act
            const result = handler.shouldRenderGames([1001, 1002], null);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true when game is in offer games and not back to lobby", () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps);

            // Act
            const result = handler.shouldRenderGames([1001, 1002], 1001);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true when game is in offer games but back to lobby is true", () => {
            // Arrange
            mockStorageHelper.get.mockReturnValue({
                backToLobby: true,
                gameId: 0,
            });
            const handler = new DashboardHandler(defaultProps);

            // Act
            const result = handler.shouldRenderGames([1001, 1002], 1001);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true when ssoRedirectGameId is greater than 0", () => {
            // Arrange
            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 1001,
            });
            const handler = new DashboardHandler(defaultProps);

            // Act
            const result = handler.shouldRenderGames([1001, 1002], 0);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("getOfferGamesIds", () => {
        it("should return offer games IDs from authorize response", () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([1001, 1002]);
            const handler = new DashboardHandler(defaultProps);

            // Act
            const result = handler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([1001, 1002]);
            expect(mockGetOfferGamesIds).toHaveBeenCalledWith(defaultProps.authorizeResponse);
        });
    });

    describe("reset", () => {
        it("should not throw any error", () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps);

            // Act & Assert
            expect(() => handler.reset()).not.toThrow();
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined authorizeResponse", () => {
            // Arrange
            const props = { ...defaultProps, authorizeResponse: undefined };
            mockGetOfferGamesIds.mockReturnValue([]);
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([]);
        });

        it("should handle undefined lobbyConfigs", () => {
            // Arrange
            const props = { ...defaultProps, lobbyConfigs: undefined };
            mockGetOfferGamesIds.mockReturnValue([1001, 1002]);
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([1001, 1002]); // This method doesn't depend on lobbyConfigs
        });

        it("should handle empty offer games array", () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([]);
            const handler = new DashboardHandler(defaultProps);

            // Act
            const result = handler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([]);
        });
    });
});
