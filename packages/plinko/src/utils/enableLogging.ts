import { logger } from '../services/logger';

/**
 * Utility to enable logging for debugging
 * Call this function in the browser console or add it to your app initialization
 */
export const enableLogging = () => {
    logger.expand(); // Show full functionality
    logger.start(); // Start logging

    // Make logger available globally for easy access (only in browser environment)
    if (typeof window !== 'undefined') {
        (window as any).plinkoLogger = logger;
    }

    console.log('🔧 [LOGGING] Plinko logging enabled!');
    console.log('🔧 [LOGGING] Use window.plinkoLogger to access logger methods:');
    console.log('🔧 [LOGGING] Basic methods:');
    console.log('🔧 [LOGGING] - window.plinkoLogger.info(message, data, context)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.warn(message, data, context)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.error(message, data, context)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.debug(message, data, context)');
    console.log('🔧 [LOGGING] Workflow tracking:');
    console.log('🔧 [LOGGING] - window.plinkoLogger.startWorkflow(id, category, description)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.endWorkflow(id)');
    console.log('🔧 [LOGGING] Specialized logging:');
    console.log('🔧 [LOGGING] - window.plinkoLogger.logApiRequest(endpoint, method, data)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.logSocketEvent(event, direction, data)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.logStateChange(component, oldState, newState)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.logBetAction(action, data)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.logGameEvent(event, data)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.logPhysicsEvent(event, data)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.logUIEvent(event, data)');
    console.log('🔧 [LOGGING] - window.plinkoLogger.logError(error, contextData)');
    console.log('🔧 [LOGGING] Utilities:');
    console.log('🔧 [LOGGING] - window.plinkoLogger.downloadLogs()');
    console.log('🔧 [LOGGING] - window.plinkoLogger.getLogs()');
    console.log('🔧 [LOGGING] - window.plinkoLogger.clear()');
    console.log('🔧 [LOGGING] - window.plinkoLogger.getStatus()');
    console.log('🔧 [LOGGING] - window.plinkoLogger.getActiveWorkflows()');

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
