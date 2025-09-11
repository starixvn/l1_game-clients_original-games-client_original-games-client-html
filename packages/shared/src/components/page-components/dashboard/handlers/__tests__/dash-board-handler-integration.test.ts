import { DashboardHandler } from "../dash-board-handler";
import { StorageHelper } from '@shared/helpers';
import { SSOResponse, AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { TolgeeInstance } from "@tolgee/core";
import { NextRouter } from "next/router";

// Mock dependencies
jest.mock("@shared/helpers", () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        url: "url",
        latestGameId: "latestGameId",
    },
    getOfferGamesIds: jest.fn((authorizeInfo) => {
        return authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId) || [];
    }),
    getLobbyGameIds: jest.fn((lobbyConfigs) => {
        return lobbyConfigs?.categories?.[0]?.gameSettings?.map((setting: any) => setting.gameId);
    }),
}));

const mockStorageHelper = StorageHelper as jest.Mocked<typeof StorageHelper>;

// Mock router
const mockRouter: NextRouter = {
    route: "/",
    pathname: "/",
    query: {},
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
    push: jest.fn(),
} as NextRouter;

describe("DashboardHandler Integration - Direct Mode Scenario", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("shouldRenderGames with null openGameId", () => {
        it("should handle the specific scenario from the logs correctly", () => {
            // Arrange: Simulate the exact scenario from the logs
            const props = {
                router: mockRouter,
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
                queryGame: 0, // This is the key issue - queryGame is 0
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

            // Mock the URL context to match the logs
            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 0,
            });

            const handler = new DashboardHandler(props);

            // Act: Call shouldRenderGames with null openGameId (as seen in logs)
            const result = handler.shouldRenderGames([1005, 148], null);

            // Assert: Should return true because the implementation always returns true
            expect(result).toBe(true);
        });

        it("should handle undefined openGameId correctly", () => {
            // Arrange
            const props = {
                router: mockRouter,
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
                queryGame: 0,
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
                            { gameId: 1001, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
                        availSpins: 0,
                        scoins: 0,
                    },
                    errorCode: null,
                    umInfo: null,
                    isUM: false,
                } as AuthorizeResponse,
            };

            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 0,
            });

            const handler = new DashboardHandler(props);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], undefined);

            // Assert
            expect(result).toBe(true);
        });

        it("should handle zero openGameId correctly", () => {
            // Arrange
            const props = {
                router: mockRouter,
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
                queryGame: 0,
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
                            { gameId: 1001, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
                        availSpins: 0,
                        scoins: 0,
                    },
                    errorCode: null,
                    umInfo: null,
                    isUM: false,
                } as AuthorizeResponse,
            };

            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 0,
            });

            const handler = new DashboardHandler(props);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], 0);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("checkIsNotOfferGame in direct mode", () => {
        it("should return true when queryGame is 0 (lobby)", () => {
            // Arrange
            const props = {
                router: mockRouter,
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
                queryGame: 0,
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
                            { gameId: 1001, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
                        availSpins: 0,
                        scoins: 0,
                    },
                    errorCode: null,
                    umInfo: null,
                    isUM: false,
                } as AuthorizeResponse,
            };

            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true); // Game 0 is not in offer games [1001, 1002, 1003]
        });

        it("should return false when queryGame is in offer games", () => {
            // Arrange
            const props = {
                router: mockRouter,
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
                queryGame: 1001,
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
                            { gameId: 1001, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
                        availSpins: 0,
                        scoins: 0,
                    },
                    errorCode: null,
                    umInfo: null,
                    isUM: false,
                } as AuthorizeResponse,
            };

            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            // When queryGame (1001) is in offer games, checkIsNotOfferGame should return false
            expect(result).toBe(false);
        });

        it("should return true when queryGame is not in offer games", () => {
            // Arrange
            const props = {
                router: mockRouter,
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
                queryGame: 9999,
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
                            { gameId: 1001, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
                        availSpins: 0,
                        scoins: 0,
                    },
                    errorCode: null,
                    umInfo: null,
                    isUM: false,
                } as AuthorizeResponse,
            };

            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
        });
    });
});

