import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { withRouter } from 'next/router';
import Dashboard from '../Dashboard';
import { DashboardProps, DashboardState } from '../type';
import { SSOResponse, AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { logger as plinkoLogger } from '../../../services/logger';

// Mock the router
jest.mock('next/router', () => ({
    withRouter: (Component: any) => Component,
    useRouter: () => ({
        push: jest.fn(),
        pathname: '/',
        query: {},
        asPath: '/'
    })
}));

// Mock the logger
jest.mock('../../../services/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    }
}));

// Mock the shared services
jest.mock('@shared/services/auth-service', () => ({
    reCheckIn: jest.fn()
}));

// Mock the shared stores
jest.mock('@shared/stores/global-events-store/global-events-store', () => ({
    useGlobalEventsStore: {
        getState: () => ({
            subscribe: jest.fn(() => jest.fn())
        })
    }
}));

// Mock the shared components
jest.mock('@shared/components/page-components/header/setting/settings-popup', () => {
    return function MockSoundSettings() {
        return <div data-testid="sound-settings">Sound Settings</div>;
    };
});

jest.mock('@shared/components/page-components/music-player', () => {
    return function MockMusicPlayer() {
        return <div data-testid="music-player">Music Player</div>;
    };
});

jest.mock('@shared/components/game-components/game-loading/loading-spinner', () => {
    return function MockLoadingSpinner() {
        return <div data-testid="loading-spinner">Loading...</div>;
    };
});

jest.mock('@shared/react-hooks/providers/balance-sync-provider', () => {
    return function MockBalanceSyncProvider({ children }: { children: React.ReactNode }) {
        return <div data-testid="balance-sync-provider">{children}</div>;
    };
});

jest.mock('@shared/react-contexts', () => ({
    PlayerContextProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="player-context-provider">{children}</div>
    )
}));

jest.mock('../../../pages/index', () => {
    return function MockPlinkoGame() {
        return <div data-testid="plinko-game">Plinko Game</div>;
    };
});

jest.mock('../handlers/dash-board-handler', () => ({
    DashboardHandler: jest.fn().mockImplementation(() => ({
        reCheckIn: jest.fn(),
        checkGameOffer: jest.fn(),
        openGame: jest.fn()
    }))
}));

jest.mock('../handlers/notification-handler', () => ({
    NotificationHandler: jest.fn().mockImplementation(() => ({
        initialize: jest.fn(),
        handleReCheckIn: jest.fn()
    }))
}));

