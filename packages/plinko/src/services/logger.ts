// Comprehensive Logger utility for downloading logs as text file with detailed workflow tracking
type Level = 'info' | 'warn' | 'error' | 'debug';
type Category = 'game-init' | 'betting' | 'socket' | 'physics' | 'api' | 'ui' | 'state' | 'pf' | 'sound' | 'preload' | 'analytics' | 'error';

interface LogContext {
  category?: Category;
  workflow?: string;
  userId?: string;
  sessionId?: string;
  roundId?: string;
  betId?: string;
  timestamp?: string;
  duration?: number;
  requestId?: string;
}

interface WorkflowTimer {
  id: string;
  startTime: number;
  category: Category;
  description: string;
}

class Logger {
  private logs: string[] = [];
  private readonly maxLogs: number = 10000; // Prevent memory issues
  private workflowTimers: Map<string, WorkflowTimer> = new Map();
  private activeWorkflows: Set<string> = new Set();
  private autoSaveEnabled: boolean = true;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;
  private autoDownloadInterval: ReturnType<typeof setInterval> | null = null;
  private readonly STORAGE_KEY = 'plinko_game_logs';
  private readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  private readonly AUTO_DOWNLOAD_INTERVAL = 300000; // 5 minutes

  constructor() {
    // Initialize with a header
    this.log('info', 'Logger initialized - Auto-save enabled');

    // Load existing logs from localStorage
    this.loadFromStorage();

    // Start auto-save functionality
    this.startAutoSave();

    // Start auto-download functionality
    this.startAutoDownload();
  }

