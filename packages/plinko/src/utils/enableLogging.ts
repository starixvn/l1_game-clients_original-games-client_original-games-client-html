import { logger } from '../services/logger';

/**
 * Utility to enable logging for debugging
 * Call this function in the browser console or add it to your app initialization
 */
export const enableLogging = () => {
    // Make logger available globally for easy access (only in browser environment)
    if (typeof window !== 'undefined') {
        (window as any).plinkoLogger = logger;
    }

    // Logging instructions removed for production

    return logger;
};

/**
 * Utility to disable logging
 */
export const disableLogging = () => {
    logger.stopAutoOperations();
    // Logging disabled message removed for production
};

/**
 * Utility to download current logs
 */
export const downloadLogs = () => {
    logger.downloadLogs();
};

// Make utilities available globally
(window as any).enablePlinkoLogging = enableLogging;
(window as any).disablePlinkoLogging = disableLogging;
(window as any).downloadPlinkoLogs = downloadLogs;
