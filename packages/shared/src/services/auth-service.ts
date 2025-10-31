import { SSOResponse } from "sc-user-service-client/dist/auth";

import { AnalyticsHelper, localStorageKeys, StorageHelper } from '@shared/helpers';
import { UserClientCommunication } from "./user-client-communication";
import { StandaloneMode } from "@shared/utils/constant";

const authService = UserClientCommunication?.getUserClientInstance()?.auth;
const lobbyService = UserClientCommunication?.getUserClientInstance()?.lobby;

export const sso = async (token: string, appType: number): Promise<SSOResponse> => {
    const standaloneMode = StorageHelper.get<Partial<StandaloneMode>>(localStorageKeys.standaloneMode);

    try {
        const userSession: SSOResponse & Partial<StandaloneMode> = await authService?.sso(token, appType);

        if (userSession?.isAuthenticated) {
            if (standaloneMode?.isStandalone) {
                userSession.isStandalone = true;
                userSession.cg = standaloneMode.cg;
                userSession.op = standaloneMode.op;
                userSession.lang = standaloneMode.lang;
                userSession.rurl = standaloneMode.rurl;
                userSession.lurl = standaloneMode.lurl;
            }

            StorageHelper.set(localStorageKeys.session, userSession);
        }

        return userSession;
    } catch (error) {
        throw error;
    }
};

export const verifySession = async (): Promise<SSOResponse> => {
    const userSession = StorageHelper.get<SSOResponse>(localStorageKeys.session);

    if (!userSession) {
        return null;
    }

    try {
        const verifySessionResponse = await authService?.verifySession(userSession?.ss, userSession?.username);

        if (verifySessionResponse) {
            userSession.isUM = verifySessionResponse.isUM;
            userSession.umInfo = verifySessionResponse.umInfo;

            if (verifySessionResponse.isSuccessful) {
                userSession.isAuthenticated = true;
                StorageHelper.set(localStorageKeys.session, userSession);
                AnalyticsHelper.setPlayerSession(userSession);
            }
        }

        const result = verifySessionResponse.isSuccessful || userSession.isUM ? userSession : null;
        return result;
    } catch (error) {
        throw error;
    }
};

export const clearSession = () => {
    StorageHelper.remove(localStorageKeys.session);
};

export const reCheckIn = async (userSession: SSOResponse) => {
    try {
        const result = await authService?.reCheckIn(userSession?.ss, userSession?.username);
        return result;
    } catch (error) {
        throw error;
    }
};

export const createNickname = async (userSession: SSOResponse, nickname: string, avatarId: number) => {
    try {
        const result = await authService?.signName(userSession.ss, userSession.username, nickname, avatarId);
        return result;
    } catch (error) {
        throw error;
    }
};

export const authorize = async (userSession: SSOResponse) => {
    try {
        const result = await authService?.authorize(userSession.ss, userSession.username);
        return result;
    } catch (error) {
        throw error;
    }
};

export const getBalance = async (userSession: SSOResponse) => {
    try {
        const result = await authService?.getBalance(userSession.ss, userSession.username);
        return result;
    } catch (error) {
        throw error;
    }
};

export const getLobbyConfigs = async (userSession: SSOResponse) => {
    try {
        const result = await lobbyService?.getLobbyConfigs(userSession.ss, userSession.username);
        return result;
    } catch (error) {
        throw error;
    }
};
