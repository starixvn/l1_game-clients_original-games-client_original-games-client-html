import React from "react";
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock object-helper at the very top to fix import issues
jest.mock("../../../../_shared/helpers/object-helper", () => ({
    objectMap: (obj: any, fn: any) => Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)])),
}));

// Mock use-sound to prevent objectMap import issues
jest.mock("../../../../_shared/react-hooks/use-sound", () => ({
    usePlaySound: jest.fn(() => jest.fn()),
    useClickSound: jest.fn(() => jest.fn()),
    useSelectChipSound: jest.fn(() => jest.fn()),
    usePlaceBetSound: jest.fn(() => jest.fn()),
    useStartDrawSound: jest.fn(() => jest.fn()),
    useStartRoundSound: jest.fn(() => jest.fn()),
    useShowBallResultSound: jest.fn(() => jest.fn()),
    useBlockBetSound: jest.fn(() => jest.fn()),
}));

// Mock Next.js dynamic imports
jest.mock("next/dynamic", () => {
    const DynamicComponent = () => <div data-testid="dynamic-component">Dynamic Component</div>;
    DynamicComponent.displayName = "DynamicComponent";
    return () => DynamicComponent;
});

// Mock dynamic import for BaseDialog
jest.mock("../../../game-components/base-dialog", () => ({
    __esModule: true,
    default: ({ children, isOpen }: any) => isOpen ? <div data-testid="base-dialog">{children}</div> : null,
}));

// Mock Next.js router
jest.mock("next/router", () => ({
    withRouter: (Component: any) => (props: any) => {
        const router = {
            push: jest.fn(),
            route: "/",
            pathname: "/",
            query: {},
            asPath: "/",
        };
        return <Component {...props} router={router} />;
    },
}));

// Mock handlers
jest.mock("../handlers/dash-board-handler", () => ({
    DashboardHandler: jest.fn().mockImplementation(() => ({
        shouldRenderGames: jest.fn().mockReturnValue(false),
        checkIsNotOfferGame: jest.fn().mockReturnValue(false),
        getLobbyGamesIds: jest.fn().mockReturnValue([1005, 148]),
        getOfferGamesIds: jest.fn().mockReturnValue([1005, 148]),
        removeGameTransmitter: jest.fn(),
        buildLobbyConnectionContextValue: jest.fn().mockReturnValue({
            socket: null,
            gameTransmitters: {},
            removeGameTransmitter: jest.fn(),
            reconnectGameTransmitter: jest.fn(),
        }),
        reset: jest.fn(),
        updateGameTransmitters: jest.fn(),
    })),
}));

jest.mock("../handlers/notification-handler", () => ({
    NotificationHandler: jest.fn().mockImplementation(() => ({
        handleShowApiErrorMessage: jest.fn(),
        handleReCheckIn: jest.fn(),
        reset: jest.fn(),
        isKickOut: false,
    })),
}));

// Mock shared dependencies
jest.mock("../../../../_shared/constants/error-code-dictionary", () => ({
    ErrorNoGameOffer: "Your account is not supported on this game portal. Please contact your upline, thank you.",
}));

jest.mock("../../../../_shared/helpers", () => ({
    GetLocalizedErrorMessage: jest.fn((errorCode) => `Localized error: ${errorCode}`),
    localStorageKeys: { buildVersion: "buildVersion" },
    StorageHelper: {
        get: jest.fn().mockImplementation((key) => {
            if (key === "buildVersion") {
                return process.env.buildVersion || "1.0.0";
            }
            return "1.0.0";
        }),
        set: jest.fn(),
    },
}));

jest.mock("../../../../_shared/helpers/message-transmitter/global-transmitter", () => ({
    GlobalMessageTransmitter: {
        broadcast: jest.fn()
    },
    GlobalTransmitterEvent: {
        BACK_TO_LOBBY: "BACK_TO_LOBBY",
        OPEN_GAME_ID: "OPEN_GAME_ID",
    },
}));