  log(level: Level, message: string, data?: any, context?: LogContext) {
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${level.toUpperCase()}]`;

    // Add category if provided
    if (context?.category) {
      logEntry += ` [${context.category.toUpperCase()}]`;
    }

    logEntry += ` ${message}`;

    // Add workflow context
    if (context?.workflow) {
      logEntry += ` | Workflow: ${context.workflow}`;
    }

    // Add IDs if provided
    const ids = [];
    if (context?.userId) ids.push(`User:${context.userId}`);
    if (context?.sessionId) ids.push(`Session:${context.sessionId}`);
    if (context?.roundId) ids.push(`Round:${context.roundId}`);
    if (context?.betId) ids.push(`Bet:${context.betId}`);
    if (context?.requestId) ids.push(`Request:${context.requestId}`);
    if (ids.length > 0) {
      logEntry += ` | IDs: {${ids.join(', ')}}`;
    }

    // Add duration if provided
    if (context?.duration !== undefined) {
      logEntry += ` | Duration: ${context.duration}ms`;
    }

    // Add data
    if (data) {
      try {
        logEntry += ` | Data: ${JSON.stringify(data, this.safeStringifyReplacer, 2)}`;
      } catch (error) {
        logEntry += ` | Data: [Circular or Non-Serializable Object]`;
      }
    }

    // Console logging removed

    // Store in memory
    this.logs.push(logEntry);

    // Prevent memory overflow
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Auto-save to localStorage on critical logs
    if (level === 'error' || message.includes('Workflow completed') || message.includes('API Response')) {
      this.saveToStorage();
    }
  }

  private safeStringifyReplacer(key: string, value: any): any {
    // Handle circular references and non-serializable objects
    if (typeof value === 'object' && value !== null) {
      if (value instanceof Error) {
        return { error: value.message, stack: value.stack };
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'function') {
        return '[Function]';
      }
      if (value.constructor && value.constructor.name !== 'Object') {
        return `[${value.constructor.name}]`;
      }
    }
    return value;
  }

  info(message: string, data?: any, context?: LogContext) {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: LogContext) {
    this.log('warn', message, data, context);
  }

  error(message: string, data?: any, context?: LogContext) {
    this.log('error', message, data, context);
  }

  debug(message: string, data?: any, context?: LogContext) {
    this.log('debug', message, data, context);
  }

  // Workflow tracking methods
  startWorkflow(workflowId: string, category: Category, description: string, context?: LogContext) {
    if (this.activeWorkflows.has(workflowId)) {
      this.warn(`Workflow already active: ${workflowId}`, { workflowId, category }, context);
      return;
    }

    this.activeWorkflows.add(workflowId);
    this.workflowTimers.set(workflowId, {
      id: workflowId,
      startTime: Date.now(),
      category,
      description
    });

    this.info(`Workflow started: ${description}`, {
      workflowId,
      category,
      startTime: new Date().toISOString()
    }, { ...context, workflow: workflowId, category });
  }

  endWorkflow(workflowId: string, context?: LogContext) {
    const timer = this.workflowTimers.get(workflowId);
    if (!timer) {
      this.warn(`Workflow not found: ${workflowId}`, { workflowId }, context);
      return;
    }

    const duration = Date.now() - timer.startTime;
    this.activeWorkflows.delete(workflowId);
    this.workflowTimers.delete(workflowId);

    this.info(`Workflow completed: ${timer.description}`, {
      workflowId,
      category: timer.category,
      duration,
      endTime: new Date().toISOString()
    }, { ...context, workflow: workflowId, category: timer.category, duration });
  }

  // API/Socket logging methods
  logApiRequest(endpoint: string, method: string, data?: any, context?: LogContext) {
    const requestId = this.generateRequestId();
    this.info(`API Request: ${method} ${endpoint}`, {
      endpoint,
      method,
      requestData: data
    }, { ...context, requestId, category: 'api' });
    return requestId;
  }

  logApiResponse(requestId: string, endpoint: string, status: number, responseData?: any, context?: LogContext) {
    this.info(`API Response: ${endpoint}`, {
      endpoint,
      status,
      responseData
    }, { ...context, requestId, category: 'api' });
  }

  logSocketEvent(event: string, direction: 'sent' | 'received', data?: any, context?: LogContext) {
    this.info(`Socket ${direction}: ${event}`, {
      event,
      direction,
      data
    }, { ...context, category: 'socket' });
  }

  logStateChange(component: string, previousState: any, newState: any, context?: LogContext) {
    this.debug(`State changed: ${component}`, {
      component,
      previousState,
      newState,
      changes: this.diffStates(previousState, newState)
    }, { ...context, category: 'state' });
  }

  logBetAction(action: string, betData: any, context?: LogContext) {
    this.info(`Bet action: ${action}`, betData, { ...context, category: 'betting' });
  }

  logGameEvent(event: string, eventData: any, context?: LogContext) {
    this.info(`Game event: ${event}`, eventData, { ...context, category: 'game-init' });
  }

  logPhysicsEvent(event: string, physicsData: any, context?: LogContext) {
    this.debug(`Physics event: ${event}`, physicsData, { ...context, category: 'physics' });
  }

  logUIEvent(event: string, uiData: any, context?: LogContext) {
    this.debug(`UI event: ${event}`, uiData, { ...context, category: 'ui' });
  }

  logError(error: Error, contextData?: any, context?: LogContext) {
    this.error(`Error occurred: ${error.message}`, {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      contextData
    }, { ...context, category: 'error' });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private diffStates(oldState: any, newState: any): any {
    const changes: any = {};

    if (typeof oldState !== 'object' || typeof newState !== 'object' || oldState === null || newState === null) {
      return { oldValue: oldState, newValue: newState };
    }

    const oldKeys = Object.keys(oldState || {});
    const newKeys = Object.keys(newState || {});
    const allKeys = new Set(oldKeys.concat(newKeys));

    allKeys.forEach(key => {
      const oldVal = oldState?.[key];
      const newVal = newState?.[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = { from: oldVal, to: newVal };
      }
    });

    return changes;
  }

  // Auto-save functionality
  private startAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.autoSaveInterval = setInterval(() => {
      if (this.autoSaveEnabled && this.logs.length > 0) {
        this.saveToStorage();
      }
    }, this.AUTO_SAVE_INTERVAL);
  }

  private stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        logs: this.logs,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.logs && Array.isArray(data.logs)) {
          this.logs = data.logs;
          this.log('info', 'Logs loaded from localStorage', { count: this.logs.length });
        }
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
    }
  }

  // Auto-download functionality
  private startAutoDownload() {
    if (this.autoDownloadInterval) {
      clearInterval(this.autoDownloadInterval);
    }
    this.autoDownloadInterval = setInterval(() => {
      if (this.logs.length > 0) {
        this.downloadLogs(`auto-game-logs-${new Date().toISOString().split('T')[0]}-${Date.now()}.txt`);
      }
    }, this.AUTO_DOWNLOAD_INTERVAL);
  }

  private stopAutoDownload() {
    if (this.autoDownloadInterval) {
      clearInterval(this.autoDownloadInterval);
      this.autoDownloadInterval = null;
    }
  }

  // Get all logs as a formatted string
  getLogs(): string {
    const header = `Game Console Logs\nGenerated: ${new Date().toLocaleString()}\nTotal Logs: ${this.logs.length}\n\n`;
    return header + this.logs.join('\n');
  }

  // Clear all logs
  clear() {
    this.logs = [];
    this.log('info', 'Logger cleared');
  }

  // Download logs as a text file
  downloadLogs(filename?: string): string {
    const logsContent = this.getLogs();
    const blob = new Blob([logsContent], { type: 'text/plain;charset=utf-8' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename || `game-logs-${new Date().toISOString().split('T')[0]}.txt`;

    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up the URL object
    URL.revokeObjectURL(downloadLink.href);

    return downloadLink.download;
  }

  // Get log count
  getLogCount(): number {
    return this.logs.length;
  }

  // Get active workflows
  getActiveWorkflows(): string[] {
    const result: string[] = [];
    this.activeWorkflows.forEach(id => result.push(id));
    return result;
  }

  // Get workflow status
  getWorkflowStatus(workflowId: string): { active: boolean; duration?: number; category?: Category; description?: string } {
    const timer = this.workflowTimers.get(workflowId);
    if (!timer) {
      return { active: false };
    }

    return {
      active: true,
      duration: Date.now() - timer.startTime,
      category: timer.category,
      description: timer.description
    };
  }

  // Get logger status
  getStatus(): {
    logCount: number;
    activeWorkflows: string[];
    workflowCount: number;
  } {
    const activeWorkflows: string[] = [];
    this.activeWorkflows.forEach(id => activeWorkflows.push(id));
    return {
      logCount: this.logs.length,
      activeWorkflows,
      workflowCount: this.workflowTimers.size
    };
  }

  // Stop auto-operations and final save
  stopAutoOperations() {
    this.stopAutoSave();
    this.stopAutoDownload();
    if (this.logs.length > 0) {
      this.saveToStorage();
    }
  }
}

// Create a singleton instance
export const logger = new Logger();

// Export the class for testing or multiple instances if needed
export default Logger;
