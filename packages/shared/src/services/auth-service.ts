import { SSOResponse } from "sc-user-service-client/dist/auth";

import { AnalyticsHelper, localStorageKeys, StorageHelper } from '@shared/helpers';
import { UserClientCommunication } from "./user-client-communication";
import { logger } from "./logger";

const authService = UserClientCommunication?.getUserClientInstance()?.auth;
const lobbyService = UserClientCommunication?.getUserClientInstance()?.lobby;

export const sso = async (token: string, appType: number): Promise<SSOResponse> => {
    logger.info('SSO authentication initiated', { appType, tokenLength: token?.length });

    try {
        const userSession = await authService?.sso(token, appType);

        if (userSession?.isAuthenticated) {
            logger.info('SSO authentication successful', {
                username: userSession.username,
                isAuthenticated: userSession.isAuthenticated,
                isUM: userSession.isUM
            });
            StorageHelper.set(localStorageKeys.session, userSession);
        } else {
            logger.warn('SSO authentication failed - not authenticated', {
                isAuthenticated: userSession?.isAuthenticated
            });
        }

        return userSession;
    } catch (error) {
        logger.error('SSO authentication error', { error, appType });
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
    logger.info('Authorization initiated', { username: userSession.username });

    try {
        const result = await authService?.authorize(userSession.ss, userSession.username);
        logger.info('Authorization completed', {
            username: userSession.username,
            success: !!result
        });
        return result;
    } catch (error) {
        logger.error('Authorization error', { error, username: userSession.username });
        throw error;
    }
};

export const getBalance = async (userSession: SSOResponse) => {
    logger.info('Getting balance', { username: userSession.username });

    try {
        const result = await authService?.getBalance(userSession.ss, userSession.username);
        logger.info('Balance retrieved', {
            username: userSession.username,
            balance: result
        });
        return result;
    } catch (error) {
        logger.error('Get balance error', { error, username: userSession.username });
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
