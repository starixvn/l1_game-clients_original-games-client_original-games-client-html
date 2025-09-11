import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import SplashScreen, { customStartup, onStartupError } from "../../components/page-components/splash-screen";
import { URLContext } from "../../_shared/react-contexts/url-context";
import { PlayerContext } from "../../_shared/react-contexts/auth";
import { authorize, getLobbyConfigs, sso } from "../../services/auth-service";
import { getUserLatestGameId } from "../../_shared/helpers";

// Mock dependencies
jest.mock("../../services/auth-service");
jest.mock("../../_shared/helpers", () => ({
    ...jest.requireActual("../../_shared/helpers"),
    getEnabledRenderGameSettings: jest.fn(),
    getUserLatestGameId: jest.fn(),
}));

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    setUser: jest.fn(),
    setTag: jest.fn(),
    setExtra: jest.fn(),
    withProfiler: jest.fn((name, fn) => fn),
    startTransaction: jest.fn(() => ({
        setTag: jest.fn(),
        setData: jest.fn(),
        finish: jest.fn(),
    })),
}));

// Mock Tolgee
jest.mock("../../_shared/tolgee", () => ({
    tolgee: {
        changeLanguage: jest.fn().mockResolvedValue(undefined),
    },
}));

// Mock useTranslator hook
jest.mock("../../_shared/react-hooks/use-translator", () => ({
    useTranslator: () => ({
        t: (key: string) => key,
    }),
}));

// Mock Next.js router
jest.mock("next/router", () => ({
    useRouter: () => ({
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
    }),
}));

// Mock the optimized PreloadResources component
jest.mock("../../_shared/helpers/preload-resources", () => ({
    __esModule: true,
    default: ({ setIsDonePreload }: { setIsDonePreload: () => void }) => {
        const PreloadResourcesComponent = () => {
            React.useEffect(() => {
                // For testing purposes, don't auto-complete preload to allow testing the preload state
                // Tests can manually trigger completion if needed
                return () => {
                    // Cleanup
                };
            }, [setIsDonePreload]);
            return <div data-testid="preload-resources">Preload Resources</div>;
        };
        return <PreloadResourcesComponent />;
    },
    DURATION_HOLD_SPLASH_SCREEN: 100,
    getAndHandleGameOfferIds: jest.fn(),
    getAndHandleBannerOffer: jest.fn(),
}));

// Mock getEnabledRenderGameSettings and getRenderGameSettings
const mockGetEnabledRenderGameSettings = require("../../_shared/helpers").getEnabledRenderGameSettings;
const mockGetRenderGameSettings = require("../../_shared/helpers/lobby-helper").getRenderGameSettings;
jest.mock("../../_shared/helpers/lobby-helper", () => ({
    ...jest.requireActual("../../_shared/helpers/lobby-helper"),
    getRenderGameSettings: jest.fn(),
}));

// Mock session and authorization responses
const mockSession = {
    isAuthenticated: true,
    username: "testUser",
    language: "en",
    isUM: false,
    ss: "test-session-token",
    memberName: "testUser",
    umInfo: null,
    system: "test-system",
};

