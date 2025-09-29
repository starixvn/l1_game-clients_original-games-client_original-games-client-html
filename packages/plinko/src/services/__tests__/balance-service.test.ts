import {
    PlinkoBalanceService,
    getPlinkoBalanceService,
    initializePlinkoBalanceService,
    BalanceResponse
} from '../balance-service';
import { SSOResponse } from "sc-user-service-client/dist/auth";
import { getBalance as getAuthBalance } from '@shared/services/auth-service';
import { logger as plinkoLogger } from '../logger';

// Mock the shared auth service
jest.mock('@shared/services/auth-service', () => ({
    getBalance: jest.fn()
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

describe('PlinkoBalanceService', () => {
    let balanceService: PlinkoBalanceService;
    let mockSession: SSOResponse;
    let mockBalanceResponse: BalanceResponse;

    beforeEach(() => {
        // Arrange: Set up test data
        mockSession = {
            isAuthenticated: true,
            isUM: false,
            username: 'testuser',
            ss: 'test-session-string',
            language: 'en'
        } as SSOResponse;

        mockBalanceResponse = {
            isSuccessful: true,
            balance: 1000
        };

        balanceService = new PlinkoBalanceService(mockSession);
        jest.clearAllMocks();
    });

    describe('getBalance', () => {
        it('should retrieve balance successfully', async () => {
            // Arrange
            getAuthBalance.mockResolvedValue(mockBalanceResponse);

            // Act
            const result = await balanceService.getBalance();

            // Assert
            expect(result).toEqual(mockBalanceResponse);
            expect(balanceService.getCurrentBalance()).toBe(1000);
            expect(getAuthBalance).toHaveBeenCalledWith(mockSession);
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                'Balance retrieved successfully for Plinko',
                expect.any(Object)
            );
        });

        it('should handle balance retrieval failure', async () => {
            // Arrange
            const failedResponse = { ...mockBalanceResponse, isSuccessful: false, errorCode: 'ERROR' };
            getAuthBalance.mockResolvedValue(failedResponse);

            // Act
            const result = await balanceService.getBalance();

            // Assert
            expect(result).toEqual(failedResponse);
            expect(plinkoLogger.warn).toHaveBeenCalledWith(
                'Failed to retrieve balance for Plinko',
                expect.any(Object)
            );
        });

        it('should handle balance retrieval error', async () => {
            // Arrange
            const error = new Error('Network error');
            getAuthBalance.mockRejectedValue(error);

            // Act & Assert
            await expect(balanceService.getBalance()).rejects.toThrow('Network error');
            expect(plinkoLogger.error).toHaveBeenCalledWith(
                'Get balance error for Plinko',
                expect.any(Object)
            );
        });
    });

    describe('updateBalance', () => {
        it('should update balance and notify subscribers', async () => {
            // Arrange
            const callback = jest.fn();
            balanceService.subscribeToBalanceUpdates(callback);

            // Act
            await balanceService.updateBalance(2000);

            // Assert
            expect(balanceService.getCurrentBalance()).toBe(2000);
            expect(callback).toHaveBeenCalledWith(2000);
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '✅ [BALANCE] Balance updated successfully for Plinko',
                expect.any(Object)
            );
        });

        it('should not notify subscribers when balance is unchanged', async () => {
            // Arrange
            balanceService['currentBalance'] = 1000;
            const callback = jest.fn();
            balanceService.subscribeToBalanceUpdates(callback);

            // Act
            await balanceService.updateBalance(1000);

            // Assert
            expect(callback).not.toHaveBeenCalled();
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                '💰 [BALANCE] Balance unchanged for Plinko',
                expect.any(Object)
            );
        });
    });

    describe('subscribeToBalanceUpdates', () => {
        it('should subscribe and unsubscribe to balance updates', () => {
            // Arrange
            const callback = jest.fn();

            // Act
            const unsubscribe = balanceService.subscribeToBalanceUpdates(callback);
            balanceService.updateBalance(1500);

            // Assert
            expect(callback).toHaveBeenCalledWith(1500);

            // Act - Unsubscribe
            unsubscribe();
            balanceService.updateBalance(2000);

            // Assert - Callback should not be called again
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should handle multiple subscribers', () => {
            // Arrange
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            // Act
            balanceService.subscribeToBalanceUpdates(callback1);
            balanceService.subscribeToBalanceUpdates(callback2);
            balanceService.updateBalance(3000);

            // Assert
            expect(callback1).toHaveBeenCalledWith(3000);
            expect(callback2).toHaveBeenCalledWith(3000);
        });
    });

    describe('deductBetAmount', () => {
        it('should deduct bet amount successfully when sufficient balance', async () => {
            // Arrange
            balanceService['currentBalance'] = 1000;
            const betAmount = 100;

            // Act
            const result = await balanceService.deductBetAmount(betAmount);

            // Assert
            expect(result).toBe(true);
            expect(balanceService.getCurrentBalance()).toBe(900);
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '✅ [BALANCE] Bet amount deducted successfully',
                expect.any(Object)
            );
        });

        it('should fail to deduct when insufficient balance', async () => {
            // Arrange
            balanceService['currentBalance'] = 50;
            const betAmount = 100;

            // Act
            const result = await balanceService.deductBetAmount(betAmount);

            // Assert
            expect(result).toBe(false);
            expect(balanceService.getCurrentBalance()).toBe(50);
            expect(plinkoLogger.warn).toHaveBeenCalledWith(
                '💰 [BALANCE] Insufficient balance for bet',
                expect.any(Object)
            );
        });

        it('should handle exact balance deduction', async () => {
            // Arrange
            balanceService['currentBalance'] = 100;
            const betAmount = 100;

            // Act
            const result = await balanceService.deductBetAmount(betAmount);

            // Assert
            expect(result).toBe(true);
            expect(balanceService.getCurrentBalance()).toBe(0);
        });
    });

    describe('addWinnings', () => {
        it('should add winnings successfully', async () => {
            // Arrange
            balanceService['currentBalance'] = 1000;
            const winAmount = 500;

            // Act
            await balanceService.addWinnings(winAmount);

            // Assert
            expect(balanceService.getCurrentBalance()).toBe(1500);
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                '✅ [BALANCE] Winnings added successfully',
                expect.any(Object)
            );
        });

        it('should handle zero winnings', async () => {
            // Arrange
            balanceService['currentBalance'] = 1000;
            const winAmount = 0;

            // Act
            await balanceService.addWinnings(winAmount);

            // Assert
            expect(balanceService.getCurrentBalance()).toBe(1000);
        });
    });

    describe('refreshBalance', () => {
        it('should refresh balance successfully', async () => {
            // Arrange
            getAuthBalance.mockResolvedValue(mockBalanceResponse);

            // Act
            await balanceService.refreshBalance();

            // Assert
            expect(getAuthBalance).toHaveBeenCalledWith(mockSession);
            expect(balanceService.getCurrentBalance()).toBe(1000);
        });

        it('should handle refresh balance error', async () => {
            // Arrange
            const error = new Error('Refresh failed');
            getAuthBalance.mockRejectedValue(error);

            // Act & Assert
            await expect(balanceService.refreshBalance()).rejects.toThrow('Refresh failed');
            expect(plinkoLogger.error).toHaveBeenCalledWith(
                '💰 [BALANCE] Failed to refresh balance',
                expect.any(Object)
            );
        });
    });

    describe('getPlinkoBalanceService singleton', () => {
        it('should return the same instance when initialized', () => {
            // Arrange
            const instance1 = initializePlinkoBalanceService(mockSession);
            const instance2 = getPlinkoBalanceService();

            // Act & Assert
            expect(instance1).toBe(instance2);
        });

        it('should throw error when not initialized', () => {
            // Arrange
            // Reset the singleton
            require('../balance-service').balanceServiceInstance = null;

            // Act & Assert
            expect(() => getPlinkoBalanceService()).toThrow('Balance service not initialized. Please provide a session.');
        });
    });

    describe('Edge cases and error handling', () => {
        it('should handle callback errors gracefully', () => {
            // Arrange
            const errorCallback = jest.fn().mockImplementation(() => {
                throw new Error('Callback error');
            });
            const normalCallback = jest.fn();

            // Act
            balanceService.subscribeToBalanceUpdates(errorCallback);
            balanceService.subscribeToBalanceUpdates(normalCallback);
            balanceService.updateBalance(1000);

            // Assert
            expect(normalCallback).toHaveBeenCalled();
            expect(plinkoLogger.error).toHaveBeenCalledWith(
                '💰 [BALANCE] Error in balance update callback',
                expect.any(Object)
            );
        });

        it('should handle negative balance updates', async () => {
            // Arrange
            balanceService['currentBalance'] = 1000;

            // Act
            await balanceService.updateBalance(-500);

            // Assert
            expect(balanceService.getCurrentBalance()).toBe(-500);
        });

        it('should handle very large balance values', async () => {
            // Arrange
            const largeBalance = Number.MAX_SAFE_INTEGER;

            // Act
            await balanceService.updateBalance(largeBalance);

            // Assert
            expect(balanceService.getCurrentBalance()).toBe(largeBalance);
        });
    });
});
