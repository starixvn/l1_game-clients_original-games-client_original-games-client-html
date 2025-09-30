import { SSOResponse, AuthorizeResponse } from "sc-user-service-client/dist/auth";
import {
    sso as sharedSSO,
    verifySession as sharedVerifySession,
    authorize as sharedAuthorize,
    getBalance as sharedGetBalance,
    clearSession as sharedClearSession,
    reCheckIn as sharedReCheckIn
} from "@shared/services/auth-service";
import { logger } from "@shared/services/logger";
import { logger as plinkoLogger } from "./logger";
import { StorageHelper, localStorageKeys } from "@shared/helpers";

export interface PlinkoAuthState {
    isAuthenticated: boolean;
    isUM: boolean;
    session: SSOResponse | null;
    authorizeResponse: AuthorizeResponse | null;
    balance: number;
    username: string | null;
}

export class PlinkoAuthService {
    private authState: PlinkoAuthState;
    private authStateCallbacks: ((state: PlinkoAuthState) => void)[] = [];

    constructor() {
        this.authState = {
            isAuthenticated: false,
            isUM: false,
            session: null,
            authorizeResponse: null,
            balance: 0,
            username: null
        };

        plinkoLogger.info('🔐 [AUTH] Plinko auth service initialized');
    }

    public async authenticateWithSSO(token: string, appType: number = 10): Promise<SSOResponse> {
        plinkoLogger.info('🔐 [AUTH] Starting SSO authentication for Plinko', {
            tokenLength: token?.length,
            appType
        });

        try {
            const session = await sharedSSO(token, appType);

            if (session?.isAuthenticated) {
                this.updateAuthState({
                    isAuthenticated: true,
                    isUM: session.isUM,
                    session,
                    username: session.username
                });

                plinkoLogger.info('✅ [AUTH] SSO authentication successful for Plinko', {
                    username: session.username,
                    isAuthenticated: session.isAuthenticated,
                    isUM: session.isUM
                });
            } else {
                plinkoLogger.warn('❌ [AUTH] SSO authentication failed for Plinko', {
                    isAuthenticated: session?.isAuthenticated
                });
            }

            return session;
        } catch (error) {
            plinkoLogger.error('❌ [AUTH] SSO authentication error for Plinko', {
                error: error.message,
                appType
            });
            throw error;
        }
    }

    public async verifySession(): Promise<SSOResponse | null> {
        plinkoLogger.info('🔐 [AUTH] Verifying session for Plinko');

        try {
            const session = await sharedVerifySession();

            if (session) {
                this.updateAuthState({
                    isAuthenticated: session.isAuthenticated,
                    isUM: session.isUM,
                    session,
                    username: session.username
                });

                plinkoLogger.info('✅ [AUTH] Session verification successful for Plinko', {
                    username: session.username,
                    isAuthenticated: session.isAuthenticated,
                    isUM: session.isUM
                });
            } else {
                plinkoLogger.warn('❌ [AUTH] Session verification failed for Plinko');
                this.updateAuthState({
                    isAuthenticated: false,
                    isUM: false,
                    session: null,
                    username: null
                });
            }

            return session;
        } catch (error) {
            plinkoLogger.error('❌ [AUTH] Session verification error for Plinko', {
                error: error.message
            });
            throw error;
        }
    }

    public async authorize(): Promise<AuthorizeResponse | null> {
        const { session } = this.authState;

        if (!session) {
            plinkoLogger.warn('❌ [AUTH] Cannot authorize - no session available');
            return null;
        }

        plinkoLogger.info('🔐 [AUTH] Starting authorization for Plinko', {
            username: session.username
        });

        try {
            const authorizeResponse = await sharedAuthorize(session);

            if (authorizeResponse) {
                this.updateAuthState({
                    authorizeResponse: authorizeResponse as AuthorizeResponse,
                    balance: (authorizeResponse as AuthorizeResponse).user?.red || 0
                });

                plinkoLogger.info('✅ [AUTH] Authorization successful for Plinko', {
                    username: session.username,
                    balance: (authorizeResponse as AuthorizeResponse).user?.red || 0
                });
            } else {
                plinkoLogger.warn('❌ [AUTH] Authorization failed for Plinko', {
                    username: session.username
                });
            }

            return authorizeResponse as AuthorizeResponse;
        } catch (error) {
            plinkoLogger.error('❌ [AUTH] Authorization error for Plinko', {
                error: error.message,
                username: session.username
            });
            throw error;
        }
    }

