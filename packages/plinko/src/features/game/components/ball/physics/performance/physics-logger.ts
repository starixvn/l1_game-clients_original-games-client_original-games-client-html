/**
 * Physics Logger Utility
 * Centralized logging system for physics operations with configurable levels
 * and structured data for monitoring and debugging
 */

import { logger } from '../../../../../../services/logger';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}

export interface PhysicsLogContext {
    component: string;
    function: string;
    timestamp: number;
    performance?: {
        startTime: number;
        endTime?: number;
        duration?: number;
    };
    metadata?: Record<string, any>;
}

export interface PhysicsLoggerConfig {
    level: LogLevel;
    enablePerformanceTracking: boolean;
    enableStackTraces: boolean;
    maxLogEntries: number;
}

/**
 * Physics Logger Class
 * Provides structured logging for physics operations
 */
export class PhysicsLogger {
    private static instance: PhysicsLogger;
    private config: PhysicsLoggerConfig;
    private logHistory: Array<{ level: LogLevel; message: string; context: PhysicsLogContext }> = [];

    private constructor() {
        this.config = {
            level: LogLevel.INFO,
            enablePerformanceTracking: true,
            enableStackTraces: false,
            maxLogEntries: 1000
        };
    }

    static getInstance(): PhysicsLogger {
        if (!PhysicsLogger.instance) {
            PhysicsLogger.instance = new PhysicsLogger();
        }
        return PhysicsLogger.instance;
    }

    configure(config: Partial<PhysicsLoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.config.level;
    }

    private formatMessage(level: LogLevel, message: string, context: PhysicsLogContext): string {
        const timestamp = new Date(context.timestamp).toISOString();
        const levelStr = LogLevel[level];
        const perfInfo = context.performance?.duration ?
            ` [${context.performance.duration.toFixed(2)}ms]` : '';

        return `[${timestamp}] ${levelStr} [${context.component}:${context.function}]${perfInfo} ${message}`;
    }

    private addToHistory(level: LogLevel, message: string, context: PhysicsLogContext): void {
        this.logHistory.push({ level, message, context });
        if (this.logHistory.length > this.config.maxLogEntries) {
            this.logHistory.shift();
        }
    }

    debug(message: string, context: Omit<PhysicsLogContext, 'timestamp'>): void {
        if (!this.shouldLog(LogLevel.DEBUG)) { return; }

        const fullContext: PhysicsLogContext = {
            ...context,
            timestamp: Date.now()
        };

        const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, fullContext);
        logger.debug(formattedMessage, fullContext.metadata);

        this.addToHistory(LogLevel.DEBUG, message, fullContext);
    }

    info(message: string, context: Omit<PhysicsLogContext, 'timestamp'>): void {
        if (!this.shouldLog(LogLevel.INFO)) { return; }

        const fullContext: PhysicsLogContext = {
            ...context,
            timestamp: Date.now()
        };

        const formattedMessage = this.formatMessage(LogLevel.INFO, message, fullContext);
        logger.info(formattedMessage, fullContext.metadata);

        this.addToHistory(LogLevel.INFO, message, fullContext);
    }

    warn(message: string, context: Omit<PhysicsLogContext, 'timestamp'>): void {
        if (!this.shouldLog(LogLevel.WARN)) { return; }

        const fullContext: PhysicsLogContext = {
            ...context,
            timestamp: Date.now()
        };

        const formattedMessage = this.formatMessage(LogLevel.WARN, message, fullContext);
        logger.warn(formattedMessage, fullContext.metadata);

        this.addToHistory(LogLevel.WARN, message, fullContext);
    }

    error(message: string, context: Omit<PhysicsLogContext, 'timestamp'>, error?: Error): void {
        if (!this.shouldLog(LogLevel.ERROR)) { return; }

        const fullContext: PhysicsLogContext = {
            ...context,
            timestamp: Date.now()
        };

        const formattedMessage = this.formatMessage(LogLevel.ERROR, message, fullContext);

        // Create error metadata combining context metadata and error info
        const errorMetadata = {
            ...fullContext.metadata,
            ...(error && { error: error.message, stack: this.config.enableStackTraces ? error.stack : undefined })
        };

        logger.error(formattedMessage, errorMetadata);

        this.addToHistory(LogLevel.ERROR, message, fullContext);
    }

    /**
     * Performance tracking wrapper for functions
     */
    trackPerformance<T>(
        fn: () => T,
        context: Omit<PhysicsLogContext, 'timestamp' | 'performance'>
    ): T {
        if (!this.config.enablePerformanceTracking) {
            return fn();
        }

        const startTime = performance.now();
        const perfContext: PhysicsLogContext = {
            ...context,
            timestamp: Date.now(),
            performance: { startTime }
        };

        try {
            const result = fn();
            const endTime = performance.now();
            perfContext.performance.endTime = endTime;
            perfContext.performance.duration = endTime - startTime;

            this.debug('Function completed successfully', perfContext);
            return result;
        } catch (error) {
            const endTime = performance.now();
            perfContext.performance.endTime = endTime;
            perfContext.performance.duration = endTime - startTime;

            this.error('Function threw an exception', perfContext, error as Error);
            throw error;
        }
    }

    /**
     * Get recent log entries
     */
    getLogHistory(level?: LogLevel): Array<{ level: LogLevel; message: string; context: PhysicsLogContext }> {
        if (level !== undefined) {
            return this.logHistory.filter(entry => entry.level >= level);
        }
        return [...this.logHistory];
    }

    /**
     * Clear log history
     */
    clearHistory(): void {
        this.logHistory = [];
    }

    /**
     * Export logs for debugging
     */
    exportLogs(): string {
        return JSON.stringify(this.logHistory, null, 2);
    }
}

// Global logger instance
export const physicsLogger = PhysicsLogger.getInstance();

/**
 * Convenience functions for common physics logging scenarios
 */
export const PhysicsLog = {
    ball: {
        scaling: (message: string, metadata?: Record<string, any>) =>
            physicsLogger.info(message, { component: 'BallScaling', function: 'unknown', metadata }),

        physics: (message: string, metadata?: Record<string, any>) =>
            physicsLogger.info(message, { component: 'BallPhysics', function: 'unknown', metadata }),

        properties: (message: string, metadata?: Record<string, any>) =>
            physicsLogger.info(message, { component: 'BallProperties', function: 'unknown', metadata })
    },

    collision: {
        detection: (message: string, metadata?: Record<string, any>) =>
            physicsLogger.debug(message, { component: 'CollisionDetection', function: 'unknown', metadata }),

        response: (message: string, metadata?: Record<string, any>) =>
            physicsLogger.debug(message, { component: 'CollisionResponse', function: 'unknown', metadata }),

        cooldown: (message: string, metadata?: Record<string, any>) =>
            physicsLogger.debug(message, { component: 'CollisionCooldown', function: 'unknown', metadata })
    },

    performance: {
        warning: (message: string, metadata?: Record<string, any>) =>
            physicsLogger.warn(message, { component: 'Performance', function: 'unknown', metadata }),

        error: (message: string, metadata?: Record<string, any>) =>
            physicsLogger.error(message, { component: 'Performance', function: 'unknown', metadata })
    }
};
