// Logger utility for downloading logs as text file
type Level = 'info' | 'warn' | 'error' | 'debug';
class Logger {
  private logs: string[] = [];
  private readonly maxLogs = 10000; // Prevent memory issues
  private isEnabled = false; // Logging starts disabled by default
  private isCollapsed = true; // Logger starts collapsed by default

  constructor() {
    // Initialize quietly when collapsed
    if (!this.isCollapsed) {
      this.log('info', 'Logger initialized');
    }
  }

  log(level: Level, message: string, data?: any) {
    // Always log errors regardless of state
    if (level === 'error') {
      this.doLog(level, message, data);
      return;
    }

    // Don't log if disabled or collapsed (except for errors)
    if (!this.isEnabled || this.isCollapsed) {
      return;
    }

    this.doLog(level, message, data);
  }

  private doLog(level: Level, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (data) {
      logEntry += ` | Data: ${JSON.stringify(data, null, 2)}`;
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

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
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

  // Get logger status
  getStatus(): { enabled: boolean; collapsed: boolean; logCount: number } {
    return {
      enabled: this.isEnabled,
      collapsed: this.isCollapsed,
      logCount: this.logs.length
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