    public async refreshBalance(): Promise<number> {
        const { session } = this.authState;

        if (!session) {
            plinkoLogger.warn('❌ [AUTH] Cannot get balance - no session available');
            return 0;
        }

        plinkoLogger.info('💰 [AUTH] Getting balance for Plinko', {
            username: session.username
        });

        try {
            const balanceResponse = await sharedGetBalance(session);

            if (balanceResponse.isSuccessful) {
                this.updateAuthState({
                    balance: balanceResponse.balance
                });

                plinkoLogger.info('✅ [AUTH] Balance retrieved successfully for Plinko', {
                    username: session.username,
                    balance: balanceResponse.balance
                });

                return balanceResponse.balance;
            } else {
                plinkoLogger.warn('❌ [AUTH] Failed to get balance for Plinko', {
                    username: session.username,
                    errorCode: balanceResponse.errorCode
                });
                return 0;
            }
        } catch (error) {
            plinkoLogger.error('❌ [AUTH] Get balance error for Plinko', {
                error: error.message,
                username: session.username
            });
            throw error;
        }
    }

    public async reCheckIn(): Promise<boolean> {
        const { session } = this.authState;

        if (!session) {
            plinkoLogger.warn('❌ [AUTH] Cannot re-check-in - no session available');
            return false;
        }

        plinkoLogger.info('🔐 [AUTH] Re-check-in for Plinko', {
            username: session.username
        });

        try {
            const result = await sharedReCheckIn(session);

            plinkoLogger.info('✅ [AUTH] Re-check-in completed for Plinko', {
                username: session.username,
                success: !!result
            });

            return !!result;
        } catch (error) {
            plinkoLogger.error('❌ [AUTH] Re-check-in error for Plinko', {
                error: error.message,
                username: session.username
            });
            throw error;
        }
    }

    public clearSession(): void {
        plinkoLogger.info('🔐 [AUTH] Clearing session for Plinko');

        sharedClearSession();
        this.updateAuthState({
            isAuthenticated: false,
            isUM: false,
            session: null,
            authorizeResponse: null,
            balance: 0,
            username: null
        });
    }

    public getAuthState(): PlinkoAuthState {
        return { ...this.authState };
    }

    public subscribeToAuthState(callback: (state: PlinkoAuthState) => void): () => void {
        this.authStateCallbacks.push(callback);

        plinkoLogger.debug('🔐 [AUTH] Subscribed to auth state updates', {
            totalSubscribers: this.authStateCallbacks.length
        });

        // Return unsubscribe function
        return () => {
            const index = this.authStateCallbacks.indexOf(callback);
            if (index > -1) {
                this.authStateCallbacks.splice(index, 1);
                plinkoLogger.debug('🔐 [AUTH] Unsubscribed from auth state updates', {
                    remainingSubscribers: this.authStateCallbacks.length
                });
            }
        };
    }

    public updateBalance(balance: number): void {
        plinkoLogger.info('💰 [AUTH] Updating balance in auth state', {
            oldBalance: this.authState.balance,
            newBalance: balance
        });

        this.updateAuthState({
            balance
        });
    }

    private updateAuthState(updates: Partial<PlinkoAuthState>): void {
        const oldState = { ...this.authState };
        this.authState = { ...this.authState, ...updates };

        plinkoLogger.debug('🔐 [AUTH] Auth state updated', {
            changes: Object.keys(updates),
            isAuthenticated: this.authState.isAuthenticated,
            username: this.authState.username,
            balance: this.authState.balance
        });

        // Notify all subscribers
        this.authStateCallbacks.forEach(callback => {
            try {
                callback(this.authState);
            } catch (error) {
                plinkoLogger.error('🔐 [AUTH] Error in auth state callback', {
                    error: error.message
                });
            }
        });
    }

    public isAuthenticated(): boolean {
        return this.authState.isAuthenticated;
    }

    public isUM(): boolean {
        return this.authState.isUM;
    }

    public getSession(): SSOResponse | null {
        return this.authState.session;
    }

    public getAuthorizeResponse(): AuthorizeResponse | null {
        return this.authState.authorizeResponse;
    }

    public getBalance(): number {
        return this.authState.balance;
    }

    public getUsername(): string | null {
        return this.authState.username;
    }
}

// Singleton instance
let authServiceInstance: PlinkoAuthService | null = null;

export function getPlinkoAuthService(): PlinkoAuthService {
    if (!authServiceInstance) {
        authServiceInstance = new PlinkoAuthService();
    }
    return authServiceInstance;
}

export function initializePlinkoAuthService(): PlinkoAuthService {
    authServiceInstance = new PlinkoAuthService();
    return authServiceInstance;
}
