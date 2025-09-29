import { SSOResponse } from "sc-user-service-client/dist/auth";
import { UserClientCommunication } from "./user-client-communication";
import { logger } from "./logger";
import { fileLoadingLogger } from '../helpers/file-loading-logger';

const userClientInstance = UserClientCommunication?.getUserClientInstance();
const userSettingsService = userClientInstance?.userSettings;
const chipSettings = userClientInstance?.setting;

export const updateSignInSMStatus = async (userSession: SSOResponse) => {
    const startTime = Date.now();
    const apiUrl = 'https://l2-proxy1.lumigame.com/user/settings';
    
    logger.info('⚙️ [USER-SETTINGS] Updating sign-in SM status', { 
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
        const result = await userSettingsService?.updateSignInSMStatus(userSession.ss, userSession.username);
        const responseTime = Date.now() - startTime;
        
        logger.info('✅ [USER-SETTINGS] Sign-in SM status updated', {
            username: userSession.username,
            result,
            responseTime: `${responseTime}ms`,
            apiUrl
        });
        
        // Track successful API response
        fileLoadingLogger.trackAPIResponse(apiUrl, 200, responseTime, {
            username: userSession.username,
            result
        });
        
        return result;
    } catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error('❌ [USER-SETTINGS] Update sign-in SM status error', { 
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

export const getChipSettings = async (userSession: SSOResponse) => {
    const startTime = Date.now();
    const apiUrl = 'https://l2-proxy1.lumigame.com/user/settings';
    
    logger.info('🎯 [USER-SETTINGS] Getting chip settings', { 
        username: userSession.username,
        apiUrl,
        timestamp: new Date().toISOString()
    });

    // Track API call
    fileLoadingLogger.trackAPICall(apiUrl, 'GET', { 
        username: userSession.username,
        sessionToken: userSession.ss?.substring(0, 10) + '...' // Truncate for security
    });

    try {
        const result = await chipSettings?.getSettings(userSession.ss, userSession.username);
        const responseTime = Date.now() - startTime;
        
        logger.info('✅ [USER-SETTINGS] Chip settings retrieved', {
            username: userSession.username,
            hasSettings: !!result,
            responseTime: `${responseTime}ms`,
            apiUrl,
            settingsCount: result ? Object.keys(result).length : 0
        });
        
        // Track successful API response
        fileLoadingLogger.trackAPIResponse(apiUrl, 200, responseTime, {
            username: userSession.username,
            hasSettings: !!result,
            settingsCount: result ? Object.keys(result).length : 0
        });
        
        return result;
    } catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error('❌ [USER-SETTINGS] Get chip settings error', { 
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
