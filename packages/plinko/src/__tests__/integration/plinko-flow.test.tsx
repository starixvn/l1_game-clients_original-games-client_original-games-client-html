import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import SplashScreen from '../../components/splash-screen/SplashScreen';
import Dashboard from '../../components/dashboard/Dashboard';
import { getPlinkoAuthService } from '../../services/auth-service';
import { getPlinkoBalanceService } from '../../services/balance-service';
import { PlinkoSocketService } from '../../services/socket-service';
import { logger as plinkoLogger } from '../../services/logger';

// Mock all external dependencies
jest.mock('next/router', () => ({
    useRouter: jest.fn()
}));

jest.mock('../../services/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    }
}));

jest.mock('@shared/services/auth-service', () => ({
    sso: jest.fn(),
    authorize: jest.fn(),
    getBalance: jest.fn(),
    reCheckIn: jest.fn()
}));

jest.mock('@shared/react-contexts', () => ({
    URLContext: React.createContext({
        token: 'test-token-123',
        language: 'en'
    }),
    usePlayerContext: () => ({
        session: null,
        locale: 'en'
    }),
    PlayerContextProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="player-context">{children}</div>
    )
}));

jest.mock('@shared/react-hooks', () => ({
    useTranslator: () => ({
        t: (key: string) => key
    })
}));

jest.mock('@shared/utils', () => ({
    getDefaultGameId: jest.fn().mockReturnValue(145)
}));

jest.mock('@shared/helpers', () => ({
    AnalyticsHelper: { setUser: jest.fn() },
    StorageHelper: { set: jest.fn(), get: jest.fn() },
    localStorageKeys: { session: 'session', buildVersion: 'buildVersion' },
    randomInteger: jest.fn().mockReturnValue(5)
}));

jest.mock('@shared/helpers/name-generator', () => ({
    __esModule: true,
    default: { generate: jest.fn().mockReturnValue('TestNickname') }
}));

jest.mock('@shared/helpers/avatar-helper', () => ({
    MAX_AVATAR_ID: 10
}));

jest.mock('@shared/sentry', () => ({
    setSentryUser: jest.fn()
}));

jest.mock('@shared/tolgee', () => ({
    tolgee: {
        loadLanguage: jest.fn().mockResolvedValue(undefined),
        getLanguage: jest.fn().mockReturnValue('en')
    }
}));

// Mock components
jest.mock('../../components/um-page/UmPage', () => {
    return function MockUmPage() {
        return <div data-testid="um-page">UM Page</div>;
    };
});

jest.mock('../../components/dashboard/Dashboard', () => {
    return function MockDashboard() {
        return <div data-testid="dashboard-component">Dashboard</div>;
    };
});

jest.mock('../../pages/index', () => {
    return function MockPlinkoGame() {
        return <div data-testid="plinko-game">Plinko Game</div>;
    };
});

jest.mock('@shared/helpers/preload-resources', () => {
    return function MockPreloadResources({ setIsDonePreload, onProgressUpdate }: any) {
        React.useEffect(() => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 25;
                onProgressUpdate(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    setIsDonePreload();
                }
            }, 50);
            return () => clearInterval(interval);
        }, [setIsDonePreload, onProgressUpdate]);
        return <div data-testid="preload-resources">Preloading...</div>;
    };
});

jest.mock('../ui/components/controls/LoggerControls', () => {
    return function MockLoggerControls() {
        return <div data-testid="logger-controls">Logger Controls</div>;
    };
});

