import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import SplashScreen from '../SplashScreen';
import { logger as plinkoLogger } from '../../../services/logger';

// Mock the router
jest.mock('next/router', () => ({
    useRouter: jest.fn()
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
    sso: jest.fn(),
    authorize: jest.fn(),
    createNickname: jest.fn()
}));

// Mock the shared hooks and contexts
jest.mock('@shared/react-contexts', () => ({
    URLContext: React.createContext({
        token: 'test-token',
        language: 'en'
    }),
    usePlayerContext: () => ({
        session: null,
        locale: 'en'
    })
}));

jest.mock('@shared/react-hooks', () => ({
    useTranslator: () => ({
        t: (key: string) => key
    })
}));

// Mock the shared utilities
jest.mock('@shared/utils', () => ({
    getDefaultGameId: jest.fn().mockReturnValue(145)
}));

jest.mock('@shared/helpers', () => ({
    AnalyticsHelper: {
        setUser: jest.fn()
    },
    StorageHelper: {
        set: jest.fn(),
        get: jest.fn()
    },
    localStorageKeys: {
        session: 'session',
        buildVersion: 'buildVersion'
    },
    randomInteger: jest.fn().mockReturnValue(5)
}));

jest.mock('@shared/helpers/name-generator', () => ({
    __esModule: true,
    default: {
        generate: jest.fn().mockReturnValue('TestNickname')
    }
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

// Mock the dynamic imports
jest.mock('../../um-page/UmPage', () => {
    return function MockUmPage() {
        return <div data-testid="um-page">UM Page</div>;
    };
});

jest.mock('../../dashboard/Dashboard', () => {
    return function MockDashboard() {
        return <div data-testid="dashboard-component">Dashboard</div>;
    };
});

jest.mock('@shared/helpers/preload-resources', () => {
    return function MockPreloadResources({ setIsDonePreload, onProgressUpdate }: any) {
        React.useEffect(() => {
            // Simulate progress updates
            let progress = 0;
            const interval = setInterval(() => {
                progress += 25;
                onProgressUpdate(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    setIsDonePreload();
                }
            }, 100);
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

describe('SplashScreen Component', () => {
    let mockRouter: any;
    let mockSSOResponse: any;
    let mockAuthorizeResponse: any;

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

        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        jest.clearAllMocks();
    });

    describe('Component Initialization', () => {
        it('should initialize with correct props', () => {
            // Act
            render(<SplashScreen />);

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🎬 [SPLASH] SplashScreen component initialized',
                expect.objectContaining({
                    hasToken: true,
                    tokenLength: 10,
                    language: 'en'
                })
            );
        });

        it('should set initial state correctly', () => {
            // Act
            render(<SplashScreen />);

            // Assert
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '📊 [SPLASH] Component state initialized',
                expect.objectContaining({
                    isUm: false,
                    currentGameId: -1,
                    isRenderDashboard: false,
                    isDoneLoadConfig: false,
                    preloadProgress: 0
                })
            );
        });
    });

    describe('Authentication Flow', () => {
        it('should handle successful SSO authentication', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<SplashScreen />);

            // Wait for async operations
            await waitFor(() => {
                expect(sso).toHaveBeenCalledWith('test-token', 10);
            });

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🔐 [SPLASH] Session retrieved',
                expect.objectContaining({
                    hasSession: true,
                    isAuthenticated: true,
                    username: 'testuser'
                })
            );
        });

        it('should handle SSO authentication failure', async () => {
            // Arrange
            const { sso } = require('@shared/services/auth-service');
            const failedResponse = { ...mockSSOResponse, isAuthenticated: false };
            sso.mockResolvedValue(failedResponse);

            // Act
            render(<SplashScreen />);

            // Wait for async operations
            await waitFor(() => {
                expect(sso).toHaveBeenCalled();
            });

            // Assert
            expect(plinkoLogger.warn).toHaveBeenCalledWith(
                '⏰ [SPLASH] Session timeout detected, redirecting to timeout page'
            );
            expect(mockRouter.push).toHaveBeenCalledWith('timeout');
        });

        it('should handle SSO authentication error', async () => {
            // Arrange
            const { sso } = require('@shared/services/auth-service');
            const error = new Error('Network error');
            sso.mockRejectedValue(error);

            // Act
            render(<SplashScreen />);

            // Wait for async operations
            await waitFor(() => {
                expect(sso).toHaveBeenCalled();
            });

            // Assert
            expect(plinkoLogger.error).toHaveBeenCalledWith(
                '❌ [SPLASH] Initialization failed',
                expect.any(Object)
            );
        });
    });

    describe('Language Loading', () => {
        it('should load language successfully', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<SplashScreen />);

            // Wait for async operations
            await waitFor(() => {
                expect(sso).toHaveBeenCalled();
            });

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '✅ [SPLASH] Language loaded successfully',
                expect.objectContaining({
                    locale: 'en'
                })
            );
        });

        it('should handle language loading error', async () => {
            // Arrange
            const { sso } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            const { tolgee } = require('@shared/tolgee');
            tolgee.loadLanguage.mockRejectedValue(new Error('Language load failed'));

            // Act
            render(<SplashScreen />);

            // Wait for async operations
            await waitFor(() => {
                expect(sso).toHaveBeenCalled();
            });

            // Assert
            expect(plinkoLogger.error).toHaveBeenCalledWith(
                '❌ [SPLASH] Failed to load language',
                expect.any(Object)
            );
        });
    });

    describe('Game Configuration', () => {
        it('should configure game with correct ID', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<SplashScreen />);

            // Wait for async operations
            await waitFor(() => {
                expect(sso).toHaveBeenCalled();
            });

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🎮 [SPLASH] Game configuration started',
                expect.objectContaining({
                    defaultGameId: 145
                })
            );
        });
    });

    describe('Resource Preloading', () => {
        it('should start resource preloading after config is done', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<SplashScreen />);

            // Wait for async operations
            await waitFor(() => {
                expect(sso).toHaveBeenCalled();
            });

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '📦 [SPLASH] Starting resource preloading',
                expect.any(Object)
            );
        });

        it('should update progress during preloading', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<SplashScreen />);

            // Wait for progress updates
            await waitFor(() => {
                expect(plinkoLogger.debug).toHaveBeenCalledWith(
                    '📈 [SPLASH] Preload progress updated',
                    expect.any(Object)
                );
            }, { timeout: 1000 });
        });

        it('should render dashboard after preloading completes', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<SplashScreen />);

            // Wait for dashboard to render
            await waitFor(() => {
                expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
            }, { timeout: 2000 });

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '✅ [SPLASH] Resource preloading completed, rendering dashboard'
            );
        });
    });

    describe('UM (User Management) Handling', () => {
        it('should render UM page when user is UM', async () => {
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

    describe('UI Rendering', () => {
        it('should render splash screen UI initially', () => {
            // Act
            render(<SplashScreen />);

            // Assert
            expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
            expect(screen.getByTestId('splash-screen-slogan')).toBeInTheDocument();
            expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
            expect(screen.getByTestId('download-message')).toBeInTheDocument();
        });

        it('should render logo with correct content', () => {
            // Act
            render(<SplashScreen />);

            // Assert
            const logo = screen.getByText('PLINKO');
            expect(logo).toBeInTheDocument();
            expect(screen.getByText('Original Games')).toBeInTheDocument();
        });

        it('should render logger controls', () => {
            // Act
            render(<SplashScreen />);

            // Assert
            expect(screen.getByTestId('logger-controls')).toBeInTheDocument();
        });

        it('should show progress percentage in download message', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<SplashScreen />);

            // Wait for progress updates
            await waitFor(() => {
                const downloadMessage = screen.getByTestId('download-message');
                expect(downloadMessage.textContent).toContain('(25%)');
            }, { timeout: 1000 });
        });
    });

    describe('Error Handling', () => {
        it('should handle initialization errors gracefully', async () => {
            // Arrange
            const { sso } = require('@shared/services/auth-service');
            sso.mockRejectedValue(new Error('Initialization failed'));

            // Act
            render(<SplashScreen />);

            // Wait for error handling
            await waitFor(() => {
                expect(plinkoLogger.error).toHaveBeenCalledWith(
                    '❌ [SPLASH] Initialization failed',
                    expect.any(Object)
                );
            });
        });

        it('should handle missing token gracefully', () => {
            // Arrange
            const { URLContext } = require('@shared/react-contexts');
            URLContext._currentValue = { token: null, language: 'en' };

            // Act
            render(<SplashScreen />);

            // Assert
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '🎬 [SPLASH] SplashScreen component initialized',
                expect.objectContaining({
                    hasToken: false
                })
            );
        });
    });

    describe('Component State Management', () => {
        it('should update state correctly during initialization', async () => {
            // Arrange
            const { sso, authorize } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<SplashScreen />);

            // Wait for state updates
            await waitFor(() => {
                expect(plinkoLogger.debug).toHaveBeenCalledWith(
                    '🎨 [SPLASH] Rendering splash screen UI',
                    expect.objectContaining({
                        locale: 'en',
                        isDoneLoadConfig: true,
                        currentGameId: 145
                    })
                );
            });
        });
    });
});