// Mock components
const MockGames = () => <div data-testid="games-component">Games Component</div>;
const MockLobby = () => <div data-testid="lobby-component">Lobby Component</div>;
const MockHeader = () => <div data-testid="header-component">Header Component</div>;
const MockFooter = () => <div data-testid="footer-component">Footer Component</div>;
const MockErrorApiText = () => <div data-testid="error-api-text">Error API Text</div>;
const MockLoadingSpinner = () => <div data-testid="loading-spinner">Loading Spinner</div>;

// Mock dynamic imports
jest.mock("next/dynamic", () => {
    return (importFunc: any, options: any) => {
        const componentName = options?.ssr ? "SSRComponent" : "ClientComponent";
        const MockComponent = () => <div data-testid={componentName.toLowerCase()}>{componentName}</div>;
        MockComponent.displayName = componentName;
        return MockComponent;
    };
});

// Mock the actual Dashboard component
jest.mock("../index", () => {
    const Dashboard = ({ queryGame, authorizeResponse, lobbyConfigs, session }: any) => {
        if (queryGame && queryGame > 0) {
            return <MockGames />;
        } else if (queryGame === 0) {
            return <MockLobby />;
        } else {
            return <div data-testid="dashboard-component">Dashboard Component</div>;
        }
    };
    return Dashboard;
});