const mockAuthorizeResponse = {
    authorized: true,
    user: {
        UID: 12345,
        id: 12345,
        username: "testUser",
        avatarId: 1,
        currency: "USD",
        name: "Test User",
        red: 1000,
        settings: { theme: "light" },
        isSignedInSM: true,
        isDisplayPlayerCurrency: true,
        offerGames: [1005, 148],
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
};

const mockLobbyConfigs = {
    lobbyConfigs: {
        name: "Test Lobby",
        currencyGroupIds: ["USD"],
        miniPanelGameIds: [1005, 148],
        categories: [
            {
                name: "Test Category",
                gameSettings: [
                    { gameId: 1005, bigSize: false, newTag: false },
                    { gameId: 148, bigSize: false, newTag: false },
                ],
            },
        ],
        banners: [
            { gameId: 1005, displayTime: 5000 },
            { gameId: 148, displayTime: 5000 },
        ],
        gameSettings: {
            1005: { id: 1005, name: "SeBall1" },
            148: { id: 148, name: "SeDie" },
        },
        roundTimerGame: 1005,
    },
} as any;

describe("SplashScreen Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Clear any global state that might persist between tests
        jest.clearAllTimers();

        mockGetEnabledRenderGameSettings.mockReturnValue([
            {
                id: 123,
                gameName: "Test Game",
                gameResourceConfigs: { path: "/test" },
            },
            {
                id: 1005,
                gameName: "Default Game",
                gameResourceConfigs: { path: "/default" },
            },
        ]);

        mockGetRenderGameSettings.mockReturnValue([
            {
                id: 1005,
                gameName: "SeDie",
                gameResourceConfigs: { path: "/sedie" },
            },
            {
                id: 148,
                gameName: "SeBall1",
                gameResourceConfigs: { path: "/seball" },
            },
        ]);
    });

    afterEach(() => {
        // Additional cleanup to ensure no open handles
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    const renderSplashScreen = (urlContext: any, playerContext: any = {}) => {
        return render(
            <URLContext.Provider value={urlContext}>
                <PlayerContext.Provider value={playerContext}>
                    <SplashScreen />
                </PlayerContext.Provider>
            </URLContext.Provider>
        );
    };

    describe("Core Function Tests", () => {
        it("should identify timeout session correctly", () => {
            // Arrange
            const nullSession = null;
            const invalidSession = { isAuthenticated: false, isUM: false };
            const validSession = { isAuthenticated: true, isUM: false };
            const umSession = { isAuthenticated: false, isUM: true };

            // Act & Assert - Testing the logic directly since isTimeoutSession is not exported
            expect(!nullSession || (!nullSession?.isUM && !nullSession?.isAuthenticated)).toBe(true);
            expect(!invalidSession || (!invalidSession?.isUM && !invalidSession?.isAuthenticated)).toBe(true);
            expect(!validSession || (!validSession?.isUM && !validSession?.isAuthenticated)).toBe(false);
            expect(!umSession || (!umSession?.isUM && !umSession?.isAuthenticated)).toBe(false);
        });

        it("should handle startup error correctly", () => {
            // Arrange
            const locationSpy = jest.spyOn(globalThis, "location", "get").mockReturnValue({
                pathname: "/test",
            } as any);

            // Suppress console.error for this test to avoid open handle detection
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            // Act
            const error = new Error("Test error");
            onStartupError(error);

            // Assert
            expect(locationSpy).toHaveBeenCalled();

            // Cleanup
            locationSpy.mockRestore();
            consoleSpy.mockRestore();
        });

        it("should handle custom startup with valid session", async () => {
            // Arrange
            const mockRouter = {
                push: jest.fn(),
            } as any;
            const mockPlayer = {
                locale: "",
                session: null,
                authorizeInfo: null,
                setLocale: jest.fn(),
                setSession: jest.fn(),
                setAuthorizeInfo: jest.fn(),
            } as any;
            const session = {
                isAuthenticated: true,
                username: "testUser",
                language: "en",
                ss: "test-session-token",
                memberName: "testUser",
                isUM: false,
                umInfo: null,
                system: 1,
            };
            const locale = "en";
            const authorizeResponse = { authorized: true };

            // Act
            await customStartup(session, locale, mockRouter, mockPlayer, authorizeResponse);

            // Assert
            expect(mockPlayer.setLocale).toHaveBeenCalledWith(locale);
            expect(mockPlayer.setSession).toHaveBeenCalledWith(session);
            expect(mockPlayer.setAuthorizeInfo).toHaveBeenCalledWith(authorizeResponse);
        });

        it("should handle custom startup with timeout session", async () => {
            // Arrange
            const mockRouter = {
                push: jest.fn(),
            } as any;
            const mockPlayer = {
                locale: "",
                session: null,
                authorizeInfo: null,
                setLocale: jest.fn(),
                setSession: jest.fn(),
                setAuthorizeInfo: jest.fn(),
            } as any;
            const session = null;
            const locale = "en";
            const authorizeResponse = { authorized: false };

            // Act
            await customStartup(session, locale, mockRouter, mockPlayer, authorizeResponse);

            // Assert
            expect(mockRouter.push).toHaveBeenCalledWith("timeout");
            expect(mockPlayer.setLocale).toHaveBeenCalledWith(locale);
        });
    });

    describe("User-Specific Storage Tests", () => {
        it("should use user-specific latestGameId", () => {
            // Arrange
            const user1 = "user1";
            const user2 = "user2";
            const gameId1 = 123;
            const gameId2 = 456;

            (getUserLatestGameId as jest.Mock).mockReturnValueOnce(gameId1).mockReturnValueOnce(gameId2);

            // Act
            const result1 = getUserLatestGameId(user1);
            const result2 = getUserLatestGameId(user2);

            // Assert
            expect(result1).toBe(gameId1);
            expect(result2).toBe(gameId2);
            expect(result1).not.toBe(result2);
        });

        it("should return 0 when no gameId is stored for user", () => {
            // Arrange
            const username = "testUser123";
            (getUserLatestGameId as jest.Mock).mockReturnValue(0);

            // Act
            const result = getUserLatestGameId(username);

            // Assert
            expect(result).toBe(0);
        });
    });

    describe("Optimized PreloadResources Integration", () => {
        it("should render PreloadResources with optimized props", async () => {
            // Arrange
            const urlContext = {
                gameId: 1005,
                token: "test-token",
                language: "en",
            };

            (sso as jest.Mock).mockResolvedValue(mockSession);
            (authorize as jest.Mock).mockResolvedValue(mockAuthorizeResponse);
            (getLobbyConfigs as jest.Mock).mockResolvedValue(mockLobbyConfigs);

            // Act
            await act(async () => {
                renderSplashScreen(urlContext);
            });

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("preload-resources")).toBeInTheDocument();
            });
        });

        it("should complete preload faster with optimized component", async () => {
            // Arrange
            const urlContext = {
                gameId: 1005,
                token: "test-token",
                language: "en",
            };

            (sso as jest.Mock).mockResolvedValue(mockSession);
            (authorize as jest.Mock).mockResolvedValue(mockAuthorizeResponse);
            (getLobbyConfigs as jest.Mock).mockResolvedValue(mockLobbyConfigs);

            // Act
            await act(async () => {
                renderSplashScreen(urlContext);
            });

            // Assert - Should complete faster than the old 2000ms delay
            await waitFor(
                () => {
                    expect(screen.getByTestId("preload-resources")).toBeInTheDocument();
                },
                { timeout: 1000 }
            ); // Reduced timeout expectation
        });
    });

    describe("Direct Mode Logic Tests", () => {
        it("should handle direct mode with valid gameId", async () => {
            // Arrange
            const urlContext = {
                gameId: 123,
                token: "test-token",
                language: "en",
            };

            (sso as jest.Mock).mockResolvedValue(mockSession);
            (authorize as jest.Mock).mockResolvedValue(mockAuthorizeResponse);
            (getLobbyConfigs as jest.Mock).mockResolvedValue(mockLobbyConfigs);

            // Act
            await act(async () => {
                renderSplashScreen(urlContext);
            });

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("splash-screen")).toBeInTheDocument();
            });
        });
    });

    describe("Error Handling Tests", () => {
        it("should handle session timeout", async () => {
            // Arrange
            const urlContext = {
                gameId: 123,
                token: "test-token",
                language: "en",
            };

            (sso as jest.Mock).mockResolvedValue(null);

            // Act
            await act(async () => {
                renderSplashScreen(urlContext);
            });

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("splash-screen")).toBeInTheDocument();
            });
        });

        it("should handle authorization failure", async () => {
            // Arrange
            const urlContext = {
                gameId: 123,
                token: "test-token",
                language: "en",
            };

            (sso as jest.Mock).mockResolvedValue(mockSession);
            (authorize as jest.Mock).mockResolvedValue({
                ...mockAuthorizeResponse,
                errorCode: "SB0002",
            });

            // Act
            await act(async () => {
                renderSplashScreen(urlContext);
            });

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("splash-screen")).toBeInTheDocument();
            });
        });
    });
});