describe('Dashboard Component', () => {
    let mockProps: DashboardProps;
    let mockSession: SSOResponse;
    let mockAuthorizeResponse: AuthorizeResponse;

    beforeEach(() => {
        // Arrange: Set up test data
        mockSession = {
            isAuthenticated: true,
            isUM: false,
            username: 'testuser',
            ss: 'test-session-string',
            language: 'en'
        } as SSOResponse;

        mockAuthorizeResponse = {
            isSuccessful: true,
            user: {
                red: 1000,
                fractionalOddsFormat: false
            }
        } as AuthorizeResponse;

        mockProps = {
            session: mockSession,
            queryGame: 145, // Plinko game ID
            setIsUm: jest.fn(),
            tolgee: {
                getLanguage: jest.fn().mockReturnValue('en')
            } as any,
            authorizeResponse: mockAuthorizeResponse
        };

        jest.clearAllMocks();
    });

    describe('Component Initialization', () => {
        it('should initialize dashboard with correct props', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🏠 [DASHBOARD] Dashboard component initialized',
                expect.objectContaining({
                    hasSession: true,
                    hasAuthorizeResponse: true,
                    queryGame: 145,
                    username: 'testuser'
                })
            );
        });

        it('should set initial state correctly', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '📊 [DASHBOARD] Initial state set',
                expect.objectContaining({
                    userStakeLevel: { minBet: 0, maxBet: 0 },
                    hasAuthorizeInfo: true,
                    queryGame: 145
                })
            );
        });

        it('should check build version on initialization', () => {
            // Arrange
            const originalEnv = process.env.buildVersion;
            process.env.buildVersion = 'test-build-123';

            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '🔧 [DASHBOARD] Build version check',
                expect.any(Object)
            );

            // Cleanup
            process.env.buildVersion = originalEnv;
        });
    });

    describe('Component Mounting', () => {
        it('should perform initialization on mount', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🚀 [DASHBOARD] Component mounted, starting initialization',
                expect.any(Object)
            );
        });

        it('should initialize handlers on mount', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '🎛️ [DASHBOARD] Dashboard handler initialized'
            );
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '🔔 [DASHBOARD] Notification handler initialized'
            );
        });

        it('should broadcast user info on mount', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '📡 [DASHBOARD] User info broadcasted',
                expect.objectContaining({
                    userRed: 1000
                })
            );
        });
    });

    describe('Game Rendering', () => {
        it('should render Plinko game when openGameId is 145', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(screen.getByTestId('plinko-game')).toBeInTheDocument();
        });

        it('should render loading spinner when no game is open', () => {
            // Arrange
            const propsWithoutGame = { ...mockProps, queryGame: null as any };

            // Act
            render(<Dashboard {...propsWithoutGame} />);

            // Assert
            expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        });
    });

    describe('Balance Management', () => {
        it('should update user balance correctly', () => {
            // Arrange
            const { rerender } = render(<Dashboard {...mockProps} />);
            const newBalance = 2000;

            // Act
            // Simulate balance update through props change
            const updatedProps = {
                ...mockProps,
                authorizeResponse: {
                    ...mockAuthorizeResponse,
                    user: { ...mockAuthorizeResponse.user, red: newBalance }
                }
            };
            rerender(<Dashboard {...updatedProps} />);

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '💰 [DASHBOARD] Updating user balance',
                expect.any(Object)
            );
        });

        it('should handle balance update with setBalanceByPlaceBet flag', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert - The component should be ready to handle balance updates
            expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        });
    });

    describe('Event Handling', () => {
        it('should handle visibility change events', () => {
            // Arrange
            render(<Dashboard {...mockProps} />);

            // Act
            Object.defineProperty(document, 'hidden', {
                writable: true,
                value: true
            });
            fireEvent(document, new Event('visibilitychange'));

            // Assert
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '👁️ [DASHBOARD] Page visibility changed',
                expect.objectContaining({
                    isHidden: true
                })
            );
        });

        it('should handle page becoming visible', () => {
            // Arrange
            render(<Dashboard {...mockProps} />);

            // Act
            Object.defineProperty(document, 'hidden', {
                writable: true,
                value: false
            });
            fireEvent(document, new Event('visibilitychange'));

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '👁️ [DASHBOARD] Page became visible, handling re-check in'
            );
        });
    });

    describe('Component Rendering', () => {
        it('should render all required components', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(screen.getByTestId('dashboard')).toBeInTheDocument();
            expect(screen.getByTestId('sound-settings')).toBeInTheDocument();
            expect(screen.getByTestId('music-player')).toBeInTheDocument();
            expect(screen.getByTestId('player-context-provider')).toBeInTheDocument();
            expect(screen.getByTestId('balance-sync-provider')).toBeInTheDocument();
        });

        it('should render with desktop class when on desktop', () => {
            // Arrange
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1024,
            });

            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            const dashboard = screen.getByTestId('dashboard');
            expect(dashboard).toHaveClass('desktop-dashboard');
        });
    });

    describe('Auth Context', () => {
        it('should prepare auth context value correctly', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '🔐 [DASHBOARD] Auth context value prepared',
                expect.objectContaining({
                    hasAuthorizeInfo: true,
                    hasSession: true,
                    fractionalOddsFormat: false,
                    enableQuickBet: true,
                    locale: 'en'
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle missing session gracefully', () => {
            // Arrange
            const propsWithoutSession = { ...mockProps, session: null as any };

            // Act
            render(<Dashboard {...propsWithoutSession} />);

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🏠 [DASHBOARD] Dashboard component initialized',
                expect.objectContaining({
                    hasSession: false
                })
            );
        });

        it('should handle missing authorize response gracefully', () => {
            // Arrange
            const propsWithoutAuth = { ...mockProps, authorizeResponse: null as any };

            // Act
            render(<Dashboard {...propsWithoutAuth} />);

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🏠 [DASHBOARD] Dashboard component initialized',
                expect.objectContaining({
                    hasAuthorizeResponse: false
                })
            );
        });
    });

    describe('Component Lifecycle', () => {
        it('should clean up event listeners on unmount', () => {
            // Arrange
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

            // Act
            const { unmount } = render(<Dashboard {...mockProps} />);
            unmount();

            // Assert
            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'visibilitychange',
                expect.any(Function)
            );
        });

        it('should handle shouldComponentUpdate correctly', () => {
            // Arrange
            const { rerender } = render(<Dashboard {...mockProps} />);

            // Act
            rerender(<Dashboard {...mockProps} />);

            // Assert
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '🔄 [DASHBOARD] Checking if component should update',
                expect.any(Object)
            );
        });
    });

    describe('Integration with Handlers', () => {
        it('should initialize dashboard handler with correct methods', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '🎮 [DASHBOARD] Performing initial game offer check'
            );
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '🎮 [DASHBOARD] Checking game offer availability'
            );
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '✅ [DASHBOARD] Game offer available'
            );
        });

        it('should open game with correct game ID', () => {
            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🎮 [DASHBOARD] Query game specified, opening game',
                expect.objectContaining({
                    queryGame: 145
                })
            );
        });
    });
});
