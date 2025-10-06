import { logger } from '../services/logger';

/**
 * Utility to enable logging for debugging
 * Call this function in the browser console or add it to your app initialization
 */
export const enableLogging = () => {
    logger.expand(); // Show full functionality
    logger.start(); // Start logging

    // Make logger available globally for easy access
    (window as any).plinkoLogger = logger;

    console.log('🔧 [LOGGING] Plinko logging enabled!');
    console.log('🔧 [LOGGING] Use window.plinkoLogger to access logger methods:');
    console.log('🔧 [LOGGING] - window.plinkoLogger.info(message, data)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.warn(message, data)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.error(message, data)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.debug(message, data)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.downloadLogs()');
    console.log('🔧 [LOGGING] - window.plinkoLogger.getLogs()');
    console.log('🔧 [LOGGING] - window.plinkoLogger.clear()');

    return logger;
};

/**
 * Utility to disable logging
 */
export const disableLogging = () => {
    logger.stop();
    logger.collapse();
    console.log('🔧 [LOGGING] Plinko logging disabled!');
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