describe('Plinko Integration Flow', () => {
    let mockRouter: any;
    let mockSSOResponse: any;
    let mockAuthorizeResponse: any;
    let mockBalanceResponse: any;

    beforeEach(() => {
        // Arrange: Set up test data
        mockRouter = {
            push: jest.fn(),
            pathname: '/',
            query: {},
            asPath: '/'
        };

        mockSSOResponse = {
            isAuthenticated: true,
            isUM: false,
            username: 'testuser',
            ss: 'test-session-string',
            language: 'en'
        };

        mockAuthorizeResponse = {
            isSuccessful: true,
            user: {
                red: 1000,
                fractionalOddsFormat: false
            }
        };

        mockBalanceResponse = {
            isSuccessful: true,
            balance: 1000
        };

        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        jest.clearAllMocks();
    });

    describe('Complete Authentication Flow', () => {
        it('should complete full authentication flow from splash to dashboard', async () => {
            // Arrange
            const { sso, authorize, getBalance } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);
            getBalance.mockResolvedValue(mockBalanceResponse);

            // Act
            render(<SplashScreen />);

            // Wait for authentication to complete
            await waitFor(() => {
                expect(sso).toHaveBeenCalledWith('test-token-123', 10);
            });

            // Wait for authorization to complete
            await waitFor(() => {
                expect(authorize).toHaveBeenCalledWith(mockSSOResponse);
            });

            // Wait for dashboard to render
            await waitFor(() => {
                expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
            }, { timeout: 2000 });

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🔐 [SPLASH] Session retrieved',
                expect.objectContaining({
                    hasSession: true,
                    isAuthenticated: true,
                    username: 'testuser'
                })
            );

            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🔑 [SPLASH] Authorization result',
                expect.objectContaining({
                    authorized: true,
                    hasUser: true
                })
            );

            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '✅ [SPLASH] Resource preloading completed, rendering dashboard'
            );
        });

        it('should handle authentication failure gracefully', async () => {
            // Arrange
            const { sso } = require('@shared/services/auth-service');
            const failedResponse = { ...mockSSOResponse, isAuthenticated: false };
            sso.mockResolvedValue(failedResponse);

            // Act
            render(<SplashScreen />);

            // Wait for authentication failure
            await waitFor(() => {
                expect(sso).toHaveBeenCalled();
            });

            // Assert
            expect(plinkoLogger.warn).toHaveBeenCalledWith(
                '⏰ [SPLASH] Session timeout detected, redirecting to timeout page'
            );
            expect(mockRouter.push).toHaveBeenCalledWith('timeout');
        });

        it('should handle UM user flow', async () => {
            // Arrange
            const { sso } = require('@shared/services/auth-service');
            const umResponse = { ...mockSSOResponse, isUM: true };
            sso.mockResolvedValue(umResponse);

            // Act
            render(<SplashScreen />);

            // Wait for UM page to render
            await waitFor(() => {
                expect(screen.getByTestId('um-page')).toBeInTheDocument();
            });

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '👑 [SPLASH] Handling UM (User Management) session',
                expect.any(Object)
            );
        });
    });

    describe('Service Integration', () => {
        it('should integrate auth service correctly', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            const authService = getPlinkoAuthService();
            await authService.authenticateWithSSO('test-token', 10);
            await authService.authorize();

            // Assert
            expect(authService.isAuthenticated()).toBe(true);
            expect(authService.getUsername()).toBe('testuser');
            expect(authService.getAuthorizeResponse()).toEqual(mockAuthorizeResponse);
        });

        it('should integrate balance service correctly', async () => {
            // Arrange
            const { getBalance } = require('@shared/services/auth-service');
            getBalance.mockResolvedValue(mockBalanceResponse);

            // Act
            const balanceService = getPlinkoBalanceService(mockSSOResponse);
            const balance = await balanceService.getBalance();

            // Assert
            expect(balance).toEqual(mockBalanceResponse);
            expect(balanceService.getCurrentBalance()).toBe(1000);
        });

        it('should handle balance updates with callbacks', async () => {
            // Arrange
            const balanceService = getPlinkoBalanceService(mockSSOResponse);
            const callback = jest.fn();

            // Act
            balanceService.subscribeToBalanceUpdates(callback);
            await balanceService.updateBalance(2000);

            // Assert
            expect(callback).toHaveBeenCalledWith(2000);
            expect(balanceService.getCurrentBalance()).toBe(2000);
        });
    });

    describe('Socket Integration', () => {
        it('should initialize socket service correctly', () => {
            // Arrange
            const mockGameMessageHandler = {
                registerSocketEvents: jest.fn(),
                broadcastGameEvent: jest.fn(),
                broadcastGameMessage: jest.fn()
            } as any;

            const mockSocketInfo = {
                namespace: 'plinko',
                path: 'game'
            };

            // Act
            const socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSSOResponse,
                'Plinko',
                mockSocketInfo
            );

            // Assert
            expect(socketService).toBeInstanceOf(PlinkoSocketService);
            expect(socketService.getSocket()).toBeNull(); // Not connected yet
        });

        it('should connect socket and handle events', () => {
            // Arrange
            const mockGameMessageHandler = {
                registerSocketEvents: jest.fn(),
                broadcastGameEvent: jest.fn(),
                broadcastGameMessage: jest.fn()
            } as any;

            const mockSocketInfo = {
                namespace: 'plinko',
                path: 'game'
            };

            // Act
            const socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSSOResponse,
                'Plinko',
                mockSocketInfo
            );
            const socket = socketService.connect();

            // Assert
            expect(socket).toBeDefined();
            expect(socketService.isConnected()).toBe(true);
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle network errors gracefully', async () => {
            // Arrange
            const { sso } = require('@shared/services/auth-service');
            sso.mockRejectedValue(new Error('Network error'));

            // Act
            render(<SplashScreen />);

            // Wait for error handling
            await waitFor(() => {
                expect(sso).toHaveBeenCalled();
            });

            // Assert
            expect(plinkoLogger.error).toHaveBeenCalledWith(
                '❌ [SPLASH] Initialization failed',
                expect.any(Object)
            );
        });

        it('should handle authorization errors gracefully', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockRejectedValue(new Error('Authorization failed'));

            // Act
            render(<SplashScreen />);

            // Wait for error handling
            await waitFor(() => {
                expect(authorize).toHaveBeenCalled();
            });

            // Assert
            expect(plinkoLogger.error).toHaveBeenCalledWith(
                '❌ [SPLASH] Initialization failed',
                expect.any(Object)
            );
        });

        it('should handle balance service errors gracefully', async () => {
            // Arrange
            const { getBalance } = require('@shared/services/auth-service');
            getBalance.mockRejectedValue(new Error('Balance service error'));

            // Act & Assert
            const balanceService = getPlinkoBalanceService(mockSSOResponse);
            await expect(balanceService.getBalance()).rejects.toThrow('Balance service error');
        });
    });

    describe('Performance and State Management', () => {
        it('should handle multiple rapid state updates', async () => {
            // Arrange
            const balanceService = getPlinkoBalanceService(mockSSOResponse);
            const callback = jest.fn();

            // Act
            balanceService.subscribeToBalanceUpdates(callback);

            // Rapid updates
            await act(async () => {
                await balanceService.updateBalance(1000);
                await balanceService.updateBalance(1500);
                await balanceService.updateBalance(2000);
            });

            // Assert
            expect(callback).toHaveBeenCalledTimes(3);
            expect(balanceService.getCurrentBalance()).toBe(2000);
        });

        it('should handle subscription cleanup correctly', () => {
            // Arrange
            const balanceService = getPlinkoBalanceService(mockSSOResponse);
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            // Act
            const unsubscribe1 = balanceService.subscribeToBalanceUpdates(callback1);
            const unsubscribe2 = balanceService.subscribeToBalanceUpdates(callback2);

            balanceService.updateBalance(1000);
            unsubscribe1();
            balanceService.updateBalance(2000);

            // Assert
            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(2);
        });
    });

    describe('Real-world Scenarios', () => {
        it('should handle complete betting flow', async () => {
            // Arrange
            const { sso, authorize, getBalance } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);
            getBalance.mockResolvedValue(mockBalanceResponse);

            // Act
            render(<SplashScreen />);

            // Wait for complete flow
            await waitFor(() => {
                expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
            }, { timeout: 2000 });

            // Simulate betting flow
            const balanceService = getPlinkoBalanceService(mockSSOResponse);
            const canBet = await balanceService.deductBetAmount(100);
            expect(canBet).toBe(true);

            // Simulate win
            await balanceService.addWinnings(200);
            expect(balanceService.getCurrentBalance()).toBe(1100);

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '✅ [BALANCE] Bet amount deducted successfully',
                expect.any(Object)
            );
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '✅ [BALANCE] Winnings added successfully',
                expect.any(Object)
            );
        });

        it('should handle session timeout during gameplay', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<SplashScreen />);

            // Wait for dashboard
            await waitFor(() => {
                expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
            }, { timeout: 2000 });

            // Simulate session timeout
            const authService = getPlinkoAuthService();
            authService.clearSession();

            // Assert
            expect(authService.isAuthenticated()).toBe(false);
            expect(authService.getSession()).toBeNull();
        });
    });
});
