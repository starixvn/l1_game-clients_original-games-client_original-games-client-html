import { SSOResponse, AuthorizeResponse } from "sc-user-service-client/dist/auth";

import { AnalyticsHelper, localStorageKeys, StorageHelper } from '@shared/helpers';
import { UserClientCommunication } from "./user-client-communication";
import { logger } from "./logger";
import { fileLoadingLogger } from '../helpers/file-loading-logger';

const authService = UserClientCommunication?.getUserClientInstance()?.auth;
const lobbyService = UserClientCommunication?.getUserClientInstance()?.lobby;

export const sso = async (token: string, appType: number): Promise<SSOResponse> => {
    const startTime = Date.now();
    const apiUrl = 'https://l2-proxy1.lumigame.com/user/auth/session/verify';

    logger.info('🔐 [AUTH] SSO authentication initiated', {
        appType,
        tokenLength: token?.length,
        apiUrl,
        timestamp: new Date().toISOString()
    });

    // Track API call
    fileLoadingLogger.trackAPICall(apiUrl, 'POST', { appType, tokenLength: token?.length });

    try {
        const userSession = await authService?.sso(token, appType);
        const responseTime = Date.now() - startTime;

        if (userSession?.isAuthenticated) {
            logger.info('✅ [AUTH] SSO authentication successful', {
                username: userSession.username,
                isAuthenticated: userSession.isAuthenticated,
                isUM: userSession.isUM,
                responseTime: `${responseTime}ms`,
                apiUrl
            });

            // Track successful API response
            fileLoadingLogger.trackAPIResponse(apiUrl, 200, responseTime, {
                username: userSession.username,
                isAuthenticated: userSession.isAuthenticated,
                isUM: userSession.isUM
            });

            StorageHelper.set(localStorageKeys.session, userSession);
        } else {
            logger.warn('⚠️ [AUTH] SSO authentication failed - not authenticated', {
                isAuthenticated: userSession?.isAuthenticated,
                responseTime: `${responseTime}ms`,
                apiUrl
            });

            // Track failed API response
            fileLoadingLogger.trackAPIResponse(apiUrl, 401, responseTime, {
                isAuthenticated: userSession?.isAuthenticated
            });
        }

        return userSession;
    } catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error('❌ [AUTH] SSO authentication error', {
            error: error.message,
            appType,
            responseTime: `${responseTime}ms`,
            apiUrl,
            stack: error.stack
        });

        // Track error API response
        fileLoadingLogger.trackAPIResponse(apiUrl, 500, responseTime, { error: error.message });

        throw error;
    }
};

export const verifySession = async (): Promise<SSOResponse> => {
    logger.info('Session verification initiated');

    const userSession = StorageHelper.get<SSOResponse>(localStorageKeys.session);

    if (!userSession) {
        logger.warn('No user session found in storage');
        return null;
    }

    logger.info('Verifying session for user', { username: userSession.username });

    try {
        const verifySessionResponse = await authService?.verifySession(userSession?.ss, userSession?.username);

        if (verifySessionResponse) {
            userSession.isUM = verifySessionResponse.isUM;
            userSession.umInfo = verifySessionResponse.umInfo;

            if (verifySessionResponse.isSuccessful) {
                logger.info('Session verification successful', {
                    username: userSession.username,
                    isUM: verifySessionResponse.isUM,
                    isSuccessful: verifySessionResponse.isSuccessful
                });
                StorageHelper.set(localStorageKeys.session, userSession);
                AnalyticsHelper.setPlayerSession(userSession);
            } else {
                logger.warn('Session verification failed', {
                    username: userSession.username,
                    isSuccessful: verifySessionResponse.isSuccessful
                });
            }
        } else {
            logger.warn('No response from session verification', { username: userSession.username });
        }

        const result = verifySessionResponse.isSuccessful || userSession.isUM ? userSession : null;
        logger.info('Session verification result', {
            username: userSession.username,
            isValid: !!result
        });

        return result;
    } catch (error) {
        logger.error('Session verification error', { error, username: userSession.username });
        throw error;
    }
};

export const clearSession = () => {
    logger.info('Clearing user session');
    StorageHelper.remove(localStorageKeys.session);
};

export const reCheckIn = async (userSession: SSOResponse) => {
    logger.info('Re-check-in initiated', { username: userSession?.username });

    try {
        const result = await authService?.reCheckIn(userSession?.ss, userSession?.username);
        logger.info('Re-check-in completed', {
            username: userSession?.username,
            success: !!result
        });
        return result;
    } catch (error) {
        logger.error('Re-check-in error', { error, username: userSession?.username });
        throw error;
    }
};

