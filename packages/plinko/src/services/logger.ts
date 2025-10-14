// Logger utility for downloading logs as text file with detailed workflow tracking
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
  private readonly maxLogs = 10000; // Prevent memory issues
  private isEnabled = false; // Logging starts disabled by default
  private isCollapsed = true; // Logger starts collapsed by default
  private workflowTimers: Map<string, WorkflowTimer> = new Map();
  private activeWorkflows: Set<string> = new Set();

  constructor() {
    // Initialize quietly when collapsed
    if (!this.isCollapsed) {
      this.log('info', 'Logger initialized');
    }
  }

  log(level: Level, message: string, data?: any, context?: LogContext) {
    // Always log errors regardless of state
    if (level === 'error') {
      this.doLog(level, message, data, context);
      return;
    }

    // Don't log if disabled or collapsed (except for errors)
    if (!this.isEnabled || this.isCollapsed) {
      return;
    }

    this.doLog(level, message, data, context);
  }

  private doLog(level: Level, message: string, data?: any, context?: LogContext) {
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

    // Log to console when not collapsed
    if (!this.isCollapsed) {
      console.log(logEntry);
    }

    // Store in memory
    this.logs.push(logEntry);

    // Prevent memory overflow
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
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
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private diffStates(oldState: any, newState: any): any {
    const changes: any = {};

    if (typeof oldState !== 'object' || typeof newState !== 'object' || oldState === null || newState === null) {
      return { oldValue: oldState, newValue: newState };
    }

    const allKeys = new Set([...Object.keys(oldState || {}), ...Object.keys(newState || {})]);

    for (const key of allKeys) {
      const oldVal = oldState?.[key];
      const newVal = newState?.[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = { from: oldVal, to: newVal };
      }
    }

    return changes;
  }

  // Get all logs as a formatted string
  getLogs(): string {
    const header = `Plinko Game Console Logs\nGenerated: ${new Date().toLocaleString()}\nTotal Logs: ${this.logs.length}\n\n`;
    return header + this.logs.join('\n');
  }

  // Clear all logs
  clear() {
    this.logs = [];
    if (!this.isCollapsed) {
      this.log('info', 'Logger cleared');
    }
  }

  // Download logs as a text file
  downloadLogs(filename?: string) {
    const logsContent = this.getLogs();
    const blob = new Blob([logsContent], { type: 'text/plain;charset=utf-8' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename || `plinko-logs-${new Date().toISOString().split('T')[0]}.txt`;

    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up the URL object
    URL.revokeObjectURL(downloadLink.href);

    // Only log if not collapsed
    if (!this.isCollapsed) {
      this.log('info', 'Logs downloaded', { filename: downloadLink.download });
    }
  }

  // Get log count
  getLogCount(): number {
    return this.logs.length;
  }

  // Check if logging is enabled
  isLoggingEnabled(): boolean {
    return this.isEnabled;
  }

  // Check if logger is collapsed
  isCollapsedState(): boolean {
    return this.isCollapsed;
  }

  // Get active workflows
  getActiveWorkflows(): string[] {
    return Array.from(this.activeWorkflows);
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
    enabled: boolean;
    collapsed: boolean;
    logCount: number;
    activeWorkflows: string[];
    workflowCount: number;
  } {
    return {
      enabled: this.isEnabled,
      collapsed: this.isCollapsed,
      logCount: this.logs.length,
      activeWorkflows: Array.from(this.activeWorkflows),
      workflowCount: this.workflowTimers.size
    };
  }

  // Start logging
  start() {
    if (!this.isEnabled) {
      this.isEnabled = true;
      // Don't log here to avoid recursion if logging is disabled
      console.log('[LOGGER] Logging started');
    }
  }

  // Stop logging
  stop() {
    if (this.isEnabled) {
      this.isEnabled = false;
      // Don't log here to avoid recursion since logging is now disabled
      console.log('[LOGGER] Logging stopped');
    }
  }

  // Expand logger (show full functionality)
  expand() {
    if (this.isCollapsed) {
      this.isCollapsed = false;
      console.log('[LOGGER] Logger expanded - full functionality available');
      this.log('info', 'Logger expanded');
    }
  }

  // Collapse logger (minimal interface)
  collapse() {
    if (!this.isCollapsed) {
      this.isCollapsed = true;
      console.log('[LOGGER] Logger collapsed - minimal interface active');
    }
  }

  // Toggle collapsed/expanded state
  toggle() {
    if (this.isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }
}

// Create a singleton instance
export const logger = new Logger();

// Export the class for testing or multiple instances if needed
export default Logger;
