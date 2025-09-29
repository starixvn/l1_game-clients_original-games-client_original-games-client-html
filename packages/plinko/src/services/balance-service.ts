import { SSOResponse } from "sc-user-service-client/dist/auth";
import { getBalance as getAuthBalance } from "@shared/services/auth-service";
import { logger } from "@shared/services/logger";
import { logger as plinkoLogger } from "./logger";

export interface BalanceResponse {
    isSuccessful: boolean;
    balance: number;
    errorCode?: string;
    errorMessage?: string;
}

export class PlinkoBalanceService {
    private session: SSOResponse;
    private currentBalance: number = 0;
    private balanceUpdateCallbacks: ((balance: number) => void)[] = [];

    constructor(session: SSOResponse) {
        this.session = session;
        plinkoLogger.info('💰 [BALANCE] Balance service initialized', {
            username: session.username
        });
    }

    public async getBalance(): Promise<BalanceResponse> {
        plinkoLogger.info('Getting balance for Plinko', {
            username: this.session.username
        });

        try {
            const result = await getAuthBalance(this.session);

            if (result.isSuccessful) {
                this.currentBalance = result.balance;
                plinkoLogger.info('Balance retrieved successfully for Plinko', {
                    username: this.session.username,
                    balance: result.balance
                });

                // Notify all callbacks
                this.notifyBalanceUpdate(result.balance);
            } else {
                plinkoLogger.warn('Failed to retrieve balance for Plinko', {
                    username: this.session.username,
                    errorCode: result.errorCode
                });
            }

            return result;
        } catch (error) {
            plinkoLogger.error('Get balance error for Plinko', {
                error: error.message,
                username: this.session.username
            });
            throw error;
        }
    }

    public async updateBalance(newBalance: number): Promise<void> {
        plinkoLogger.info('💰 [BALANCE] Updating balance for Plinko', {
            username: this.session.username,
            oldBalance: this.currentBalance,
            newBalance
        });

        if (this.currentBalance !== newBalance) {
            this.currentBalance = newBalance;
            this.notifyBalanceUpdate(newBalance);

            plinkoLogger.info('✅ [BALANCE] Balance updated successfully for Plinko', {
                username: this.session.username,
                newBalance
            });
        } else {
            plinkoLogger.debug('💰 [BALANCE] Balance unchanged for Plinko', {
                username: this.session.username,
                balance: newBalance
            });
        }
    }

    public getCurrentBalance(): number {
        return this.currentBalance;
    }

    public subscribeToBalanceUpdates(callback: (balance: number) => void): () => void {
        this.balanceUpdateCallbacks.push(callback);

        plinkoLogger.debug('💰 [BALANCE] Subscribed to balance updates', {
            username: this.session.username,
            totalSubscribers: this.balanceUpdateCallbacks.length
        });

        // Return unsubscribe function
        return () => {
            const index = this.balanceUpdateCallbacks.indexOf(callback);
            if (index > -1) {
                this.balanceUpdateCallbacks.splice(index, 1);
                plinkoLogger.debug('💰 [BALANCE] Unsubscribed from balance updates', {
                    username: this.session.username,
                    remainingSubscribers: this.balanceUpdateCallbacks.length
                });
            }
        };
    }

    private notifyBalanceUpdate(balance: number): void {
        plinkoLogger.debug('💰 [BALANCE] Notifying balance update subscribers', {
            username: this.session.username,
            balance,
            subscriberCount: this.balanceUpdateCallbacks.length
        });

        this.balanceUpdateCallbacks.forEach(callback => {
            try {
                callback(balance);
            } catch (error) {
                plinkoLogger.error('💰 [BALANCE] Error in balance update callback', {
                    error: error.message,
                    username: this.session.username
                });
            }
        });
    }

    public async deductBetAmount(betAmount: number): Promise<boolean> {
        plinkoLogger.info('💰 [BALANCE] Deducting bet amount for Plinko', {
            username: this.session.username,
            currentBalance: this.currentBalance,
            betAmount
        });

        if (this.currentBalance >= betAmount) {
            const newBalance = this.currentBalance - betAmount;
            await this.updateBalance(newBalance);

            plinkoLogger.info('✅ [BALANCE] Bet amount deducted successfully', {
                username: this.session.username,
                betAmount,
                newBalance
            });

            return true;
        } else {
            plinkoLogger.warn('💰 [BALANCE] Insufficient balance for bet', {
                username: this.session.username,
                currentBalance: this.currentBalance,
                betAmount
            });

            return false;
        }
    }

    public async addWinnings(winAmount: number): Promise<void> {
        plinkoLogger.info('💰 [BALANCE] Adding winnings for Plinko', {
            username: this.session.username,
            currentBalance: this.currentBalance,
            winAmount
        });

        const newBalance = this.currentBalance + winAmount;
        await this.updateBalance(newBalance);

        plinkoLogger.info('✅ [BALANCE] Winnings added successfully', {
            username: this.session.username,
            winAmount,
            newBalance
        });
    }

    public async refreshBalance(): Promise<void> {
        plinkoLogger.info('💰 [BALANCE] Refreshing balance for Plinko', {
            username: this.session.username
        });

        try {
            await this.getBalance();
        } catch (error) {
            plinkoLogger.error('💰 [BALANCE] Failed to refresh balance', {
                error: error.message,
                username: this.session.username
            });
            throw error;
        }
    }
}

// Singleton instance
let balanceServiceInstance: PlinkoBalanceService | null = null;

export function getPlinkoBalanceService(session?: SSOResponse): PlinkoBalanceService {
    if (!balanceServiceInstance && session) {
        balanceServiceInstance = new PlinkoBalanceService(session);
    }

    if (!balanceServiceInstance) {
        throw new Error('Balance service not initialized. Please provide a session.');
    }

    return balanceServiceInstance;
}

export function initializePlinkoBalanceService(session: SSOResponse): PlinkoBalanceService {
    balanceServiceInstance = new PlinkoBalanceService(session);
    return balanceServiceInstance;
}