export const createNickname = async (userSession: SSOResponse, nickname: string, avatarId: number) => {
    logger.info('Creating nickname', {
        username: userSession.username,
        nickname,
        avatarId
    });

    try {
        const result = await authService?.signName(userSession.ss, userSession.username, nickname, avatarId);
        logger.info('Nickname creation completed', {
            username: userSession.username,
            nickname,
            success: !!result
        });
        return result;
    } catch (error) {
        logger.error('Nickname creation error', {
            error,
            username: userSession.username,
            nickname,
            avatarId
        });
        throw error;
    }
};

export const authorize = async (userSession: SSOResponse) => {
    const startTime = Date.now();
    const apiUrl = 'https://l2-proxy1.lumigame.com/user/auth/authorize';

    logger.info('🔑 [AUTH] Authorization initiated', {
        username: userSession.username,
        apiUrl,
        timestamp: new Date().toISOString()
    });

    // Track API call
    fileLoadingLogger.trackAPICall(apiUrl, 'POST', {
        username: userSession.username,
        sessionToken: userSession.ss?.substring(0, 10) + '...' // Truncate for security
    });

    try {
        const result = await authService?.authorize(userSession.ss, userSession.username);
        const responseTime = Date.now() - startTime;

        logger.info('✅ [AUTH] Authorization completed', {
            username: userSession.username,
            success: !!result,
            responseTime: `${responseTime}ms`,
            apiUrl,
            authorized: (result as AuthorizeResponse)?.authorized,
            hasUser: !!(result as AuthorizeResponse)?.user
        });

        // Track successful API response
        fileLoadingLogger.trackAPIResponse(apiUrl, 200, responseTime, {
            username: userSession.username,
            authorized: (result as AuthorizeResponse)?.authorized,
            hasUser: !!(result as AuthorizeResponse)?.user
        });

        return result;
    } catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error('❌ [AUTH] Authorization error', {
            error: error.message,
            username: userSession.username,
            responseTime: `${responseTime}ms`,
            apiUrl,
            stack: error.stack
        });

        // Track error API response
        fileLoadingLogger.trackAPIResponse(apiUrl, 500, responseTime, {
            error: error.message,
            username: userSession.username
        });

        throw error;
    }
};

export const getBalance = async (userSession: SSOResponse) => {
    const startTime = Date.now();
    const apiUrl = 'https://l2-proxy1.lumigame.com/user/auth/balance';

    logger.info('💰 [AUTH] Getting balance', {
        username: userSession.username,
        apiUrl,
        timestamp: new Date().toISOString()
    });

    // Track API call
    fileLoadingLogger.trackAPICall(apiUrl, 'POST', {
        username: userSession.username,
        sessionToken: userSession.ss?.substring(0, 10) + '...' // Truncate for security
    });

    try {
        const result = await authService?.getBalance(userSession.ss, userSession.username);
        const responseTime = Date.now() - startTime;

        logger.info('✅ [AUTH] Balance retrieved', {
            username: userSession.username,
            balance: result,
            responseTime: `${responseTime}ms`,
            apiUrl,
            isSuccessful: result?.isSuccessful,
            balanceAmount: result?.balance
        });

        // Track successful API response
        fileLoadingLogger.trackAPIResponse(apiUrl, 200, responseTime, {
            username: userSession.username,
            isSuccessful: result?.isSuccessful,
            balanceAmount: result?.balance
        });

        return result;
    } catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error('❌ [AUTH] Get balance error', {
            error: error.message,
            username: userSession.username,
            responseTime: `${responseTime}ms`,
            apiUrl,
            stack: error.stack
        });

        // Track error API response
        fileLoadingLogger.trackAPIResponse(apiUrl, 500, responseTime, {
            error: error.message,
            username: userSession.username
        });

        throw error;
    }
};

export const getLobbyConfigs = async (userSession: SSOResponse) => {
    logger.info('Getting lobby configs', { username: userSession.username });

    try {
        const result = await lobbyService?.getLobbyConfigs(userSession.ss, userSession.username);
        logger.info('Lobby configs retrieved', {
            username: userSession.username,
            hasResult: !!result
        });
        return result;
    } catch (error) {
        logger.error('Get lobby configs error', { error, username: userSession.username });
        throw error;
    }
};