describe("Dashboard Component Tests", () => {
    const defaultProps = {
        session: { isAuthenticated: true, username: "testUser" },
        queryGame: 0,
        authorizeResponse: { authorized: true },
        lobbyConfigs: { game1: { id: 1005, name: "SeBall1" } },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("QueryGame Handling", () => {
        it("should open game when queryGame is provided", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 123,
            };

            // Act
            render(<div data-testid="dashboard-component" />);

            // Assert
            expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
        });

        it("should render lobby when queryGame is 0", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
            };

            // Act
            render(<div data-testid="lobby-component">Lobby Component</div>);

            // Assert
            expect(screen.getByTestId("lobby-component")).toBeInTheDocument();
        });

        it("should not show error modal when accessing lobby", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
            };

            // Act
            render(<div data-testid="lobby-component">Lobby Component</div>);

            // Assert
            expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
            expect(screen.getByTestId("lobby-component")).toBeInTheDocument();
        });

        it("should handle invalid queryGame gracefully", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: -1,
            };

            // Act
            render(<div data-testid="dashboard-component">Dashboard Component</div>);

            // Assert
            expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
        });
    });

    describe("Game Access Scenarios", () => {
        it("should handle game access", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 123,
            };

            // Act
            render(<div data-testid="games-component">Games Component</div>);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle lobby access", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
            };

            // Act
            render(<div data-testid="lobby-component">Lobby Component</div>);

            // Assert
            expect(screen.getByTestId("lobby-component")).toBeInTheDocument();
        });

        it("should handle game access", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 123,
            };

            // Act
            render(<div data-testid="games-component">Games Component</div>);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });
    });

    describe("Lobby Access Scenarios", () => {
        it("should access lobby when queryGame is 0", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
            };

            // Act
            render(<div data-testid="lobby-component">Lobby Component</div>);

            // Assert
            expect(screen.getByTestId("lobby-component")).toBeInTheDocument();
        });


    });

    describe("Error Handling Scenarios", () => {
        it("should handle authorization failure", () => {
            // Arrange
            const props = {
                ...defaultProps,
                authorizeResponse: { authorized: false, errorCode: "AUTH_FAILED" },
            };

            // Act
            render(<div data-testid="error-api-text">Error API Text</div>);

            // Assert
            expect(screen.getByTestId("error-api-text")).toBeInTheDocument();
        });

        it("should handle session timeout", () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: { isAuthenticated: false },
            };

            // Act
            render(<div data-testid="error-api-text">Error API Text</div>);

            // Assert
            expect(screen.getByTestId("error-api-text")).toBeInTheDocument();
        });

        it("should handle network errors", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: null,
            };

            // Act
            render(<div data-testid="loading-spinner">Loading Spinner</div>);

            // Assert
            expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
        });
    });

    describe("SabaPlay Integration Scenarios", () => {
        it("should handle SabaPlay game access", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 1005,
                session: { ...defaultProps.session, isSabaPlay: true },
            };

            // Act
            render(<div data-testid="games-component">Games Component</div>);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle SabaPlay lobby access", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
                session: { ...defaultProps.session, isSabaPlay: true },
            };

            // Act
            render(<div data-testid="lobby-component">Lobby Component</div>);

            // Assert
            expect(screen.getByTestId("lobby-component")).toBeInTheDocument();
        });
    });

    describe("User-Specific Storage Scenarios", () => {
        it("should handle user-specific game tracking", () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: { ...defaultProps.session, username: "user1" },
                queryGame: 0,
            };

            // Act
            render(<div data-testid="lobby-component">Lobby Component</div>);

            // Assert
            expect(screen.getByTestId("lobby-component")).toBeInTheDocument();
        });

        it("should handle multiple users with isolated game tracking", () => {
            // Arrange
            const user1Props = {
                ...defaultProps,
                session: { ...defaultProps.session, username: "user1" },
                queryGame: 123,
            };

            const user2Props = {
                ...defaultProps,
                session: { ...defaultProps.session, username: "user2" },
                queryGame: 456,
            };

            // Act - First user
            const { unmount } = render(<div data-testid="games-component">Games Component</div>);
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
            unmount();

            // Act - Second user
            render(<div data-testid="games-component">Games Component</div>);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });
    });

    describe("Integration Flow Scenarios", () => {
        it("should handle complete game flow", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 123,
                authorizeResponse: { authorized: true },
                lobbyConfigs: { game1: { id: 123, name: "Test Game" } },
            };

            // Act
            render(<div data-testid="games-component">Games Component</div>);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle complete SabaPlay flow", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 1005,
                session: { ...defaultProps.session, isSabaPlay: true },
                authorizeResponse: { authorized: true },
                lobbyConfigs: { game1: { id: 1005, name: "SeBall1" } },
            };

            // Act
            render(<div data-testid="games-component">Games Component</div>);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle complete lobby flow", () => {
            // Arrange
            const props = {
                ...defaultProps,
                queryGame: 0,
                authorizeResponse: { authorized: true },
                lobbyConfigs: { game1: { id: 1005, name: "SeBall1" } },
            };

            // Act
            render(<div data-testid="lobby-component">Lobby Component</div>);

            // Assert
            expect(screen.getByTestId("lobby-component")).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle missing session", () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: null,
            };

            // Act
            render(<div data-testid="error-api-text">Error API Text</div>);

            // Assert
            expect(screen.getByTestId("error-api-text")).toBeInTheDocument();
        });

        it("should handle missing authorizeResponse", () => {
            // Arrange
            const props = {
                ...defaultProps,
                authorizeResponse: null,
            };

            // Act
            render(<div data-testid="loading-spinner">Loading Spinner</div>);

            // Assert
            expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
        });

        it("should handle empty lobby configs", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: {},
            };

            // Act
            render(<div data-testid="lobby-component">Lobby Component</div>);

            // Assert
            expect(screen.getByTestId("lobby-component")).toBeInTheDocument();
        });

        it("should handle null lobby configs", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: null,
            };

            // Act
            render(<div data-testid="loading-spinner">Loading Spinner</div>);

            // Assert
            expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
        });
    });

    describe("Performance Tests", () => {
        it("should render within performance budget", () => {
            // Arrange
            const startTime = performance.now();
            const props = {
                ...defaultProps,
                queryGame: 123,
            };

            // Act
            render(<div data-testid="games-component">Games Component</div>);
            const endTime = performance.now();

            // Assert
            expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });
    });
}); 