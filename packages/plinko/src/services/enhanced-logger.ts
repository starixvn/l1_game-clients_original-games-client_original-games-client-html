import { logger as sharedLogger } from '@shared/services/logger';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    component: string;
    message: string;
    data?: any;
    sessionId?: string;
    userId?: string;
    gameId?: number;
}

export interface LoggerConfig {
    enableConsole: boolean;
    enableStorage: boolean;
    enableRemote: boolean;
    maxStorageEntries: number;
    logLevel: LogLevel;
    remoteEndpoint?: string;
}

class PlinkoEnhancedLogger {
    private config: LoggerConfig;
    private logStorage: LogEntry[] = [];
    private sessionId: string;
    private userId: string | null = null;
    private gameId: number = 145; // Plinko game ID

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = {
            enableConsole: true,
            enableStorage: true,
            enableRemote: false,
            maxStorageEntries: 1000,
            logLevel: LogLevel.INFO,
            ...config
        };

        this.sessionId = this.generateSessionId();
        this.initializeLogger();
    }

    private generateSessionId(): string {
        return `plinko_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private initializeLogger(): void {
        if (this.config.enableStorage) {
            this.loadStoredLogs();
        }

        // Log initialization
        this.info('🔧 [LOGGER] Enhanced logger initialized', {
            sessionId: this.sessionId,
            config: this.config
        });
    }

    private loadStoredLogs(): void {
        try {
            const stored = localStorage.getItem('plinko_logs');
            if (stored) {
                this.logStorage = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load stored logs:', error);
        }
    }

    private saveLogs(): void {
        if (!this.config.enableStorage) return;

        try {
            // Keep only the most recent entries
            if (this.logStorage.length > this.config.maxStorageEntries) {
                this.logStorage = this.logStorage.slice(-this.config.maxStorageEntries);
            }
            localStorage.setItem('plinko_logs', JSON.stringify(this.logStorage));
        } catch (error) {
            console.warn('Failed to save logs:', error);
        }
    }

    private createLogEntry(level: LogLevel, component: string, message: string, data?: any): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            data,
            sessionId: this.sessionId,
            userId: this.userId,
            gameId: this.gameId
        };
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.config.logLevel;
    }

    private log(level: LogLevel, component: string, message: string, data?: any): void {
        if (!this.shouldLog(level)) return;

        const entry = this.createLogEntry(level, component, message, data);

        // Console logging
        if (this.config.enableConsole) {
            this.logToConsole(entry);
        }

        // Storage logging
        if (this.config.enableStorage) {
            this.logStorage.push(entry);
            this.saveLogs();
        }

        // Remote logging
        if (this.config.enableRemote && this.config.remoteEndpoint) {
            this.logToRemote(entry);
        }

        // Shared logger integration
        this.logToShared(entry);
    }

    private logToConsole(entry: LogEntry): void {
        const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        const levelName = levelNames[entry.level];
        const prefix = `[${entry.timestamp}] [${levelName}] [${entry.component}]`;

        switch (entry.level) {
            case LogLevel.DEBUG:
                console.debug(prefix, entry.message, entry.data || '');
                break;
            case LogLevel.INFO:
                console.info(prefix, entry.message, entry.data || '');
                break;
            case LogLevel.WARN:
                console.warn(prefix, entry.message, entry.data || '');
                break;
            case LogLevel.ERROR:
                console.error(prefix, entry.message, entry.data || '');
                break;
        }
    }

    private logToShared(entry: LogEntry): void {
        const logData = {
            ...entry.data,
            sessionId: entry.sessionId,
            userId: entry.userId,
            gameId: entry.gameId,
            component: entry.component
        };

        switch (entry.level) {
            case LogLevel.DEBUG:
                sharedLogger.debug(entry.message, logData);
                break;
            case LogLevel.INFO:
                sharedLogger.info(entry.message, logData);
                break;
            case LogLevel.WARN:
                sharedLogger.warn(entry.message, logData);
                break;
            case LogLevel.ERROR:
                sharedLogger.error(entry.message, logData);
                break;
        }
    }

    private async logToRemote(entry: LogEntry): Promise<void> {
        if (!this.config.remoteEndpoint) return;

        try {
            await fetch(this.config.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entry)
            });
        } catch (error) {
            console.warn('Failed to send log to remote endpoint:', error);
        }
    }

    // Public logging methods
    public debug(component: string, message: string, data?: any): void {
        this.log(LogLevel.DEBUG, component, message, data);
    }

    public info(component: string, message: string, data?: any): void {
        this.log(LogLevel.INFO, component, message, data);
    }

    public warn(component: string, message: string, data?: any): void {
        this.log(LogLevel.WARN, component, message, data);
    }

    public error(component: string, message: string, data?: any): void {
        this.log(LogLevel.ERROR, component, message, data);
    }

    // User and session management
    public setUserId(userId: string): void {
        this.userId = userId;
        this.info('🔐 [LOGGER] User ID set', { userId });
    }

    public setGameId(gameId: number): void {
        this.gameId = gameId;
        this.info('🎮 [LOGGER] Game ID set', { gameId });
    }

    public clearUserId(): void {
        this.userId = null;
        this.info('🔐 [LOGGER] User ID cleared');
    }

    // Configuration management
    public updateConfig(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
        this.info('🔧 [LOGGER] Configuration updated', { config });
    }

    public setLogLevel(level: LogLevel): void {
        this.config.logLevel = level;
        this.info('🔧 [LOGGER] Log level updated', { level });
    }

    // Log retrieval and management
    public getLogs(filter?: Partial<LogEntry>): LogEntry[] {
        if (!filter) return [...this.logStorage];

        return this.logStorage.filter(entry => {
            return Object.entries(filter).every(([key, value]) => {
                return entry[key as keyof LogEntry] === value;
            });
        });
    }

    public getLogsByComponent(component: string): LogEntry[] {
        return this.getLogs({ component });
    }

    public getLogsByLevel(level: LogLevel): LogEntry[] {
        return this.getLogs({ level });
    }

    public getRecentLogs(count: number = 50): LogEntry[] {
        return this.logStorage.slice(-count);
    }

    public clearLogs(): void {
        this.logStorage = [];
        this.saveLogs();
        this.info('🧹 [LOGGER] Logs cleared');
    }

    public exportLogs(): string {
        const exportData = {
            sessionId: this.sessionId,
            userId: this.userId,
            gameId: this.gameId,
            exportTime: new Date().toISOString(),
            logs: this.logStorage
        };

        return JSON.stringify(exportData, null, 2);
    }

    public downloadLogs(filename?: string): void {
        const data = this.exportLogs();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `plinko_logs_${this.sessionId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.info('📥 [LOGGER] Logs downloaded', { filename: link.download });
    }

    // Performance monitoring
    public startTimer(label: string): () => void {
        const startTime = performance.now();
        this.debug('⏱️ [TIMER]', `Timer started: ${label}`, { label, startTime });

        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            this.info('⏱️ [TIMER]', `Timer ended: ${label}`, {
                label,
                startTime,
                endTime,
                duration: `${duration.toFixed(2)}ms`
            });
        };
    }

    // Error tracking
    public trackError(error: Error, context?: any): void {
        this.error('🚨 [ERROR]', 'Error tracked', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            context
        });
    }

    // Game-specific logging methods
    public logGameEvent(event: string, data?: any): void {
        this.info('🎮 [GAME]', event, data);
    }

    public logBettingEvent(event: string, data?: any): void {
        this.info('💰 [BETTING]', event, data);
    }

    public logSocketEvent(event: string, data?: any): void {
        this.info('📡 [SOCKET]', event, data);
    }

    public logAuthEvent(event: string, data?: any): void {
        this.info('🔐 [AUTH]', event, data);
    }

    public logBalanceEvent(event: string, data?: any): void {
        this.info('💰 [BALANCE]', event, data);
    }

    // Statistics
    public getStats(): any {
        const stats = {
            totalLogs: this.logStorage.length,
            logsByLevel: {
                debug: this.getLogsByLevel(LogLevel.DEBUG).length,
                info: this.getLogsByLevel(LogLevel.INFO).length,
                warn: this.getLogsByLevel(LogLevel.WARN).length,
                error: this.getLogsByLevel(LogLevel.ERROR).length
            },
            logsByComponent: {} as Record<string, number>,
            sessionId: this.sessionId,
            userId: this.userId,
            gameId: this.gameId
        };

        // Count logs by component
        this.logStorage.forEach(entry => {
            stats.logsByComponent[entry.component] = (stats.logsByComponent[entry.component] || 0) + 1;
        });

        return stats;
    }
}

// Singleton instance
let enhancedLoggerInstance: PlinkoEnhancedLogger | null = null;

export function getEnhancedLogger(): PlinkoEnhancedLogger {
    if (!enhancedLoggerInstance) {
        enhancedLoggerInstance = new PlinkoEnhancedLogger();
    }
    return enhancedLoggerInstance;
}

export function initializeEnhancedLogger(config?: Partial<LoggerConfig>): PlinkoEnhancedLogger {
    enhancedLoggerInstance = new PlinkoEnhancedLogger(config);
    return enhancedLoggerInstance;
}

// Export the enhanced logger as the default logger
export const enhancedLogger = getEnhancedLogger();
export default enhancedLogger;
