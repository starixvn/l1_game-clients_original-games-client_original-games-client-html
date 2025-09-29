import { PlinkoAuthService, getPlinkoAuthService, initializePlinkoAuthService } from '../auth-service';
import { SSOResponse, AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { logger as plinkoLogger } from '../logger';

// Mock the shared auth service
jest.mock('@shared/services/auth-service', () => ({
    sso: jest.fn(),
    verifySession: jest.fn(),
    authorize: jest.fn(),
    getBalance: jest.fn(),
    clearSession: jest.fn(),
    reCheckIn: jest.fn()
}));

// Mock the logger
jest.mock('../logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    }
}));

describe('PlinkoAuthService', () => {
    let authService: PlinkoAuthService;
    let mockSSOResponse: SSOResponse;
    let mockAuthorizeResponse: AuthorizeResponse;

    beforeEach(() => {
        // Arrange: Set up test data
        mockSSOResponse = {
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

        authService = new PlinkoAuthService();
        jest.clearAllMocks();
    });

    describe('authenticateWithSSO', () => {
        it('should authenticate successfully with valid token', async () => {
            // Arrange
            const { sso } = require('@shared/services/auth-service');
            sso.mockResolvedValue(mockSSOResponse);

            // Act
            const result = await authService.authenticateWithSSO('valid-token', 10);

            // Assert
            expect(result).toEqual(mockSSOResponse);
            expect(authService.isAuthenticated()).toBe(true);
            expect(authService.getUsername()).toBe('testuser');
            expect(sso).toHaveBeenCalledWith('valid-token', 10);
        });

        it('should handle authentication failure', async () => {
            // Arrange
            const { sso } = require('@shared/services/auth-service');
            const failedResponse = { ...mockSSOResponse, isAuthenticated: false };
            sso.mockResolvedValue(failedResponse);

            // Act
            const result = await authService.authenticateWithSSO('invalid-token', 10);

            // Assert
            expect(result).toEqual(failedResponse);
            expect(authService.isAuthenticated()).toBe(false);
            expect(plinkoLogger.warn).toHaveBeenCalledWith(
                '❌ [AUTH] SSO authentication failed for Plinko',
                expect.any(Object)
            );
        });

        it('should handle authentication error', async () => {
            // Arrange
            const { sso } = require('@shared/services/auth-service');
            const error = new Error('Network error');
            sso.mockRejectedValue(error);

            // Act & Assert
            await expect(authService.authenticateWithSSO('token', 10)).rejects.toThrow('Network error');
            expect(plinkoLogger.error).toHaveBeenCalledWith(
                '❌ [AUTH] SSO authentication error for Plinko',
                expect.any(Object)
            );
        });
    });

    describe('verifySession', () => {
        it('should verify session successfully', async () => {
            // Arrange
            const { verifySession } = require('@shared/services/auth-service');
            verifySession.mockResolvedValue(mockSSOResponse);

            // Act
            const result = await authService.verifySession();

            // Assert
            expect(result).toEqual(mockSSOResponse);
            expect(authService.isAuthenticated()).toBe(true);
            expect(verifySession).toHaveBeenCalled();
        });

        it('should handle session verification failure', async () => {
            // Arrange
            const { verifySession } = require('@shared/services/auth-service');
            verifySession.mockResolvedValue(null);

            // Act
            const result = await authService.verifySession();

            // Assert
            expect(result).toBeNull();
            expect(authService.isAuthenticated()).toBe(false);
            expect(plinkoLogger.warn).toHaveBeenCalledWith(
                '❌ [AUTH] Session verification failed for Plinko'
            );
        });
    });

    describe('authorize', () => {
        it('should authorize successfully with valid session', async () => {
            // Arrange
            authService['authState'].session = mockSSOResponse;
            const { authorize } = require('@shared/services/auth-service');
            authorize.mockResolvedValue(mockAuthorizeResponse);

            // Act
            const result = await authService.authorize();

            // Assert
            expect(result).toEqual(mockAuthorizeResponse);
            expect(authService.getAuthorizeResponse()).toEqual(mockAuthorizeResponse);
            expect(authService.getBalance()).toBe(1000);
            expect(authorize).toHaveBeenCalledWith(mockSSOResponse);
        });

        it('should handle authorization without session', async () => {
            // Arrange
            authService['authState'].session = null;

            // Act
            const result = await authService.authorize();

            // Assert
            expect(result).toBeNull();
            expect(plinkoLogger.warn).toHaveBeenCalledWith(
                '❌ [AUTH] Cannot authorize - no session available'
            );
        });
    });

    describe('getBalance', () => {
        it('should get balance successfully', async () => {
            // Arrange
            authService['authState'].session = mockSSOResponse;
            const { getBalance } = require('@shared/services/auth-service');
            const balanceResponse = { isSuccessful: true, balance: 1500 };
            getBalance.mockResolvedValue(balanceResponse);

            // Act
            const result = await authService.getBalance();

            // Assert
            expect(result).toBe(1500);
            expect(authService.getBalance()).toBe(1500);
            expect(getBalance).toHaveBeenCalledWith(mockSSOResponse);
        });

        it('should handle balance retrieval failure', async () => {
            // Arrange
            authService['authState'].session = mockSSOResponse;
            const { getBalance } = require('@shared/services/auth-service');
            const balanceResponse = { isSuccessful: false, errorCode: 'INSUFFICIENT_FUNDS' };
            getBalance.mockResolvedValue(balanceResponse);

            // Act
            const result = await authService.getBalance();

            // Assert
            expect(result).toBe(0);
            expect(plinkoLogger.warn).toHaveBeenCalledWith(
                '❌ [AUTH] Failed to get balance for Plinko',
                expect.any(Object)
            );
        });
    });

    describe('clearSession', () => {
        it('should clear session and reset auth state', () => {
            // Arrange
            authService['authState'] = {
                isAuthenticated: true,
                isUM: false,
                session: mockSSOResponse,
                authorizeResponse: mockAuthorizeResponse,
                balance: 1000,
                username: 'testuser'
            };

            // Act
            authService.clearSession();

            // Assert
            expect(authService.isAuthenticated()).toBe(false);
            expect(authService.getSession()).toBeNull();
            expect(authService.getUsername()).toBeNull();
            expect(authService.getBalance()).toBe(0);
        });
    });

    describe('subscribeToAuthState', () => {
        it('should subscribe and unsubscribe to auth state changes', () => {
            // Arrange
            const callback = jest.fn();
            const initialState = authService.getAuthState();

            // Act
            const unsubscribe = authService.subscribeToAuthState(callback);
            authService.updateBalance(2000);

            // Assert
            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({ balance: 2000 })
            );

            // Act - Unsubscribe
            unsubscribe();
            authService.updateBalance(3000);

            // Assert - Callback should not be called again
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateBalance', () => {
        it('should update balance and notify subscribers', () => {
            // Arrange
            const callback = jest.fn();
            authService.subscribeToAuthState(callback);

            // Act
            authService.updateBalance(2500);

            // Assert
            expect(authService.getBalance()).toBe(2500);
            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({ balance: 2500 })
            );
        });
    });

    describe('getPlinkoAuthService singleton', () => {
        it('should return the same instance', () => {
            // Act
            const instance1 = getPlinkoAuthService();
            const instance2 = getPlinkoAuthService();

            // Assert
            expect(instance1).toBe(instance2);
        });
    });

    describe('initializePlinkoAuthService', () => {
        it('should create a new instance', () => {
            // Act
            const instance = initializePlinkoAuthService();

            // Assert
            expect(instance).toBeInstanceOf(PlinkoAuthService);
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle null session gracefully', () => {
            // Arrange
            authService['authState'].session = null;

            // Act & Assert
            expect(authService.getSession()).toBeNull();
            expect(authService.isAuthenticated()).toBe(false);
        });

        it('should handle undefined authorize response', () => {
            // Arrange
            authService['authState'].authorizeResponse = null;

            // Act & Assert
            expect(authService.getAuthorizeResponse()).toBeNull();
        });

        it('should handle callback errors gracefully', () => {
            // Arrange
            const errorCallback = jest.fn().mockImplementation(() => {
                throw new Error('Callback error');
            });
            const normalCallback = jest.fn();

            // Act
            authService.subscribeToAuthState(errorCallback);
            authService.subscribeToAuthState(normalCallback);
            authService.updateBalance(1000);

            // Assert
            expect(normalCallback).toHaveBeenCalled();
            expect(plinkoLogger.error).toHaveBeenCalledWith(
                '🔐 [AUTH] Error in auth state callback',
                expect.any(Object)
            );
        });
    });
});
