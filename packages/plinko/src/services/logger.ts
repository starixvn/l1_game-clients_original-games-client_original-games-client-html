// Logger utility for downloading logs as text file
class Logger {
  private logs: string[] = [];
  private maxLogs: number = 10000; // Prevent memory issues

  constructor() {
    // Initialize with a header
    this.log('info', 'Logger initialized');
  }

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (data) {
      logEntry += ` | Data: ${JSON.stringify(data, null, 2)}`;
    }

    // Also log to console for immediate feedback
    console.log(logEntry);

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
    this.log('info', 'Logger cleared');
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

    this.log('info', 'Logs downloaded', { filename: downloadLink.download });
  }

  // Get log count
  getLogCount(): number {
    return this.logs.length;
  }
}

// Create a singleton instance
export const logger = new Logger();

// Export the class for testing or multiple instances if needed
export default Logger;