describe("DashboardHandler Integration Tests - Timing Issues", () => {
    describe("checkIsNotOfferGame timing issues", () => {
        it("should handle first load scenario where authorizeResponse is not available but queryGame is 0", () => {
            // Arrange - Simulate first load where data is not yet loaded but accessing lobby
            const props = {
                router: mockRouter,
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
                queryGame: 0, // Lobby access
                setIsUm: jest.fn(),
                tolgee: {} as TolgeeInstance,
                authorizeResponse: null, // Data not available yet
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Returns false when authorizeResponse is null
        });

        it("should handle first load scenario where lobbyConfigs is not available but queryGame is 0", () => {
            // Arrange - Simulate first load where data is not yet loaded but accessing lobby
            const props = {
                router: mockRouter,
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
                queryGame: 0, // Lobby access
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
                            { gameId: 1001, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
                        availSpins: 0,
                        scoins: 0,
                    },
                    errorCode: null,
                    umInfo: null,
                    isUM: false,
                } as AuthorizeResponse,
                lobbyConfigs: null, // Data not available yet
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true); // Game 0 is not in offer games [1001, 1002, 1003]
        });

        it("should handle first load scenario where both data sources are not available but queryGame is 0", () => {
            // Arrange - Simulate first load where both data sources are not yet loaded but accessing lobby
            const props = {
                router: mockRouter,
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
                queryGame: 0, // Lobby access
                setIsUm: jest.fn(),
                tolgee: {} as TolgeeInstance,
                authorizeResponse: null, // Data not available yet
                lobbyConfigs: null, // Data not available yet
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Returns false when authorizeResponse is null
        });

        it("should work correctly when data becomes available after initial load", () => {
            // Arrange - Simulate data becoming available
            const props = {
                router: mockRouter,
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
                queryGame: 0, // Lobby access
                setIsUm: jest.fn(),
                tolgee: {} as TolgeeInstance,
                authorizeResponse: {
                    authorized: true,
                    user: {
                        UID: 123,
                        avatarId: 1,
                        currency: "USD",
                        name: "testuser",
                        red: 1000,
                        settings: { theme: "light" },
                        enabledGameIds: [1001, 1002],
                        offerGames: [{ gameId: 1001, minBet: 1, maxBet: 100, maxBetPerChoices: {} }],
                        fractionalOddsFormat: false,
                        isSignedInSM: true,
                        isDisplayPlayerCurrency: true,
                        availSpins: 0,
                        scoins: 0,
                    },
                },
                lobbyConfigs: {
                    name: "test",
                    currencyGroupIds: ["USD"],
                    miniPanelGameIds: [1001],
                    categories: [
                        {
                            id: 1,
                            name: "test",
                            gameSettings: [{ gameId: 1001, bigSize: false, newTag: false }],
                        },
                    ],
                    banners: [],
                },
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true); // Game 0 is not in offer games [1001]
        });

        it("should return false when queryGame is not 0 and data is not available (timing issue)", () => {
            // Arrange - Simulate first load where data is not yet loaded and accessing specific game
            const props = {
                router: mockRouter,
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
                queryGame: 1001, // Specific game access
                setIsUm: jest.fn(),
                tolgee: {} as TolgeeInstance,
                authorizeResponse: null, // Data not available yet
                lobbyConfigs: null, // Data not available yet
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Returns false when data is not available (timing issue)
        });

        it("should handle normal mode with complete data correctly", () => {
            // Arrange - Normal mode with complete data
            const props = {
                router: mockRouter,
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
                queryGame: 1001,

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
                            { gameId: 1001, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
                        availSpins: 0,
                        scoins: 0,
                    },
                    errorCode: null,
                    umInfo: null,
                    isUM: false,
                } as AuthorizeResponse,
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Should not show error when game is available
        });

        it("should handle direct mode with complete data correctly", () => {
            // Arrange - Direct mode with complete data
            const props = {
                router: mockRouter,
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
                queryGame: 1001,
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
                            { gameId: 1001, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
                        availSpins: 0,
                        scoins: 0,
                    },
                    errorCode: null,
                    umInfo: null,
                    isUM: false,
                } as AuthorizeResponse,
            };
            const handler = new DashboardHandler(props);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false); // Should not show error when game is available
        });
    });
});
